'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutList, Kanban } from 'lucide-react'
import { ProjetosTable } from '@/components/pelimotion/projetos-table'
import { ProjetosKanban } from '@/components/pelimotion/projetos-kanban'
import type { Project } from '@/lib/supabase/types'

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProjetosView({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<'lista' | 'kanban'>('lista')

  // Stats
  const ativos = projects.filter((p) => p.stage !== 'concluido').length
  const totalAReceber = projects.reduce((sum, p) => sum + (p.amount_receivable ?? 0), 0)
  const totalLucro = projects.reduce((sum, p) => sum + (p.profit ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground text-sm mt-1">Pipeline Pelimotion</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projetos/calendario"
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border hover:bg-muted/30 transition-colors"
          >
            Calendário
          </Link>
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setView('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                view === 'lista'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              <LayoutList className="size-3.5" />
              Lista
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-l transition-colors ${
                view === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              <Kanban className="size-3.5" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={String(projects.length)} />
        <StatCard label="Em andamento" value={String(ativos)} />
        <StatCard label="A receber" value={fmtBRL(totalAReceber)} highlight />
        <StatCard label="Lucro total" value={fmtBRL(totalLucro)} highlight />
      </div>

      {/* View */}
      {view === 'lista' ? (
        <ProjetosTable projects={projects} />
      ) : (
        <ProjetosKanban projects={projects} />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${highlight ? 'text-emerald-400' : ''}`}>
        {value}
      </p>
    </div>
  )
}
