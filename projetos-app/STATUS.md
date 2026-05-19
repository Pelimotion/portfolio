# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — Fases A ✅ B ✅ C ✅ D ✅ completas | Próxima: Fase E
**Próxima Ação:** Fase E — substituir `window.prompt` por modal, drag-from-browser, toast progress
**Branch ativa:** `main` (11 commits à frente do origin — já pusheado)
**Bloqueadores:** Nenhum
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
| Integração Drive + toasts + modal | ❌ Fase E — planejado | — |
| Microinterações (framer-motion, skeleton) | ❌ Fase F — planejado | — |
| Dashboard financeiro | ❌ Não iniciado | — |
| Aprovação de conteúdo (vagas, editais) | ❌ Planejado | — |

---

## 📝 HISTÓRICO DE SESSÕES

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

## 🎯 PRÓXIMA SESSÃO — FASE E: Integração Drive + UX Polish

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Fase E

📋 STATUS ANTERIOR
Fases A→D completas (2026-05-19). Em main. Build verde. Calendário com 4 views funcionais.
DatabaseRenderer refatorado. CommandPalette com cmdk. Design System com tokens e primitivos.

🎯 TAREFA DESTA SESSÃO
Fase E — substituir window.prompt por modais reais, adicionar toast feedback, polish de UX.

📦 ESCOPO FASE E
1. Substituir `window.prompt('Ir para (YYYY-MM-DD):')` em `CalendarKbd.jsx` por um Radix Dialog com input
2. Substituir `prompt()` de "Editar Prazo" / "Editar Entrega" no CalendarView antigo (já migrado) — verificar se ainda existe
3. Toast de feedback para drag-to-reschedule (usar Radix Toast ou sonner)
4. Drag-from-browser: arrastar card do Kanban para abrir detalhes (não bloqueador)

📦 ARQUIVOS RELEVANTES
- `src/components/calendar/CalendarKbd.jsx` — tem window.prompt (linha ~21)
- `src/components/calendar/MonthView.jsx` — drag-to-reschedule (sem toast ainda)
- `src/components/database/views/CalendarView.jsx` — onReschedule handler

📦 RED FLAGS
- NÃO instalar dependência nova sem perguntar
- `sonner` é leve e sem Radix overhead — boa opção para toasts
- `--cache /tmp/npm-cache` se npm cache der EACCES

⏸️ Prosseguir com Fase E?
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
