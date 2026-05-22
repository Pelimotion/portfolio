'use client'

import { useMemo } from 'react'
import type { CashFlow, Project } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function daysDiff(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

const AREA_LABELS: Record<string, string> = {
  contabilidade: 'Contabilidade',
  tributo: 'Tributo',
  escritorio: 'Escritório',
  workstation: 'Workstation',
  clientes: 'Clientes',
}

const AREA_COLORS: Record<string, string> = {
  contabilidade: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  tributo: 'bg-red-500/15 text-red-400 border-red-500/30',
  escritorio: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  workstation: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  clientes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type Grupo = 'vencido' | 'hoje' | 'semana' | 'futuro' | 'sem-data'

function getGrupo(iso: string | null | undefined): Grupo {
  if (!iso) return 'sem-data'
  const diff = daysDiff(iso)
  if (diff < 0) return 'vencido'
  if (diff === 0) return 'hoje'
  if (diff <= 7) return 'semana'
  return 'futuro'
}

const GRUPO_LABELS: Record<Grupo, string> = {
  vencido: 'Vencidos',
  hoje: 'Hoje',
  semana: 'Próximos 7 dias',
  futuro: 'Futuros',
  'sem-data': 'Sem data',
}

const GRUPO_ORDER: Grupo[] = ['vencido', 'hoje', 'semana', 'futuro', 'sem-data']

const GRUPO_STYLES: Record<Grupo, string> = {
  vencido: 'text-red-400',
  hoje: 'text-yellow-400',
  semana: 'text-blue-400',
  futuro: 'text-muted-foreground',
  'sem-data': 'text-muted-foreground',
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function AreaBadge({ area }: { area: string }) {
  const color = AREA_COLORS[area] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {AREA_LABELS[area] ?? area}
    </span>
  )
}

function CashFlowItem({
  item,
  projectName,
}: {
  item: CashFlow
  projectName: string | undefined
}) {
  const diff = item.due_date ? daysDiff(item.due_date) : null

  const diffLabel =
    diff === null
      ? null
      : diff < 0
      ? `${Math.abs(diff)}d atrás`
      : diff === 0
      ? 'hoje'
      : `em ${diff}d`

  return (
    <div className="flex items-start gap-3 p-3 rounded-md border bg-card">
      {/* Indicador de urgência */}
      <div
        className={`w-1 self-stretch rounded-full shrink-0 ${
          diff === null
            ? 'bg-zinc-600'
            : diff < 0
            ? 'bg-red-500'
            : diff === 0
            ? 'bg-yellow-400'
            : diff <= 7
            ? 'bg-blue-500'
            : 'bg-zinc-600'
        }`}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {item.areas?.map((a) => <AreaBadge key={a} area={a} />)}
          {projectName && (
            <span className="text-xs text-muted-foreground">· {projectName}</span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm text-muted-foreground">{fmtDate(item.due_date)}</p>
        {diffLabel && (
          <p
            className={`text-xs mt-0.5 ${
              diff !== null && diff < 0
                ? 'text-red-400'
                : diff === 0
                ? 'text-yellow-400'
                : 'text-muted-foreground'
            }`}
          >
            {diffLabel}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FinanceiroCaixa({
  cashFlow,
  projects,
}: {
  cashFlow: CashFlow[]
  projects: Project[]
}) {
  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  )

  const grupos = useMemo(() => {
    const map: Record<Grupo, CashFlow[]> = {
      vencido: [],
      hoje: [],
      semana: [],
      futuro: [],
      'sem-data': [],
    }

    const sorted = [...cashFlow].sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })

    for (const item of sorted) {
      map[getGrupo(item.due_date)].push(item)
    }

    return map
  }, [cashFlow])

  const hasItems = cashFlow.length > 0

  if (!hasItems) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhum vencimento cadastrado.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {GRUPO_ORDER.map((grupo) => {
        const items = grupos[grupo]
        if (items.length === 0) return null
        return (
          <div key={grupo}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${GRUPO_STYLES[grupo]}`}>
              {GRUPO_LABELS[grupo]} ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <CashFlowItem
                  key={item.id}
                  item={item}
                  projectName={item.project_id ? projectMap[item.project_id] : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
