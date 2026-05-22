'use client'

import { useState, useMemo } from 'react'
import type { Database } from '@/lib/supabase/types'

type Task = Database['personal']['Tables']['tasks']['Row']
type Area = Database['personal']['Enums']['task_area_enum']

const AREAS: { value: Area | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'casa', label: 'Casa' },
  { value: 'rua', label: 'Rua' },
  { value: 'pc', label: 'PC' },
  { value: 'comprar', label: 'Comprar' },
  { value: 'compromisso', label: 'Compromisso' },
]

function fmtDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function TasksView({ tasks }: { tasks: Task[] }) {
  const [area, setArea] = useState<Area | 'todas'>('todas')
  const [showDone, setShowDone] = useState(false)

  const filtered = useMemo(() =>
    tasks.filter((t) => {
      const matchArea = area === 'todas' || t.area === area
      const matchDone = showDone || !t.is_done
      return matchArea && matchDone
    }), [tasks, area, showDone])

  const pending = tasks.filter((t) => !t.is_done).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pending} pendentes</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="rounded border-border"
          />
          Mostrar concluídas
        </label>
      </div>

      {/* Filtro de área */}
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <button
            key={a.value}
            onClick={() => setArea(a.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              area === a.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma tarefa encontrada.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 px-4 py-3 ${task.is_done ? 'opacity-50' : ''}`}
            >
              {/* Indicador done */}
              <div
                className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                  task.is_done
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-muted-foreground'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.is_done ? 'line-through' : ''}`}>
                  {task.name}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.area && (
                  <span className="rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground capitalize">
                    {task.area}
                  </span>
                )}
                {task.task_date && (
                  <span className="text-xs text-muted-foreground">
                    {fmtDate(task.task_date)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
