# Fase 6 — Módulo Financeiro

**Status:** Em execução
**Data de início:** 2026-05-21

---

## Objetivo

Dashboard financeiro completo do ecossistema Pelimotion, com dados reais do Supabase.

---

## Fontes de dados

| Tabela | Schema | O que representa |
|--------|--------|-----------------|
| `income_entries` | pelimotion | Entradas de receita (pagamentos recebidos) |
| `project_expenses` | pelimotion | Despesas por projeto (freelancers, assets, etc.) |
| `cash_flow` | pelimotion | Vencimentos futuros a pagar (contas da empresa) |

### Campos relevantes
- `income_entries`: `value`, `entry_date`, `name`, `project_id`
- `project_expenses`: `value`, `expense_date`, `is_paid`, `name`, `supplier`, `project_id`
- `cash_flow`: `name`, `areas`, `due_date`, `project_id` (sem valor monetário — é timeline de vencimentos)

---

## Componentes criados

### `components/pelimotion/financeiro-dashboard.tsx` (client)
- Cards: Receita total, Custo total, Lucro, A pagar (despesas não pagas)
- Gráfico Recharts: BarChart comparando entradas vs saídas por mês (últimos 6 meses)

### `components/pelimotion/financeiro-saidas.tsx` (client)
- Lista de `project_expenses` com filtros: pago/não pago, busca por nome
- Colunas: nome, valor, data, fornecedor, projeto, status pago

### `components/pelimotion/financeiro-caixa.tsx` (client)
- Timeline de `cash_flow` ordenada por `due_date`
- Agrupa: vencidos, hoje, próximos 7 dias, futuros
- Badge por área (`areas` enum)

### `app/(pelimotion)/financeiro/page.tsx` (server)
- Fetch paralelo dos 3 datasets
- Monta layout com tabs: Dashboard | Saídas | Caixa

---

## Decisões técnicas

- **Sem valor em cash_flow:** A tabela não tem campo `value` — usada apenas como agenda de vencimentos, não soma financeira
- **Gráfico mensal:** Agrupamento por mês feito no cliente (não SQL) para simplificar
- **Filtros:** Todos client-side com `useState` (volume baixo de dados)
- **fmtBRL:** Reutilizado igual ao padrão de projetos-view.tsx

---

## Arquivos modificados

- Criados: `plans/phase-06-financeiro.md`, `components/pelimotion/financeiro-dashboard.tsx`, `components/pelimotion/financeiro-saidas.tsx`, `components/pelimotion/financeiro-caixa.tsx`
- Modificados: `app/(pelimotion)/financeiro/page.tsx`, `STATUS.md`
