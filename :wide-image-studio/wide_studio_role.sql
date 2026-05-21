-- ============================================================
-- wide-image-studio :: role wide_studio
-- ============================================================
-- Cria função helper que verifica se o usuário atual tem a role.
-- A role é atribuída via app_metadata.role no Supabase Auth
-- (campo raw_app_meta_data em auth.users; só admin/service_role pode editar).
--
-- Aplicar ANTES de migrations/001_wide_jobs.sql porque as policies
-- usam essa função.
-- ============================================================

-- Função para verificar role no JWT do usuário atual.
-- Usa auth.jwt() (built-in do Supabase) que retorna o JWT decodificado.
create or replace function public.has_wide_studio_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'wide_studio',
    false
  );
$$;

comment on function public.has_wide_studio_role() is
  'Returns true if the current authenticated user has role=wide_studio in app_metadata. Used by RLS policies in wide_jobs table. Role must be assigned via service_role on auth.users.raw_app_meta_data.';

-- Concede execute para authenticated (usuários logados podem chamar)
grant execute on function public.has_wide_studio_role() to authenticated;

-- ============================================================
-- Como atribuir a role a um usuário (rodar como service_role):
-- ============================================================
--
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--                            || '{"role": "wide_studio"}'::jsonb
--  where email in ('voce@pelimotion.com', 'colega@pelimotion.com');
--
-- Para verificar:
-- select email, raw_app_meta_data
--   from auth.users
--  where raw_app_meta_data ? 'role';
--
-- Para revogar:
-- update auth.users
--    set raw_app_meta_data = raw_app_meta_data - 'role'
--  where email = 'ex-colega@pelimotion.com';
-- ============================================================
