/**
 * SEARCH SERVICE — K.3 + K.5: Busca BM25 e Hybrid (BM25 + pgvector) em document_chunks
 *
 * Estratégia:
 *   1. Tenta RPC `search_document_chunks` (com ts_headline server-side).
 *   2. Fallback: .textSearch() do Supabase JS + snippet client-side.
 *
 * SQL para criar o RPC (rodar no Supabase SQL Editor):
 *
 *   CREATE OR REPLACE FUNCTION search_document_chunks(
 *     p_query   TEXT,
 *     p_limit   INT DEFAULT 10
 *   )
 *   RETURNS TABLE (
 *     file_name      TEXT,
 *     chunk_index    INT,
 *     drive_file_id  TEXT,
 *     project_id     UUID,
 *     snippet        TEXT
 *   )
 *   LANGUAGE sql STABLE SECURITY DEFINER
 *   AS $$
 *     SELECT
 *       file_name,
 *       chunk_index,
 *       drive_file_id,
 *       project_id,
 *       ts_headline(
 *         'portuguese', content,
 *         websearch_to_tsquery('portuguese', p_query),
 *         'StartSel=[[, StopSel=]], MaxWords=30, MinWords=15'
 *       ) AS snippet
 *     FROM document_chunks
 *     WHERE content_tsv @@ websearch_to_tsquery('portuguese', p_query)
 *     ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', p_query)) DESC
 *     LIMIT p_limit;
 *   $$;
 */

import { supabase } from '../lib/supabase';

// ── Helpers ───────────────────────────────────────────────────

/**
 * Extrai snippet ao redor da primeira ocorrência de qualquer palavra da query.
 * Envolve os termos encontrados em [[MARK]]...[[/MARK]] para highlight.
 */
function extractSnippet(text, query) {
  if (!text) return '';
  const words = query.trim().split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return text.slice(0, 120);

  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const match = pattern.exec(text);
  if (!match) return text.slice(0, 120);

  const start = Math.max(0, match.index - 60);
  const end = Math.min(text.length, match.index + 100);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  const excerpt = prefix + text.slice(start, end) + suffix;

  return excerpt.replace(pattern, '[[MARK]]$1[[/MARK]]');
}

// ── API pública ───────────────────────────────────────────────

/**
 * Busca BM25 em todos os document_chunks acessíveis.
 * Retorna [{ file_name, chunk_index, drive_file_id, project_id, snippet }].
 *
 * @param {string} query - Texto de busca (websearch syntax suportado)
 * @param {number} [limit=10]
 */
export async function searchDocuments(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  // Tenta RPC com ts_headline (server-side, melhor qualidade)
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'search_document_chunks',
    { p_query: query, p_limit: limit }
  );

  if (!rpcError && Array.isArray(rpcData)) {
    return rpcData;
  }

  if (rpcError) {
    console.warn('[searchService] RPC indisponível, usando textSearch:', rpcError.message);
  }

  // Fallback: textSearch via Supabase JS + snippet client-side
  const { data, error } = await supabase
    .from('document_chunks')
    .select('file_name, chunk_index, content, drive_file_id, project_id')
    .textSearch('content', query, { type: 'websearch', config: 'portuguese' })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(row => ({
    file_name: row.file_name,
    chunk_index: row.chunk_index,
    drive_file_id: row.drive_file_id,
    project_id: row.project_id,
    snippet: extractSnippet(row.content, query),
  }));
}

// ── K.5: Hybrid Search (BM25 + pgvector via RRF) ─────────────
//
// PRÉ-REQUISITOS (rodar no Supabase SQL Editor antes de usar):
//
//   -- 1. Habilitar pgvector (se ainda não estiver ativo)
//   CREATE EXTENSION IF NOT EXISTS vector;
//
//   -- 2. Adicionar coluna de embedding ao document_chunks
//   ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);
//
//   -- 3. Índice IVFFlat para busca por cosseno (ajustar `lists` conforme volume)
//   CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
//     ON document_chunks USING ivfflat (embedding vector_cosine_ops)
//     WITH (lists = 100);
//
//   -- 4. RPC de hybrid search com RRF (Reciprocal Rank Fusion)
//   CREATE OR REPLACE FUNCTION search_documents_hybrid(
//     p_query     TEXT,
//     p_embedding vector(768),
//     p_limit     INT DEFAULT 10,
//     p_rrf_k     INT DEFAULT 60
//   )
//   RETURNS TABLE (
//     file_name     TEXT,
//     chunk_index   INT,
//     drive_file_id TEXT,
//     project_id    UUID,
//     snippet       TEXT,
//     score         FLOAT
//   )
//   LANGUAGE sql STABLE SECURITY DEFINER AS $$
//     WITH bm25 AS (
//       SELECT id,
//         ts_headline('portuguese', content,
//           websearch_to_tsquery('portuguese', p_query),
//           'StartSel=[[, StopSel=]], MaxWords=30, MinWords=15') AS snippet,
//         ROW_NUMBER() OVER (
//           ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', p_query)) DESC
//         ) AS rank
//       FROM document_chunks
//       WHERE content_tsv @@ websearch_to_tsquery('portuguese', p_query)
//     ),
//     vec AS (
//       SELECT id,
//         content AS snippet,
//         ROW_NUMBER() OVER (ORDER BY embedding <=> p_embedding) AS rank
//       FROM document_chunks
//       WHERE embedding IS NOT NULL
//       ORDER BY embedding <=> p_embedding
//       LIMIT p_limit * 3
//     ),
//     rrf AS (
//       SELECT
//         COALESCE(b.id, v.id) AS id,
//         COALESCE(b.snippet, v.snippet) AS snippet,
//         (COALESCE(1.0 / (p_rrf_k + b.rank), 0) + COALESCE(1.0 / (p_rrf_k + v.rank), 0)) AS score
//       FROM bm25 b
//       FULL OUTER JOIN vec v ON b.id = v.id
//     )
//     SELECT dc.file_name, dc.chunk_index, dc.drive_file_id, dc.project_id,
//       rrf.snippet, rrf.score
//     FROM rrf
//     JOIN document_chunks dc ON dc.id = rrf.id
//     ORDER BY rrf.score DESC
//     LIMIT p_limit;
//   $$;
//
// BUNNY EDGE: deploy `bunny-edge/generate-embedding/index.js` como endpoint
// e configurar BUNNY_EMBED_URL nas variáveis de ambiente do app.

const BUNNY_EMBED_URL = import.meta.env.VITE_BUNNY_EMBED_URL ?? null;

/**
 * Gera embedding de texto via Bunny Edge (Vertex AI text-embedding-004).
 * Retorna float[] com 768 dimensões ou null se serviço indisponível.
 */
async function generateQueryEmbedding(text) {
  if (!BUNNY_EMBED_URL) return null;
  try {
    const res = await fetch(BUNNY_EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const { embedding } = await res.json();
    return Array.isArray(embedding) ? embedding : null;
  } catch {
    return null;
  }
}

/**
 * Busca híbrida: BM25 + similaridade vetorial (RRF fusion).
 * Fallback automático para BM25 puro se embedding indisponível.
 *
 * @param {string} query
 * @param {number} [limit=10]
 */
export async function searchDocumentsHybrid(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  const embedding = await generateQueryEmbedding(query);

  if (embedding) {
    const { data, error } = await supabase.rpc('search_documents_hybrid', {
      p_query: query,
      p_embedding: JSON.stringify(embedding),
      p_limit: limit,
    });
    if (!error && Array.isArray(data)) return data;
    console.warn('[searchService] hybrid RPC falhou, usando BM25:', error?.message);
  }

  // Fallback: BM25 puro
  return searchDocuments(query, limit);
}

/**
 * Verifica se há algum chunk indexado (para empty state do modal).
 * Retorna true se o banco tiver ao menos 1 chunk.
 */
export async function hasIndexedChunks() {
  const { count, error } = await supabase
    .from('document_chunks')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  if (error) {
    console.error('[searchService] hasIndexedChunks error:', error);
    return false;
  }
  return (count ?? 0) > 0;
}
