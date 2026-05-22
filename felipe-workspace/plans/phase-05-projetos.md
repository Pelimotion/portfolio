# Plano — Fase 5: Módulo Projetos + Calendário
**Status:** ✅ CONCLUÍDA | **Data:** 2026-05-21

---

## Entregáveis

| Entregável | Arquivo | Status |
|-----------|---------|--------|
| Lista de projetos (TanStack Table) | `projetos/page.tsx` + `components/projetos-table.tsx` | ✅ |
| Kanban por stage (toggle) | `components/projetos-kanban.tsx` | ✅ |
| Calendário de etapas (Gantt CSS) | `projetos/calendario/page.tsx` + `components/stage-calendar.tsx` | ✅ |
| Página individual (tabs) | `projetos/[id]/page.tsx` + `projeto-tabs.tsx` | ✅ |
| Rewrite /workspace → pelispace.vercel.app | `Portfolio/vercel.json` | ✅ |

---

## Arquivos criados

```
app/components/pelimotion/
  projetos-table.tsx      ← TanStack Table com filtros stage/cliente + sort
  projetos-kanban.tsx     ← Kanban em 5 colunas lógicas
  stage-calendar.tsx      ← Grid CSS customizado, 1 linha/projeto, barras por etapa

app/app/(pelimotion)/projetos/
  page.tsx                ← Server: fetch projetos → ProjetosView
  projetos-view.tsx       ← Client: stats + toggle lista/kanban
  calendario/page.tsx     ← Server: fetch projects + stages → StageCalendar
  [id]/page.tsx           ← Server: fetch projeto + etapas + tarefas + despesas
  [id]/projeto-tabs.tsx   ← Client: tabs Etapas | Tarefas | Despesas
```

---

## Decisões técnicas

- **Calendário customizado (CSS Grid)** — `@fullcalendar/resource-timeline` é premium (não instalado).
  CSS Grid puro: controle total, sem licença, mesma experiência visual.
- **StageCalendar é client component** — navegação por mês precisa de estado local.
  Dados são carregados no server e passados como props (todos os projetos ativos, todas as etapas).
  Filtragem por mês é feita no cliente.
- **ProjetosView é client component** — toggle lista/kanban precisa de estado local.
- **Kanban agrupa stages** em 5 colunas lógicas (Negociação / Produção / Revisão / Fechamento / Concluído).
  Mostra todos os projetos, independente de terem etapas.

---

## Próximo passo

Fase 6 — Módulo Financeiro:
- Dashboard: receita total, custo, lucro, a receber, a pagar
- Gráfico mensal (Recharts) de entrada/saída
- Lista de saídas (cash_flow + project_expenses) com filtros
