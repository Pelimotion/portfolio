@../AI_AGENT_BRIEFING.md
@STATUS.md

# AGENTE: PROJETOS-APP (Gerenciador Interno)
**Última atualização:** 2026-05-20 | **Status:** BETA — Fases A→K.9 completas

---

## O Que Este Projeto Faz
Gerenciador de projetos interno da Pelimotion.
- **Hoje:** hub operacional com Kanban, Calendário, Busca global, Document Intelligence (busca full-text em docs do Drive)
- **Futuro:** Dashboard financeiro, aprovação de conteúdo (vagas/editais), ERP leve

> **IMPORTANTE:** Este é o único projeto React do ecossistema.
> Não importar lógica daqui para projetos Vanilla. Manter isolado.

---

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | React + Vite |
| Estilização | Tailwind CSS + Shadcn/ui (setup manual) |
| DB/Auth | Supabase (Email/Senha) — projeto `gfaqnkmmbozmhroicqyc` |
| Deploy | Vercel (subpasta `projetos-app/dist`) |
| Busca local | Fuse.js (SmartSearch — ⌘⇧F) |
| Document search | Supabase tsvector BM25 + pgvector scaffold (DocSearch — ⌘⇧D) |
| PDF extraction | pdfjs-dist (lazy-loaded no browser) |

## Comandos
```bash
cd projetos-app
npm install --cache /tmp/npm-cache   # usar sempre (cache root-owned)
npm run dev     # desenvolvimento local (porta 5173)
npm run build   # build de produção → dist/
```

---

## Banco de Dados (Schema real — 2026-05-20)

> ⚠️ O schema antigo (`projects`, `scenes`, `daily_log`) foi substituído pela entidade universal `pages`.
> Não criar código baseado nas tabelas antigas — elas não existem mais.

```sql
-- Entidade universal: projetos, cenas, tarefas, qualquer hierarquia
pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  page_type     TEXT,        -- 'project' | 'scene' | 'task' | etc.
  status        TEXT,        -- depende do page_type (ver abaixo)
  parent_id     UUID REFERENCES pages(id),
  created_by    UUID,        -- auth.users.id (pode ser null em seeds antigos)
  drive_folder_url TEXT,
  stages        JSONB DEFAULT '[]',   -- períodos de etapas (Calendário)
  properties    JSONB DEFAULT '{}',   -- campos customizados
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
)

-- Chunks de documentos indexados do Google Drive
document_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES pages(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  mime_type     TEXT,
  chunk_index   INT NOT NULL,
  content       TEXT NOT NULL,
  content_tsv   tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED,
  char_offset   INT DEFAULT 0,
  modified_time TIMESTAMPTZ,
  indexed_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (drive_file_id, chunk_index)
)

-- KV store para pageToken do Drive changes.list (K.7)
kv_store (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

## Status de Kanban (page_type = 'project')
`briefing | producao | revisao | entregue`

## Migrations SQL pendentes (rodar no Supabase antes de usar)
```sql
-- Fase F: períodos de etapas no Calendário
ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;

-- K.5: hybrid search (só se for ativar pgvector)
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);

-- K.7: reindex cron (só se for deployar bunny-edge/reindex-cron)
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Módulos Implementados (Fases A→K.9)

- [x] Design System — tokens, primitivos UI, Tailwind config (Fase A)
- [x] CommandPalette — cmdk + Radix Dialog, hotkey ⌘K (Fase B)
- [x] DatabaseRenderer refactor — 1098 → 147 linhas (Fase C)
- [x] Calendário — 4 views (Mês/Semana/Dia/Agenda) + keyboard + drag-to-reschedule (Fase D)
- [x] Refinamento Visual + UX Polish — toasts, modais, sem window.alert (Fase E)
- [x] Períodos de Etapas no Calendário (Fase F)
- [x] Smart Search Global — Fuse.js client-side, ⌘⇧F (Fase G)
- [x] Drive Sync — DriveLink, parseDriveFolderId (Fase H)
- [x] Pipeline Legend — painel colapsável no Calendário (Fase I)
- [x] Lazy-loading de rotas — React.lazy, bundle 1.6MB → 825KB (Fase J)
- [x] Document Intelligence — indexação Drive + BM25 + modal ⌘⇧D (Fases K.1–K.9)
  - Tipos suportados: Google Docs, Google Sheets, Google Slides, PDF (pdfjs-dist), TXT, MD
  - DOCX: requer VITE_BUNNY_EXTRACT_URL (Bunny Edge K.7)

## Módulos Planejados
- [ ] Dashboard financeiro / faturamento
- [ ] Aprovação de conteúdo (vagas, editais)
- [ ] Avatar Engine (PS2-era, idle behaviors)

---

## Variáveis de Ambiente

| Var | Uso | Status |
|-----|-----|--------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Configurada |
| `VITE_SUPABASE_ANON_KEY` | Chave pública Supabase | ✅ Configurada |
| `VITE_BUNNY_EXTRACT_URL` | Extração de DOCX via Bunny Edge | ⚠️ Não configurada (DOCX pulado) |
| `VITE_BUNNY_EMBED_URL` | Embeddings Vertex AI para hybrid search | ⚠️ Não configurada (K.5 inativo) |
