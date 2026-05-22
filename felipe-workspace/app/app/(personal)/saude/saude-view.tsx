'use client'

import { useState, useMemo } from 'react'
import type { Database } from '@/lib/supabase/types'

type HealthLog = Database['personal']['Tables']['health_log']['Row']
type EntryType = Database['personal']['Enums']['health_type_enum']
type Sphere = Database['personal']['Enums']['health_sphere_enum']

const STATUS_STYLE: Record<string, string> = {
  investigando: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  em_tratamento: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  pendente: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  concluido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  acompanhando: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const TYPE_LABEL: Record<EntryType, string> = {
  diario: 'Diário',
  condicao: 'Condição',
  medico: 'Médico',
  tarefa: 'Tarefa',
}

const SPHERE_LABEL: Record<Sphere, string> = {
  corpo: 'Corpo',
  mente: 'Mente',
  geral: 'Geral',
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function SaudeView({ entries }: { entries: HealthLog[] }) {
  const [filterType, setFilterType] = useState<EntryType | 'todos'>('todos')
  const [filterSphere, setFilterSphere] = useState<Sphere | 'todos'>('todos')

  const filtered = useMemo(() =>
    entries.filter((e) => {
      const matchType = filterType === 'todos' || e.entry_type === filterType
      const matchSphere = filterSphere === 'todos' || e.sphere === filterSphere
      return matchType && matchSphere
    }), [entries, filterType, filterSphere])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Saúde</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{entries.length} registros</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {/* Tipo */}
        <div className="flex rounded-md border overflow-hidden text-sm">
          {(['todos', 'diario', 'condicao', 'medico', 'tarefa'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 capitalize transition-colors border-l first:border-l-0 ${
                filterType === t
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              {t === 'todos' ? 'Todos' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Esfera */}
        <div className="flex rounded-md border overflow-hidden text-sm">
          {(['todos', 'corpo', 'mente', 'geral'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSphere(s)}
              className={`px-3 py-1.5 capitalize transition-colors border-l first:border-l-0 ${
                filterSphere === s
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              {s === 'todos' ? 'Todas' : SPHERE_LABEL[s]}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} registros
        </span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{entry.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fmtDate(entry.log_date)} · {SPHERE_LABEL[entry.sphere]}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className="rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                    {TYPE_LABEL[entry.entry_type]}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLE[entry.status] ?? ''
                    }`}
                  >
                    {entry.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed">{entry.notes}</p>
              )}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded bg-muted/30 px-1.5 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
