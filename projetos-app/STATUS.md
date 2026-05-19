# STATUS — PROJETOS-APP (Gerenciador Interno)
**Fonte única de verdade. Atualizar ao final de cada sessão.**

---

## 📊 SNAPSHOT ATUAL

**Data:** 2026-05-19
**Projeto:** Gerenciador interno — React + Vite + Supabase
**Status:** BETA — Fases A ✅ B ✅ C ✅ D ✅ completas | Próxima: Fase E (integração Drive + toasts)
**Próxima Ação:** Fase E — substituir `window.prompt` por modal, drag-from-browser, toast progress
**Branch ativa:** `main`
**Bloqueadores:** Nenhum
**Auth:** ✅ Supabase Auth (email+senha), roles via `profiles.role`

---

## 🗺️ PROGRESSO POR MÓDULO

| Módulo | Status | Última Sessão |
|--------|--------|--------------|
| Kanban de projetos | ✅ Funcional | 2026-05-16 |
| Detalhe de cenas | ✅ Funcional | 2026-05-16 |
| Daily log por cena | ✅ Funcional | 2026-05-16 |
| Dashboard financeiro | ❌ Não iniciado | — |
| Calendário editorial (4 views: mês/semana/dia/agenda) | ✅ Funcional | 2026-05-19 |
| Aprovação de conteúdo (vagas, editais) | ❌ Planejado | — |

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-19 — Fases C+D: Refactor DatabaseRenderer + Full Calendar

**O que foi feito:**
- [x] `DatabaseRenderer.jsx` refatorado em orquestrador leve (~200 linhas) — exporta `useDensity`
- [x] `DatabaseToolbar.jsx` extraído (view switcher, density, card config, PropertyManagerModal, add button)
- [x] `KanbanView.jsx`, `TableView.jsx`, `ListView.jsx` extraídos para `views/`
- [x] `CalendarView.jsx` reescrito como orquestrador (4 views, keyboard shortcuts, filter mode)
- [x] `calendarUtils.js` criado: date-fns (ptBR, weekStartsOn:1), `buildEvents`, `groupByDay`, `navigate`, formatadores
- [x] `CalendarKbd.jsx` criado: T/J/K/←/→/G keyboard handler
- [x] `CalendarHeader.jsx` criado: 4 view tabs, nav buttons, filtro Todos/Projeto, hint de atalhos
- [x] `MonthView.jsx`: grade Mon-Sun, drag-to-reschedule HTML5, dropdown com GCal link
- [x] `WeekView.jsx`: 7 colunas Mon-Sun usando `weekDays()`, event chips clicáveis
- [x] `DayView.jsx`: lista de eventos do dia com status e ícone
- [x] `AgendaView.jsx`: próximos 60 dias agrupados por data
- [x] Build limpo (`npm run build` ✅)

**Arquivos criados:** `src/components/calendar/calendarUtils.js`, `CalendarKbd.jsx`, `CalendarHeader.jsx`, `MonthView.jsx`, `WeekView.jsx`, `DayView.jsx`, `AgendaView.jsx`; `src/components/database/DatabaseToolbar.jsx`; `src/components/database/views/KanbanView.jsx`, `TableView.jsx`, `ListView.jsx`
**Arquivos modificados:** `src/components/database/DatabaseRenderer.jsx`, `src/components/database/views/CalendarView.jsx`

---

### 2026-05-19 — Fase B: CommandPalette → cmdk
**O que foi feito:**
- [x] Instalado `cmdk`
- [x] `CommandPalette.jsx` reescrito com `Command` (cmdk) + `Dialog.Root/Overlay/Content` (Radix)
- [x] `shouldFilter={false}` — busca Supabase mantida, cmdk gerencia teclado e `aria-selected`
- [x] Grupos (`Command.Group`) substituem o array flat com sentinelas `{type:'section'}`
- [x] Hotkey ⌘K e store Zustand preservados sem mudança
- [x] Build limpo; merge em `main`

**Arquivos modificados:** `src/components/ui/CommandPalette.jsx`, `package.json`

---

### 2026-05-19 — Fase A: Design System base (4 PRs)
**O que foi feito:**
- [x] PR A.1: `tailwind.config.js` estendido com tokens `bg-surface-*`, `border-subtle/default/strong`, `text-status-*`; alias `@` no Vite; `components.json` + `src/lib/utils.js` (shadcn setup manual)
- [x] PR A.2: Escala tipográfica semântica (8 níveis, 2 pesos); 8 primitivos UI criados (`Button`, `Input`, `Select`, `Badge`, `Card`, `Skeleton`, `Tabs`, `Toggle`) com Radix onde aplicável
- [x] PR A.3: Codemod `font-black → font-semibold` em 8 arquivos (~50 substituições); `grep -r "font-black" src/` retorna zero
- [x] PR A.4: `docs/DESIGN_TOKENS.md` + página `/dev/tokens` (QA visual de todos os tokens e primitivos); rota registrada no `App.jsx`

**Arquivos criados:** `components.json`, `src/lib/utils.js`, `src/components/ui/Button.jsx`, `Input.jsx`, `Select.jsx`, `Badge.jsx`, `Card.jsx`, `Skeleton.jsx`, `Tabs.jsx`, `Toggle.jsx`, `docs/DESIGN_TOKENS.md`, `src/pages/dev/TokensPage.jsx`
**Arquivos modificados:** `tailwind.config.js`, `vite.config.js`, `App.jsx`, `package.json`, + 8 arquivos codemod
**Branch:** `feat/design-system-fase-a` — pronto para merge em `main`

---

### 2026-05-19 — UX/UI Research + Plano de Implementação (Fase 1 / research-only)
**O que foi feito:**
- [x] Auditoria do estado atual do código (sidebar, command palette, kanban via `DatabaseRenderer`, calendar view, drive integration)
- [x] Research externo via WebSearch/WebFetch sobre 6 referências: Notion, Linear, Cron/Notion Calendar, Superhuman, Drive embed, motion design
- [x] Plano faseado A→F com escopo, justificativa, arquivos, esforço, risco e critério de aceite
- [x] 5 decisões pendentes documentadas (calendar lib, cmdk, shadcn CLI, refactor DatabaseRenderer, codemod font-black)

**Arquivos criados:** `docs/UX_AUDIT_2026-05-19.md`
**Arquivos modificados:** `STATUS.md` (este)
**Próximo passo:** Usuário decide as 5 perguntas da Seção 4 do audit. Depois, abrir Fase A em branch dedicada.

---

### 2026-05-16 — Build e runtime errors corrigidos
**O que foi feito:**
- [x] JSX syntax errors em `UniversalEntityPage` corrigidos
- [x] ReferenceErrors de variáveis undefined resolvidos
- [x] Kanban e dashboard views funcionais

**Arquivos modificados:** componentes React (ver git log)

---

## 🎯 PRÓXIMA SESSÃO — FASE C: REFACTOR DatabaseRenderer

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Fase C (refactor DatabaseRenderer)

📋 STATUS ANTERIOR
Fase A (design system base) e Fase B (CommandPalette cmdk) completas em 2026-05-19.
Ambas mergeadas em main. Nenhum bug ativo. Sistema em produção.

🎯 TAREFA DESTA SESSÃO
Fase C — PR "refactor only": quebrar DatabaseRenderer.jsx em sub-componentes
ANTES de adicionar qualquer feature nova. Zero mudança funcional.

📦 DECISÃO TRAVADA
DatabaseRenderer.jsx (Fase C): quebrar ANTES de adicionar features, em PR "refactor only".
Sem mudança funcional — apenas extração de sub-componentes.

📦 ARQUIVOS RELEVANTES
- `src/components/database/DatabaseRenderer.jsx` — arquivo monolítico (~1000 linhas)
- `src/components/database/EntityCard.jsx` — referência de padrão já extraído

📦 ESTRATÉGIA SUGERIDA
1. Ler DatabaseRenderer.jsx completo e mapear blocos extraíveis
2. Criar sub-componentes em `src/components/database/`:
   - `KanbanView.jsx` — renderização do board Kanban
   - `TableView.jsx` — renderização da tabela
   - `GalleryView.jsx` — renderização da galeria (se existir)
   - `DatabaseToolbar.jsx` — barra de ações/filtros
   - `GroupHeader.jsx` — cabeçalho de grupo/etapa
3. DatabaseRenderer.jsx vira um orquestrador leve (<200 linhas)
4. PR único, sem mudança funcional, build verde

⏸️ Prosseguir com Fase C?
```

---

## 🎯 STATUS ANTERIOR — FASE B (arquivado)

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: projetos-app-agent — Fase B (CommandPalette cmdk)

📋 STATUS ANTERIOR
Fase A completa (2026-05-19). Branch feat/design-system-fase-a com 4 commits prontos para merge.
Design system base instalado: tokens Tailwind, escala tipográfica, 8 primitivos UI, página /dev/tokens.
font-black banido (grep retorna zero). Próxima fase: Fase B — CommandPalette com cmdk.

🎯 TAREFA DESTA SESSÃO
Migrar CommandPalette.jsx de implementação customizada para cmdk + melhorias de UX.

📦 DECISÃO TRAVADA
CommandPalette (Fase B): migrar para `cmdk` (paacote npm). Instalar com --cache /tmp/npm-cache.

📦 ARQUIVOS RELEVANTES
- `src/components/ui/CommandPalette.jsx` — implementação atual a ser migrada
- `src/App.jsx` — hotkey global do CommandPalette
- `docs/UX_AUDIT_2026-05-19.md` — referências e justificativa

📦 RED FLAGS
- NÃO instalar cmdk na sessão de Fase A (foi adiado intencionalmente)
- Usar `npm install --cache /tmp/npm-cache` se npm cache der erro EACCES

⏸️ Merge da branch feat/design-system-fase-a em main antes de começar?
```

---

## 🎯 STATUS ANTERIOR — FASE A (arquivado)

```markdown
[AI_AGENT_BRIEFING.md carregado automaticamente]

---

# Context: projetos-app-agent — Fase A (Design System base)

📋 STATUS ANTERIOR
Sessão 2026-05-19 produziu auditoria UX/UI completa em `docs/UX_AUDIT_2026-05-19.md`.
As 5 decisões da Seção 4 já estão TRAVADAS (todas as recomendadas).
Nenhum código foi modificado ainda. Sistema em produção, a equipe está usando.

🎯 TAREFA DESTA SESSÃO
Implementar Fase A — Design System base. Branch dedicado: `feat/design-system-fase-a`.

📦 DECISÕES JÁ TRAVADAS (não perguntar de novo)
1. Calendar lib (Fase D futura): custom sobre `date-fns`
2. CommandPalette (Fase B futura): migrar para `cmdk`
3. shadcn/ui CLI: ADOTAR (`npx shadcn@latest init` + add components)
4. DatabaseRenderer.jsx (Fase C futura): quebrar ANTES de adicionar features, em PR "refactor only"
5. Codemod font-black: ATÔMICO, um único PR

📦 ESCOPO DA FASE A (do audit, copiado verbatim)
1. Auditar `index.css` tokens vs. classes Tailwind. Criar utilitários: `bg-surface-1..3`, `border-subtle/default/strong`, `text-status-*`.
2. Definir escala tipográfica enxuta: `text-display | text-h1 | text-h2 | text-h3 | text-body | text-small | text-caption | text-eyebrow`. 2 pesos só: 500 (medium) + 600 (semibold).
3. Banir `font-black` (codemod). Banir `uppercase tracking-wider` fora de `text-eyebrow`.
4. Documentar em `projetos-app/docs/DESIGN_TOKENS.md` (criar).
5. Inicializar shadcn/ui CLI (`npx shadcn@latest init`).
6. Componentes primitivos faltantes em `src/components/ui/`: `Button` (4 variantes), `Input`, `Select`, `Badge`, `Card`, `Skeleton`, `Tabs`, `Toggle` — usando Radix onde aplicável.

📦 ORDEM SUGERIDA DE PRs (separar para rollback claro)
- PR A.1: `chore(design-system): init shadcn cli + tokens em tailwind.config`
- PR A.2: `feat(design-system): escala tipográfica + primitives (Button/Input/Badge/Card/Skeleton/Tabs/Toggle)`
- PR A.3: `refactor(design-system): codemod font-black → font-semibold + ban uppercase fora de eyebrow`
- PR A.4: `docs(design-system): DESIGN_TOKENS.md + página /dev/tokens`

📦 ARQUIVOS RELEVANTES
Configuração:
- `projetos-app/tailwind.config.js`
- `projetos-app/src/index.css`
- `projetos-app/components.json` (criar via shadcn init)

A criar:
- `projetos-app/docs/DESIGN_TOKENS.md`
- `projetos-app/src/components/ui/Button.jsx` (e demais primitives)
- `projetos-app/src/pages/dev/TokensPage.jsx` (página opcional para QA visual)

A auditar (não alterar sem necessidade):
- `projetos-app/src/components/database/EntityCard.jsx` (uso intensivo de font-black)
- `projetos-app/src/pages/dashboard/Dashboard.jsx` (topbar com font-black + uppercase)
- `projetos-app/src/components/layout/Sidebar.jsx` (poucos uppercase — eyebrows legítimos)

📦 CRITÉRIO DE ACEITE (do audit)
- [ ] Storybook OU página `/dev/tokens` mostra todos os primitives
- [ ] `grep -r "font-black" projetos-app/src` retorna 0
- [ ] Visual da Sidebar e Dashboard mantém-se ≥ 95% igual após codemod (comparar screenshot antes/depois)
- [ ] `npm run build` sem warnings de Tailwind

📦 COMANDOS
cd projetos-app
npm run dev    # porta 5173
npm run build  # gera dist/
npx shadcn@latest init    # PR A.1
npx shadcn@latest add button input badge card skeleton tabs   # PR A.2

📦 RED FLAGS (do AI_AGENT_BRIEFING — atentar)
- NÃO tocar em `shared/auth.js`, `shared/roles.js`, `vercel.json`, `blog/**`
- NÃO mudar schema do Supabase
- NÃO adicionar dependência além de shadcn primitives (não instalar cmdk ainda — é da Fase B)
- Cada PR precisa rodar `npm run build` antes de subir

⏸️  Prosseguir com PR A.1 (shadcn init + tokens em tailwind.config)?
```

---

## 🚨 BLOQUEADORES ATIVOS

_Nenhum bloqueador no momento._

---

## 📚 DECISÕES ARQUITETURAIS

### Isolamento React
- Único projeto React do ecossistema — não importar lógica daqui para projetos Vanilla
- Auth via Supabase diretamente (não usa shared/auth.js do root — incompatível com módulos ES + React)
- Build output em `projetos-app/dist/`

---

## 🔄 TEMPLATE DE ATUALIZAÇÃO

```markdown
### [DATA] — Sessão N: [TÍTULO]
**O que foi feito:**
- [x] Item completado

**Arquivos modificados:** [lista]
**Próximo passo:** [descrição]
```

---

**Última atualização:** 2026-05-19

---

## 🚀 DEPLOY LOG

| Data/Hora UTC | Operador | Projeto | Status |
|---|---|---|---|

