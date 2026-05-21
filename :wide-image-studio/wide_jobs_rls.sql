-- ============================================================
-- wide-image-studio :: RLS policies para wide_jobs
-- ============================================================
-- Aplicar APÓS migrations/001_wide_jobs.sql e seed/wide_studio_role.sql.
--
-- Políticas:
-- - SELECT: usuário vê apenas seus jobs E precisa ter role wide_studio
-- - INSERT: usuário cria apenas jobs para si E precisa ter role wide_studio
-- - UPDATE: o próprio usuário pode cancelar; service_role atualiza tudo (webhook)
-- - DELETE: somente o dono (raramente usado; jobs expiram naturalmente)
--
-- service_role (usado pelo edge script) bypassa RLS automaticamente — não
-- precisa de policy específica.
-- ============================================================

alter table public.wide_jobs enable row level security;

-- =========================
-- SELECT
-- =========================
drop policy if exists "wide_jobs_select_own" on public.wide_jobs;
create policy "wide_jobs_select_own"
  on public.wide_jobs
  for select
  to authenticated
  using (
    auth.uid() = user_id
    and public.has_wide_studio_role()
  );

-- =========================
-- INSERT
-- =========================
drop policy if exists "wide_jobs_insert_own" on public.wide_jobs;
create policy "wide_jobs_insert_own"
  on public.wide_jobs
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and public.has_wide_studio_role()
  );

-- =========================
-- UPDATE
-- =========================
-- Usuários só podem mudar status para 'cancelled' nos próprios jobs ainda ativos.
-- Updates de progresso (master_ready, tiles_ready, etc) vêm via service_role.
drop policy if exists "wide_jobs_cancel_own" on public.wide_jobs;
create policy "wide_jobs_cancel_own"
  on public.wide_jobs
  for update
  to authenticated
  using (
    auth.uid() = user_id
    and public.has_wide_studio_role()
    and status in ('created', 'master_pending', 'master_ready', 'tiles_pending', 'tiles_partial')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

-- =========================
-- DELETE
-- =========================
-- Raramente usado; jobs expiram via cleanup. Mas deixar disponível para LGPD/privacy.
drop policy if exists "wide_jobs_delete_own" on public.wide_jobs;
create policy "wide_jobs_delete_own"
  on public.wide_jobs
  for delete
  to authenticated
  using (
    auth.uid() = user_id
    and public.has_wide_studio_role()
  );

-- ============================================================
-- Teste das policies (via Supabase dashboard "Try out" ou:):
-- ============================================================
-- -- Como usuário sem role wide_studio: deve retornar 0 rows.
-- set role authenticated;
-- set request.jwt.claim.sub = '<uuid-de-user-sem-role>';
-- select count(*) from public.wide_jobs;
--
-- -- Como usuário com role wide_studio: deve retornar seus jobs.
-- set request.jwt.claim.sub = '<uuid-de-user-com-role>';
-- set request.jwt.claim.app_metadata = '{"role":"wide_studio"}';
-- select count(*) from public.wide_jobs where user_id = '<uuid>';
--
-- Reset:
-- reset role;
-- ============================================================
