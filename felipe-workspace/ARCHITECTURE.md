# PELIMOTION OS — Documento de Arquitetura
**Versão:** 1.0 | **Criado em:** 2026-05-21
**Propósito:** Referência permanente de todas as decisões arquiteturais.
Nunca apagar. Atualizar quando uma decisão mudar.

---

## 1. VISÃO GERAL

Substituição completa do Notion por uma aplicação web proprietária que gerencia:
- **Domínio Pelimotion** — pipeline de projetos, produção, financeiro, CRM, fornecedores
- **Domínio Pessoal** — rotina, gastos, saúde, investimentos, projetos pessoais

A separação em domínios é física (schemas PostgreSQL distintos) e visual (módulos isolados na UI).

---

## 2. STACK DEFINITIVA

| Camada | Tecnologia | Versão | Motivo da escolha |
|--------|-----------|--------|-------------------|
| Framework frontend | Next.js | 16 (App Router) | SSR nativo, API routes, sem Vercel Functions extras |
| Estilização | Tailwind CSS | 4.x | Utility-first, dark mode nativo, sem CSS manual |
| Componentes UI | shadcn/ui | latest | Acessível, composável, nível enterprise, sem lock-in |
| Banco de dados | Supabase (PostgreSQL 15) | — | Auth + DB + Realtime + Storage em um serviço |
| Auth | Supabase Auth | — | Já existe no ecossistema Pelimotion, roles funcionando |
| Storage/CDN | Bunny.net | — | Vídeos e assets pesados; Supabase fica só com dados |
| Calendário | @fullcalendar/react | 6.x | Suporta "range events" (barras contínuas por etapa) |
| Tabelas | @tanstack/react-table | 8.x | Virtualização, filtros server-side, +1000 registros |
| Gráficos | Recharts | 2.x | Leve, composável, integra com Tailwind |
| Estado global | Zustand | 5.x | Simples, sem boilerplate, sem Redux |
| Formulários | React Hook Form + Zod | — | Validação tipada, zero re-renders |
| Deploy | Vercel | — | Push no main = deploy automático |

---

## 3. CREDENCIAIS E SERVIÇOS

```
Supabase Project ID:  gfaqnkmmbozmhroicqyc
Supabase URL:         https://gfaqnkmmbozmhroicqyc.supabase.co
Bunny Storage Zone:   pelimotion-portfolio
Bunny CDN:            pelimotion-portfolio.b-cdn.net
Vercel Project:       portfolio (pelimotion.art)
Notion Bot:           "Framework" (workspace: Felipe)
Notion Workspace ID:  41905f3c-1b3b-4a04-ba8c-8fbfb89cbff2
```

Todas as chaves ficam em `.env` na raiz do workspace. **Nunca commitar.**

---

## 4. ESTRUTURA DO REPOSITÓRIO

```
felipe-workspace/
├── .env                          ← credenciais locais (nunca commitar)
├── .gitignore
├── CLAUDE.md                     ← instruções do agente (comportamento)
├── ARCHITECTURE.md               ← este arquivo (decisões arquiteturais)
├── STATUS.md                     ← estado atual + próximo passo
├── notion_architecture.json      ← schema extraído do Notion
├── notion_architecture.md        ← diagrama Mermaid
├── package.json                  ← scripts Node.js utilitários
├── scripts/
│   ├── notion-extract.js         ← extrator do Notion
│   └── generate-mermaid.js       ← gerador de diagrama Mermaid
├── supabase/
│   ├── README.md
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_triggers.sql
│       └── 003_rls.sql
├── plans/                        ← planos de implementação por fase (substituídos ao concluir)
│   └── phase-XX-nome.md
└── app/                          ← Next.js 16 (Fase 3 ✅)
    ├── app/                      ← App Router (rotas)
    │   ├── login/                ← página de login (pública)
    │   ├── (pelimotion)/         ← módulo empresarial (protegido via proxy.ts)
    │   │   ├── projetos/         ← pipeline, [id], calendario
    │   │   ├── financeiro/
    │   │   └── crm/
    │   └── (personal)/           ← módulo pessoal (protegido)
    │       ├── tasks/
    │       ├── gastos/
    │       ├── saude/
    │       └── projetos-pessoais/
    ├── components/
    │   ├── ui/                   ← shadcn/ui primitivos (render prop, não asChild)
    │   ├── pelimotion/           ← sidebar e componentes empresariais
    │   └── personal/             ← sidebar e componentes pessoais
    ├── lib/
    │   ├── supabase/             ← server.ts, browser.ts, types.ts
    │   └── utils.ts
    ├── hooks/                    ← React hooks (use-mobile.ts)
    ├── proxy.ts                  ← proteção de rotas (substitui middleware.ts no Next 16)
    ├── .env.local                ← env do Next.js
    └── next.config.ts
```

---

## 5. BANCO DE DADOS — SCHEMAS

### Schema `pelimotion` (domínio empresarial)
| Tabela | Função | Colunas chave |
|--------|--------|---------------|
| `projects` | Núcleo — pipeline de projetos | stage, client, total_value, profit (gerado), notion_id |
| `project_stages` | Etapas de projeto (calendário) | project_id, start_date, end_date, stage_type |
| `tasks` | Tarefas de produção PLM | project_id, area, is_done, status |
| `project_expenses` | Despesas por projeto | project_id, value, is_paid |
| `cash_flow` | Fluxo de caixa Pelimotion | project_id, areas[], due_date |
| `income_entries` | Entradas de caixa (legado) | project_id, value |
| `workflow_tasks` | Workflow de produção | project_id, status, channel, responsible |
| `crm_contacts` | CRM de clientes/prospects | crm_status, lead_temp, sector |
| `suppliers` | Fornecedores e produtoras | city, state, rating |
| `products` | Catálogo de serviços | complexity, duration_sec, credits (gerado) |

### Schema `personal` (domínio pessoal)
| Tabela | Função | Colunas chave |
|--------|--------|---------------|
| `tasks` | Tarefas pessoais | area, is_done, status |
| `expenses` | Gastos pessoais | competence_date, due_day, due_date (gerado), is_recurring |
| `investments` | Investimentos | area, price, invest_date |
| `home_items` | Lista de necessidades da casa | sphere, priority, estimated_price |
| `health_log` | Diário de saúde | entry_type, sphere, status, log_date |
| `projects` | Projetos pessoais | status, total_value |

### Schema `public`
| Tabela | Função |
|--------|--------|
| `profiles` | Perfis de usuário (id = auth.users.id, role: admin/editor/viewer) |
| `blog_posts` | Posts do blog (sistema existente, não tocar) |

---

## 6. DECISÕES DE BANCO CRÍTICAS

### 6.1 Calendário de Etapas (regra de negócio mais importante)
O calendário **não é** um simples calendário de entregas. É uma visualização de etapas contínuas por projeto.

```sql
-- Cada projeto tem N etapas com start_date + end_date
-- O frontend renderiza como barras horizontais cobrindo os dias do mês
-- delivery_date é pontual (diamante no calendário), diferente das barras
SELECT ps.*, p.name AS project_name, p.client
FROM pelimotion.project_stages ps
JOIN pelimotion.projects p ON p.id = ps.project_id
WHERE ps.start_date <= :month_end
  AND ps.end_date   >= :month_start
ORDER BY ps.start_date, p.name;
```

**Renderização no frontend:**
- Cada linha do calendário = 1 projeto
- Barra colorida contínua = 1 etapa (de start_date até end_date)
- Múltiplas etapas do mesmo projeto = múltiplas barras na mesma linha
- Sobreposição de etapas = permitida (ex: "Animação" começa antes de "Aprovação" terminar)

### 6.2 Fórmulas do Notion → Colunas Geradas
| Notion | PostgreSQL | Tabela |
|--------|-----------|--------|
| `Valor Total - Custo Pago` | `profit GENERATED` | projects |
| `Valor Total - Recebido` | `amount_receivable GENERATED` | projects |
| `Custo - Custo Pago` | `amount_payable GENERATED` | projects |
| `Duração × Complexidade` | `credits GENERATED` | products |
| `make_date(ano, mês, dia_vencimento)` | `due_date GENERATED` | personal.expenses |

### 6.3 Workflow Consolidado
Os 3 databases "Workflow" duplicados do Notion viram **1 tabela** `pelimotion.workflow_tasks`.
Campo `notion_id` mantém o ID original para rastreabilidade na migração.

### 6.4 Schemas Expostos no Supabase (TEMPORÁRIO — desenvolvimento)
Por padrão, o Supabase expõe só o schema `public` na API REST.
Para `pelimotion` e `personal` funcionarem durante o desenvolvimento, foram expostos explicitamente.

**Configuração atual:** Supabase Dashboard → Settings → API → "Extra schemas to expose" → `pelimotion,personal`

**⚠️ PLANO DE REVERSÃO (pós-desenvolvimento):**
Quando o sistema estiver em produção e independente do Notion:
1. Remover `pelimotion` e `personal` de "Extra schemas to expose"
2. Criar views/functions no schema `public` que acessam os dados internamente
3. O frontend passa a chamar essas views/functions (que já respeitam RLS)
4. Os schemas ficam privados — acessíveis só via server-side ou functions internas

Isso garante que a superfície de ataque da API REST seja mínima em produção.

---

## 7. AUTH E PERMISSÕES

Sistema de roles existente (já funciona no ecossistema Pelimotion):
| Role | Acesso |
|------|--------|
| `admin` | Leitura + escrita + delete em tudo |
| `editor` | Leitura + escrita (sem delete) |
| `viewer` | Somente leitura |

Função helper: `public.current_user_role()` — retorna o role do usuário logado.
Todas as tabelas têm RLS ativado com policies baseadas nessa função.

---

## 8. STORAGE — BUNNY.NET

Regra: **Supabase só guarda dados textuais/relacionais.** Arquivos e mídias vão para o Bunny.

| Tipo de arquivo | Destino Bunny | Referenciado em |
|----------------|--------------|-----------------|
| Vídeos de projetos | `pelimotion-portfolio/projects/[project_id]/` | `projects.media_urls[]` |
| Documentação de projetos | `pelimotion-portfolio/projects/[project_id]/docs/` | `projects.documentation_urls[]` |
| Assets do blog | `pelimotion-portfolio.b-cdn.net/blog/` | `blog_posts.data.images[]` |
| Avatars de usuário | `pelimotion-portfolio/avatars/` | `profiles.avatar_url` |

Upload flow: `Frontend → /api/upload → Bunny Storage API → retorna CDN URL → salva no Supabase`

---

## 9. MÓDULOS DA APLICAÇÃO

### 9.1 Shell / Layout Global
- Sidebar responsiva com ícones + labels
- Separação visual clara entre "Pelimotion" e "Pessoal"
- Dark mode por padrão
- Header com avatar, notificações, quick-actions

### 9.2 Módulo Projetos (Pelimotion)
**Views disponíveis:**
1. **Kanban** — colunas por `stage` (Negociação → Concluído)
2. **Calendário** — barras de etapas por projeto no mês (regra crítica)
3. **Lista** — tabela filtrable com TanStack Table
4. **Projeto individual** — detalhes + etapas + tarefas + despesas + financeiro

### 9.3 Módulo Financeiro (Pelimotion)
- Dashboard: receita total, custo, lucro, a receber, a pagar
- Gráfico mensal de entrada/saída
- Lista de saídas com filtros por tipo/período
- Caixa Pelimotion: timeline de vencimentos

### 9.4 Módulo CRM
- Pipeline de prospects (Kanban por status: Prospecção → Concluído)
- Temperatura visual (Frio/Morno/Quente)
- Diretório de produtoras (BH/RJ/SP unificado com busca)

### 9.5 Módulo Pessoal
- Tasks com área (Casa/Rua/PC/Comprar/Compromisso)
- Gastos mensais com gráfico de categorias
- Diário de saúde
- Lista de itens para a casa
- Projetos pessoais

---

## 10. ROADMAP DE FASES

| Fase | Nome | Status | Entregável |
|------|------|--------|-----------|
| 1 | Discovery Notion | ✅ | `notion_architecture.json` |
| 2 | Schema Supabase | ✅ | 4 migrations SQL (001–004) |
| 3 | Setup Next.js 16 | ✅ | App local com auth e rotas |
| 4 | Shell + Auth | ✅ | Sidebar, login, deploy Vercel |
| 5 | Módulo Projetos | ✅ | Kanban + Calendário Gantt |
| 6 | Módulo Financeiro | ✅ | Dashboard + saídas + caixa |
| 7 | Módulo Pessoal | ✅ | Tasks + saúde + gastos |
| 8 | CRM + Fornecedores | ✅ | CRM Kanban + diretório |
| 9 | Migração de dados | ✅ | 881 registros, 15 tabelas, 0 erros |
| 10 | Qualidade de Produção | 🔴 | Zero erros console, login OK em prod |
| 11 | Dados Complementares | ⏳ | Workflow + CRM B2B migrados |
| 12 | Linkagem de Dados | ⏳ | FKs maximizadas, encoding corrigido |
| 13 | CRUD | ⏳ | Criar/editar projetos, tasks, despesas |
| 14 | Sync Incremental Notion | ⏳ | `scripts/sync.js` + cron |
| 15 | Hardening de Produção | ⏳ | Schemas privados, RLS final |

---

## 11. CONVENÇÕES DE CÓDIGO

```typescript
// Nomenclatura
camelCase      → funções, variáveis, props React
PascalCase     → componentes, types, interfaces
kebab-case     → arquivos, pastas, rotas URL
UPPER_SNAKE    → constantes de env/config
snake_case     → colunas SQL (PostgreSQL convention)

// Padrão de arquivo de componente
export function ComponentName({ prop }: Props) { ... }  // named export sempre
// ↑ facilita tree-shaking e refactoring

// Padrão de Server Component vs Client Component
// Default: Server Component (sem 'use client')
// 'use client' apenas quando: useState, useEffect, event handlers, browser APIs

// Padrão de fetch de dados
// Server Components → Supabase server client (SSR)
// Client Components → Supabase browser client + React Query/SWR
```

---

## 12. HISTÓRICO DE DECISÕES

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-05-21 | Schemas separados `pelimotion`/`personal` | Isolamento real — expandir um não afeta o outro |
| 2026-05-21 | `project_stages.start_date` + `end_date` | Calendário: barras contínuas, não pontos pontuais |
| 2026-05-21 | `due_date` usa `make_date()` | `DATE_TRUNC` não é immutable no PG — gera erro 42P17 |
| 2026-05-21 | 3 databases Workflow → 1 tabela `workflow_tasks` | Eram duplicatas idênticas, sem distinção de dados |
| 2026-05-21 | `client TEXT` (não FK para CRM) | Criar projeto sem cadastro CRM prévio; join é opcional |
| 2026-05-21 | Bunny.net para mídias, Supabase só dados textuais | Evitar storage pesado no plano gratuito do Supabase |
| 2026-05-21 | Schemas expostos na API REST (TEMPORÁRIO) | Dev: acesso direto; prod: criar views/functions no `public` |
| 2026-05-21 | Next.js 16 (era 15 no plano) | `create-next-app@latest` instalou v16. `middleware.ts` → `proxy.ts` |
| 2026-05-21 | shadcn/ui usa `render` prop (não `asChild`) | Nova versão usa base-ui com `render` em vez de Radix `asChild` |
| 2026-05-22 | `project_stages.project_id` nullable | DB Cronograma do Notion não tem relation FK com Pipeline |
| 2026-05-22 | `proxy.ts` matcher usa `/login` (não `/pelispace/login`) | Com basePath, pathname no middleware NÃO inclui o basePath |

---

## 13. DATABASES NOTION — INVENTÁRIO COMPLETO

### ✅ Migrados (15 seções → 881 registros)
| DB Notion | ID | Tabela Supabase | Registros |
|-----------|-----|----------------|----------|
| Pipeline Pelimotion | 95479a5a | pelimotion.projects | 106 |
| Cronograma | 23401aae | pelimotion.project_stages | 13 |
| Tasks Plm | 8ae038a8 | pelimotion.tasks | 116 |
| Saídas PLM | a9160e4a | pelimotion.project_expenses | 170 |
| Caixa Pelimotion | 7db0f506 | pelimotion.cash_flow | 5 |
| Entradas | 35201aae | pelimotion.income_entries | 3 |
| Produtos | d0185ee1 | pelimotion.products | 9 |
| CRM | 20d01aae | pelimotion.crm_contacts | 18 |
| Produtoras RJ | 1fc01aae | pelimotion.suppliers | 101 |
| Produtoras BH | 1fc01aae (BH) | pelimotion.suppliers | 68 |
| Produtoras SP | 1fc01aae (SP) | pelimotion.suppliers | 100 |
| Tasks Pessoal | 26201aae | personal.tasks | 68 |
| Saídas Pessoal | 35201aae (p) | personal.expenses | 11 |
| Investimento | 2e001aae | personal.investments | 36 |
| Casa | 2fe01aae | personal.home_items | 38 |
| Saúde | 2ef01aae | personal.health_log | 3 |
| Projetos Pessoais | cedb2b50 | personal.projects | 16 |

### ❌ Não migrados — Fase 11
| DB Notion | ID | Schema mapeado | Observação |
|-----------|-----|---------------|-----------|
| Workflow (×3) | 28d, 28c, 25f | pelimotion.workflow_tasks | Tabela já criada no SQL. Schema idêntico entre os 3 DBs. Campos: Tarefa, Responsável, Status, Produto, Canal, Duração, Tipo, Prioridade, Prazo, Observações. Pode ter 0 páginas (só schema). |
| Alto valor extraido perplexity | 22301aae | pelimotion.crm_contacts | Campos: fn, ln, email, phone, company, title, zip, country, st, ct — formato de lead B2B. Upsert por email no crm_contacts. |
| NomedaEmpresa (B2B) | 20401aae | NOVO: pelimotion.companies (?) | Campos: Nome da Empresa, Funcionários, Receita R$, Contato Principal, Especialidades, Website, Líder. Escopo diferente de crm_contacts — pode justificar tabela própria. |
| Pipeline Pelimotion (Principal) | 3e5c9ec2 | pelimotion.projects (upsert) | Schema mais rico: Pessoa (people), Fornecedores (multi_select), Mídias (files), fórmulas A pagar/A receber. Pode ser versão mais antiga do Pipeline migrado. Verificar duplicatas por notion_id antes de migrar. |
