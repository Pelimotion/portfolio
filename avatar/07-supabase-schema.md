# 07 — Supabase Schema
> Schema completo, RLS policies e migrations

---

## Migration SQL

```sql
-- ============================================================
-- PS2 Avatar System — Supabase Migration
-- Rodar em: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabela principal de seeds
create table if not exists avatar_seeds (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  face_seed   integer not null default 42,
  outfit_seed integer not null default 7,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Um registro por user
  constraint avatar_seeds_user_unique unique (user_id)
);

-- Index pra lookup rápido
create index if not exists avatar_seeds_user_id_idx on avatar_seeds(user_id);

-- ── RLS (Row Level Security) ─────────────────────────────
alter table avatar_seeds enable row level security;

-- Cada user lê apenas o próprio avatar
create policy "Users can read own avatar seeds"
  on avatar_seeds for select
  using (auth.uid() = user_id);

-- Cada user só escreve o próprio avatar
create policy "Users can upsert own avatar seeds"
  on avatar_seeds for insert
  with check (auth.uid() = user_id);

create policy "Users can update own avatar seeds"
  on avatar_seeds for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Tabela de avatares públicos (compartilhamento) ───────
-- Opcional: pra feature de "ver avatar de outros users"
create table if not exists avatar_public_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  face_seed     integer not null,
  outfit_seed   integer not null,
  is_public     boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table avatar_public_profiles enable row level security;

-- Qualquer um pode ver perfis públicos
create policy "Anyone can view public avatars"
  on avatar_public_profiles for select
  using (is_public = true);

-- User gerencia próprio perfil público
create policy "Users manage own public profile"
  on avatar_public_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Tabela de histórico de seeds (opcional) ──────────────
-- Guarda últimos 10 looks pra feature de "histórico/favoritos"
create table if not exists avatar_seed_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  face_seed   integer not null,
  outfit_seed integer not null,
  label       text,                -- Nome opcional: "Look 1", "Punk mode"
  created_at  timestamptz not null default now()
);

create index if not exists avatar_history_user_idx on avatar_seed_history(user_id, created_at desc);

alter table avatar_seed_history enable row level security;

create policy "Users manage own seed history"
  on avatar_seed_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Limitar a 10 registros por user (via trigger)
create or replace function trim_avatar_history()
returns trigger language plpgsql as $$
begin
  delete from avatar_seed_history
  where user_id = NEW.user_id
    and id not in (
      select id from avatar_seed_history
      where user_id = NEW.user_id
      order by created_at desc
      limit 10
    );
  return NEW;
end;
$$;

create trigger trim_avatar_history_trigger
after insert on avatar_seed_history
for each row execute function trim_avatar_history();

-- ── Updated_at automático ────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger avatar_seeds_updated_at
before update on avatar_seeds
for each row execute function update_updated_at();
```

---

## Tipos TypeScript (gerados do schema)

```ts
// types/avatar.ts
export interface AvatarSeed {
  id: string
  user_id: string
  face_seed: number
  outfit_seed: number
  created_at: string
  updated_at: string
}

export interface AvatarPublicProfile {
  user_id: string
  display_name: string | null
  face_seed: number
  outfit_seed: number
  is_public: boolean
  created_at: string
}

export interface AvatarSeedHistory {
  id: string
  user_id: string
  face_seed: number
  outfit_seed: number
  label: string | null
  created_at: string
}
```

---

## Supabase Client (lib/supabase.ts)

```ts
// lib/supabase.ts — client-side
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — server-side (Next.js App Router)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) }
      }
    }
  )
}
```

---

## Queries Supabase Completas

```ts
// services/avatarService.ts
import { createClient } from '../lib/supabase'
import type { AvatarSeed } from '../types/avatar'

const supabase = createClient()

// Carregar seeds do user
export async function loadAvatarSeeds(userId: string): Promise<AvatarSeed | null> {
  const { data, error } = await supabase
    .from('avatar_seeds')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {  // PGRST116 = not found
    console.error('Error loading avatar seeds:', error)
    return null
  }
  return data
}

// Salvar/atualizar seeds
export async function saveAvatarSeeds(
  userId: string,
  faceSeed: number,
  outfitSeed: number
): Promise<boolean> {
  const { error } = await supabase
    .from('avatar_seeds')
    .upsert({
      user_id: userId,
      face_seed: faceSeed,
      outfit_seed: outfitSeed,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving avatar seeds:', error)
    return false
  }
  return true
}

// Adicionar ao histórico
export async function addToHistory(
  userId: string,
  faceSeed: number,
  outfitSeed: number,
  label?: string
): Promise<void> {
  await supabase.from('avatar_seed_history').insert({
    user_id: userId,
    face_seed: faceSeed,
    outfit_seed: outfitSeed,
    label: label ?? null
  })
  // Trigger no DB limita automaticamente a 10 entradas
}

// Buscar histórico
export async function getHistory(userId: string) {
  const { data } = await supabase
    .from('avatar_seed_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return data ?? []
}

// Avatar público de outro user (pra perfil público)
export async function getPublicAvatar(userId: string) {
  const { data } = await supabase
    .from('avatar_public_profiles')
    .select('face_seed, outfit_seed, display_name')
    .eq('user_id', userId)
    .eq('is_public', true)
    .single()

  return data
}
```
