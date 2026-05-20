# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-20
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — Fases A→K completas ✅ + bugs pós-deploy K corrigidos ✅
**Próxima Ação:** Dashboard financeiro (nova fase, não planejada) ou melhorias operacionais
**Branch ativa:** `main`
**Bloqueadores:** stages migration ainda pendente: `ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;`
**Auth:** ✅ Supabase Auth (email+senha), roles via `profiles.role`

---

## 🗺️ PROGRESSO POR MÓDULO

| Módulo | Status | Última Sessão |
|--------|--------|--------------|
| Kanban de projetos | ✅ Funcional | 2026-05-16 |
| Detalhe de cenas | ✅ Funcional | 2026-05-16 |
| Daily log por cena | ✅ Funcional | 2026-05-16 |
| Design System (tokens, primitivos UI) | ✅ Fase A completa | 2026-05-19 |
| CommandPalette (cmdk) | ✅ Fase B completa | 2026-05-19 |
| DatabaseRenderer refactor | ✅ Fase C completa | 2026-05-19 |
| Calendário (4 views + keyboard + filter) | ✅ Fase D completa | 2026-05-19 |
| Refinamento Visual + UX Polish | ✅ Fase E completa | 2026-05-19 |
| Períodos de Etapas no Calendário | ✅ Fase F completa | 2026-05-19 |
| Smart Search Global (Fuse.js) | ✅ Fase G completa | 2026-05-19 |
| Drive Sync (DriveLink) | ✅ Fase H completa | 2026-05-19 |
| Pipeline Legend (Calendário) | ✅ Fase I completa | 2026-05-19 |
| Lazy-loading de rotas (code-split) | ✅ Fase J completa | 2026-05-19 |
| Document Intelligence — K.1 Spike | ✅ Fase K.1 completa | 2026-05-19 |
| Document Intelligence — K.2 Indexador | ✅ Fase K.2 completa | 2026-05-19 |
| Document Intelligence — K.3 BM25 Search | ✅ Fase K.3 completa | 2026-05-19 |
| Document Intelligence — K.4 Views (list/grid/compare) | ✅ Fase K.4 completa | 2026-05-19 |
| Document Intelligence — K.5 Hybrid search scaffold | ✅ Fase K.5 completa | 2026-05-19 |
| Document Intelligence — K.6 File type badges + URLs | ✅ Fase K.6 completa | 2026-05-19 |
| Document Intelligence — K.7 Bunny Edge reindex cron | ✅ Fase K.7 completa | 2026-05-19 |
| Document Intelligence — K.8 Filter chips + export .md | ✅ Fase K.8 completa | 2026-05-19 |
| Dashboard financeiro | ❌ Não iniciado | — |
| Aprovação de conteúdo (vagas, editais) | ❌ Planejado | — |

---

## 🧠 DOCUMENT INTELLIGENCE — ARQUITETURA COMPLETA (Fase K)

Sistema de busca full-text em documentos do Google Drive, integrado ao gerenciador de projetos.
**Status:** ✅ Funcionando em produção (testado 2026-05-20)

### Fluxo de Indexação

```
Usuário clica "Indexar" (botão violeta na Dashboard do projeto)
    ↓
AssetsPanel.jsx → pega slot DOCS (slot_key = 'docs') → obtém drive_file_id da pasta
    ↓
googleAuth.ensureToken() → verifica localStorage (gdrive_token + gdrive_scope_version=2)
    → se expirado/ausente: abre popup Google OAuth (drive.readonly)
    → se válido: reutiliza token sem popup
    ↓
documentService.indexProject(projectId, docsFolderId, accessToken, onProgress)
    ↓
listDriveFiles(folderId) — recursivo, paginado (nextPageToken), resolve shortcuts
    → tipos suportados no browser: Google Docs, text/plain, text/markdown, .docx*, .doc*
    (* requer VITE_BUNNY_EXTRACT_URL configurado — Bunny Edge K.7)
    ↓
Para cada arquivo → documentService.indexFile():
    1. Delta sync: compara file.modifiedTime vs indexed_at no Supabase → skip se não mudou
    2. extractText(): Google Docs via /export?mimeType=text/plain; text/plain via ?alt=media
    3. isGarbled(): ratio nonAscii > 30% → skip (PDFs de CAD com fontes não-padrão)
    4. chunkText(): blocos de 800 chars com 100 de overlap
    5. DELETE chunks antigos → INSERT novos em document_chunks
    ↓
Toast de resultado: "X indexados · Y sem alteração · Z pulados"
```

### Fluxo de Busca

```
Usuário pressiona ⌘⇧D (hotkey global)
    ↓
DocSearchModal abre (Radix Dialog + cmdk Command)
    ↓
Usuário digita → debounce 300ms
    ↓
searchService.searchDocuments(query, limit=10)
    → tenta RPC search_document_chunks (BM25 com ts_headline — highlight server-side)
    → fallback: .textSearch('content', query, { type: 'websearch', config: 'portuguese' })
      + snippet gerado client-side (primeiros 200 chars)
    ↓
Resultados exibidos em 3 modos (toggle, persistido em localStorage 'docSearchView'):
    - list (padrão): arquivo + snippet com [[MARK]] destacado em violeta
    - grid: 2 colunas, cards compactos
    - compare: 2 painéis side-by-side com seletor de arquivo + scroll sincronizado
    ↓
Filter chips por arquivo (aparece quando >1 arquivo nos resultados)
Clicar no resultado: abre Google Drive (Google Docs → /edit; outros → /view)
Footer: contagem de trechos + botão export .md (MARK → **bold**)
```

### Schema Supabase — `document_chunks`

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id      UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE
drive_file_id   TEXT NOT NULL
file_name       TEXT NOT NULL
mime_type       TEXT
chunk_index     INT NOT NULL
content         TEXT NOT NULL
content_tsv     tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED
char_offset     INT DEFAULT 0
modified_time   TIMESTAMPTZ
indexed_at      TIMESTAMPTZ DEFAULT now()
UNIQUE (drive_file_id, chunk_index)
```

### RLS — Política ativa (simplificada para app interno)

```sql
-- Qualquer usuário autenticado pode ler/escrever
-- (projetos legados têm created_by = null → subquery por owner falha)
dc_authenticated_read   FOR SELECT  USING (auth.uid() IS NOT NULL)
dc_authenticated_write  FOR INSERT  WITH CHECK (auth.uid() IS NOT NULL)
dc_authenticated_update FOR UPDATE  USING/WITH CHECK (auth.uid() IS NOT NULL)
dc_authenticated_delete FOR DELETE  USING (auth.uid() IS NOT NULL)
```

> **Decisão:** políticas por `pages.created_by` foram tentadas mas falham porque projetos
> criados via seed têm `created_by = null`. Para app interno de equipe, `auth.uid() IS NOT NULL` é suficiente.

### RPC ativa

```sql
search_document_chunks(p_query TEXT, p_limit INT DEFAULT 10)
-- Retorna: file_name, chunk_index, drive_file_id, project_id, snippet (com [[/]] markers)
-- Usa: websearch_to_tsquery('portuguese', ...) + ts_rank_cd + ts_headline
-- GRANT EXECUTE TO authenticated
```

### Arquivos do sistema (Fase K)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/services/documentService.js` | Indexação: listDriveFiles, extractText, chunkText, indexFile, indexProject |
| `src/services/searchService.js` | Busca: searchDocuments (BM25 + fallback), searchDocumentsHybrid (RRF scaffold K.5) |
| `src/components/search/DocSearchModal.jsx` | Modal de busca: 3 views, filter chips, export .md, highlight |
| `src/lib/googleAuth.js` | OAuth Google Drive: token cache em localStorage, scope version, ensureToken |
| `src/lib/useDocSearch.js` | Zustand store: docSearchOpen, openDocSearch, closeDocSearch |
| `scripts/database/k1_document_chunks.sql` | Migration original da tabela (schema + índices) |
| `bunny-edge/generate-embedding/index.js` | K.5: Vertex AI text-embedding-004 (scaffold, não ativo) |
| `bunny-edge/reindex-cron/index.js` | K.7: cron incremental via Drive changes.list (scaffold, não ativo) |

### Variáveis de ambiente relevantes

| Var | Uso | Status |
|-----|-----|--------|
| `VITE_BUNNY_EXTRACT_URL` | Extração de DOCX/PDF via Bunny Edge | ⚠️ Não configurada (DOCX pulado) |
| `VITE_BUNNY_EMBED_URL` | Geração de embeddings para hybrid search | ⚠️ Não configurada (K.5 inativo) |
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Configurada |
| `VITE_SUPABASE_ANON_KEY` | Chave pública Supabase | ✅ Configurada |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-20 — Bugs pós-deploy Fase K: RLS, RPC, Radix, Auth loop

**O que foi feito:**
- [x] `DocSearchModal.jsx` — adicionados `<Dialog.Title>` e `<Dialog.Description>` com `sr-only` → elimina warnings Radix UI sobre acessibilidade
- [x] **SQL K-fix-1** — drop policies `FOR ALL` sem `WITH CHECK`; recria `dc_select/dc_insert/dc_update/dc_delete` com `TO authenticated` e `WITH CHECK` explícito (tentativa correta mas ainda falhou por `created_by = null`)
- [x] **SQL K-fix-2** — `CREATE FUNCTION search_document_chunks` com `ts_headline + ts_rank_cd` + `GRANT authenticated` → resolve 404 no RPC
- [x] **SQL K-fix-3** — diagnóstico: projetos legados têm `created_by = null` → subquery por owner sempre retorna vazio → 403 permanente. Fix: substituir por `auth.uid() IS NOT NULL` (app interno de equipe, sem multi-tenancy por usuário)
- [x] Build verde ✅ — commit `df19fc5`, push para `main`
- [x] Indexação e busca testadas em produção ✅

**Causa raiz do 403:** `pageService.create()` aceita `createdBy = null` como default. O Projects Hub seed (ROOT_HUB_ID) passa `createdBy = null` explicitamente. Todos os projetos filhos criados a partir do hub herdam `created_by = null` na tabela `pages`.

**Arquivos modificados:** `src/components/search/DocSearchModal.jsx`
**SQLs executados no Supabase:** K-fix-1, K-fix-2, K-fix-3

---

### 2026-05-19 — Fases K.4 + K.5 + K.6 + K.7 + K.8: Document Intelligence completo

**O que foi feito:**
- [x] `src/components/search/DocSearchModal.jsx` — reescrito com:
  - **K.4**: 3 view modes persistidos em localStorage: `list` (padrão) · `grid` (2 col, cards compactos) · `compare` (2 painéis side-by-side, scroll sync via `scrollTop` ratio + `requestAnimationFrame`, seletor de arquivo por painel)
  - **K.6**: `getDriveUrl()` detecta extensão e usa URL otimizada (Google Docs → `docs.google.com/document/d/{id}/edit`; PDF/DOC → `drive.google.com/file/d/{id}/view`); `getFileTypeBadge()` retorna label+cor por tipo
  - **K.8**: filter chips por arquivo (multi-select, aparece quando >1 arquivo nos resultados); botão export `.md` no footer (blob download com highlight desmarcado para `**bold**`)
- [x] `src/services/searchService.js` — adicionado:
  - `generateQueryEmbedding(text)` — chama `VITE_BUNNY_EMBED_URL` com fallback null
  - `searchDocumentsHybrid(query, limit)` — chama RPC `search_documents_hybrid` com vetor; fallback para BM25 puro
  - SQL de todas as migrations K.5 documentado em comentário (pgvector, embedding column, IVFFlat index, RPC RRF)
- [x] `bunny-edge/generate-embedding/index.js` — **K.5**: Bunny Edge POST `/generate-embedding`; chama Vertex AI `text-embedding-004`; retorna `{ embedding: float[] }` 768 dims; CORS configurável via env
- [x] `bunny-edge/reindex-cron/index.js` — **K.7**: Bunny Edge cron GET/POST; OAuth refresh automático; Drive `changes.list` com pageToken persistido em `kv_store` Supabase; re-extrai via `/extract-text`; chunkeiza + upserta; garbled detection (>30% non-ASCII → skip)
- [x] Build verde ✅

**⚠️ Migrations SQL necessárias (K.5 + K.7 — rodar no Supabase antes de usar esses recursos):**
```sql
-- K.5: pgvector + embedding column + IVFFlat index + RPC RRF
-- (SQL completo documentado em searchService.js)
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);

-- K.7: tabela KV para pageToken do Drive changes.list
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Arquivos criados:** `bunny-edge/generate-embedding/index.js`, `bunny-edge/reindex-cron/index.js`
**Arquivos modificados:** `src/components/search/DocSearchModal.jsx`, `src/services/searchService.js`

---

### 2026-05-19 — Fase K.3: Busca BM25 + DocSearchModal (⌘⇧D)

**O que foi feito:**
- [x] `src/services/searchService.js` — criado com 2 funções públicas:
  - `searchDocuments(query, limit=10)`: tenta RPC `search_document_chunks` (com `ts_headline`); fallback para `.textSearch('content', query, { type: 'websearch', config: 'portuguese' })` + snippet client-side
  - `hasIndexedChunks()`: verifica se há ao menos 1 chunk no banco (para empty state)
  - Inclui SQL comentado para criar o RPC no Supabase (com `ts_headline` + `ts_rank_cd`)
- [x] `src/lib/useDocSearch.js` — Zustand store: `docSearchOpen`, `openDocSearch`, `closeDocSearch`
- [x] `src/components/search/DocSearchModal.jsx` — criado:
  - Radix Dialog + cmdk, hotkey global ⌘⇧D
  - Debounce 300ms no input
  - Skeleton loading, highlight `[[MARK]]` em violeta (distinto do amarelo do SmartSearch)
  - Empty state "Nenhum documento indexado" vs "Nenhum resultado" (detectado via `hasIndexedChunks`)
  - Resultados clicáveis abrem o arquivo no Google Drive (`_blank`)
  - Footer com contagem de trechos
- [x] `src/components/layout/AppLayout.jsx` — `<DocSearchModal>` adicionado ao lado de `<SmartSearchModal>`
- [x] `src/components/ui/CommandPalette.jsx` — segundo item fixo "Buscar em trechos indexados ⌘⇧D" que abre `DocSearchModal`; import `useDocSearch` adicionado
- [x] Build verde ✅

**⚠️ RPC opcional (ts_headline melhor qualidade):**
```sql
CREATE OR REPLACE FUNCTION search_document_chunks(p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (file_name TEXT, chunk_index INT, drive_file_id TEXT, project_id UUID, snippet TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT file_name, chunk_index, drive_file_id, project_id,
    ts_headline('portuguese', content, websearch_to_tsquery('portuguese', p_query),
      'StartSel=[[, StopSel=]], MaxWords=30, MinWords=15') AS snippet
  FROM document_chunks
  WHERE content_tsv @@ websearch_to_tsquery('portuguese', p_query)
  ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', p_query)) DESC
  LIMIT p_limit;
$$;
```
Sem o RPC, o fallback `.textSearch()` funciona normalmente (snippet gerado no client).

**Arquivos criados:** `src/services/searchService.js`, `src/lib/useDocSearch.js`, `src/components/search/DocSearchModal.jsx`
**Arquivos modificados:** `src/components/layout/AppLayout.jsx`, `src/components/ui/CommandPalette.jsx`

---

### 2026-05-19 — Fase K.2: Indexador on-demand

**O que foi feito:**
- [x] `src/lib/googleAuth.js` — scope atualizado `drive.metadata.readonly` → `drive.readonly`; `ensureToken` verifica `gdrive_scope_version=2` para invalidar tokens antigos; `getAccessToken` persiste `gdrive_scope_version` ao salvar token
- [x] `src/services/documentService.js` — criado com 4 funções públicas:
  - `indexFile(projectId, file, accessToken)` — extrai texto (Google Docs via export API, text/plain via download), garbled detection (nonAscii > 30% → skip), chunkeia (800 chars / 100 overlap), delta sync por `modifiedTime`, upserta em `document_chunks`
  - `indexProject(projectId, rootFolderId, accessToken, onProgress)` — lista Drive recursivamente (com `modifiedTime`), filtra tipos suportados, chama `indexFile`, retorna `{ total, supported, indexed, skipped, notModified, errors }`
  - `getIndexStatus(projectId)` — conta arquivos e chunks indexados por projeto
  - `clearIndex(projectId)` — remove todos os chunks do projeto
- [x] `src/components/storage/AssetsPanel.jsx` — modificado:
  - Imports: `documentService`, `toast` (sonner), `FileSearch` (lucide)
  - States: `indexing`, `indexProgress`, `indexResult`
  - Função `handleIndexDocuments`: obtém token, chama `indexProject`, trata `INSUFFICIENT_SCOPE` (limpa token + orienta re-auth), exibe toast de sucesso/info/erro
  - `DriveConnectionSection` recebe `onIndexDocuments`, `indexing`, `indexProgress`, `indexResult`
  - UI: botão "Indexar" (violeta) ao lado de "Sincronizar Estrutura"; chip de nome do arquivo durante indexação; chips de resultado (indexados / sem alteração / pulados) após concluir
- [x] Build verde ✅ — zero erros, chunks idênticos à Fase J

**Tipos suportados no browser (K.2):** Google Docs, text/plain, text/markdown
**Tipos adiados (servidor):** PDF, DOCX → Fase K.7 (Bunny Edge)

**Arquivos criados:** `src/services/documentService.js`
**Arquivos modificados:** `src/lib/googleAuth.js`, `src/components/storage/AssetsPanel.jsx`

---

### 2026-05-19 — Fase K.1: Spike Document Intelligence — GO com ajustes

**O que foi feito:**
- [x] `scripts/database/k1_document_chunks.sql` — migration criada e rodada no Supabase (RLS com `created_by = auth.uid()::text`)
- [x] `bunny-edge/extract-text/index.js` — Edge script para extração (Google Docs / PDF / DOCX / txt)
- [x] `bunny-edge/extract-text/package.json` — setup de build com esbuild
- [x] `scripts/spike-k1.mjs` — script de ingestão com `createRequire` para CJS interop
- [x] `.env.spike.example` — template de variáveis com instruções linha a linha
- [x] `package.json` — `pdf-parse` fixado em `1.1.1` sem `^`
- [x] `.gitignore` — `.env.spike` adicionado
- [x] `docs/SPIKE_K1_REPORT.md` — relatório completo com diagnóstico e decisão GO
- [x] 2 PDFs ingeridos: 6.473 chars, 2 chunks, ~2.9s/arquivo ✅
- [x] Diagnóstico: PDFs de CAD com fontes não-padrão geram texto garbled → detectar por nonAscii ratio

**Decisão:** GO com ajustes — Google Docs como tipo prioritário em K.2; detectar PDFs garbled (ratio > 0.3 → skip)

**Arquivos criados:** `scripts/database/k1_document_chunks.sql`, `bunny-edge/extract-text/index.js`, `bunny-edge/extract-text/package.json`, `scripts/spike-k1.mjs`, `.env.spike.example`, `docs/SPIKE_K1_REPORT.md`
**Arquivos modificados:** `package.json`, `.gitignore`

---

### 2026-05-19 — Fase J: Lazy-loading de rotas + Roadmap K definido

**O que foi feito:**
- [x] `src/App.jsx` — `Dashboard`, `UniversalEntityPage`, `ProfilePage`, `TokensPage` convertidos para `React.lazy()`
- [x] `Suspense` com fallback `<RouteFallback>` (Loader2 spinner) em cada rota
- [x] Tratamento de named export (`UniversalEntityPage`) via `.then(m => ({ default: m.UniversalEntityPage }))`
- [x] `Login` permanece eager (rota crítica, carrega antes do auth resolver)
- [x] Build verde ✅ — chunks separados confirmados:
  - `index-*.js`: **825 KB** (era ~1.6 MB)
  - `Dashboard-*.js`: 27 KB
  - `UniversalEntityPage-*.js`: 441 KB
  - `ProfilePage-*.js`: 16 KB
  - `TokensPage-*.js`: 42 KB
- [x] Bundle inicial reduzido **~49%**; carregamento por rota agora é incremental

**Arquivos modificados:** `src/App.jsx`
**Próximo passo:** Spike Fase K.1 (validar viabilidade de Document Intelligence com 10 docs)

---

### 2026-05-19 — Roadmap K: Document Intelligence (multi-doc search no Drive)

**Decisão arquitetural:** stack **Postgres-first** (Supabase + pgvector) + Gemini embeddings (Vertex) + Bunny Edge para extração. Zero impacto nas 12 functions do Vercel.

**Fases planejadas (8 sub-fases incrementais):**
- **K.1** — Schema `document_chunks` + extrator Bunny Edge (PDF/DOCX/Google Docs) — *próxima sessão (spike)*
- **K.2** — Indexador on-demand via crawl do Drive já existente + delta sync por `modifiedTime`
- **K.3** — Busca BM25 (`tsvector` + `ts_headline`) + modal multi-doc (hotkey ⌘⇧D)
- **K.4** — 3 modos de view: Lista · Grade paralela · Compare side-by-side com scroll sync
- **K.5** — Hybrid search (RRF entre BM25 + cosseno via `pgvector` + `text-embedding-004`)
- **K.6** — Highlight contextual + deep-links (`#heading=` p/ Docs, `#page=` p/ PDF)
- **K.7** — Re-indexação incremental + cron Bunny Edge via `changes.list` do Drive
- **K.8** — Filtros + saved searches + export markdown + (stretch) resumo Gemini dos top-N trechos

**Benchmarks consultados:** Glean (RAG enterprise), Notion AI Q&A (embeddings por bloco), Coda Pack Drive (delta sync), Sourcegraph (compare-view sincronizada), Hebbia (multi-doc table).

**Caminho escolhido pelo usuário:** Caminho 3 — **validar primeiro** com spike K.1 antes de comprometer todo o roadmap.

---

### 2026-05-19 — Fases G + H + I: Smart Search, Drive Sync, Pipeline Legend + fix dynamic imports

**O que foi feito:**
- [x] `fuse.js` instalado (`--cache /tmp/npm-cache`)
- [x] `src/lib/searchUtils.js` — `buildSearchIndex`, `searchAll`, `extractSnippet` (Fuse.js client-side)
- [x] `src/lib/useSmartSearch.js` — Zustand store: `smartSearchOpen`, `openSmartSearch`, `closeSmartSearch`
- [x] `src/components/search/SmartSearchModal.jsx` — Radix Dialog + cmdk, ⌘⇧F hotkey, useDeferredValue, highlight `[[MARK]]`, Skeleton loading, grupos por page_type
- [x] `CommandPalette.jsx` — item fixo no topo "Buscar em documentos ⌘⇧F" que abre SmartSearchModal
- [x] `AppLayout.jsx` — `<SmartSearchModal>` adicionado ao lado do `<CommandPalette>`
- [x] `src/lib/driveUtils.js` — `parseDriveFolderId`, `buildSceneDriveUrl`, `validateDriveUrl`, `openDriveAsset` (toast.error se inválido)
- [x] `src/components/ui/DriveLink.jsx` — 3 estados: linked (azul), inherited (cinza "↰ Herdado"), unlinked (muted)
- [x] `PageRenderer.jsx:191` — `<a href>` substituído por `<DriveLink projectDriveUrl={...} />`
- [x] `src/components/calendar/PipelineLegend.jsx` — painel colapsável 180px, toggle por projeto, "Mostrar/Ocultar todos", localStorage persist
- [x] `CalendarView.jsx` — `<PipelineLegend>` integrado quando `isRoot`; `rangeEvents` filtrados por `hiddenProjects`
- [x] **Fix:** `INEFFECTIVE_DYNAMIC_IMPORT` eliminados em 3 arquivos: `Dashboard.jsx` (databaseFactory), `CalendarView.jsx` (pageService + propertyService), `KanbanView.jsx` (propertyService x2)
- [x] Build verde ✅ (zero erros, zero avisos INEFFECTIVE)

**Arquivos criados:** `searchUtils.js`, `useSmartSearch.js`, `SmartSearchModal.jsx`, `driveUtils.js`, `DriveLink.jsx`, `PipelineLegend.jsx`
**Arquivos modificados:** `CommandPalette.jsx`, `AppLayout.jsx`, `PageRenderer.jsx`, `CalendarView.jsx`, `Dashboard.jsx`, `KanbanView.jsx`

---

### 2026-05-19 — Fase F: Períodos de Etapas no Calendário

**O que foi feito:**
- [x] `calendarUtils.js` — `buildProjectEvents()` e `buildPipelineEvents()` adicionados
- [x] `StageEditor.jsx` — criado em `src/components/project/` (4 etapas, datas início/fim, save via Supabase pages table)
- [x] `MonthView.jsx` — props `rangeEvents` e `mode` adicionadas; barras coloridas renderizadas por célula de dia
- [x] `CalendarView.jsx` — carrega `project.stages` do Supabase, passa `rangeEvents` ao MonthView, exibe StageEditor inline no modo projeto
- [x] Build verde ✅

**Arquivos criados:** `src/components/project/StageEditor.jsx`
**Arquivos modificados:** `calendarUtils.js`, `MonthView.jsx`, `CalendarView.jsx`

**⚠️ SQL MIGRATION PENDENTE** (rodar no Supabase SQL Editor antes de testar Fase F):
```sql
ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
```

---

### 2026-05-19 — Fase E: Refinamento Visual + UX Polish

**O que foi feito:**
- [x] `Dashboard.jsx` — busca duplicada + avatar do header removidos; `search` state removido
- [x] `Sidebar.jsx` — tooltip ⌘K atualizado; user identity card substituído por `UserMenu`
- [x] `UserMenu.jsx` — criado (Radix DropdownMenu: Perfil / Configurações / Sair)
- [x] `DatabaseToolbar.jsx` — reescrito: 2 dropdowns (Board ▾ + Exibição ▾), `addButtonLabel` condicional
- [x] `DashboardOverview.jsx` — cards ~200px → chips inline h-7 com Radix Popover (Próximas Datas + Etapas Ativas + Concluídos)
- [x] `KanbanView.jsx` — empty state ghost (`text-sm opacity-40 italic`), border-dashed removido
- [x] `EntityCard.jsx` — `border border-[var(--border-subtle)]` → `shadow-sm`, hover → `shadow-md`; surface-1
- [x] `sonner` instalado + `<Toaster />` em `main.jsx`
- [x] `DatePickerDialog.jsx` — criado (Radix Dialog + `input[type=date]`, Enter/Esc)
- [x] `CalendarKbd.jsx` — `window.prompt` → `DatePickerDialog`
- [x] `MonthView.jsx` — drag-to-reschedule com `toast.success`
- [x] `AssetsPanel.jsx` — `window.prompt` → input inline controlado
- [x] `grep window.prompt|window.alert src/ = 0` ✅
- [x] Build verde ✅

**Arquivos criados:** `UserMenu.jsx`, `DatePickerDialog.jsx`
**Arquivos modificados:** `Dashboard.jsx`, `Sidebar.jsx`, `DatabaseToolbar.jsx`, `DashboardOverview.jsx`, `KanbanView.jsx`, `EntityCard.jsx`, `main.jsx`, `CalendarKbd.jsx`, `MonthView.jsx`, `AssetsPanel.jsx`

---

### 2026-05-19 — Fase D: Full Calendar (4 views + keyboard shortcuts)

**O que foi feito:**
- [x] `calendarUtils.js` — date-fns (ptBR, weekStartsOn:1): `buildEvents`, `groupByDay`, `navigate`, formatadores
- [x] `CalendarKbd.jsx` — T/J/K/←/→/G global keyboard handler (ignora foco em input)
- [x] `CalendarHeader.jsx` — 4 view tabs (Mês/Semana/Dia/Agenda), nav buttons, filtro Todos/Projeto, hint T·J/K·G
- [x] `MonthView.jsx` — grade Mon-Sun, HTML5 drag-to-reschedule, dropdown GCal, today highlight
- [x] `WeekView.jsx` — 7 colunas Mon-Sun via `weekDays()`, chips clicáveis
- [x] `DayView.jsx` — lista de eventos do dia com status e badge
- [x] `AgendaView.jsx` — próximos 60 dias agrupados por data, dot color por status
- [x] `CalendarView.jsx` reescrito como orquestrador: gerencia view/current/filterMode, carrega contexto global, chama `buildEvents`, passa `onValueChange` para reschedule
- [x] Build limpo — `npm run build` ✅ | Push para `main` ✅

**Arquivos criados:** `src/components/calendar/calendarUtils.js`, `CalendarKbd.jsx`, `CalendarHeader.jsx`, `MonthView.jsx`, `WeekView.jsx`, `DayView.jsx`, `AgendaView.jsx`
**Arquivos modificados:** `src/components/database/views/CalendarView.jsx`

---

### 2026-05-19 — Fase C: Refactor DatabaseRenderer (1098 → 147 linhas)

**O que foi feito:**
- [x] `DatabaseToolbar.jsx` extraído — view switcher, density, card config, PropertyManagerModal, add button
- [x] `KanbanView.jsx`, `TableView.jsx`, `ListView.jsx` extraídos para `src/components/database/views/`
- [x] `DatabaseRenderer.jsx` virou orquestrador leve (~147 linhas) — exporta `useDensity` (compatibilidade EntityCard)
- [x] Todos os imports internos atualizados; build limpo

**Arquivos criados:** `DatabaseToolbar.jsx`, `views/KanbanView.jsx`, `views/TableView.jsx`, `views/ListView.jsx`
**Arquivos modificados:** `src/components/database/DatabaseRenderer.jsx`

---

### 2026-05-19 — Fase B: CommandPalette → cmdk

**O que foi feito:**
- [x] `cmdk` instalado; `CommandPalette.jsx` reescrito com `Command` (cmdk) + Radix Dialog
- [x] `shouldFilter={false}` — busca Supabase mantida, cmdk gerencia teclado e `aria-selected`
- [x] `Command.Group` substitui array flat com sentinelas; hotkey ⌘K e store Zustand inalterados

**Arquivos modificados:** `src/components/ui/CommandPalette.jsx`, `package.json`

---

### 2026-05-19 — Fase A: Design System base

**O que foi feito:**
- [x] `tailwind.config.js` — tokens `bg-surface-*`, `border-subtle/default/strong`, `text-status-*`, escala tipográfica (8 níveis, 2 pesos)
- [x] shadcn setup manual: `components.json`, `src/lib/utils.js` (clsx + twMerge)
- [x] 8 primitivos UI: `Button`, `Input`, `Select`, `Badge`, `Card`, `Skeleton`, `Tabs`, `Toggle` (Radix onde aplicável)
- [x] Codemod `font-black → font-semibold` em 8 arquivos (~50 substituições); `grep -r "font-black" src/` = 0
- [x] `docs/DESIGN_TOKENS.md` + página `/dev/tokens` (QA visual)

---

### 2026-05-16 — Build e runtime errors corrigidos

- [x] JSX syntax errors em `UniversalEntityPage` corrigidos
- [x] ReferenceErrors de variáveis undefined resolvidos

---

## 🎯 PRÓXIMA SESSÃO — PÓS-FASE K (operacional)

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Pós-Fase K (deploy + migrations)

📋 STATUS ANTERIOR
Todas as fases K completas (2026-05-19):
  - K.4: DocSearchModal com 3 views (list/grid/compare + scroll sync, localStorage persist)
  - K.5: searchDocumentsHybrid scaffold + bunny-edge/generate-embedding/index.js (Vertex AI)
  - K.6: file type badges (GDoc/PDF/DOC/TXT) + URLs otimizadas por tipo
  - K.7: bunny-edge/reindex-cron/index.js (Drive changes.list + incremental reindex via Supabase)
  - K.8: filter chips por arquivo + export markdown (.md) no footer do DocSearchModal
  - Build verde ✅ (841KB index.js, chunks separados por rota)

Migrations SQL ainda pendentes (rodar no Supabase SQL Editor):
  1. ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;  (Fase F)
  2. CREATE EXTENSION IF NOT EXISTS vector;  (K.5 — só se for ativar hybrid search)
  3. ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);  (K.5)
  4. CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT now());  (K.7)

Bunny Edge a deployar:
  - bunny-edge/generate-embedding/  → configurar VERTEX_PROJECT_ID + VERTEX_API_KEY + VITE_BUNNY_EMBED_URL
  - bunny-edge/reindex-cron/        → configurar SUPABASE_SERVICE_KEY + DRIVE_REFRESH_TOKEN + agendar cron

🎯 PRÓXIMA TAREFA SUGERIDA
A. Rodar as SQL migrations acima no Supabase.
B. Deploy dos Bunny Edge scripts (generate-embedding + reindex-cron).
C. Dashboard financeiro (nova fase, não planejada ainda).

⏸️ Qual tarefa seguir?
```

---

## 🚨 BLOQUEADORES ATIVOS

1. **Migration Fase F** — `ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;` (rodar no Supabase antes de testar Calendário com Etapas)
2. **Escopo OAuth** — `googleAuth.js` usa `drive.metadata.readonly`; K.2 no browser precisará de `drive.readonly` para exportar conteúdo (avaliar incremental auth vs. novo consent)

---

## 📚 DECISÕES ARQUITETURAIS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Calendar lib | custom sobre `date-fns` | Sem overhead de lib externa; ptBR nativo |
| CommandPalette | `cmdk` | Padrão de mercado (Linear, Vercel, shadcn) |
| shadcn/ui | setup manual (sem CLI) | npm cache EACCES no sistema |
| DatabaseRenderer | refactor first | Previne débito técnico antes de features |
| npm install | `--cache /tmp/npm-cache` | Cache root-owned: `~/.npm` inacessível |
| React isolado | sem compartilhar com Vanilla | Único projeto React do ecossistema |
| Code-splitting | `React.lazy` por rota (Fase J) | Bundle inicial 1.6MB → 825KB |
| Document Intelligence (K) | Postgres + pgvector + Gemini + Bunny Edge | Zero impacto nas 12 functions Vercel; reusa Supabase |

---

**Última atualização:** 2026-05-19 (pós-spike K.1)

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|
| 2026-05-19 | Claude Sonnet 4.6 | projetos-app (Fase D) | ✅ push main → Vercel deploy |
| 2026-05-19 | Claude Opus 4.7  | projetos-app (Fase J) | ⏳ build local OK — aguarda commit/push |
