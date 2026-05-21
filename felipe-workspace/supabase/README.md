# Supabase — Instruções de Migração

## Ordem de execução

Rodar **em sequência** no Supabase SQL Editor:
`Dashboard → SQL Editor → New query → colar → Run`

| Arquivo | O que faz |
|---------|-----------|
| `001_initial_schema.sql` | Cria schemas, enums, todas as tabelas |
| `002_triggers.sql` | `updated_at` automático, índices, validações |
| `003_rls.sql` | Row Level Security por role (admin/editor/viewer) |

## Schemas criados

| Schema | Domínio | Tabelas |
|--------|---------|---------|
| `pelimotion` | Empresa/B2B | projects, project_stages, tasks, crm_contacts, workflow_tasks, products, project_expenses, cash_flow, income_entries, suppliers |
| `personal` | Vida pessoal | tasks, expenses, investments, home_items, health_log, projects |
| `public` | Compartilhado | profiles (auth) |

## Como desfazer (rollback)

```sql
DROP SCHEMA pelimotion CASCADE;
DROP SCHEMA personal CASCADE;
-- Roles e tipos em public:
DROP TYPE IF EXISTS public.task_status_enum CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role();
DROP FUNCTION IF EXISTS public.set_updated_at();
```

## Regra crítica do calendário

A tabela `pelimotion.project_stages` tem `start_date` + `end_date`.
Cada etapa de projeto é renderizada como **barra contínua** no calendário mensal.
O campo `delivery_date` é opcional e representa uma data pontual de entrega.

Query para buscar etapas de um mês:
```sql
SELECT ps.*, p.name AS project_name, p.client
FROM pelimotion.project_stages ps
JOIN pelimotion.projects p ON p.id = ps.project_id
WHERE ps.start_date <= '2026-05-31'
  AND ps.end_date   >= '2026-05-01'
ORDER BY ps.start_date, p.name;
```
