# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — Fases A ✅ B ✅ C ✅ D ✅ E ✅ F ✅ G ✅ H ✅ I ✅ completas
**Próxima Ação:** Fase J — Lazy-loading de rotas (bundle size) ou Dashboard Financeiro
**Branch ativa:** `main`
**Bloqueadores:** SQL migration pendente (rodar no Supabase): `ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;`
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
| Dashboard financeiro | ❌ Não iniciado | — |
| Aprovação de conteúdo (vagas, editais) | ❌ Planejado | — |

---

## 📝 HISTÓRICO DE SESSÕES

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

## 🎯 PRÓXIMA SESSÃO — FASE J

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Fase J

📋 STATUS ANTERIOR
Fases A→I completas (2026-05-19). Build verde em main. Zero avisos INEFFECTIVE_DYNAMIC_IMPORT.
Fase G: Smart Search (⌘⇧F) com Fuse.js client-side, SmartSearchModal, item fixo no CommandPalette.
Fase H: DriveLink (3 estados: linked/inherited/unlinked), driveUtils, integrado em PageRenderer.
Fase I: PipelineLegend colapsável no CalendarView (modo pipeline), filtro por projeto com localStorage.
SQL PENDENTE: `ALTER TABLE pages ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;`

🎯 TAREFA DESTA SESSÃO
Escolher entre:
  (A) Fase J — Lazy-loading de rotas → reduz bundle de 1.6MB → ~400kB por rota
  (B) Dashboard Financeiro — nova view no hub

📦 OPÇÃO A — Lazy-loading de rotas (React.lazy + Suspense)
Arquivos a modificar: `src/App.jsx`
- `React.lazy(() => import('./pages/dashboard/Dashboard'))`
- `React.lazy(() => import('./pages/entity/UniversalEntityPage'))`
- `React.lazy(() => import('./pages/profile/ProfilePage'))`
- Envolver com `<Suspense fallback={<LoadingSpinner />}>`
- Build: verificar que chunks separados aparecem no output

📦 OPÇÃO B — Dashboard Financeiro
- Nova seção no Dashboard com resumo de faturamento por status
- Campos na tabela `pages`: `budget NUMERIC`, `invoice_status TEXT`
- SQL: `ALTER TABLE pages ADD COLUMN IF NOT EXISTS budget NUMERIC; ...`

📦 RED FLAGS
- NÃO rodar migration SQL sem confirmação do usuário
- `npm install --cache /tmp/npm-cache` em todos os installs

⏸️ Qual opção seguir (A ou B)?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

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

---

**Última atualização:** 2026-05-19

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|
| 2026-05-19 | Claude Sonnet 4.6 | projetos-app (Fase D) | ✅ push main → Vercel deploy |
