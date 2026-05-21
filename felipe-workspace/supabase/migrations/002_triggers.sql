-- =============================================================================
-- PELIMOTION OS — Triggers
-- Migração: 002_triggers.sql
-- Rodar APÓS 001_initial_schema.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNÇÃO: atualiza updated_at automaticamente em qualquer tabela
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- MACRO: aplica o trigger em todas as tabelas do schema
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    -- pelimotion
    'pelimotion.crm_contacts',
    'pelimotion.suppliers',
    'pelimotion.projects',
    'pelimotion.project_stages',
    'pelimotion.workflow_tasks',
    'pelimotion.tasks',
    'pelimotion.project_expenses',
    'pelimotion.cash_flow',
    'pelimotion.products',
    'pelimotion.income_entries',
    -- personal
    'personal.tasks',
    'personal.expenses',
    'personal.investments',
    'personal.home_items',
    'personal.health_log',
    'personal.projects'
  ];
  schema_name TEXT;
  table_name TEXT;
  trigger_name TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    schema_name := SPLIT_PART(tbl, '.', 1);
    table_name  := SPLIT_PART(tbl, '.', 2);
    trigger_name := 'trg_' || table_name || '_updated_at';

    EXECUTE FORMAT(
      'CREATE OR REPLACE TRIGGER %I
       BEFORE UPDATE ON %I.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      trigger_name, schema_name, table_name
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNÇÃO: cria perfil automaticamente quando usuário é criado no Supabase Auth
-- (reutiliza a tabela profiles já existente no projeto)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'editor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Só cria se ainda não existir (projeto já pode ter essa trigger do auth unificado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNÇÃO: valida consistência de datas em project_stages
-- (start_date deve ser ≤ end_date — já há CHECK constraint, mas este trigger
--  dá mensagem de erro amigável para a UI)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION pelimotion.validate_stage_dates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'A data de fim da etapa (%) não pode ser anterior à data de início (%).',
      NEW.end_date, NEW.start_date;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_project_stages_validate_dates
  BEFORE INSERT OR UPDATE ON pelimotion.project_stages
  FOR EACH ROW EXECUTE FUNCTION pelimotion.validate_stage_dates();

-- ─────────────────────────────────────────────────────────────────────────────
-- ÍNDICES (performance para queries frequentes)
-- ─────────────────────────────────────────────────────────────────────────────

-- Projetos: busca por cliente e status
CREATE INDEX idx_projects_client       ON pelimotion.projects (client);
CREATE INDEX idx_projects_stage        ON pelimotion.projects (stage);
CREATE INDEX idx_projects_is_delivered ON pelimotion.projects (is_delivered);
CREATE INDEX idx_projects_notion_id    ON pelimotion.projects (notion_id);

-- Etapas: busca por projeto e range de datas (core do calendário)
CREATE INDEX idx_stages_project_id  ON pelimotion.project_stages (project_id);
CREATE INDEX idx_stages_date_range  ON pelimotion.project_stages (start_date, end_date);
CREATE INDEX idx_stages_start_date  ON pelimotion.project_stages (start_date);

-- Tarefas PLM: busca por projeto
CREATE INDEX idx_plm_tasks_project_id ON pelimotion.tasks (project_id);
CREATE INDEX idx_plm_tasks_is_done    ON pelimotion.tasks (is_done);

-- CRM: busca por status e temperatura
CREATE INDEX idx_crm_status   ON pelimotion.crm_contacts (crm_status);
CREATE INDEX idx_crm_lead_temp ON pelimotion.crm_contacts (lead_temp);

-- Saídas pessoais: busca por mês de competência
CREATE INDEX idx_personal_expenses_competence ON personal.expenses (competence_date);
CREATE INDEX idx_personal_expenses_is_paid    ON personal.expenses (is_paid);
CREATE INDEX idx_personal_expenses_due_date   ON personal.expenses (due_date);

-- Saúde: busca por data
CREATE INDEX idx_health_log_date ON personal.health_log (log_date);

-- Full-text search em nomes de projeto e clientes
CREATE INDEX idx_projects_name_trgm ON pelimotion.projects USING gin (name gin_trgm_ops);
CREATE INDEX idx_crm_name_trgm      ON pelimotion.crm_contacts USING gin (name gin_trgm_ops);
