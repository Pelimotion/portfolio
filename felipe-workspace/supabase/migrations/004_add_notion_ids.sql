-- =============================================================================
-- MIGRAÇÃO 004 — Adicionar notion_id às tabelas existentes
-- Executar no Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Necessário porque as migrations anteriores foram rodadas sem este campo.
-- =============================================================================

-- Schema: pelimotion

ALTER TABLE pelimotion.crm_contacts     ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.suppliers        ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.projects         ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.project_stages   ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.workflow_tasks   ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.tasks            ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.project_expenses ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.cash_flow        ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.products         ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE pelimotion.income_entries   ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;

-- Schema: personal

ALTER TABLE personal.tasks        ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE personal.expenses     ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE personal.investments  ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE personal.home_items   ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE personal.health_log   ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;
ALTER TABLE personal.projects     ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;

-- Verificação: mostra as tabelas que agora têm notion_id
SELECT table_schema, table_name, column_name
FROM information_schema.columns
WHERE column_name = 'notion_id'
  AND table_schema IN ('pelimotion', 'personal')
ORDER BY table_schema, table_name;
