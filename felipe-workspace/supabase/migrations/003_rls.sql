-- =============================================================================
-- PELIMOTION OS — Row Level Security (RLS)
-- Migração: 003_rls.sql
-- Rodar APÓS 002_triggers.sql
-- =============================================================================
-- Modelo de roles (já existe em public.profiles):
--   admin  → acesso total a tudo
--   editor → leitura e escrita no próprio domínio (pelimotion + personal)
--   viewer → somente leitura
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNÇÃO HELPER: retorna o role do usuário atual
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- MACRO: ativa RLS e cria policies padrão para todas as tabelas
-- Política:
--   SELECT  → admin, editor, viewer (todos os autenticados)
--   INSERT  → admin, editor
--   UPDATE  → admin, editor
--   DELETE  → apenas admin
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
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
    'personal.tasks',
    'personal.expenses',
    'personal.investments',
    'personal.home_items',
    'personal.health_log',
    'personal.projects'
  ];
  s TEXT; t TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    s := SPLIT_PART(tbl, '.', 1);
    t := SPLIT_PART(tbl, '.', 2);

    -- Ativa RLS
    EXECUTE FORMAT('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', s, t);

    -- SELECT: qualquer usuário autenticado
    EXECUTE FORMAT(
      'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated
       USING (public.current_user_role() IN (''admin'', ''editor'', ''viewer''))',
      'pol_' || t || '_select', s, t
    );

    -- INSERT: admin e editor
    EXECUTE FORMAT(
      'CREATE POLICY %I ON %I.%I FOR INSERT TO authenticated
       WITH CHECK (public.current_user_role() IN (''admin'', ''editor''))',
      'pol_' || t || '_insert', s, t
    );

    -- UPDATE: admin e editor
    EXECUTE FORMAT(
      'CREATE POLICY %I ON %I.%I FOR UPDATE TO authenticated
       USING (public.current_user_role() IN (''admin'', ''editor''))
       WITH CHECK (public.current_user_role() IN (''admin'', ''editor''))',
      'pol_' || t || '_update', s, t
    );

    -- DELETE: somente admin
    EXECUTE FORMAT(
      'CREATE POLICY %I ON %I.%I FOR DELETE TO authenticated
       USING (public.current_user_role() = ''admin'')',
      'pol_' || t || '_delete', s, t
    );

  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS em public.profiles (já existente no projeto)
-- Garante que cada usuário só vê/edita o próprio perfil (exceto admin)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê só o próprio perfil; admin vê todos
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- Usuário edita só o próprio perfil
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Apenas admin pode inserir/deletar perfis diretamente
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- GRANT: dá acesso aos schemas para o role authenticated
-- (Supabase por padrão restringe schemas custom)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA pelimotion TO authenticated, service_role;
GRANT USAGE ON SCHEMA personal   TO authenticated, service_role;

GRANT ALL ON ALL TABLES    IN SCHEMA pelimotion TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pelimotion TO service_role;
GRANT ALL ON ALL TABLES    IN SCHEMA personal   TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA personal   TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA pelimotion TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA personal   TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA pelimotion TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA personal   TO authenticated;
