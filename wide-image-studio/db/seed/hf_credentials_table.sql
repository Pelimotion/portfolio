-- ============================================================
-- wide-image-studio :: hf_credentials (encrypted)
-- ============================================================
-- Tabela para guardar credenciais Higgsfield criptografadas, caso queira
-- gerenciar via Supabase em vez de variáveis de ambiente do Bunny.
--
-- ⚠️ NOTA: a recomendação principal é guardar HF_API_KEY/HF_SECRET nas env
-- vars do painel Bunny Edge (mais simples, não passa pelo DB). Esta tabela
-- existe como backup/alternative caso queira:
-- - Rotacionar credenciais sem redeploy
-- - Ter múltiplos "tenants" com credenciais HF separadas no futuro
-- - Audit log de quem acessou
--
-- Se ficar só no .env do Bunny, este arquivo pode ser pulado.
-- ============================================================

-- pgsodium é incluso no Supabase mas precisa ser habilitado explicitamente:
create extension if not exists pgsodium with schema pgsodium cascade;

create table if not exists public.hf_credentials (
  id              uuid primary key default gen_random_uuid(),
  label           text not null unique,             -- ex: 'default', 'pelimotion-team'
  api_key_encrypted   text not null,                -- pgsodium encrypted
  api_secret_encrypted text not null,
  key_id          uuid not null,                    -- pgsodium key id (de pgsodium.create_key())
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  rotated_at      timestamptz,
  created_by      uuid references auth.users(id)
);

comment on table public.hf_credentials is
  'Credenciais Higgsfield criptografadas via pgsodium. Acessível apenas via service_role no edge script. Alternativa às env vars do Bunny.';

-- RLS: ninguém vê via API direta. Só service_role bypassa.
alter table public.hf_credentials enable row level security;

-- (sem policies = ninguém autenticado consegue ler/escrever direto)

-- View para o service_role ler decriptado (server-side only, jamais expor via REST)
create or replace function public.get_hf_credentials(p_label text default 'default')
returns table(api_key text, api_secret text)
language sql
security definer
set search_path = public, pgsodium
as $$
  select
    pgsodium.crypto_aead_det_decrypt(
      decode(api_key_encrypted, 'base64'),
      convert_to(label, 'utf8'),
      key_id
    )::text as api_key,
    pgsodium.crypto_aead_det_decrypt(
      decode(api_secret_encrypted, 'base64'),
      convert_to(label, 'utf8'),
      key_id
    )::text as api_secret
  from public.hf_credentials
  where label = p_label
    and active = true
  limit 1;
$$;

-- Apenas service_role pode chamar
revoke all on function public.get_hf_credentials(text) from public;
revoke all on function public.get_hf_credentials(text) from authenticated;
grant execute on function public.get_hf_credentials(text) to service_role;

-- ============================================================
-- Como inserir credenciais (rodar como service_role no SQL editor):
-- ============================================================
-- DO $$
-- DECLARE
--   v_key_id uuid;
-- BEGIN
--   -- Criar chave de criptografia (1 vez)
--   select pgsodium.create_key() into v_key_id;
--
--   insert into public.hf_credentials (label, api_key_encrypted, api_secret_encrypted, key_id)
--   values (
--     'default',
--     encode(pgsodium.crypto_aead_det_encrypt(
--       convert_to('hf_xxxxx', 'utf8'), convert_to('default', 'utf8'), v_key_id
--     ), 'base64'),
--     encode(pgsodium.crypto_aead_det_encrypt(
--       convert_to('sk_xxxxx', 'utf8'), convert_to('default', 'utf8'), v_key_id
--     ), 'base64'),
--     v_key_id
--   );
-- END $$;
--
-- Para o edge script usar:
-- select * from public.get_hf_credentials('default');
-- ============================================================
