# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-21
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — Fases A→Q completas ✅ | Build verde | Último commit: `131ad60`
**Próxima Ação:** Verificar se ReferenceError `ct` persiste no novo deploy; se persistir → investigar com sourcemaps habilitados
**Branch ativa:** `main`
**Bloqueadores:** Nenhum bloqueador ativo
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
| Document Intelligence — K.9 GSheets + GSlides + PDF nativo | ✅ Fase K.9 completa | 2026-05-20 |
| Revisão Visual + UX — L.1 Rebrand + Padrões P&B | ✅ Fase L.1 completa | 2026-05-20 |
| Revisão Visual + UX — L.2 Header responsivo + topo redesign | ✅ Fase L.2 completa | 2026-05-20 |
| Revisão Visual + UX — L.3 Cards + Kanban ordering + Checkbox | ✅ Fase L.3 completa | 2026-05-20 |
| Revisão Visual + UX — L.4 Persistência de preferências | ✅ Fase L.4 completa | 2026-05-20 |
| Revisão Visual + UX — L.5 Dashboard + Auditoria | ✅ Fase L.5 completa | 2026-05-20 |
| Revisão Visual + UX — L.6 Bugfix PropertyManagerModal | ✅ Fase L.6 completa | 2026-05-20 |
| Fase M — M.1 Breadcrumb fix (parent title real) | ✅ completo | 2026-05-20 |
| Fase M — M.2 Pattern v3 (4 motivos novos + rotation/scale + cache) | ✅ completo | 2026-05-20 |
| Fase M — M.3 PropertyManagerModal (Radix Popover + scroll fix) | ✅ completo | 2026-05-20 |
| Fase M — M.4 ViewPreferences completo (sort/filter/density persistidos) | ✅ completo | 2026-05-20 |
| Fase M — M.5 Dashboard Hub (Board/Grid/Timeline + pipeline bar + filtros) | ✅ completo | 2026-05-20 |
| Fase M — M.6 Calendar "Geral do Mês" (Gantt por projeto) | ✅ completo | 2026-05-20 |
| Fase M — M.7 Topbar redesign (h-12, breadcrumb, shadow on scroll, avatar) | ✅ completo | 2026-05-20 |
| Fase M — M.8 Features competitivas (Favoritos, ActivityPulse, BulkActions, Templates, StatusAccent) | ✅ completo | 2026-05-20 |
| Fase N — N.2 Fix busca (Cena 07a/07b) | ✅ completo | 2026-05-20 |
| Fase N — N.3 Fix breadcrumb (Pipeline → Projeto) | ✅ completo | 2026-05-20 |
| Fase N — N.5 DocSearch GSheets/GSlides/PDF | ✅ completo | 2026-05-20 |
| Fase N — N.4 Página de cena (3 abas: Overview + Notes + Assets) | ✅ completo | 2026-05-20 |
| Fase N — N.1 Collapsing header (isCollapsed + max-h transition) | ✅ completo | 2026-05-20 |
| Fase N — N.6 Avatares 3D (skin 15 tons, hair 18 estilos, facial hair, ProfilePage hero) | ✅ completo | 2026-05-20 |
| Fase N — N.7 Dashboard redesign (topbar consolidado, pipeline+filtros colapsáveis) | ✅ completo | 2026-05-20 |
| Fase P — Dashboard Financeiro | ✅ Funcional (FinancialTab + ClientsManager) | 2026-05-21 |
| Fase Q — Cover Images + Scene Checkboxes + Pinned Doc | ✅ Completo e deployado | 2026-05-21 |
| Fix: 409 Conflict (projects_identity upsert) | ✅ Corrigido — `onConflict: 'slug'` | 2026-05-21 |
| Fix: ReferenceError `ct` (UniversalEntityPage) | 🔍 Investigado — sem circular deps; novo bundle deployado | 2026-05-21 |
| Sourcemaps habilitados em prod | ✅ `build: { sourcemap: true }` no vite.config.js | 2026-05-21 |
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

### 2026-05-20 — Fase P: Dashboard Financeiro (P.1→P.6 completos)

**O que foi feito:**
- [x] **P.1** SQL Migrations rodadas via Supabase Management API (personal access token):
  - `ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB` (Fase F pendente)
  - `DROP + CREATE FUNCTION search_document_chunks` com coluna `mime_type` (Fase N.5)
  - `CREATE TABLE financial_records` + `clients` + `project_clients` com RLS
- [x] **P.2** `src/services/financialService.js` — CRUD (list, create, update, destroy), summary() com totais + 6 meses, exportCSV()
- [x] **P.2** `src/services/clientService.js` — CRUD de clientes + link/unlink de project_clients
- [x] **P.3** `Dashboard.jsx` — financial summary bar: totais Recebido/Pendente/Vencido + mini bar chart SVG últimos 6 meses
- [x] **P.4** `src/components/financial/FinancialTab.jsx` — tab Financeiro em cada projeto: cards de resumo, CRUD inline (criar/editar/excluir registros), export CSV
- [x] **P.4** `UniversalEntityPage.jsx` — tab "Financeiro" adicionada em PROJECT_TABS; `<FinancialTab>` + `<LinkClientPanel>` renderizados na tab
- [x] **P.5** `src/components/financial/ClientsManager.jsx` — gerenciador standalone de clientes (lista, criar, editar, excluir) + `LinkClientPanel` (vincular/desvincular clientes a projetos)
- [x] **P.5** `Sidebar.jsx` — link "Clientes" adicionado à navegação (expansão + colapsado); rota `/clients` no `App.jsx`
- [x] **P.6** Export CSV integrado no `FinancialTab` (botão CSV no toolbar de registros)
- [x] Build verde ✅ (812KB index.js, zero erros)

**Arquivos criados:** `src/services/financialService.js`, `src/services/clientService.js`, `src/components/financial/FinancialTab.jsx`, `src/components/financial/ClientsManager.jsx`
**Arquivos modificados:** `Dashboard.jsx`, `UniversalEntityPage.jsx`, `Sidebar.jsx`, `App.jsx`, `STATUS.md`

---

### 2026-05-20 — Fase O: Fixes Kanban + Filtros Board + Checkboxes (O.2→O.8 completos)

**O que foi feito:**
- [x] **O.2** `KanbanView.jsx` — drag cross-column com posição exata: `onReorderPersist` sempre chamado (fallback `push` quando overIndex=-1)
- [x] **O.3** `KanbanView.jsx` — date picker do header de coluna oculto quando `entityType === 'project'` (Board do Hub limpo)
- [x] **O.4** `DatabaseRenderer.jsx` + `Dashboard.jsx` — prop `filterParams` adicionada ao DatabaseRenderer; filtros quickFilter/searchText do Dashboard propagados ao Board view via `boardFilterParams` useMemo
- [x] **O.5** `KanbanView.jsx` — input de nome de status controlado: `editingLabel` state + `labelInputRef`; suporta acentos, espaços, Escape cancela
- [x] **O.6** `KanbanView.jsx` — botão `...` (MoreHorizontal) no header de cada coluna; DropdownMenu com "Renomear" (foca o input) e "Excluir coluna" (migra cards para coluna adjacente + toast)
- [x] **O.7** `DatabaseRenderer.jsx` — auto-cria property "Feito" (checkbox) quando `entityType !== 'project'` e ela não existe; EntityCard já exibe o checkbox corretamente
- [x] **O.8** Build verde ✅ (843KB index.js, zero erros)

**Arquivos modificados:** `KanbanView.jsx`, `DatabaseRenderer.jsx`, `Dashboard.jsx`, `STATUS.md`
**Commit Fase O:** `0ff6996` | **Fix post-audit:** `9d64eaf` (null-safety + remove prompt/reload)
**Push:** ✅ `main` → Vercel deploy
**SQL O.1 ainda pendente:** rodar manualmente no Supabase (ver seção PRÓXIMA SESSÃO)

---

### 2026-05-20 — Fase N: 7 blocos de fixes e melhorias (N.1→N.7 completos)

**O que foi feito:**
- [x] **N.2** `searchUtils.js` — `minMatchCharLength: 2→1` + `useExtendedSearch: true`; guard `query.length < 1` — fix busca "Cena 07a/07b"
- [x] **N.3** `UniversalEntityPage.jsx` — useEffect de parent resolution: se `parent.page_type === 'database'`, sobe mais um nível e usa título/id do projeto avô no breadcrumb
- [x] **N.5** `searchService.js` — fallback select inclui `mime_type`; `DocSearchModal.jsx` — `getDriveUrl` recebe `mimeType` e gera URLs corretas para GSheets/GSlides/GDocs/Drive
- [x] **N.4** `UniversalEntityPage.jsx` — `SCENE_TABS` += `overview` (default); scene default tab usa localStorage; handlers para `overview` e `notes` adicionados; `SceneOverview.jsx` criado (Detalhes + Atividade + back-to-project)
- [x] **N.1** `UniversalEntityPage.jsx` — `isCollapsed` state com hysteresis (collapse >60px, expand <10px); hero com `max-h` CSS transition; topbar exibe título em destaque quando colapsado
- [x] **N.6** `FaceGenerator.js` — skin tones 9→15, hair styles 12→18, `facialHair` params + `buildFacialHair()`; `OutfitGenerator.js` — tops/outer/headwear expandidos; `ProfilePage.jsx` — AvatarWidget 160×200 hero no topo da aba Perfil
- [x] **N.7** `Dashboard.jsx` — topbar consolidado h-14 (busca central expandível, view toggle + Novo à direita); pipeline bar inline + filter chips em linha colapsável; `DashboardOverview` removida da stack vertical

**Arquivos criados:** `src/components/scene/SceneOverview.jsx`
**Arquivos modificados:** `searchUtils.js`, `UniversalEntityPage.jsx`, `searchService.js`, `DocSearchModal.jsx`, `FaceGenerator.js`, `OutfitGenerator.js`, `ProfilePage.jsx`, `Dashboard.jsx`, `STATUS.md`
**Build:** ✅ verde (844KB index.js, zero erros) — commit `b2edd1d`

**SQL migration ainda necessária (N.5 RPC — opcional mas melhora qualidade do snippet):**
```sql
-- Atualizar RPC para retornar mime_type (rodar no Supabase SQL Editor):
CREATE OR REPLACE FUNCTION search_document_chunks(p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (file_name TEXT, chunk_index INT, drive_file_id TEXT, project_id UUID, snippet TEXT, mime_type TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT file_name, chunk_index, drive_file_id, project_id, mime_type,
    ts_headline('portuguese', content, websearch_to_tsquery('portuguese', p_query),
      'StartSel=[[, StopSel=]], MaxWords=30, MinWords=15') AS snippet
  FROM document_chunks
  WHERE content_tsv @@ websearch_to_tsquery('portuguese', p_query)
  ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', p_query)) DESC
  LIMIT p_limit;
$$;
```

---

### 2026-05-20 — Fase M: 8 blocos de melhoria (M.1→M.8 completos)

**O que foi feito:**
- [x] **M.1** `UniversalEntityPage.jsx` — breadcrumb exibe título real do projeto pai (fetchById fallback + `parentPageTitle` state)
- [x] **M.2** `pattern-generator.js` — PATTERN_VERSION=3, 4 motivos novos (kumiko, yagasuri, hexTessellation, tessen), rotation/scale por seed; `generativeService.js` — version check no cache
- [x] **M.3** `PropertyManagerModal.jsx` — Radix Popover substitui `window.confirm`, `max-h-[85vh]` + `overflow-y-auto` no body, botões de delete sempre visíveis, footer sticky
- [x] **M.4** `DatabaseRenderer.jsx` + `DatabaseToolbar.jsx` — sort (5 campos) e filterText persistidos em viewPreferences; UI de sort com RadioGroup Radix; input de filtro inline com clear
- [x] **M.5** `Dashboard.jsx` — reescrito: 3 views (Board/Grid/Timeline), pipeline summary bar, quick filters (Atrasados/Em andamento/Entregues/Sem deadline), busca inline, Gantt por projeto
- [x] **M.6** `CalendarHeader.jsx` — tab "Geral do Mês"; `CalendarView.jsx` — integra ProjectTimelineView; `ProjectTimelineView.jsx` — criado (Gantt mensal com etapas por projeto)
- [x] **M.7** `UniversalEntityPage.jsx` — topbar h-12, shadow-sm ao rolar, TamagochiAvatar no canto direito, breadcrumb limpo
- [x] **M.8** Features competitivas:
  - `src/lib/useFavorites.js` — criado (hook localStorage `toca-favorites`)
  - `EntityCard.jsx` — estrela favorito (amarelo quando ativo), activity pulse (tempo relativo atualizado_em), status color accent fallback, bulk checkbox
  - `KanbanView.jsx` — modo seleção múltipla + floating action bar (Mover/Excluir) com Radix DropdownMenu
  - `CreateProjectModal.jsx` — template stages: Motion/CGI/Branding/Social criam 5 etapas automáticas via `pageService.update`

**Arquivos criados:** `src/lib/useFavorites.js`, `src/components/calendar/ProjectTimelineView.jsx`
**Arquivos modificados:** `UniversalEntityPage.jsx`, `pattern-generator.js`, `generativeService.js`, `PropertyManagerModal.jsx`, `DatabaseRenderer.jsx`, `DatabaseToolbar.jsx`, `Dashboard.jsx`, `CalendarHeader.jsx`, `CalendarView.jsx`, `EntityCard.jsx`, `KanbanView.jsx`, `CreateProjectModal.jsx`, `STATUS.md`
**Build:** ✅ verde (842KB index.js, zero erros)

---

### 2026-05-20 — Fase L: Revisão Visual + UX (L.1→L.6 completas)

**O que foi feito:**
- [x] **L.1** `palette.js` — paletas rebrand P&B (ICON_PALETTE: branco/cinza; PATTERN_PALETTE: preto/cinza escuro)
- [x] **L.1** `pattern-generator.js` — reescrito com 3 motivos orientais P&B: seigaiha, asanoha, shippo
- [x] **L.1** `GenerativeHeader.jsx` — botão Randomize removido; opacidade aumentada (0.35→0.45, 0.15→0.20)
- [x] **L.1** `Sidebar.jsx`, `Login.jsx`, `ProfilePage.jsx`, `Dashboard.jsx`, `gamification.js`, `useDocumentMetadata.js` — rebrand "Pelimotion" → "TOCA HUB"
- [x] **L.2** `UniversalEntityPage.jsx` — hero h-64→h-28/md:h-52; info bar com ícone 44×44 + título contentEditable + status+contexto; "Randomize Identity" movido para More Actions; `alert()` → `toast.success()`; `uppercase` removido do h1
- [x] **L.3** `EntityCard.jsx` — checkbox "Feito" funcional via `propertyService.upsertValue` direto (estado local otimista + rollback); ícones falsos MessageSquare/Paperclip removidos
- [x] **L.3** `KanbanView.jsx` — drop cross-column com posição correta via `onReorderPersist`
- [x] **L.4** `viewPreferences.js` — criado (`savePreference`, `loadPreference`)
- [x] **L.4** `DatabaseRenderer.jsx` — density e activeViewType persistidos em localStorage por databaseId
- [x] **L.5** `UniversalEntityPage.jsx` `ProductionDashboard` — 5 ocorrências `.checkbox === true` → `.checked === true` (bug de contagem de progresso)
- [x] **L.6** `PropertyManagerModal.jsx` — modal controlado (`open`/`onOpenChange`); `onUpdate()` chamado apenas no fechamento; `useEffect` sincroniza só na abertura; `max-h-[90vh]` para viewports curtos

**Arquivos criados:** `src/lib/viewPreferences.js`
**Arquivos modificados:** `palette.js`, `pattern-generator.js`, `GenerativeHeader.jsx`, `UniversalEntityPage.jsx`, `EntityCard.jsx`, `KanbanView.jsx`, `DatabaseRenderer.jsx`, `PropertyManagerModal.jsx`, `Sidebar.jsx`, `Login.jsx`, `ProfilePage.jsx`, `Dashboard.jsx`, `gamification.js`, `useDocumentMetadata.js`

---

### 2026-05-20 — Fase K.9: GSheets + GSlides + PDF nativo no browser

**O que foi feito:**
- [x] `src/services/documentService.js` — adicionados 3 novos tipos ao `SUPPORTED_MIME_TYPES`:
  - `application/vnd.google-apps.spreadsheet` → export como `text/csv`
  - `application/vnd.google-apps.presentation` → export como `text/plain`
  - `application/pdf` → download binário + extração via `pdfjs-dist` lazy-loaded
- [x] `src/components/search/DocSearchModal.jsx` — `getFileTypeBadge` atualizado para receber `mimeType`:
  - GSheet → badge verde `GSheet`
  - GSlide → badge amarelo `GSlide`
  - call site `DocResultItem` passa `result.mime_type`
- [x] `pdfjs-dist@5.7.284` instalado (lazy-loaded — só carrega ao encontrar PDF)
- [x] `STATUS.md` — bloqueador stale #2 removido, data do rodapé e deploy log corrigidos
- [x] Build verde ✅ — `pdf.worker.min.mjs` extraído como chunk separado

**Arquivos modificados:** `src/services/documentService.js`, `src/components/search/DocSearchModal.jsx`, `STATUS.md`, `package.json` (pdfjs-dist)

---

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

## 🎯 PRÓXIMA SESSÃO — FASE Q (Cover Images + Scene Checkboxes + Pinned Doc)

> **ANTES DE COMEÇAR:** Rodar as migrations pendentes no Supabase SQL Editor:
>
> ```sql
> -- Migration O.1-A: coluna stages (Fase F pendente)
> ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
>
> -- Migration O.1-B: RPC com mime_type (Fase N.5)
> CREATE OR REPLACE FUNCTION search_document_chunks(p_query TEXT, p_limit INT DEFAULT 10)
> RETURNS TABLE (file_name TEXT, chunk_index INT, drive_file_id TEXT, project_id UUID, snippet TEXT, mime_type TEXT)
> LANGUAGE sql STABLE SECURITY DEFINER AS $$
>   SELECT file_name, chunk_index, drive_file_id, project_id, mime_type,
>     ts_headline('portuguese', content, websearch_to_tsquery('portuguese', p_query),
>       'StartSel=[[, StopSel=]], MaxWords=30, MinWords=15') AS snippet
>   FROM document_chunks
>   WHERE content_tsv @@ websearch_to_tsquery('portuguese', p_query)
>   ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', p_query)) DESC
>   LIMIT p_limit;
> $$;
> GRANT EXECUTE ON FUNCTION search_document_chunks TO authenticated;
> ```

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Fase Q

📋 STATUS ANTERIOR
Fase O completa (2026-05-20) — commits 0ff6996 + 9d64eaf, build verde (843KB), push para main.
Implementado: drag cross-column, filtros board, input controlado status, menu coluna, auto-checkbox "Feito".
Sessão 2026-05-20 (planejamento): pesquisa de mercado profunda (Notion, Linear, Monday, Asana, ClickUp,
Jira, ftrack/ShotGrid VFX) + análise completa do código atual → plano detalhado Fase Q gerado.
Deploy Vercel ativo. Fase P (financeiro) postergada — Fase Q priorizada pelo usuário.

🎯 TAREFA DESTA SESSÃO
Fase Q — Cover Images elegantes + Checkboxes em Cenas com propagação de progresso + Documento Pinado no Dashboard.
ZERO SQL MIGRATIONS — tudo usa campos já existentes (pages.cover, pages.properties JSONB) ou properties existentes.

⚙️ MODO DE EXECUÇÃO
Execute sub-fase por sub-fase de forma autônoma. Não pergunte "prosseguir?" entre sub-fases.
Após cada sub-fase: rode `npm run build --prefix projetos-app` e corrija erros antes de avançar.
Ao final da fase inteira: commit único `feat(projetos-app): Fase Q completa` + atualizar STATUS.md.

📦 SUB-FASES EM ORDEM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q.1 — COVER IMAGES (projetos e cenas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXTO TÉCNICO:
- pages.cover já existe no schema Supabase (coluna TEXT, sempre null — nunca foi usada)
- pageService.js já aceita cover no create() e update() — só não é chamado
- EntityCard.jsx já renderiza cover via property text (busca prop nomeada 'capa'/'cover')
- GenerativeHeader.jsx renderiza SVG procedural P&B — deve ser o FALLBACK quando sem cover
- GenerativeCover.jsx existe mas pouco usado — mesh gradients coloridos

Q.1.1 — Hero híbrido na UniversalEntityPage
  Arquivo: src/pages/entity/UniversalEntityPage.jsx (linhas ~263-393, hero section)
  Mudança: Se page.cover existir → exibir <img> como background da hero area
           + pattern GenerativeHeader em opacity 0.12 por cima (blend sutil, identidade mantida)
           Se page.cover null → manter GenerativeHeader puro (comportamento atual)
  CSS: img: object-cover, opacity-80, transition-opacity 500ms
       Gradient overlay: bg-gradient-to-t from-[var(--surface-0)] via-[var(--surface-0)]/60 to-transparent
       Pattern blend: mix-blend-overlay opacity-[0.12]

Q.1.2 — CoverImageUploader component
  Criar: src/components/ui/CoverImageUploader.jsx
  Comportamento:
    - Input file oculto + área de drop (drag & drop)
    - Preview da imagem selecionada com crop simulado (aspect-ratio 5:2, object-cover)
    - Upload: PUT para Bunny Storage API → URL final pelimotion-portfolio.b-cdn.net/covers/{pageId}.webp
    - Variável de ambiente necessária: VITE_BUNNY_STORAGE_API_KEY (já deve existir no .env)
    - Fallback se Bunny não configurado: aceitar URL manual via input texto
    - Após upload: pageService.update(pageId, { cover: url })
    - Botão "Remover capa" → pageService.update(pageId, { cover: null })
  Onde aparece: botão "Alterar capa" no More Actions dropdown (UniversalEntityPage.jsx, hero section)
  Visual do botão: ImageIcon 16px + "Alterar capa" (texto discreto, abre popover com uploader)

Q.1.3 — EntityCard: priorizar pages.cover
  Arquivo: src/components/database/EntityCard.jsx (linha ~93-114)
  Mudança: coverUrl = item.cover || (coverP ? values[coverP.id]?.text : null)
  item.cover vem do pageService (já retorna o campo cover do Supabase select('*'))
  Sem mudança visual — o render existente (linhas 364-369) já funciona

Q.1.4 — Dashboard Grid: cover nos project cards
  Arquivo: src/pages/dashboard/Dashboard.jsx (ProjectGrid component, linhas ~378-441)
  Mudança: cada card no grid usa project.cover como background da hero (h-28)
           Se cover null → mantém GenerativeHeader atual
  Visual: mesma lógica do Q.1.1 — img + pattern blend sutil + gradient

Q.1.5 — Polish visual (referência de mercado)
  - Hover em card com cover: group-hover:scale-105 duration-700 (suave, não abrupto)
  - Sem border no cover area — luminance hierarchy (padrão Linear 2026)
  - Cover com opacity 0.75 em estado normal → opacity-90 no hover (cards ficam mais vivos)
  - Cards SEM cover: mantêm borda sutil border-[var(--border-subtle)] (distinção clara)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q.2 — CHECKBOXES EM CENAS (toggle + propagação)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXTO TÉCNICO:
- Property "Feito" (checkbox) já é auto-criada pelo DatabaseRenderer para entityType !== 'project'
- EntityCard.jsx já tem toggle funcional com estado otimista + rollback
- ProductionDashboard já conta cenas "feitas" (linha 587-641) — progress bar já existe
- SceneOverview.jsx é simples — só mostra metadata e atividade, SEM toggle visível
- UniversalEntityPage: hero da cena não exibe badge de "Feita"
- SceneOverview não carrega as properties da cena (recebe propValues mas não o doneProp)

SEMÂNTICA IMPORTANTE (não confundir):
  Checkbox "Feita" = produção interna finalizada (pronta para revisão interna)
                   ≠ Status Kanban "Entregue" (entrega ao cliente)
  São dimensões independentes — padrão Linear/Jira. Checkbox NÃO move o card no Kanban.

Q.2.1 — SceneCompletionToggle component
  Criar: src/components/scene/SceneCompletionToggle.jsx
  Props: { pageId, donePropId, checked, onChange, showLabel? }
  Visual:
    - Círculo 20px: border-2 cinza → preenchido emerald com checkmark quando checked
    - Transição: scale(1.15) + fill em 150ms cubic-bezier(0.4, 0, 0.2, 1)
    - Label: "Marcar como feita" / "✓ Feita" (toggle de texto)
    - Quando feita: label muda para verde + timestamp "Marcada hoje" ou "Marcada há Xd"
  Lógica: propertyService.upsertValue(pageId, donePropId, { checked: next }) — igual ao EntityCard

Q.2.2 — SceneOverview: toggle no topo
  Arquivo: src/components/scene/SceneOverview.jsx
  Mudança:
    - Receber props adicionais: donePropId, doneChecked, onDoneChange
    - Adicionar barra horizontal no TOPO (acima do card "Detalhes"):
      <div className="flex items-center gap-3 p-4 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl">
        <SceneCompletionToggle ... />
        <div className="text-xs text-muted-foreground">
          {checked ? 'Cena finalizada — pronta para próxima fase' : 'Marcar quando a produção estiver concluída'}
        </div>
      </div>

Q.2.3 — UniversalEntityPage: passar doneProp para SceneOverview
  Arquivo: src/pages/entity/UniversalEntityPage.jsx
  Mudança:
    - Buscar doneProp nas properties: properties.find(p => p.property_type === 'checkbox' && p.name.toLowerCase().includes('feito'))
    - Passar donePropId e doneChecked para SceneOverview via props
    - No hero da cena (!isProject): se isDone → adicionar badge emerald "Concluída" ao lado do título
      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
        ✓ Concluída
      </span>
    - Hero com cover + isDone: adicionar ring emerald sutil: ring-1 ring-emerald-500/20

Q.2.4 — Atalho de teclado Shift+D
  Arquivo: src/pages/entity/UniversalEntityPage.jsx
  Mudança: useEffect com keydown listener — quando Shift+D pressionado e !isProject e donePropId:
    toggle doneProp → chama propertyService.upsertValue → toast.success('✓ Cena marcada como feita')
    Ignorar se foco em input/textarea/contenteditable

Q.2.5 — Ring chart SVG no ProductionDashboard
  Arquivo: src/pages/entity/UniversalEntityPage.jsx (ProductionDashboard, linhas ~567-840)
  Mudança: ao lado da progress bar existente, adicionar SVG ring chart (donut):
    - SVG 64×64, viewBox 0 0 64 64
    - Círculo de fundo: cx=32 cy=32 r=24 stroke=var(--border-subtle) strokeWidth=6 fill=none
    - Arco de progresso: stroke-dasharray calculado de circumference (2π×24 ≈ 150.8)
      stroke-dashoffset = circumference × (1 - progress/100)
      Cor: hsl(142 71% 45%) (emerald) → hsl(45 93% 47%) (amber) quando < 50%
    - Texto central: "{progress}%" em font-bold text-[11px]
    - Animação: transition stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)
    - Posição: flexbox ao lado do texto "Progresso Geral X%"

Q.2.6 — Pipeline bar: segmento "Feitas" no Dashboard Hub
  Arquivo: src/pages/dashboard/Dashboard.jsx (pipeline stacked bar)
  Mudança: calcular doneByCkeckbox = cenas do projeto com property "Feito" checked === true
    Adicionar segmento emerald na stacked bar proporcional a doneByCkeckbox/total
    Tooltip: "X cenas marcadas como feitas"
    NOTA: requer carregar allValues das cenas — verificar se já está disponível no Dashboard

Q.2.7 — Toast + micro-animation na conclusão
  Arquivo: src/components/scene/SceneCompletionToggle.jsx
  Mudança: ao marcar feita → dispara partícula CSS (3 pontos emerald expandindo e desvanecendo)
    Implementação pura CSS: ::after pseudo-element com keyframe scale + opacity
    Sem biblioteca externa. Duração: 600ms, não bloqueia interação
    toast.success com action "Desfazer" (5s timeout):
      toast.success('Cena marcada como feita', { action: { label: 'Desfazer', onClick: () => toggle(false) }, duration: 5000 })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q.3 — DOCUMENTO PINADO NO DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXTO TÉCNICO:
- DocsSectionDashboard já existe (UniversalEntityPage.jsx linhas 843-1059)
- Atualmente: grid de arquivos com links externos — lista flat sem destaque
- pages.properties é JSONB — aceita qualquer key sem migration
- pageService.update(pageId, { properties: { ...props, pinned_doc: {...} } }) → funciona
- Google Docs publica URL: docs.google.com/document/d/{id}/pub?embedded=true (permite iframe)
- Google Sheets: docs.google.com/spreadsheets/d/{id}/pubhtml?widget=true&headers=false
- Google Slides: docs.google.com/presentation/d/{id}/embed?start=false&loop=false
- PDFs: usar Google Drive viewer: drive.google.com/file/d/{id}/preview

Q.3.1 — DocTypeDetector utility
  Criar: src/components/docs/DocTypeDetector.js
  Função: detectDocType(url, mimeType) → { type, embedUrl, icon, label, orientation }
  Tipos:
    'gdoc'   → icon: FileText (azul), orientation: 'portrait'
               embedUrl: url.replace('/edit', '/pub?embedded=true')
                           .replace('/view', '/pub?embedded=true')
    'gsheet' → icon: Table (verde), orientation: 'landscape'
               embedUrl: url.replace('/edit', '/pubhtml?widget=true&headers=false')
    'gslide' → icon: PresentationIcon (amarelo), orientation: 'landscape'
               embedUrl: url.replace('/edit', '/embed?start=false&loop=false')
    'pdf'    → icon: FileIcon (vermelho), orientation: 'portrait'
               embedUrl: 'https://drive.google.com/file/d/{id}/preview' (extrair id da URL)
    'unknown'→ icon: ExternalLink (cinza), embedUrl: url (abre externo)
  Detecção: mimeType first, then URL pattern matching

Q.3.2 — PinnedDocViewer component
  Criar: src/components/docs/PinnedDocViewer.jsx
  Props: { doc: { url, name, mimeType, driveFileId }, onUnpin, onExpand }
  Estados internos: 'collapsed' | 'expanded' | 'fullscreen'
  
  Estado COLLAPSED (padrão ao carregar):
    - Card horizontal h-16: ícone tipo (24px) + nome do doc + tipo badge + botões
    - Botões: "Expandir" (ChevronDown) + "Abrir original" (ExternalLink) + "Desafixar" (Pin off)
    - Fundo: var(--surface-1), borda var(--border-subtle), rounded-2xl
    
  Estado EXPANDED (inline no dashboard):
    - Container: w-full, altura adaptive por orientação:
        landscape (gsheet/gslide): aspect-ratio 16/9 → max-h 60vh
        portrait (gdoc/pdf): aspect-ratio 3/4 → max-w 640px mx-auto, max-h 75vh
    - Topbar sticky h-10: ícone + nome (truncate) + [Landscape/Portrait toggle] + [Fullscreen] + [Colapsar] + [Abrir]
    - iframe: src=embedUrl, width=100%, height=100%, border=none, allow="autoplay"
    - Loading state: Skeleton pulse + "Carregando documento..."
    - Erro iframe (onerror): mensagem "Este documento requer acesso público" + link "Abrir no Drive"
    
  Estado FULLSCREEN (portal sobre tudo):
    - ReactDOM.createPortal → fixed inset-0 z-[9999] bg-[var(--surface-0)]
    - Topbar 48px translúcida: backdrop-blur-xl bg-black/60 — ícone + nome + [Exit Fullscreen]
    - iframe ocupa 100vw × calc(100vh - 48px)
    - Hotkey Esc → volta para expanded
    
  Transição entre estados: max-height com duration-300 ease-in-out

Q.3.3 — Pinning UX na DocsSectionDashboard
  Arquivo: src/pages/entity/UniversalEntityPage.jsx (DocsSectionDashboard, linhas 843-1059)
  Mudanças:
    1. Carregar pinned_doc do page.properties ao montar: const pinnedDoc = page?.properties?.pinned_doc
    2. Cada arquivo no grid ganha ícone pin (Pin 12px) no hover:
       - Se arquivo === pinnedDoc: ícone pin preenchido (violeta)
       - Se outro arquivo: ícone pin vazio no hover → click pina este
    3. handlePin(file): await pageService.update(pageId, { properties: { ...page.properties, pinned_doc: { url: file.webViewLink, name: file.name, mimeType: file.mimeType, driveFileId: file.id } } })
    4. handleUnpin(): await pageService.update(pageId, { properties: { ...page.properties, pinned_doc: null } })
    5. Texto helper: badge "📌 Fixado" no arquivo pinado dentro do grid

Q.3.4 — Integração no layout do Dashboard do projeto
  Arquivo: src/pages/entity/UniversalEntityPage.jsx (aba 'dashboard', linhas ~491-562)
  Posição do PinnedDocViewer: ENTRE o bloco de propriedades e o ProductionDashboard
  
  Layout quando expandido: CSS Grid com transição suave:
    - Estado collapsed/sem doc: layout normal (ProductionDashboard full width)
    - Estado expanded (landscape): grid-cols-[1fr] — doc ocupa toda largura, KPIs abaixo
    - Estado expanded (portrait): grid-cols-[1fr_340px] — doc à esquerda, KPIs à direita sidebar
  
  Código de inserção (dentro do bloco activeTab === 'dashboard'):
    {pinnedDoc && (
      <div className="mb-6">
        <PinnedDocViewer
          doc={pinnedDoc}
          onUnpin={handleUnpin}
        />
      </div>
    )}

Q.3.5 — Orientação adaptativa e fullscreen
  PinnedDocViewer.jsx — detectar orientação e ajustar:
    - useEffect: observar resize do container via ResizeObserver
    - Se container width > height * 1.4 → forçar landscape layout
    - Toggle manual: botão Landscape/Portrait no topbar (overrides auto-detect)
    - Fullscreen: hotkey F quando mouse está sobre o viewer (onMouseEnter adiciona listener)

📦 ARQUIVOS QUE SERÃO LIDOS ANTES DE EDITAR
- src/pages/entity/UniversalEntityPage.jsx  ← Q.1.1, Q.1.2, Q.2.3, Q.2.4, Q.3.3, Q.3.4
- src/pages/dashboard/Dashboard.jsx         ← Q.1.4, Q.2.6
- src/components/database/EntityCard.jsx    ← Q.1.3
- src/components/scene/SceneOverview.jsx    ← Q.2.2
- src/services/pageService.js               ← confirmar campo cover + update

📦 ARQUIVOS QUE SERÃO CRIADOS
- src/components/ui/CoverImageUploader.jsx         ← Q.1.2
- src/components/scene/SceneCompletionToggle.jsx   ← Q.2.1
- src/components/docs/DocTypeDetector.js           ← Q.3.1
- src/components/docs/PinnedDocViewer.jsx          ← Q.3.2

🚫 NÃO TOCAR
- src/components/database/views/KanbanView.jsx — Fase O completa
- src/components/search/* — Fase K completa
- src/lib/generative/* — Fase M completa (patterns v3)
- src/services/propertyService.js — estável
- src/services/documentService.js — estável
```

---

## 🗺️ ROADMAP COMPLETO — FASES O → Q

### FASE O — Fixes Críticos + UX Kanban (esta sessão)
| Sub | Tarefa | Status |
|-----|--------|--------|
| O.1 | SQL migrations: `stages` column + RPC `mime_type` | ⚠️ Pendente (manual no Supabase — ver SQL abaixo) |
| O.2 | Drag & drop livre — cross-column com posição exata | ✅ Completo |
| O.3 | Board do Hub — remover prazo/deadline dos headers de coluna | ✅ Completo |
| O.4 | Filtros do Board view — propagar quickFilter ao DatabaseRenderer | ✅ Completo |
| O.5 | Bug edição de nome de status — input controlado (acentos + espaços) | ✅ Completo |
| O.6 | Deletar status — três pontinhos com opção Excluir + migrar cards | ✅ Completo |
| O.7 | Checkboxes nos cards de cenas — auto-criar property se não existir | ✅ Completo |
| O.8 | Testes + build verde + commit | ✅ Build verde (843KB) |

### FASE P — Dashboard Financeiro
| Sub | Tarefa | Status |
|-----|--------|--------|
| P.1 | Schema Supabase: `financial_records` + `clients` + `project_clients` | ❌ Planejado |
| P.2 | Services: `financialService.js` + `clientService.js` | ❌ Planejado |
| P.3 | Dashboard: card de resumo financeiro + gráfico SVG mensal | ❌ Planejado |
| P.4 | Tab "Financeiro" em cada projeto — CRUD inline de registros | ❌ Planejado |
| P.5 | Gestão de clientes — lista, criar, editar, vincular a projetos | ❌ Planejado |
| P.6 | Relatórios — export CSV por período/projeto/status/categoria | ❌ Planejado |

### FASE Q — Base Modular para Hub de Serviços
| Sub | Tarefa | Status |
|-----|--------|--------|
| Q.1 | Rota `/hub` — área "Hub de Serviços" na Sidebar com sub-módulos | ❌ Futuro |
| Q.2 | Módulo Financeiro standalone (desacoplado de projeto aberto) | ❌ Futuro |
| Q.3 | Schema CRM: `deals`, `contacts`, `activities`, `pipelines` | ❌ Futuro |
| Q.4 | Módulo Comercial — Kanban de deals, pipeline de vendas | ❌ Futuro |
| Q.5 | Módulo Administrativo — contratos, permissões por módulo | ❌ Futuro |

---

### Schema SQL Fase P (referência para quando implementar)

```sql
-- financial_records: desacoplado de pages, permite uso standalone
CREATE TABLE IF NOT EXISTS financial_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES pages(id) ON DELETE SET NULL,
  record_type   TEXT NOT NULL CHECK (record_type IN ('invoice','expense','payment','quote')),
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT DEFAULT 'BRL',
  due_date      DATE,
  paid_date     DATE,
  category      TEXT,
  tags          TEXT[] DEFAULT '{}',
  metadata      JSONB DEFAULT '{}',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- clients: base do CRM futuro
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  document      TEXT,
  client_type   TEXT DEFAULT 'company' CHECK (client_type IN ('company','person','agency')),
  tags          TEXT[] DEFAULT '{}',
  metadata      JSONB DEFAULT '{}',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- project_clients: vínculo N:N
CREATE TABLE IF NOT EXISTS project_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES pages(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'client',
  UNIQUE(project_id, client_id)
);

-- RLS para todas as tabelas (app interno — qualquer autenticado)
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fr_read"   ON financial_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "fr_write"  ON financial_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fr_update" ON financial_records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "fr_delete" ON financial_records FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cl_read"   ON clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "cl_write"  ON clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cl_update" ON clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "cl_delete" ON clients FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "pc_read"   ON project_clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pc_write"  ON project_clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pc_delete" ON project_clients FOR DELETE USING (auth.uid() IS NOT NULL);
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador ativo._

### ⚠️ Monitorar após deploy `131ad60`
- **ReferenceError `ct` antes da inicialização** — Foi investigado nesta sessão:
  - `madge --circular` confirmou: **zero dependências circulares** em 112 módulos
  - O erro apontava para o bundle antigo (`CP-_ZmBt`); o novo bundle gerado tem hash diferente
  - **Sourcemaps habilitados** (`build: { sourcemap: true }`) para facilitar debug se o erro reaparecer
  - Ação: abrir `/projetos/page/<qualquer-projeto>` e verificar se o erro ainda ocorre no console
  - Se persistir: o sourcemap agora mostrará o arquivo/linha exatos em vez da variável minificada `ct`

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
| Schema financeiro (P) | desacoplado de `pages` — `financial_records` referencia `project_id` nullable | Permite módulo financeiro standalone no Hub futuro |
| Tabela `clients` (P) | separada de `pages` | Base do CRM (Fase Q.3) — não misturar com entidade universal |
| Gráficos financeiros | SVG puro (sem recharts/chart.js) | Bundle já é 844KB — manter leve |

---

**Última atualização:** 2026-05-21 — Sessão de debug: fix 409, investigação ReferenceError, sourcemaps, deploy `131ad60`

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|
| 2026-05-19 | Claude Sonnet 4.6 | projetos-app (Fase D) | ✅ push main → Vercel deploy |
| 2026-05-19 | Claude Opus 4.6  | projetos-app (Fase J) | ✅ push main → Vercel deploy |
| 2026-05-21 02:52 UTC | Claude Sonnet 4.6 | projetos-app (fix 409 + debug ReferenceError + sourcemaps) | ✅ commit `131ad60` → push main → Vercel deploy |
