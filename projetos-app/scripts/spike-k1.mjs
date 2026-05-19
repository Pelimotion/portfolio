/**
 * Spike K.1 — Document Intelligence
 * Ingere até 10 documentos de UM projeto e mede qualidade/performance.
 *
 * Pré-requisitos:
 *   1. SQL migration K.1 já rodada no Supabase (scripts/database/k1_document_chunks.sql)
 *   2. Token Google OAuth com escopo `drive.readonly` (NÃO `drive.metadata.readonly`).
 *      Gerar via OAuth Playground: https://developers.google.com/oauthplayground/
 *      Selecionar: "Drive API v3" → "https://www.googleapis.com/auth/drive.readonly"
 *   3. Se encontrar PDFs ou DOCX, instalar antes:
 *      cd projetos-app && npm install --save-dev pdf-parse mammoth --cache /tmp/npm-cache
 *   4. Criar .env.spike com as variáveis abaixo (nunca commitar):
 *      echo ".env.spike" >> .gitignore
 *
 * Variáveis de ambiente (.env.spike):
 *   SUPABASE_SERVICE_KEY = <service_role key do Supabase — bypassa RLS para o spike>
 *   GDRIVE_ACCESS_TOKEN  = <token OAuth drive.readonly>
 *   PROJECT_ID           = <UUID do projeto na tabela pages>
 *   ROOT_FOLDER_ID       = <ID da pasta raiz no Google Drive>
 *   EXTRACT_TEXT_URL     = (opcional) URL do Edge script — se vazio, chama Drive direto
 *
 * Uso:
 *   cd projetos-app
 *   node --env-file=.env.spike scripts/spike-k1.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

// createRequire resolve módulos CJS (pdf-parse, mammoth) de dentro de um arquivo .mjs,
// evitando o bug onde `import('pkg').default` retorna undefined ou não é função.
const _require = createRequire(import.meta.url);

// ── Configuração ──────────────────────────────────────────────
// URL e anon key são públicos (hardcoded no app em src/lib/supabase.js)
const SUPABASE_URL      = process.env.SUPABASE_URL || 'https://gfaqnkmmbozmhroicqyc.supabase.co';
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const ACCESS_TOKEN      = process.env.GDRIVE_ACCESS_TOKEN;
const PROJECT_ID        = process.env.PROJECT_ID;
const ROOT_FOLDER_ID    = process.env.ROOT_FOLDER_ID;
const EXTRACT_TEXT_URL  = process.env.EXTRACT_TEXT_URL || '';

const CHUNK_SIZE    = 800;
const CHUNK_OVERLAP = 100;
const MAX_FILES     = 10;

const SUPPORTED_MIME_TYPES = new Set([
  'application/vnd.google-apps.document',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]);

// ── Validação de ambiente ─────────────────────────────────────
function validateEnv() {
  const missing = [];
  if (!SUPABASE_KEY)     missing.push('SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY)');
  if (!ACCESS_TOKEN)     missing.push('GDRIVE_ACCESS_TOKEN');
  if (!PROJECT_ID)       missing.push('PROJECT_ID');
  if (!ROOT_FOLDER_ID)   missing.push('ROOT_FOLDER_ID');
  if (missing.length) {
    console.error('❌ Variáveis ausentes:', missing.join(', '));
    console.error('   Crie um arquivo .env.spike e passe via: node --env-file=.env.spike scripts/spike-k1.mjs');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  SUPABASE_SERVICE_KEY não encontrado — usando anon key.');
    console.warn('   Com RLS ativo, inserts podem falhar. Recomendado usar service_role key para o spike.');
    console.warn('   (Painel Supabase → Project Settings → API → service_role)\n');
  }
}

// ── Drive API helpers ─────────────────────────────────────────
async function listDriveFiles(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Drive list error: ${err.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return (data.files || []).filter(f => SUPPORTED_MIME_TYPES.has(f.mimeType));
}

async function exportDriveText(fileId, mimeType) {
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    if (!res.ok) throw new Error(`Export Google Doc falhou: ${res.status}`);
    return res.text();
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Download falhou: ${res.status} ${res.statusText}`);

  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return res.text();
  }

  if (mimeType === 'application/pdf') {
    let mod;
    try {
      mod = _require('pdf-parse');
    } catch {
      throw new Error('pdf-parse não instalado. Rode: npm install --save-dev pdf-parse@1.1.1 --cache /tmp/npm-cache');
    }
    // Versão correta (1.1.1) exporta a função diretamente: module.exports = async function(...)
    const pdfParse = typeof mod === 'function' ? mod : mod?.default;
    if (typeof pdfParse !== 'function') {
      throw new Error(
        `pdf-parse incompatível (keys: ${Object.keys(mod ?? {}).slice(0,5).join(', ')}...). ` +
        'Reinstale a versão correta: npm uninstall pdf-parse && npm install --save-dev pdf-parse@1.1.1 --cache /tmp/npm-cache'
      );
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    let mod;
    try {
      mod = _require('mammoth');
    } catch {
      throw new Error('mammoth não instalado. Rode: npm install --save-dev mammoth --cache /tmp/npm-cache');
    }
    const mammoth = typeof mod?.extractRawText === 'function' ? mod : (mod?.default ?? mod);
    if (typeof mammoth?.extractRawText !== 'function') {
      throw new Error(`mammoth: export inesperado — tipo="${typeof mod}", keys=[${Object.keys(mod ?? {}).join(', ')}]`);
    }
    const buffer = await res.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Tipo não suportado: ${mimeType}`);
}

async function extractViaEdge(fileId, mimeType) {
  const res = await fetch(`${EXTRACT_TEXT_URL}/extract-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driveFileId: fileId, mimeType, accessToken: ACCESS_TOKEN }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Edge error: ${err.error || res.statusText}`);
  }
  const data = await res.json();
  return data.text;
}

// ── Chunking ──────────────────────────────────────────────────
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/);
  let buffer = '';
  let charOffset = 0;

  for (const para of paragraphs) {
    if ((buffer + para).length > size && buffer.length > 0) {
      chunks.push({ content: buffer.trim(), charOffset: Math.max(0, charOffset - buffer.length) });
      buffer = buffer.slice(-overlap) + '\n\n' + para;
    } else {
      buffer += (buffer ? '\n\n' : '') + para;
    }
    charOffset += para.length + 2;
  }

  if (buffer.trim().length > 0) {
    chunks.push({ content: buffer.trim(), charOffset: Math.max(0, charOffset - buffer.length) });
  }

  return chunks;
}

// ── Supabase insert ───────────────────────────────────────────
async function insertChunks(supabase, file, chunks) {
  const rows = chunks.map((chunk, i) => ({
    project_id:    PROJECT_ID,
    drive_file_id: file.id,
    file_name:     file.name,
    mime_type:     file.mimeType,
    chunk_index:   i,
    content:       chunk.content,
    char_offset:   chunk.charOffset,
    modified_time: file.modifiedTime || null,
  }));

  const { error } = await supabase
    .from('document_chunks')
    .upsert(rows, { onConflict: 'drive_file_id,chunk_index' });

  if (error) throw new Error(`Supabase insert: ${error.message} (code: ${error.code})`);
  return rows.length;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  validateEnv();

  const usingServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
  console.log('\n🔍 Spike K.1 — Document Intelligence\n');
  console.log(`Supabase:      ${SUPABASE_URL}`);
  console.log(`Auth mode:     ${usingServiceKey ? 'service_role (RLS bypass)' : 'anon key (RLS ativo)'}`);
  console.log(`Projeto:       ${PROJECT_ID}`);
  console.log(`Pasta Drive:   ${ROOT_FOLDER_ID}`);
  console.log(`Extração:      ${EXTRACT_TEXT_URL ? 'Edge (' + EXTRACT_TEXT_URL + ')' : 'Drive API direto'}\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('📂 Listando arquivos no Drive...');
  const allFiles = await listDriveFiles(ROOT_FOLDER_ID);
  const files = allFiles.slice(0, MAX_FILES);
  console.log(`   Encontrados: ${allFiles.length} suportados | Processando: ${files.length}\n`);

  if (files.length === 0) {
    console.warn('⚠️  Nenhum arquivo suportado encontrado. Verifique ROOT_FOLDER_ID e o escopo OAuth (drive.readonly).');
    process.exit(0);
  }

  const metrics = [];
  let totalChars  = 0;
  let totalChunks = 0;

  for (const file of files) {
    const t0 = Date.now();
    try {
      const text = EXTRACT_TEXT_URL
        ? await extractViaEdge(file.id, file.mimeType)
        : await exportDriveText(file.id, file.mimeType);

      const chunks  = chunkText(text);
      const inserted = await insertChunks(supabase, file, chunks);
      const elapsed  = Date.now() - t0;

      totalChars  += text.length;
      totalChunks += inserted;
      metrics.push({ file: file.name, mimeType: file.mimeType, chars: text.length, chunks: inserted, ms: elapsed });
      console.log(`✅ ${file.name.slice(0, 38).padEnd(38)} ${String(text.length).padStart(7)} chars  ${String(inserted).padStart(4)} chunks  ${elapsed}ms`);
    } catch (err) {
      const elapsed = Date.now() - t0;
      metrics.push({ file: file.name, mimeType: file.mimeType, error: err.message, ms: elapsed });
      console.error(`❌ ${file.name.slice(0, 38).padEnd(38)} ERRO: ${err.message.slice(0, 60)} (${elapsed}ms)`);
    }
  }

  const ok     = metrics.filter(m => !m.error);
  const failed = metrics.filter(m => m.error);
  const avgMs  = ok.length ? Math.round(ok.reduce((s, m) => s + m.ms, 0) / ok.length) : 0;

  console.log('\n──────────────────────────────────────────────────────────');
  console.log('📊 SUMÁRIO');
  console.log(`   Processados:         ${ok.length}/${files.length}`);
  console.log(`   Chars totais:        ${totalChars.toLocaleString('pt-BR')}`);
  console.log(`   Chunks inseridos:    ${totalChunks}`);
  console.log(`   Tempo médio/arquivo: ${avgMs}ms`);
  if (failed.length) {
    console.log(`   Falhas (${failed.length}):`);
    failed.forEach(m => console.log(`     - ${m.file}: ${m.error}`));
  }
  console.log('──────────────────────────────────────────────────────────\n');

  console.log('➡️  Query de validação (rodar no Supabase SQL Editor):');
  console.log(`
SELECT file_name,
       ts_headline('portuguese', content,
         websearch_to_tsquery('portuguese', '<SUA QUERY>'),
         'StartSel=[[, StopSel=]]')
FROM document_chunks
WHERE project_id = '${PROJECT_ID}'
  AND content_tsv @@ websearch_to_tsquery('portuguese', '<SUA QUERY>')
ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', '<SUA QUERY>')) DESC
LIMIT 10;
`);
  console.log('📝 Preencher: projetos-app/docs/SPIKE_K1_REPORT.md\n');
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
