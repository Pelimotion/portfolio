-- ============================================================
-- K.1 — Document Intelligence: tabela document_chunks
-- ATENÇÃO: rodar APENAS após aprovação explícita do usuário
--          no Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Extensão para busca trigrama (suporte a LIKE fuzzy via índice)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabela principal de chunks de documentos indexados
CREATE TABLE IF NOT EXISTS document_chunks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  drive_file_id   TEXT        NOT NULL,
  file_name       TEXT        NOT NULL,
  mime_type       TEXT,
  section_heading TEXT,
  chunk_index     INT         NOT NULL,
  content         TEXT        NOT NULL,
  content_tsv     tsvector    GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED,
  char_offset     INT         DEFAULT 0,
  modified_time   TIMESTAMPTZ,
  indexed_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (drive_file_id, chunk_index)
);

-- Índice GIN para busca full-text (ts_headline, ts_rank_cd)
CREATE INDEX IF NOT EXISTS document_chunks_tsv_idx
  ON document_chunks USING GIN (content_tsv);

-- Índice para filtrar por projeto rapidamente
CREATE INDEX IF NOT EXISTS document_chunks_project_idx
  ON document_chunks (project_id);

-- ── RLS ──────────────────────────────────────────────────────
-- Espelha a política de `scenes`: usuário só vê chunks cujo
-- project_id pertence a um projeto que ele pode acessar via pages.

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Leitura: projeto deve pertencer ao usuário autenticado.
-- `pages` usa `created_by` (não `user_id`) — confirmado em pageService.js.
CREATE POLICY "document_chunks: select own projects"
  ON document_chunks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM pages WHERE created_by = auth.uid()::text
    )
  );

-- Escrita (insert/update/delete): idem
CREATE POLICY "document_chunks: write own projects"
  ON document_chunks FOR ALL
  USING (
    project_id IN (
      SELECT id FROM pages WHERE created_by = auth.uid()::text
    )
  );

-- ── Verificação rápida após rodar ────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'document_chunks'
-- ORDER BY ordinal_position;
