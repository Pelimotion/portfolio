-- ============================================================
-- wide-image-studio :: migration 001
-- ============================================================
-- Cria tabela wide_jobs (state machine completa de uma geração ultra-wide).
--
-- Pré-requisito: seed/wide_studio_role.sql aplicado.
-- Pré-requisito: extensão moddatetime habilitada (Supabase tem por default;
--                se não, criar com: create extension if not exists moddatetime).
-- ============================================================

create extension if not exists moddatetime schema extensions;
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- Enum de status (mais seguro que texto livre)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'wide_job_status') then
    create type public.wide_job_status as enum (
      'created',
      'master_pending',
      'master_ready',
      'master_rejected',
      'tiles_pending',
      'tiles_partial',
      'tiles_ready',
      'done',
      'failed',
      'cancelled',
      'expired'
    );
  end if;
end$$;

-- Tabela principal
create table if not exists public.wide_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,

  -- State machine
  status          public.wide_job_status not null default 'created',

  -- Brief recebido do frontend (JSON canônico, validado pelo edge)
  brief           jsonb not null,

  -- URLs de input (refs do usuário, hospedadas no Higgsfield após upload)
  ref_urls        text[] not null default array[]::text[],

  -- Higgsfield job IDs (para correlation com webhooks)
  hf_master_job_id  text,
  hf_tile_job_ids   text[] not null default array[]::text[],

  -- URLs de output (Higgsfield, efêmeras ~24h)
  master_url      text,
  tile_urls       text[] not null default array[]::text[],   -- index = tile_idx

  -- Telemetria
  estimated_cost_usd  numeric(8,2),
  actual_cost_usd     numeric(8,2),
  duration_seconds    integer,

  -- Error log append-only
  error_log       jsonb not null default '[]'::jsonb,

  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz,
  expires_at      timestamptz not null default (now() + interval '24 hours')
);

-- Índices úteis
create index if not exists idx_wide_jobs_user_id on public.wide_jobs(user_id);
create index if not exists idx_wide_jobs_status on public.wide_jobs(status);
create index if not exists idx_wide_jobs_created_at on public.wide_jobs(created_at desc);
create index if not exists idx_wide_jobs_hf_master on public.wide_jobs(hf_master_job_id)
  where hf_master_job_id is not null;
create index if not exists idx_wide_jobs_hf_tiles on public.wide_jobs using gin(hf_tile_job_ids);

-- Trigger para auto-update do updated_at
drop trigger if exists wide_jobs_updated_at on public.wide_jobs;
create trigger wide_jobs_updated_at
  before update on public.wide_jobs
  for each row
  execute function extensions.moddatetime(updated_at);

-- Trigger para auto-set completed_at quando status vira terminal
create or replace function public.wide_jobs_set_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('done', 'failed', 'cancelled', 'expired')
     and old.status not in ('done', 'failed', 'cancelled', 'expired')
     and new.completed_at is null then
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists wide_jobs_completed_at on public.wide_jobs;
create trigger wide_jobs_completed_at
  before update on public.wide_jobs
  for each row
  execute function public.wide_jobs_set_completed_at();

-- Habilitar Realtime para a tabela
-- (Supabase: alter publication supabase_realtime add table)
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    -- Tenta adicionar; ignora se já estiver
    begin
      alter publication supabase_realtime add table public.wide_jobs;
    exception when duplicate_object then
      null;
    end;
  end if;
end$$;

-- Comentários (documentação inline)
comment on table public.wide_jobs is
  'State machine de jobs de geração ultra-wide. URLs são todas externas (Higgsfield); nenhum byte de mídia fica armazenado aqui. Expira em 24h junto com as URLs HF.';

comment on column public.wide_jobs.brief is
  'JSON do brief original. Inclui display preset, master_prompt, regions[], consistency (seed, soul_id), quality (models, overlap_pct).';

comment on column public.wide_jobs.ref_urls is
  'URLs no Higgsfield (após upload via /v2/files). Não são URLs nossas.';

comment on column public.wide_jobs.tile_urls is
  'URLs de output dos tiles no Higgsfield, indexadas por tile_idx (0..N-1). Efêmeras ~24h.';

comment on column public.wide_jobs.error_log is
  'Array de objetos {phase, error, timestamp}. Append-only via edge script.';

comment on column public.wide_jobs.expires_at is
  'Quando as URLs HF expiram. Cleanup job (futuro) marca status=expired após esse momento.';

-- ============================================================
-- Verificação rápida pós-migration:
-- ============================================================
-- select * from information_schema.tables where table_name = 'wide_jobs';
-- select * from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'wide_jobs';
-- ============================================================
