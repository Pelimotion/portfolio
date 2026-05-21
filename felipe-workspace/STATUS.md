# PELIMOTION OS — Status
**Ultima atualizacao:** 2026-05-21
**Fase atual:** 4 — Shell + Auth ✅ COMPLETA + Deploy ✅
**Progresso geral:** ~44% (Fases 1–4 concluidas) — app em producao

---

## LEITURA OBRIGATORIA PARA CONTINUAR

| Arquivo | Quando ler |
|---------|-----------|
| `ARCHITECTURE.md` | Toda sessao nova — decisoes permanentes de stack, schemas, convencoes |
| `plans/phase-03-nextjs-setup.md` | Referencia — ja concluido |

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

---

### Fase 4 — Shell + Auth
- [x] Protecao por role em `(pelimotion)/layout.tsx` — viewer → redirect /tasks
- [x] Avatar dropdown nas sidebars (DropdownMenu com nome, email, separador, Sair)
- [x] Login polida — logo, spinner no botao, erro destacado, autocomplete
- [x] Skeleton de loading — `PageSkeleton` reutilizavel + `loading.tsx` em 7 rotas
- [x] Build passando sem erros ✅

**Arquivos criados:**
- `components/ui/page-skeleton.tsx`
- `(pelimotion)/projetos/loading.tsx`
- `(pelimotion)/financeiro/loading.tsx`
- `(pelimotion)/crm/loading.tsx`
- `(personal)/tasks/loading.tsx`
- `(personal)/gastos/loading.tsx`
- `(personal)/saude/loading.tsx`
- `(personal)/projetos-pessoais/loading.tsx`

**Arquivos modificados:**
- `(pelimotion)/layout.tsx` — role check
- `components/pelimotion/sidebar.tsx` — dropdown avatar
- `components/personal/sidebar.tsx` — dropdown avatar
- `app/login/page.tsx` — polish
- `next.config.ts` — basePath '/workspace' + remocao de turbopack.root
- `proxy.ts` — redirect e matcher corrigidos para /workspace/login
- `vercel.json` (criado) — outputDirectory '.next' (sobrescreve o da raiz do repo)

**Deploy:**
- Vercel projeto separado conectado a `Pelimotion/portfolio`, Root Directory: `felipe-workspace/app`
- Deploy feito com sucesso ✅
- Pendente: rewrite no `vercel.json` da raiz para expor em `pelimotion.art/workspace`

---

## ⚠️ PENDENTE — Rewrite para pelimotion.art/workspace

O app esta deployado no Vercel mas ainda **nao esta acessivel em pelimotion.art/workspace**.
Falta adicionar o rewrite no `vercel.json` da raiz do Portfolio.

**Para fazer na proxima sessao (ou agora):**
1. Pegar a URL do projeto workspace no Vercel (ex: `pelimotion-workspace-xxx.vercel.app`)
2. Adicionar em `Portfolio/vercel.json`:
   ```json
   { "source": "/workspace", "destination": "https://[URL-DO-VERCEL]/workspace" },
   { "source": "/workspace/:path*", "destination": "https://[URL-DO-VERCEL]/workspace/:path*" }
   ```
3. Commit + push → deploy automatico do projeto principal

---

## ▶️ PROXIMA ACAO — Fase 5: Modulo Projetos + Calendario

**O que sera feito:**
1. Lista de projetos com TanStack Table (filtro por stage/cliente)
2. Kanban por stage (Negociacao → Concluido)
3. Calendario de etapas com FullCalendar (barras continuas por projeto)
4. Pagina individual do projeto (etapas + tarefas + despesas)

**Para iniciar:** diga "Fase 5"

O plano detalhado sera criado em `plans/phase-05-projetos.md` ao iniciar.

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
│   └── phase-03-nextjs-setup.md    ← plano da Fase 3 (concluida)
└── app/                            ← Next.js 16 ✅
    ├── .env.local                  ← env vars do Next.js
    ├── proxy.ts                    ← protecao de rotas (auth redirect)
    ├── app/
    │   ├── layout.tsx              ← layout raiz (fonts, dark mode, TooltipProvider)
    │   ├── page.tsx                ← redirect por role
    │   ├── login/page.tsx          ← tela de login
    │   ├── (pelimotion)/           ← route group empresarial
    │   │   ├── layout.tsx          ← sidebar Pelimotion + auth check
    │   │   ├── projetos/page.tsx
    │   │   ├── projetos/[id]/page.tsx
    │   │   ├── projetos/calendario/page.tsx
    │   │   ├── financeiro/page.tsx
    │   │   └── crm/page.tsx
    │   └── (personal)/             ← route group pessoal
    │       ├── layout.tsx          ← sidebar Personal + auth check
    │       ├── tasks/page.tsx
    │       ├── gastos/page.tsx
    │       ├── saude/page.tsx
    │       └── projetos-pessoais/page.tsx
    ├── components/
    │   ├── ui/                     ← shadcn/ui (15 componentes)
    │   ├── pelimotion/sidebar.tsx  ← sidebar empresarial
    │   └── personal/sidebar.tsx    ← sidebar pessoal
    ├── lib/
    │   ├── supabase/server.ts      ← client SSR
    │   ├── supabase/browser.ts     ← client browser
    │   ├── supabase/types.ts       ← tipos TS (3 schemas, 16 tabelas)
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
| 4 | Shell + Auth (sidebar, rotas, login) | ✅ Completa | — |
| 5 | Modulo Projetos + Calendario de etapas | ⏳ Proxima | criado ao iniciar |
| 6 | Modulo Financeiro | ⏳ | criado ao concluir Fase 5 |
| 7 | Modulo Pessoal | ⏳ | criado ao concluir Fase 6 |
| 8 | CRM + Fornecedores | ⏳ | criado ao concluir Fase 7 |
| 9 | Migracao Notion → Supabase | ⏳ | criado ao concluir Fase 8 |
