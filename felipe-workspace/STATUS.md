# PELIMOTION OS — Status
**Ultima atualizacao:** 2026-05-22
**Fase atual:** 9 — Migração Notion → Supabase ✅ Script pronto, aguardando execução
**Progresso geral:** ~90% (Fases 1–8 completas, Fase 9 pronta para rodar) — app em producao

---

## LEITURA OBRIGATORIA PARA CONTINUAR

| Arquivo | Quando ler |
|---------|-----------|
| `ARCHITECTURE.md` | Toda sessao nova — decisoes permanentes de stack, schemas, convencoes |
| `plans/phase-05-projetos.md` | Referencia — Fase 5 concluida (componentes criados, decisoes tecnicas) |

---

## ✅ CONCLUIDO

### Fase 1 — Discovery Notion
- [x] Script de extracao criado e executado
- [x] 22 databases mapeados, 1.210 pages extraidas
- [x] `notion_architecture.json` gerado com schemas completos
- [x] Diagrama Mermaid gerado (`notion_architecture.md`)
- [x] Relacoes resolvidas: Saidas + Tasks PLM + Caixa → Pipeline Pelimotion
- [x] Database "Despesas" (ID: 53935d2b) — inacessivel via API (import externo); modelada por logica

### Fase 2 — Schema Supabase
- [x] `supabase/migrations/001_initial_schema.sql` — 2 schemas, 16 tabelas, todos os enums
- [x] `supabase/migrations/002_triggers.sql` — updated_at automatico, indices, validacao de datas
- [x] `supabase/migrations/003_rls.sql` — RLS por role (admin/editor/viewer)
- [x] Bug corrigido: `due_date` usa `make_date()` (era `DATE_TRUNC`, gerava erro 42P17)
- [x] Migrations executadas no Supabase ✅
- [x] Schemas `pelimotion` e `personal` expostos na API REST (temporario — ver ARCHITECTURE.md §6.4)

### Fase 3 — Setup Next.js 16
- [x] App criado com `create-next-app@latest` (Next.js 16.2.6, Turbopack)
- [x] Dependencias instaladas: Supabase SSR, shadcn/ui, FullCalendar, TanStack Table, Recharts, Zustand, RHF+Zod
- [x] shadcn/ui inicializado + 15 componentes adicionados (sidebar, card, table, dialog, etc.)
- [x] `.env.local` configurado com Supabase URL/key e Bunny CDN
- [x] Clientes Supabase criados: `lib/supabase/server.ts` (SSR) e `lib/supabase/browser.ts` (client)
- [x] `proxy.ts` criado (substitui middleware.ts no Next.js 16) — redireciona nao-logados para /login
- [x] Tipos TypeScript gerados manualmente a partir do SQL (16 tabelas, 3 schemas, todos os enums)
- [x] Estrutura de rotas criada com route groups: `(pelimotion)` e `(personal)`
- [x] Sidebars funcionais com navegacao entre modulos e sign-out
- [x] Pagina de login com Supabase Auth (email/senha)
- [x] Pagina raiz `/` com redirect inteligente por role (admin→projetos, viewer→tasks)
- [x] Build passa sem erros (`next build` ✅)

**Adaptacoes do plano original:**
- Next.js 16 em vez de 15 (retrocompativel, App Router identico)
- `middleware.ts` → `proxy.ts` (breaking change do Next.js 16)
- shadcn/ui usa `render` prop em vez de `asChild` (nova versao com base-ui)
- Rota `/projetos-pessoais` em vez de `/projetos` no modulo personal (evita conflito com pelimotion)

### Fase 4 — Shell + Auth
- [x] Protecao por role em `(pelimotion)/layout.tsx` — viewer → redirect /tasks
- [x] Avatar dropdown nas sidebars (DropdownMenu com nome, email, separador, Sair)
- [x] Login polida — logo, spinner no botao, erro destacado, autocomplete
- [x] Skeleton de loading — `PageSkeleton` reutilizavel + `loading.tsx` em 7 rotas
- [x] `next.config.ts` — basePath '/workspace'
- [x] `vercel.json` (na raiz do app) — outputDirectory '.next'
- [x] Deploy Vercel ✅ — URL: `pelispace.vercel.app` / deploy: `pelispace-hv7ng9m6k-...vercel.app`
- [x] Rewrite `/workspace` adicionado em `Portfolio/vercel.json` → `pelispace.vercel.app` ✅
- [x] Build ✅

### Fase 5 — Módulo Projetos + Calendário
- [x] `components/pelimotion/projetos-table.tsx` — TanStack Table com filtros (stage/cliente) e sort por coluna
- [x] `components/pelimotion/projetos-kanban.tsx` — Kanban em 5 colunas logicas (Negociacao / Producao / Revisao / Fechamento / Concluido)
- [x] `components/pelimotion/stage-calendar.tsx` — Gantt CSS Grid customizado (1 linha/projeto, barras coloridas por etapa, navegacao por mes)
- [x] `(pelimotion)/projetos/page.tsx` + `projetos-view.tsx` — server fetch + stats + toggle lista/kanban
- [x] `(pelimotion)/projetos/calendario/page.tsx` — calendário de etapas com todos projetos ativos
- [x] `(pelimotion)/projetos/[id]/page.tsx` + `projeto-tabs.tsx` — detalhe com header financeiro + tabs Etapas/Tarefas/Despesas
- [x] Build ✅

---

### Fase 6 — Módulo Financeiro ✅ COMPLETA (2026-05-21)
- [x] `components/pelimotion/financeiro-dashboard.tsx` — cards (receita, custo, lucro, a pagar) + BarChart Recharts últimos 6 meses
- [x] `components/pelimotion/financeiro-saidas.tsx` — lista de project_expenses com filtro por status (pago/pendente) e busca
- [x] `components/pelimotion/financeiro-caixa.tsx` — timeline de cash_flow agrupada (vencido/hoje/7 dias/futuro) com badges por área
- [x] `app/(pelimotion)/financeiro/page.tsx` — server fetch paralelo (Promise.all) de 4 tabelas
- [x] `app/(pelimotion)/financeiro/financeiro-view.tsx` — client com tabs Dashboard | Saídas | Caixa
- [x] `plans/phase-06-financeiro.md` — plano criado
- [x] Build ✅

### Fase 7 — Módulo Pessoal ✅ COMPLETA (2026-05-22)
- [x] `tasks/page.tsx` + `tasks-view.tsx` — lista com filtro por área + toggle concluídas
- [x] `gastos/page.tsx` + `gastos-view.tsx` — tabela com filtro mês/status + cards resumo
- [x] `saude/page.tsx` + `saude-view.tsx` — health_log com filtro tipo/esfera + badges de status
- [x] `projetos-pessoais/page.tsx` — lista separada em ativos/arquivados
- [x] Build ✅

### Fase 8 — CRM + Fornecedores ✅ COMPLETA (2026-05-22)
- [x] `components/pelimotion/crm-kanban.tsx` — Kanban 8 colunas por crm_status, filtros por nome/empresa/temperatura de lead
- [x] `components/pelimotion/fornecedores-list.tsx` — tabela com busca (nome/cidade/bairro), filtro por estado, star rating
- [x] `app/(pelimotion)/crm/crm-view.tsx` — client com tabs Pipeline CRM | Fornecedores + stats (ativos, quentes, fornecedores)
- [x] `app/(pelimotion)/crm/page.tsx` — server fetch paralelo (crm_contacts + suppliers)
- [x] Build ✅

### Fase 9 — Migração Notion → Supabase (2026-05-22)
- [x] `scripts/migrate.js` — script completo criado
- [x] Dry-run validado: 881 linhas, 0 erros, 15 seções
- [x] API v5 corrigida: `dataSources.query({ data_source_id })` em vez de `databases.query`
- [ ] **PENDENTE:** executar migração real com `node scripts/migrate.js`

**Para executar a migração real:**
```bash
cd felipe-workspace
node scripts/migrate.js             # migra tudo
node scripts/migrate.js crm         # migra só uma seção
node scripts/migrate.js --dry-run   # simula sem gravar
```

**Seções disponíveis:** crm | suppliers | projects | stages | tasks-plm | expenses-plm | cash-flow | income | products | personal-tasks | personal-expenses | investments | home | health | personal-projects

**881 registros do Notion mapeados para 15 tabelas Supabase.**

## ▶️ PROXIMA ACAO — Executar migração + Ajustes finais

1. Rodar `node scripts/migrate.js` (confirmar que SUPABASE_SERVICE_ROLE_KEY está no .env ✅)
2. Validar dados no Supabase Dashboard
3. Ajustar campos `project_id` nas stages (Cronograma é inline por projeto, linkagem automática parcial)

**Para iniciar:** diga "executar migração" ou "validar dados"

---

## 📦 ARQUIVOS DO PROJETO

```
felipe-workspace/
├── .env                            ← credenciais (NOTION_TOKEN, SUPABASE_*, BUNNY_*)
├── CLAUDE.md                       ← comportamento do agente
├── ARCHITECTURE.md                 ← decisoes arquiteturais permanentes ← LER SEMPRE
├── STATUS.md                       ← este arquivo
├── notion_architecture.json        ← 22 DBs do Notion mapeados (Fase 1)
├── notion_architecture.md          ← diagrama Mermaid (Fase 1)
├── scripts/
│   ├── notion-extract.js
│   └── generate-mermaid.js
├── supabase/
│   ├── README.md
│   └── migrations/
│       ├── 001_initial_schema.sql  ✅ executado
│       ├── 002_triggers.sql        ✅ executado
│       └── 003_rls.sql             ✅ executado
├── plans/
│   ├── phase-03-nextjs-setup.md    ← Fase 3 concluida
│   └── phase-05-projetos.md        ← Fase 5 concluida (decisoes tecnicas do modulo)
└── app/                            ← Next.js 16 ✅ — basePath '/workspace'
    ├── .env.local                  ← env vars do Next.js
    ├── vercel.json                 ← outputDirectory '.next'
    ├── proxy.ts                    ← protecao de rotas (auth redirect)
    ├── next.config.ts              ← basePath '/workspace'
    ├── app/
    │   ├── layout.tsx              ← layout raiz (fonts, dark mode, TooltipProvider)
    │   ├── page.tsx                ← redirect por role
    │   ├── login/page.tsx          ← tela de login
    │   ├── (pelimotion)/
    │   │   ├── layout.tsx          ← sidebar Pelimotion + auth check (admin/editor only)
    │   │   ├── projetos/
    │   │   │   ├── page.tsx            ← server: fetch projetos
    │   │   │   ├── projetos-view.tsx   ← client: stats + toggle lista/kanban
    │   │   │   ├── loading.tsx
    │   │   │   ├── calendario/page.tsx ← server: fetch projects + stages
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx        ← server: fetch projeto + etapas + tarefas + despesas
    │   │   │       └── projeto-tabs.tsx ← client: tabs Etapas/Tarefas/Despesas
    │   │   ├── financeiro/
    │   │   │   ├── page.tsx        ← stub (Fase 6)
    │   │   │   └── loading.tsx
    │   │   └── crm/
    │   │       ├── page.tsx        ← stub (Fase 8)
    │   │       └── loading.tsx
    │   └── (personal)/
    │       ├── layout.tsx          ← sidebar Personal + auth check
    │       ├── tasks/page.tsx + loading.tsx
    │       ├── gastos/page.tsx + loading.tsx
    │       ├── saude/page.tsx + loading.tsx
    │       └── projetos-pessoais/page.tsx + loading.tsx
    ├── components/
    │   ├── ui/                     ← shadcn/ui (15 componentes: avatar, badge, button, card,
    │   │                               dialog, dropdown-menu, input, label, page-skeleton,
    │   │                               select, separator, sheet, sidebar, skeleton, table, tooltip)
    │   ├── pelimotion/
    │   │   ├── sidebar.tsx         ← sidebar empresarial com avatar dropdown
    │   │   ├── projetos-table.tsx  ← TanStack Table (Fase 5)
    │   │   ├── projetos-kanban.tsx ← Kanban 5 colunas (Fase 5)
    │   │   └── stage-calendar.tsx  ← Gantt CSS Grid (Fase 5)
    │   └── personal/
    │       └── sidebar.tsx         ← sidebar pessoal com avatar dropdown
    ├── lib/
    │   ├── supabase/server.ts      ← client SSR
    │   ├── supabase/browser.ts     ← client browser
    │   ├── supabase/types.ts       ← tipos TS (3 schemas, 16 tabelas, todos os enums)
    │   └── utils.ts                ← cn() helper
    └── hooks/use-mobile.ts         ← hook de responsividade
```

---

## 🗺️ ROADMAP COMPLETO

| # | Fase | Status | Arquivo de plano |
|---|------|--------|-----------------|
| 1 | Discovery Notion | ✅ Completa | — |
| 2 | Schema Supabase | ✅ Completa | — |
| 3 | Setup Next.js 16 | ✅ Completa | `plans/phase-03-nextjs-setup.md` |
| 4 | Shell + Auth (sidebar, rotas, login, deploy) | ✅ Completa | — |
| 5 | Modulo Projetos + Calendario | ✅ Completa | `plans/phase-05-projetos.md` |
| 6 | Modulo Financeiro | ✅ Completa | `plans/phase-06-financeiro.md` |
| 7 | Modulo Pessoal | ✅ Completa | — |
| 8 | CRM + Fornecedores | ✅ Completa | — |
| 9 | Migração Notion → Supabase | 🟡 Script pronto, execução pendente | `scripts/migrate.js` |

---

## 🎯 PROXIMA SESSAO — Prompt de inicio

```
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: workspace-agent — Fase 9 (execução migração)

📋 STATUS ANTERIOR
Fases 1–8 concluidas. App em producao: pelispace.vercel.app/workspace
Todos os módulos funcionais: Projetos, Financeiro, Pessoal, CRM, Fornecedores.
Script de migração Notion → Supabase pronto (`scripts/migrate.js`), dry-run validado (881 registros, 0 erros).
Pendente: executar migração real para popular o banco com dados do Notion.

🎯 TAREFA DESTA SESSAO
Fase 9 — Executar migração Notion → Supabase:
1. Rodar `node scripts/migrate.js --dry-run` para confirmar estado atual
2. Executar `node scripts/migrate.js` (migração real — precisa de SUPABASE_SERVICE_ROLE_KEY no .env)
3. Validar dados no Supabase Dashboard (linha a linha por seção)
4. Ajustar linkagens project_id em stages se necessário

📦 ARQUIVOS RELEVANTES
- `scripts/migrate.js` — script de migração completo (15 seções, 881 registros)
- `scripts/validate.js` — validação pós-migração
- `.env` — NOTION_TOKEN + SUPABASE_SERVICE_ROLE_KEY (confirmar presença)
- `supabase/migrations/004_add_notion_ids.sql` — migration de notion_id (executar se ainda não foi)

⏸️ Prosseguir?
```
