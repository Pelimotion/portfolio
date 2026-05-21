# wide-image-studio/db — schema e migrations

Aplicar antes do PR 4 (edge script depende da tabela existir).

## Estrutura

```
db/
├── README.md                          (este arquivo)
├── migrations/
│   └── 001_wide_jobs.sql              (tabela + trigger + realtime)
├── policies/
│   └── wide_jobs_rls.sql              (RLS por role wide_studio)
└── seed/
    ├── wide_studio_role.sql           (função has_wide_studio_role)
    └── hf_credentials_table.sql       (opcional — alternativa às env vars Bunny)
```

## Ordem de aplicação (importante!)

```
1. seed/wide_studio_role.sql           ← cria função, sem deps
2. migrations/001_wide_jobs.sql        ← cria tabela
3. policies/wide_jobs_rls.sql          ← policies usam função do passo 1
4. seed/hf_credentials_table.sql       ← OPCIONAL, só se for guardar creds no DB
```

## Como aplicar

### Opção A — Supabase CLI (recomendado)

```bash
cd wide-image-studio/db

# Linkar projeto Supabase (1 vez)
supabase link --project-ref <seu-project-ref>

# Aplicar tudo
supabase db push

# Verificar
supabase db diff   # deve estar limpo
```

> ⚠️ A CLI aplica `migrations/` automaticamente. Para `seed/` e `policies/`,
> use o método B abaixo OU concatene os arquivos numa migration única se preferir.

### Opção B — SQL Editor do dashboard

1. Abrir https://supabase.com/dashboard/project/<seu-ref>/sql/new
2. Colar conteúdo de `seed/wide_studio_role.sql` → Run
3. Colar conteúdo de `migrations/001_wide_jobs.sql` → Run
4. Colar conteúdo de `policies/wide_jobs_rls.sql` → Run
5. (Opcional) Colar conteúdo de `seed/hf_credentials_table.sql` → Run

## Atribuir role aos usuários da equipe

```sql
-- No SQL Editor (precisa de role service_role / dashboard admin)

update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                            || '{"role": "wide_studio"}'::jsonb
 where email in (
   'voce@pelimotion.com',
   'colega1@pelimotion.com',
   'colega2@pelimotion.com'
 );

-- Verificar
select email, raw_app_meta_data
  from auth.users
 where raw_app_meta_data ? 'role';
```

**Os usuários precisam fazer logout/login** depois da atribuição para o JWT
ser reemitido com a nova claim.

## Verificação rápida pós-aplicação

```sql
-- Tabela existe?
select count(*) from public.wide_jobs;          -- deve retornar 0 (vazia, OK)

-- Função existe?
select public.has_wide_studio_role();           -- false se você não tem a role

-- Policies ativas?
select policyname, cmd
  from pg_policies
 where tablename = 'wide_jobs';
-- deve listar: wide_jobs_select_own, wide_jobs_insert_own,
--              wide_jobs_cancel_own, wide_jobs_delete_own

-- Realtime ativo?
select * from pg_publication_tables
 where pubname = 'supabase_realtime'
   and tablename = 'wide_jobs';                 -- deve retornar 1 row
```

## Rollback (em caso de problema)

```sql
-- Cuidado: derruba todos os dados de wide_jobs

drop policy if exists "wide_jobs_select_own" on public.wide_jobs;
drop policy if exists "wide_jobs_insert_own" on public.wide_jobs;
drop policy if exists "wide_jobs_cancel_own" on public.wide_jobs;
drop policy if exists "wide_jobs_delete_own" on public.wide_jobs;

drop trigger if exists wide_jobs_completed_at on public.wide_jobs;
drop trigger if exists wide_jobs_updated_at on public.wide_jobs;
drop function if exists public.wide_jobs_set_completed_at();

alter publication supabase_realtime drop table public.wide_jobs;

drop table if exists public.wide_jobs;
drop type if exists public.wide_job_status;

drop function if exists public.has_wide_studio_role();

-- hf_credentials (opcional, se foi aplicado)
drop function if exists public.get_hf_credentials(text);
drop table if exists public.hf_credentials;
```

## State machine de `wide_jobs.status`

```
created
   │
   ▼
master_pending ──────────► failed
   │                           ▲
   ▼                           │
master_ready ──► master_rejected (loop pra master_pending)
   │
   ▼
tiles_pending ───────────► failed
   │
   ▼
tiles_partial    (subset de tiles voltou)
   │
   ▼
tiles_ready
   │
   ▼
done

Em qualquer momento ativo (não terminal): → cancelled
Após 24h em qualquer estado: → expired
```

## Decisões fechadas

- **URLs externas, não bytes:** `ref_urls`, `master_url`, `tile_urls` são todas URLs hospedadas no Higgsfield. Coerente com zero-storage.
- **`expires_at` = 24h:** sincronizado com TTL natural das URLs HF. Cleanup job futuro marca status=expired.
- **`error_log` append-only:** array JSONB acumula erros parciais para debug, sem perder histórico.
- **`hf_master_job_id` / `hf_tile_job_ids[]`:** correlation com webhooks. Index GIN no array permite lookup rápido por job_id do HF.
