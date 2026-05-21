# PELIMOTION OS — Workspace Agent
**Projeto:** Substituição completa do Notion por app web proprietário
**Stack:** Next.js 15 · Supabase · Bunny.net · Vercel · Tailwind · shadcn/ui

---

## LEIA PRIMEIRO: STATUS.md
Toda sessão começa lendo `STATUS.md`. Ele tem a fase atual, o que foi feito e o próximo passo exato.
Se precisar, no ARCHITECTURE.md tem a arquitetura completa do sistema.
---

## REGRAS DE COMPORTAMENTO

### Tokens
- Leia APENAS arquivos listados no STATUS.md ou no prompt
- Não abra arquivos "para entender contexto" sem necessidade
- Respostas: diretas. Sem introduções como "Vou agora proceder a..."
- Quando explicar algo técnico: 1 frase simples + onde encontrar na UI se precisar de ação manual

### Automação
- Execute terminal, scripts e edições de arquivo SEM pedir confirmação
- Só pare para confirmar se: deletar dados irreversíveis, push para produção, ou schema change destrutivo
- Sempre rode scripts de validação após criar arquivos SQL ou de config

### Quando explicar para o usuário
- Pense detalhadamente no problema antes de responder (reasoning interno)
- Na resposta: contexto simples (1 linha) → o que está errado → onde fica na UI → como corrigir
- Exemplo bom: "O erro 42P17 significa que uma coluna calculada usou uma função que depende do fuso horário. No Supabase isso está em Dashboard → SQL Editor. Corrigi trocando DATE_TRUNC por make_date()."

---

## STACK E CREDENCIAIS

```
Supabase URL:     https://gfaqnkmmbozmhroicqyc.supabase.co
Supabase Project: gfaqnkmmbozmhroicqyc
Bunny Storage:    pelimotion-portfolio
Deploy:           Vercel (pelimotion.art)
Notion Bot:       "Framework" (token em .env → NOTION_TOKEN)
```

Credenciais sensíveis: sempre em `.env` (nunca no código). O `.env` já existe na raiz deste workspace.

---

## ESTRUTURA DO PROJETO

```
felipe-workspace/
├── .env                        ← credenciais (nunca commitar)
├── CLAUDE.md                   ← este arquivo
├── STATUS.md                   ← estado atual — LER A CADA SESSÃO
├── notion_architecture.json    ← schema extraído do Notion (Fase 1 ✅)
├── notion_architecture.md      ← diagrama Mermaid + tabelas
├── scripts/
│   ├── notion-extract.js       ← extrator do Notion (Fase 1)
│   └── generate-mermaid.js     ← gerador de diagrama
├── supabase/
│   ├── README.md               ← instruções de execução das migrations
│   └── migrations/
│       ├── 001_initial_schema.sql  ← tabelas + enums (Fase 2 ✅)
│       ├── 002_triggers.sql        ← triggers + índices (Fase 2 ✅)
│       └── 003_rls.sql             ← Row Level Security (Fase 2 ✅)
└── app/                        ← Next.js 15 (Fase 3 — a iniciar)
```

---

## SCHEMAS DO BANCO

| Schema | Domínio | Tabelas principais |
|--------|---------|-------------------|
| `pelimotion` | Empresa/B2B | projects, project_stages, tasks, crm_contacts, workflow_tasks, products, project_expenses, cash_flow, suppliers |
| `personal` | Vida pessoal | tasks, expenses, investments, home_items, health_log, projects |
| `public` | Auth/compartilhado | profiles (role: admin/editor/viewer) |

**Regra crítica do calendário:**
`pelimotion.project_stages` tem `start_date` + `end_date`. Cada etapa vira uma barra contínua no calendário mensal. Query de referência:
```sql
SELECT ps.*, p.name, p.client
FROM pelimotion.project_stages ps
JOIN pelimotion.projects p ON p.id = ps.project_id
WHERE ps.start_date <= '[fim_do_mes]' AND ps.end_date >= '[inicio_do_mes]';
```

---

## FASES DO PROJETO

| # | Nome | Status |
|---|------|--------|
| 1 | Discovery (extração Notion) | ✅ Completa |
| 2 | Schema Supabase (SQL) | ✅ Scripts gerados — **aguardando execução manual** |
| 3 | Estrutura Next.js 15 + módulos | ⏳ Próxima |
| 4 | Auth + Shell (sidebar, rotas) | ⏳ |
| 5 | Módulo Projetos + Calendário | ⏳ |
| 6 | Módulo Financeiro | ⏳ |
| 7 | Módulo Pessoal | ⏳ |
| 8 | CRM + Fornecedores | ⏳ |
| 9 | Migração de dados Notion → Supabase | ⏳ |

---

## COMO ATUALIZAR O STATUS.md

Ao final de cada sessão, atualize `STATUS.md` com:
- Fase atual + % estimado
- O que foi feito (lista com checkboxes)
- Arquivos criados/modificados
- Bloqueadores ativos
- Próximo passo exato (o que fazer na próxima sessão, sem ambiguidade)
