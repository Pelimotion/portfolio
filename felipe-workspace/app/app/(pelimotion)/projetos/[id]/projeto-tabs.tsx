'use client'

import { useState } from 'react'
import type { ProjectStage, PlmTask, ProjectExpense } from '@/lib/supabase/types'

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  negociacao: 'Negociação', briefing: 'Briefing', debriefing: 'Debriefing',
  roteiro: 'Roteiro', storyboard: 'Storyboard', montagem: 'Montagem',
  criacao: 'Criação', animacao: 'Animação', aprovacao_1: 'Aprovação',
  alteracao: 'Alteração', finalizacao: 'Finalização', espera: 'Espera',
  concluido: 'Concluído', fixo: 'Fixo', pagamento: 'Pagamento',
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function fmtBRL(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function EtapasTab({ stages }: { stages: ProjectStage[] }) {
  if (stages.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma etapa cadastrada.</p>
  }

  return (
    <div className="space-y-2">
      {stages
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => (
          <div
            key={s.id}
            className={`flex items-start gap-3 p-3 rounded-md border ${
              s.is_done ? 'opacity-60 bg-muted/20' : 'bg-card'
            }`}
          >
            <div
              className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${
                s.is_done
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-muted-foreground'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${s.is_done ? 'line-through' : ''}`}>
                  {s.name}
                </span>
                {s.stage_type && (
                  <span className="text-xs text-muted-foreground">
                    ({STAGE_LABELS[s.stage_type] ?? s.stage_type})
                  </span>
                )}
              </div>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                <span>{fmtDate(s.start_date)} → {fmtDate(s.end_date)}</span>
                {s.delivery_date && <span>Entrega: {fmtDate(s.delivery_date)}</span>}
                {s.estimate_days && <span>{s.estimate_days} dias estimados</span>}
              </div>
              {s.description_for_client && (
                <p className="text-xs text-muted-foreground mt-1">{s.description_for_client}</p>
              )}
            </div>
          </div>
        ))}
    </div>
  )
}

const TASK_STATUS_LABELS: Record<string, string> = {
  nao_iniciada: 'Não iniciada',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

function TarefasTab({ tasks }: { tasks: PlmTask[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada.</p>
  }

  const byStatus = {
    em_andamento: tasks.filter((t) => t.status === 'em_andamento'),
    nao_iniciada: tasks.filter((t) => t.status === 'nao_iniciada'),
    concluido: tasks.filter((t) => t.status === 'concluido'),
  }

  return (
    <div className="space-y-4">
      {(['em_andamento', 'nao_iniciada', 'concluido'] as const).map((status) => {
        const group = byStatus[status]
        if (group.length === 0) return null
        return (
          <div key={status}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {TASK_STATUS_LABELS[status]} ({group.length})
            </h4>
            <div className="space-y-1">
              {group.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.is_done
                        ? 'bg-emerald-500'
                        : t.status === 'em_andamento'
                        ? 'bg-orange-400'
                        : 'bg-muted-foreground/40'
                    }`}
                  />
                  <span className={t.is_done ? 'line-through text-muted-foreground' : ''}>
                    {t.name}
                  </span>
                  {t.area && (
                    <span className="ml-auto text-xs text-muted-foreground">{t.area}</span>
                  )}
                  {t.task_date && (
                    <span className="text-xs text-muted-foreground">{fmtDate(t.task_date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DespesasTab({ expenses }: { expenses: ProjectExpense[] }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma despesa cadastrada.</p>
  }

  const total = expenses.reduce((sum, e) => sum + e.value, 0)
  const paid = expenses.reduce((sum, e) => sum + (e.is_paid ? e.value : 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold mt-0.5">{fmtBRL(total)}</p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <p className="text-xs text-muted-foreground">Pago</p>
          <p className="text-sm font-semibold mt-0.5 text-emerald-400">{fmtBRL(paid)}</p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <p className="text-xs text-muted-foreground">A pagar</p>
          <p className="text-sm font-semibold mt-0.5 text-yellow-400">{fmtBRL(total - paid)}</p>
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Fornecedor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Data</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Pago</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-3 py-2">{e.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{e.supplier ?? '—'}</td>
                <td className="px-3 py-2 text-muted-foreground">{fmtDate(e.expense_date)}</td>
                <td className="px-3 py-2 text-right font-medium">{fmtBRL(e.value)}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-flex w-2 h-2 rounded-full ${
                      e.is_paid ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'etapas' | 'tarefas' | 'despesas'

export function ProjetoTabs({
  stages,
  tasks,
  expenses,
}: {
  stages: ProjectStage[]
  tasks: PlmTask[]
  expenses: ProjectExpense[]
}) {
  const [tab, setTab] = useState<Tab>('etapas')

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'etapas', label: 'Etapas', count: stages.length },
    { id: 'tarefas', label: 'Tarefas', count: tasks.length },
    { id: 'despesas', label: 'Despesas', count: expenses.length },
  ]

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'etapas' && <EtapasTab stages={stages} />}
      {tab === 'tarefas' && <TarefasTab tasks={tasks} />}
      {tab === 'despesas' && <DespesasTab expenses={expenses} />}
    </div>
  )
}
