-- ============================================================
-- BRIEFINGS TABLE — Pelimotion
-- Rodar no SQL Editor do Supabase Dashboard
-- ============================================================

CREATE TABLE IF NOT EXISTS briefings (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text        NOT NULL,
  cliente_nome text       NOT NULL,
  respostas   jsonb       NOT NULL,
  criado_em   timestamptz DEFAULT now(),
  ip          text
);

CREATE INDEX IF NOT EXISTS briefings_slug_idx ON briefings(slug);

-- RLS: qualquer pessoa pode inserir (segurança por obscuridade do slug)
-- Apenas usuários autenticados podem ler
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefings_public_insert" ON briefings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "briefings_auth_select" ON briefings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "briefings_auth_update" ON briefings
  FOR UPDATE USING (auth.role() = 'authenticated');
