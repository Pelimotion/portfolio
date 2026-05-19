/**
 * DOCUMENT SERVICE — K.2: Indexador on-demand
 * Extrai texto de arquivos do Google Drive e insere chunks no Supabase.
 *
 * Tipos suportados no browser (sem dependências extra):
 *   - Google Docs  → Drive export API (text/plain)
 *   - text/plain, text/markdown → Drive download direto
 *
 * PDFs e DOCX: requerem servidor (Bunny Edge — Fase K.7).
 * Garbled detection: nonAscii/total > 0.3 → skip.
 * Delta sync: só re-indexa se modifiedTime do Drive > indexed_at no Supabase.
 */

import { supabase } from '../lib/supabase';

// ── Configuração ──────────────────────────────────────────────

const CHUNK_SIZE = 800;   // chars por chunk (conforme spike K.1)
const CHUNK_OVERLAP = 100; // sobreposição entre chunks

const SUPPORTED_MIME_TYPES = new Set([
  'application/vnd.google-apps.document', // Google Docs
  'text/plain',
  'text/markdown',
]);

// ── Helpers ───────────────────────────────────────────────────

/**
 * Detecta texto garbled (PDFs de CAD com mapeamento de fonte não-padrão).
 * Critério: > 30% dos caracteres fora do ASCII básico.
 */
function isGarbled(text) {
  if (!text || text.length < 30) return true;
  const nonAscii = (text.match(/[^\x00-\x7F]/g) || []).length;
  return nonAscii / text.length > 0.3;
}

/**
 * Divide o texto em chunks sobrepostos de CHUNK_SIZE caracteres.
 */
function chunkText(text) {
  const chunks = [];
  let pos = 0;
  let idx = 0;
  while (pos < text.length) {
    const end = Math.min(pos + CHUNK_SIZE, text.length);
    const content = text.slice(pos, end).trim();
    if (content.length > 20) {
      chunks.push({ index: idx++, content, charOffset: pos });
    }
    if (end === text.length) break;
    pos += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

/**
 * Extrai texto de um arquivo do Google Drive via API.
 * Lança 'INSUFFICIENT_SCOPE' se o token não tiver drive.readonly.
 * Lança 'UNSUPPORTED_TYPE' para tipos não implementados no browser.
 */
async function extractText(file, accessToken) {
  const mime = file.mimeType;

  if (mime === 'application/vnd.google-apps.document') {
    const url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status === 403) throw new Error('INSUFFICIENT_SCOPE');
    if (!res.ok) throw new Error(`Drive export failed: ${res.status}`);
    return await res.text();
  }

  if (mime === 'text/plain' || mime === 'text/markdown') {
    const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status === 403) throw new Error('INSUFFICIENT_SCOPE');
    if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
    return await res.text();
  }

  throw new Error('UNSUPPORTED_TYPE');
}

/**
 * Lista recursivamente todos os arquivos de uma pasta do Drive.
 * Retorna apenas arquivos (não subpastas), com campo `path` e `modifiedTime`.
 */
async function listDriveFiles(folderId, accessToken, basePath = '') {
  const allFiles = [];
  const q = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id,name,mimeType,modifiedTime)';

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('fields', fields);
  url.searchParams.set('pageSize', '1000');
  url.searchParams.set('supportsAllDrives', 'true');
  url.searchParams.set('includeItemsFromAllDrives', 'true');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Drive list error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();

  for (const item of (data.files || [])) {
    const itemPath = basePath ? `${basePath}/${item.name}` : item.name;
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      const sub = await listDriveFiles(item.id, accessToken, itemPath);
      allFiles.push(...sub);
    } else {
      allFiles.push({ ...item, path: itemPath });
    }
  }

  return allFiles;
}

// ── API pública ───────────────────────────────────────────────

export const documentService = {

  /**
   * Indexa um único arquivo: extrai texto, chunkea e upserta no Supabase.
   * Retorna { indexed: true, chunks: N } ou { skipped: true, reason: string }.
   * Lança 'INSUFFICIENT_SCOPE' para propagar ao chamador.
   */
  async indexFile(projectId, file, accessToken) {
    let text;
    try {
      text = await extractText(file, accessToken);
    } catch (e) {
      if (e.message === 'INSUFFICIENT_SCOPE') throw e;
      if (e.message === 'UNSUPPORTED_TYPE') return { skipped: true, reason: 'unsupported_type' };
      console.error(`[documentService] Extract error [${file.name}]:`, e);
      return { skipped: true, reason: 'extract_error' };
    }

    if (isGarbled(text)) {
      return { skipped: true, reason: 'garbled_text' };
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return { skipped: true, reason: 'empty_content' };
    }

    // Delta sync: pula se o arquivo não foi modificado desde a última indexação
    if (file.modifiedTime) {
      const { data: existing } = await supabase
        .from('document_chunks')
        .select('indexed_at')
        .eq('drive_file_id', file.id)
        .order('indexed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.indexed_at) {
        const modifiedAt = new Date(file.modifiedTime);
        const indexedAt = new Date(existing.indexed_at);
        if (modifiedAt <= indexedAt) {
          return { skipped: true, reason: 'not_modified' };
        }
      }
    }

    // Remove chunks antigos antes de re-inserir (número de chunks pode variar)
    await supabase
      .from('document_chunks')
      .delete()
      .eq('drive_file_id', file.id);

    const rows = chunks.map(c => ({
      project_id: projectId,
      drive_file_id: file.id,
      file_name: file.name,
      mime_type: file.mimeType,
      chunk_index: c.index,
      content: c.content,
      char_offset: c.charOffset,
      modified_time: file.modifiedTime || null,
    }));

    const { error } = await supabase
      .from('document_chunks')
      .insert(rows);

    if (error) throw error;

    return { indexed: true, chunks: chunks.length };
  },

  /**
   * Indexa todos os arquivos suportados de uma pasta raiz do Drive.
   * `onProgress({ current, total, fileName })` é chamado a cada arquivo.
   * Retorna { total, supported, indexed, skipped, notModified, errors }.
   */
  async indexProject(projectId, rootFolderId, accessToken, onProgress) {
    const allFiles = await listDriveFiles(rootFolderId, accessToken);
    const supported = allFiles.filter(f => SUPPORTED_MIME_TYPES.has(f.mimeType));

    const result = {
      total: allFiles.length,
      supported: supported.length,
      indexed: 0,
      skipped: 0,
      notModified: 0,
      errors: 0,
    };

    for (let i = 0; i < supported.length; i++) {
      const file = supported[i];
      onProgress?.({ current: i + 1, total: supported.length, fileName: file.name });

      try {
        const outcome = await this.indexFile(projectId, file, accessToken);
        if (outcome.indexed) {
          result.indexed++;
        } else if (outcome.reason === 'not_modified') {
          result.notModified++;
        } else {
          result.skipped++;
        }
      } catch (e) {
        if (e.message === 'INSUFFICIENT_SCOPE') throw e;
        result.errors++;
        console.error(`[documentService] indexFile error [${file.name}]:`, e);
      }
    }

    return result;
  },

  /**
   * Retorna contagem de arquivos e chunks indexados para um projeto.
   */
  async getIndexStatus(projectId) {
    const { data, error } = await supabase
      .from('document_chunks')
      .select('drive_file_id, file_name')
      .eq('project_id', projectId);

    if (error) throw error;

    const fileMap = {};
    for (const row of (data || [])) {
      if (!fileMap[row.drive_file_id]) {
        fileMap[row.drive_file_id] = { name: row.file_name, chunks: 0 };
      }
      fileMap[row.drive_file_id].chunks++;
    }

    return {
      fileCount: Object.keys(fileMap).length,
      totalChunks: data?.length || 0,
    };
  },

  /**
   * Remove todos os chunks indexados de um projeto.
   */
  async clearIndex(projectId) {
    const { error } = await supabase
      .from('document_chunks')
      .delete()
      .eq('project_id', projectId);
    if (error) throw error;
  },
};
