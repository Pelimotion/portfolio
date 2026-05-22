# PELIMOTION OS — Status
**Ultima atualizacao:** 2026-05-22
**Fase atual:** 10 — Qualidade de Produção
**Progresso geral:** Fases 1–9 completas. App em producao com dados reais. Fase 10 em andamento.

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
- [x] `supabase/migrations/001_initial_schema.sql` — 2 schemas, 16 tabelas + workflow_tasks, todos os enums
- [x] `supabase/migrations/002_triggers.sql` — updated_at automatico, indices, validacao de datas
- [x] `supabase/migrations/003_rls.sql` — RLS por role (admin/editor/viewer)
- [x] `supabase/migrations/004_add_notion_ids.sql` — notion_id em todas as tabelas
- [x] Bug corrigido: `due_date` usa `make_date()` (era `DATE_TRUNC`, gerava erro 42P17)
- [x] Migrations executadas no Supabase ✅
- [x] Schemas `pelimotion` e `personal` expostos na API REST (temporario — ver ARCHITECTURE.md §6.4)
- [x] `project_stages.project_id` tornada nullable (Cronograma do Notion nao tem relacao FK direta)

### Fase 3 — Setup Next.js 16
- [x] App criado com `create-next-app@latest` (Next.js 16.2.6, Turbopack)
- [x] Dependencias instaladas: Supabase SSR, shadcn/ui, FullCalendar, TanStack Table, Recharts, Zustand, RHF+Zod
- [x] shadcn/ui inicializado + 15 componentes adicionados
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
- [x] `next.config.ts` — basePath '/pelispace'
- [x] `vercel.json` (na raiz do app) — outputDirectory '.next'
- [x] Deploy Vercel ✅ — URL: `pelispace.vercel.app` / basePath: `/pelispace`
- [x] Rewrite `/pelispace` adicionado em `Portfolio/vercel.json` → `pelispace.vercel.app` ✅
- [x] Build ✅

### Fase 5 — Módulo Projetos + Calendário
- [x] `components/pelimotion/projetos-table.tsx` — TanStack Table com filtros e sort por coluna
- [x] `components/pelimotion/projetos-kanban.tsx` — Kanban em 5 colunas logicas
- [x] `components/pelimotion/stage-calendar.tsx` — Gantt CSS Grid customizado
- [x] `(pelimotion)/projetos/page.tsx` + `projetos-view.tsx` — server fetch + stats + toggle lista/kanban
- [x] `(pelimotion)/projetos/calendario/page.tsx` — calendário de etapas
- [x] `(pelimotion)/projetos/[id]/page.tsx` + `projeto-tabs.tsx` — detalhe com header financeiro + tabs
- [x] Build ✅

### Fase 6 — Módulo Financeiro ✅ (2026-05-21)
- [x] `components/pelimotion/financeiro-dashboard.tsx` — cards + BarChart Recharts últimos 6 meses
- [x] `components/pelimotion/financeiro-saidas.tsx` — lista de project_expenses com filtro
- [x] `components/pelimotion/financeiro-caixa.tsx` — timeline de cash_flow agrupada
- [x] `app/(pelimotion)/financeiro/page.tsx` + `financeiro-view.tsx`
- [x] Build ✅

### Fase 7 — Módulo Pessoal ✅ (2026-05-22)
- [x] `tasks/page.tsx` + `tasks-view.tsx` — lista com filtro por área + toggle concluídas
- [x] `gastos/page.tsx` + `gastos-view.tsx` — tabela com filtro mês/status + cards resumo
- [x] `saude/page.tsx` + `saude-view.tsx` — health_log com filtro tipo/esfera
- [x] `projetos-pessoais/page.tsx` — lista separada em ativos/arquivados
- [x] Build ✅

### Fase 8 — CRM + Fornecedores ✅ (2026-05-22)
- [x] `components/pelimotion/crm-kanban.tsx` — Kanban 8 colunas por crm_status + filtros
- [x] `components/pelimotion/fornecedores-list.tsx` — tabela com busca + filtro estado + star rating
- [x] `app/(pelimotion)/crm/crm-view.tsx` — tabs Pipeline CRM | Fornecedores + stats
- [x] `app/(pelimotion)/crm/page.tsx` — server fetch paralelo
- [x] Build ✅

### Fase 9 — Migração Notion → Supabase ✅ (2026-05-22)
- [x] `scripts/migrate.js` — script completo criado (15 seções, upsert idempotente via notion_id)
- [x] `scripts/validate.js` — validação pós-migração (contagem + amostras)
- [x] Dry-run validado: 881 linhas, 0 erros, 15 seções
- [x] API v5 corrigida: `dataSources.query({ data_source_id })` em vez de `databases.query`
- [x] Migração real executada: **881 registros, 0 erros**
- [x] Validação pós-migração: **15/15 tabelas com counts exatos**

**Inventário final da migração:**
| Seção | Tabela Supabase | Linhas | Linkagem project_id |
|-------|----------------|--------|-------------------|
| crm | pelimotion.crm_contacts | 18 | N/A |
| suppliers | pelimotion.suppliers | 269 | N/A |
| projects | pelimotion.projects | 106 | N/A (é a FK-source) |
| stages | pelimotion.project_stages | 13 | 0/13 — null esperado (ver nota) |
| tasks-plm | pelimotion.tasks | 116 | 47/116 (41%) |
| expenses-plm | pelimotion.project_expenses | 170 | 3/170 (2%) |
| cash-flow | pelimotion.cash_flow | 5 | 1/5 (20%) |
| income | pelimotion.income_entries | 3 | N/A |
| products | pelimotion.products | 9 | N/A |
| personal-tasks | personal.tasks | 68 | N/A |
| personal-expenses | personal.expenses | 11 | N/A |
| investments | personal.investments | 36 | N/A |
| home | personal.home_items | 38 | N/A |
| health | personal.health_log | 3 | N/A |
| personal-projects | personal.projects | 16 | N/A |
| **TOTAL** | | **881** | |

> **Nota stages:** O DB "Cronograma" do Notion não tem relação direta com "Pipeline Pelimotion".
> O campo `project_id` foi tornado nullable intencionalmente. Vinculação manual via UI na Fase 10.

**Para re-migrar uma seção específica:** `node scripts/migrate.js <seção>` (upsert idempotente via notion_id)

---

## 🔴 BUGS CONHECIDOS

### BUG 1 — proxy.ts loop infinito ✅ CORRIGIDO (2026-05-22)
**Fix:** pathname `/pelispace/login` → `/login` (basePath stripado no middleware). Deploy ativo.

### BUG 2 — favicon.ico 404 (COSMÉTICO — baixa prioridade)
**Fix:** Adicionar `favicon.ico` na raiz do Portfolio. Não bloqueia funcionalidade.

### BUG 3 — Vercel env vars ✅ CORRIGIDO (2026-05-22)
**Fix:** `NEXT_PUBLIC_SUPABASE_URL` (sem `/rest/v1`) + `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuradas.

### BUG 4 — Vercel CLI 54 / Next.js 16 / Turbopack path undefined ✅ CORRIGIDO (2026-05-22)
**Causa:** `modifyConfig` do Vercel CLI 54 quebrava quando `turbopack.root` diferia de `outputFileTracingRoot`.
**Fix:** `next.config.ts` — ambos apontando para `path.resolve(__dirname, '../..')` (raiz do repo).
`vercel.json` — `outputDirectory: '.next'` restaurado (necessário para `onBuildComplete` encontrar o manifest).

### BUG 5 — App logado mas dados não aparecem 🔴 PRÓXIMO A CORRIGIR
**Sintoma:** Login funciona, app carrega, mas todos os módulos aparecem vazios.
**Diagnóstico executado em 2026-05-22:**
```
projects (service_role):  106 ✅  ← dados estão no banco
personal.tasks:            68 ✅
profiles (5 usuários):
  id: 9c17dc40  role: 'admin'     ← único com role válido
  id: 0e191714  role: 'Toker'     ← role inválido (não é admin/editor/viewer)
  id: 74542c4e  role: null        ← sem role → RLS bloqueia tudo
  id: 8bf39397  role: null
  id: 4676abf8  role: null
```

**Causa A — Schemas não expostos no Supabase (MAIS PROVÁVEL):**
Por padrão, Supabase só expõe o schema `public` na API REST.
Para `pelimotion.*` e `personal.*` funcionarem no app, os schemas precisam ser adicionados em:
`Supabase Dashboard → Settings → API → "Extra schemas to expose" → pelimotion,personal`
Se esse campo está vazio, TODAS as queries do app retornam vazio silenciosamente.

**Causa B — Perfil do usuário logado com role null:**
O app faz `.from('profiles').select('role')` para decidir redirect e RLS.
Se `role = null`, a função `current_user_role()` retorna null → RLS bloqueia leitura de dados.
O usuário provavelmente logou com um dos 4 perfis sem role.

**Fix completo (executar na próxima sessão):**

**Passo 1 — Expor schemas (Supabase Dashboard):**
```
Supabase → Settings → API → Extra schemas to expose
Adicionar: pelimotion,personal
Salvar
```

**Passo 2 — Corrigir roles dos profiles (Supabase SQL Editor):**
```sql
-- Ver todos os profiles com email para identificar quem é quem:
SELECT p.id, p.role, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;

-- Depois de identificar, setar o role correto (substituir o UUID pelo seu):
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<seu-uuid-aqui>';

-- Corrigir o role inválido 'Toker':
UPDATE public.profiles
SET role = 'editor'   -- ou 'viewer' dependendo de quem é
WHERE role = 'Toker';

-- Setar role padrão para profiles sem role (editor é seguro):
UPDATE public.profiles
SET role = 'editor'
WHERE role IS NULL;
```

**Passo 3 — Verificar RLS com anon key (opcional, para confirmar):**
```js
// No terminal, dentro de felipe-workspace/:
node -e "
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
// Usar ANON KEY (não service role) para simular o app:
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
sb.schema('pelimotion').from('projects').select('id', { count: 'exact', head: true })
  .then(r => console.log('projects via anon:', r.count, r.error?.message));
"
// Se retornar null ou error → schemas não expostos (Passo 1 resolve)
// Se retornar 0 → schemas expostos mas RLS bloqueando (Passo 2 resolve)
// Se retornar 106 → dados OK, problema é outra coisa no frontend
```

---

## 🗺️ ROADMAP COMPLETO

| # | Fase | Status | Prioridade |
|---|------|--------|-----------|
| 1 | Discovery Notion | ✅ Completa | — |
| 2 | Schema Supabase | ✅ Completa | — |
| 3 | Setup Next.js 16 | ✅ Completa | — |
| 4 | Shell + Auth | ✅ Completa | — |
| 5 | Módulo Projetos + Calendário | ✅ Completa | — |
| 6 | Módulo Financeiro | ✅ Completa | — |
| 7 | Módulo Pessoal | ✅ Completa | — |
| 8 | CRM + Fornecedores | ✅ Completa | — |
| 9 | Migração Notion → Supabase | ✅ Completa | — |
| **10** | **Qualidade de Produção** | **🔴 Em andamento** | **URGENTE** |
| 11 | Dados Complementares (Workflow + CRM ampliado) | ⏳ Próxima | Alta |
| 12 | Linkagem e Qualidade de Dados | ⏳ | Alta |
| 13 | CRUD — Criação e Edição de Registros | ⏳ | Alta |
| 14 | Sync Incremental Notion (automação) | ⏳ | Média |
| 15 | Hardening de Produção (schemas privados + RLS final) | ⏳ | Média |

---

## 📋 DETALHAMENTO DAS FASES FUTURAS

### Fase 10 — Qualidade de Produção 🔴 URGENTE
**Objetivo:** App acessível e funcional em `www.pelimotion.art/pelispace`.
**Entregável:** Zero erros de console, login funcionando, todos os módulos carregando dados reais.

**Checklist:**
- [ ] **Deploy do fix do proxy.ts** — push para main → Vercel redeploy automático
- [ ] **Vercel env vars** — confirmar no painel do Vercel (projeto `pelispace`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_BUNNY_CDN` (se usado no frontend)
- [ ] **Teste de login** — acessar `www.pelimotion.art/pelispace`, fazer login, navegar por todos os módulos
- [ ] **Checar encoding dos suppliers** — Supabase Dashboard → pelimotion.suppliers → buscar nomes com `??`
  - Se quebrado: rodar `node scripts/migrate.js suppliers` (re-migra só suppliers, upsert idempotente)
- [ ] **favicon.ico** — copiar `app/app/favicon.ico` para a raiz do Portfolio se necessário
- [ ] **Verificar dados reais nos módulos:**
  - Projetos: 106 projetos devem aparecer no Kanban e na tabela
  - Financeiro: 170 despesas + 5 caixa + 3 entradas
  - CRM: 18 contatos + 269 fornecedores
  - Pessoal: 68 tasks + 11 gastos + 36 investimentos + 38 home + 3 saúde + 16 projetos

**Arquivos a modificar:**
- `app/proxy.ts` ✅ já corrigido — só precisa de deploy
- Vercel Dashboard (manual, sem código)

---

### Fase 11 — Dados Complementares Notion
**Objetivo:** Migrar os 5 databases Notion ainda não importados.
**Entregável:** `workflow_tasks` populada + CRM ampliado + empresas B2B no sistema.

**Inventário de DBs não migrados:**
| DB Notion | ID | Schema alvo | Ação |
|-----------|-----|------------|------|
| Workflow (×3) | 28d, 28c, 25f | `pelimotion.workflow_tasks` | Migrar — tabela já existe no SQL |
| Alto valor extraido perplexity | 22301aae | `pelimotion.crm_contacts` (extend) OU nova tabela | Analisar dados primeiro |
| NomedaEmpresa (empresa B2B) | 20401aae | `pelimotion.crm_contacts` (extend) OU nova tabela `companies` | Analisar dados primeiro |
| Pipeline Pelimotion (Principal) | 3e5c9ec2 | `pelimotion.projects` (upsert) | Revisar — pode ser duplicata do Pipeline já migrado |

**Passos:**
1. Testar acesso aos 3 DBs Workflow via API Notion (podem ter 0 páginas — schemas sem dados)
2. Analisar "Alto valor perplexity": tem campos `fn, ln, email, phone, company, title` → mapeável para crm_contacts
3. Analisar "NomedaEmpresa": tem `Receita, Funcionários, Especialidades` → precisa de tabela `companies` nova?
4. Adicionar seções em `scripts/migrate.js`:
   - `workflow` → mapear Status Notion para `workflow_status_enum`, Canal para `channel_enum`
   - `crm-extended` → upsert de leads no crm_contacts por email (deduplicação)
5. Criar `supabase/migrations/005_companies.sql` se decidir criar tabela separada para empresas B2B

**Mapeamento de enums (Workflow → Supabase):**
| Valor Notion | Enum Supabase |
|-------------|--------------|
| (qualquer status) | `workflow_status_enum`: briefing_pre, em_espera, pausa, criacao, animacao, ... |
| Canal: interno/redes/mapping/ooh | `channel_enum` |
| Prioridade: Alta/Média/Baixa | `priority_enum`: alta, media, baixa |

**Arquivos a criar/modificar:**
- `scripts/migrate.js` — adicionar seções: `workflow`, `crm-extended`
- `supabase/migrations/005_companies.sql` — SE criar tabela de empresas
- `scripts/validate.js` — adicionar contagens para as novas tabelas

---

### Fase 12 — Linkagem e Qualidade de Dados
**Objetivo:** Maximizar as FKs entre tabelas para queries relacionais funcionarem corretamente.
**Entregável:** UI de vinculação + script de linkagem automática por nome de projeto.

**Problemas conhecidos (da validação da Fase 9):**
| Problema | Tabela | Situação atual | Ação |
|----------|--------|---------------|------|
| Stages sem projeto | `project_stages` | 0/13 com project_id | UI de vinculação manual OU script de match por nome |
| Tasks sem projeto | `pelimotion.tasks` | 47/116 (41%) com project_id | Script de re-linkagem via notion_id da relation |
| Despesas sem projeto | `project_expenses` | 3/170 (2%) com project_id | Idem |
| Encoding quebrado | `suppliers` | Nomes com `??` | Re-migrar com encoding correto |

**Abordagem de linkagem automática:**
```js
// Para tasks e expenses: o migrate.js já tenta linkar via notion_id da relation.
// O problema é que a relation no Notion pode ter IDs de pages, não de databases.
// Solução: extrair notion_id das pages relacionadas e cruzar com projects.notion_id
```

**Script a criar:** `scripts/relink.js`
- Busca tasks sem project_id no Supabase
- Para cada task, chama Notion API para buscar a relation original
- Cruza o notion_id da relation com projects.notion_id
- Faz UPDATE no Supabase

**UI a criar (opcional):** aba "Vincular Etapas" na página de projeto (`/projetos/[id]`)
- Lista stages sem project_id
- Permite vincular manualmente via dropdown de projetos

---

### Fase 13 — CRUD (Criação e Edição de Registros)
**Objetivo:** O sistema deixa de ser read-only e vira operacional.
**Entregável:** Criar/editar projetos, tasks, despesas e contatos CRM diretamente no app.

**Prioridade de implementação (ordem decrescente de uso):**
1. **Projetos** — criar novo projeto (form: nome, cliente, stage, valor, datas)
2. **Tasks PLM** — criar task + marcar como concluída (checkbox)
3. **Despesas** — lançar saída (form: nome, valor, data, projeto opcional)
4. **CRM** — editar status de lead (drag no Kanban já seria ideal)
5. **Stages** — vincular stage a projeto + editar datas

**Stack para forms:**
- React Hook Form + Zod (já instalados)
- shadcn/ui Dialog para modais de criação
- Server Actions do Next.js (sem necessidade de API routes extras)

**Padrão a seguir:**
```typescript
// Server Action (novo arquivo: app/(pelimotion)/projetos/actions.ts)
'use server'
export async function createProject(data: ProjectFormData) {
  const supabase = await createSupabaseServer()
  const { error } = await supabase.schema('pelimotion').from('projects').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/projetos')
}
```

---

### Fase 14 — Sync Incremental Notion (automação)
**Objetivo:** Manter o Supabase atualizado sem rodar migração manual.
**Entregável:** Script de sync incremental + cron job opcional.

**Estratégia:**
- O `migrate.js` já usa `upsert` com `notion_id` como chave → é idempotente por design
- Para sync incremental, adicionar filtro `last_edited_time > last_sync_at`
- Guardar `last_sync_at` em tabela `public.sync_log` ou em arquivo `.sync-state.json`

**Script a criar:** `scripts/sync.js`
```js
// Uso:
//   node scripts/sync.js           → sync de todas as seções (só registros alterados)
//   node scripts/sync.js projects  → sync só de projetos
//   node scripts/sync.js --full    → equivale a migrate.js (todos os registros)
```

**Automação possível:**
- GitHub Actions: cron `0 */6 * * *` (a cada 6h) rodando `node scripts/sync.js`
- Ou Vercel Cron Jobs (plano Pro) chamando um endpoint `/api/sync`
- Ou script local agendado via `cron` no Mac

**Condição de ativação:** Só faz sentido enquanto o Notion ainda for fonte primária.
Após a Fase 13 (CRUD no app), o app vira fonte primária e o Notion se torna legado.

---

### Fase 15 — Hardening de Produção
**Objetivo:** Remover acessos temporários de desenvolvimento e fechar superfície de ataque.
**Entregável:** Schemas privados, RLS revisado, sem stack trace em produção.

**Checklist:**
- [ ] Supabase: remover `pelimotion` e `personal` de "Extra schemas to expose" (Settings → API)
- [ ] Criar views/functions no schema `public` para cada query do frontend
- [ ] Revisar RLS: garantir que `editor` não consegue deletar, `viewer` não consegue escrever
- [ ] Adicionar error boundaries nos Server Components (evitar crash total da página)
- [ ] Configurar `NEXT_PUBLIC_` apenas para variáveis realmente públicas (anon key é OK)
- [ ] Audit de logs: habilitar Supabase Logs para queries suspeitas

---

## 📦 ÁRVORE DE ARQUIVOS COMPLETA

```
felipe-workspace/
├── .env                            ← credenciais (NOTION_TOKEN, SUPABASE_*, BUNNY_*)
├── CLAUDE.md                       ← comportamento do agente
├── ARCHITECTURE.md                 ← decisoes arquiteturais permanentes ← LER SEMPRE
├── STATUS.md                       ← este arquivo
├── notion_architecture.json        ← 22 DBs do Notion mapeados (Fase 1)
├── notion_architecture.md          ← diagrama Mermaid (Fase 1)
├── scripts/
│   ├── notion-extract.js           ← extrator do Notion (Fase 1)
│   ├── generate-mermaid.js         ← gerador de diagrama
│   ├── migrate.js                  ← migração Notion → Supabase (Fase 9) ✅
│   └── validate.js                 ← validação pós-migração (Fase 9) ✅
│   [A CRIAR]
│   ├── relink.js                   ← re-linkagem tasks/expenses → projects (Fase 12)
│   └── sync.js                     ← sync incremental Notion (Fase 14)
├── supabase/
│   ├── README.md
│   └── migrations/
│       ├── 001_initial_schema.sql  ✅ executado
│       ├── 002_triggers.sql        ✅ executado
│       ├── 003_rls.sql             ✅ executado
│       ├── 004_add_notion_ids.sql  ✅ executado
│       [A CRIAR SE NECESSÁRIO]
│       └── 005_companies.sql       ← tabela de empresas B2B (Fase 11 — condicional)
├── plans/
│   ├── phase-03-nextjs-setup.md    ← Fase 3 concluida
│   ├── phase-05-projetos.md        ← Fase 5 concluida
│   └── phase-06-financeiro.md      ← Fase 6 concluida
└── app/                            ← Next.js 16 ✅ — basePath '/pelispace'
    ├── .env.local                  ← NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + BUNNY_CDN
    ├── proxy.ts                    ← auth redirect (CORRIGIDO 2026-05-22)
    ├── next.config.ts              ← basePath '/pelispace'
    ├── vercel.json                 ← outputDirectory '.next'
    └── app/
        ├── layout.tsx              ← root layout (fonts, dark, TooltipProvider)
        ├── page.tsx                ← redirect por role
        ├── login/page.tsx          ← login público (Supabase Auth)
        ├── (pelimotion)/           ← módulo empresarial (admin + editor)
        │   ├── layout.tsx          ← sidebar + auth check
        │   ├── projetos/           ← Kanban, Lista, Calendário, [id]
        │   ├── financeiro/         ← Dashboard, Saídas, Caixa
        │   └── crm/                ← CRM Pipeline, Fornecedores
        └── (personal)/             ← módulo pessoal (todos os roles)
            ├── tasks/
            ├── gastos/
            ├── saude/
            └── projetos-pessoais/
```

---

## 🎯 PRÓXIMA SESSÃO — Prompt de início

```
[AI_AGENT_BRIEFING.md carregado automaticamente]

# Context: workspace-agent — Fase 10 (dados visíveis em produção)

📋 STATUS ANTERIOR
Fases 1–9 completas. Deploy em produção: www.pelimotion.art/pelispace ✅
Login funcionando. 881 registros no Supabase confirmados via service_role.
App carrega mas módulos aparecem VAZIOS — dados não chegam ao frontend.

Diagnóstico feito (2026-05-22):
- 106 projects + 68 personal.tasks no banco ✅
- Schemas pelimotion/personal provavelmente NÃO expostos na API do Supabase
- 4 de 5 profiles com role=null → RLS bloqueia queries autenticadas

🎯 TAREFA DESTA SESSÃO
Fase 10 — Tornar dados visíveis no app:

PASSO 1 (manual, sem código):
  Supabase Dashboard → Settings → API → "Extra schemas to expose"
  Adicionar: pelimotion,personal → Salvar

PASSO 2 (Supabase SQL Editor):
  -- identificar seu UUID:
  SELECT p.id, p.role, u.email
  FROM public.profiles p JOIN auth.users u ON u.id = p.id;
  
  -- corrigir roles:
  UPDATE public.profiles SET role = 'admin' WHERE id = '<seu-uuid>';
  UPDATE public.profiles SET role = 'editor' WHERE role IS NULL OR role = 'Toker';

PASSO 3 (terminal, validar):
  node -e "
  require('dotenv').config({ path: '.env' });
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  sb.schema('pelimotion').from('projects').select('id',{count:'exact',head:true})
    .then(r => console.log('projects via anon:', r.count, r.error?.message));
  "
  → Esperado: 106. Se null/error = schemas não expostos. Se 0 = RLS bloqueando.

PASSO 4: Testar www.pelimotion.art/pelispace — módulos devem mostrar dados reais.

📦 ARQUIVOS RELEVANTES
- `scripts/migrate.js` — re-migrar seção se necessário
- `supabase/migrations/003_rls.sql` — políticas RLS atuais (referência)
- `app/lib/supabase/server.ts` — client SSR (referência para debug)

⏸️ Prosseguir com Passo 1 (Supabase Dashboard)?
```

---

## 📝 HISTÓRICO DE SESSÕES

### 2026-05-22 — Fase 10 continuação (deploy + diagnóstico de dados vazios)
**O que foi feito:**
- [x] Bug identificado: proxy.ts verificava `/pelispace/login` mas basePath faz Next.js stripar o prefixo → loop
- [x] `app/proxy.ts` corrigido: `/login` na condição e no matcher
- [x] Bug de build Vercel CLI 54 + Next.js 16 + Turbopack diagnosticado e corrigido:
  - `turbopack.root` e `outputFileTracingRoot` alinhados com raiz do repo via `path.resolve(__dirname, '../..')`
  - `vercel.json` com `outputDirectory: '.next'` restaurado
- [x] `NEXT_PUBLIC_SUPABASE_URL` corrigida no Vercel (estava com `/rest/v1` erroneamente)
- [x] Deploy em produção: `www.pelimotion.art/pelispace` ✅ — login funciona
- [x] Diagnóstico de dados vazios:
  - 106 projects + 68 tasks confirmados no banco via service_role
  - 4/5 profiles com `role: null` → RLS bloqueia queries
  - Schemas `pelimotion`/`personal` provavelmente não expostos na API Supabase

**Arquivos modificados:** `app/proxy.ts`, `app/next.config.ts`, `app/vercel.json`, `STATUS.md`, `ARCHITECTURE.md`
**Próximo passo:** Expor schemas no Supabase + corrigir roles dos profiles

### 2026-05-22 — Fases 9 e 10 (migração + diagnóstico de produção)
**O que foi feito:**
- [x] `node scripts/migrate.js --dry-run` — 881 linhas, 0 erros confirmados
- [x] `node scripts/migrate.js` — migração real executada (881 registros)
- [x] `node scripts/validate.js` — 15/15 tabelas validadas
- [x] Bug de produção diagnosticado: proxy.ts com path incorreto para basePath
- [x] `app/proxy.ts` corrigido: `/pelispace/login` → `/login` em condição e matcher
- [x] STATUS.md e ARCHITECTURE.md atualizados com roadmap completo até Fase 15

**Arquivos modificados:** `scripts/migrate.js` (executado), `app/proxy.ts`, `STATUS.md`, `ARCHITECTURE.md`
**Próximo passo:** Deploy do fix (push main) + verificação manual no Vercel Dashboard

---

## 🚨 BLOQUEADORES ATIVOS

| Bloqueador | Tipo | Ação necessária |
|-----------|------|----------------|
| `proxy.ts` fix não deployado | Deploy | Push para main (manual pelo usuário) |
| Vercel env vars não confirmadas | Config | Verificar no painel Vercel projeto `pelispace` |

---
**Última atualização:** 2026-05-22
