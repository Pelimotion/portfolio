'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project, ProjectStage } from '@/lib/supabase/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type StageWithProject = ProjectStage & { project_name: string; project_client: string | null }

// ─── Stage colors ─────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  negociacao: 'bg-blue-500/70',
  briefing: 'bg-indigo-500/70',
  debriefing: 'bg-indigo-600/70',
  roteiro: 'bg-violet-500/70',
  storyboard: 'bg-purple-500/70',
  montagem: 'bg-orange-500/70',
  criacao: 'bg-amber-500/70',
  animacao: 'bg-orange-600/70',
  aprovacao_1: 'bg-yellow-500/70',
  alteracao: 'bg-yellow-600/70',
  finalizacao: 'bg-green-500/70',
  espera: 'bg-zinc-500/70',
  concluido: 'bg-emerald-500/70',
  fixo: 'bg-teal-500/70',
  pagamento: 'bg-teal-600/70',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function toDateOnly(iso: string) {
  return iso.slice(0, 10) // 'YYYY-MM-DD'
}

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StageCalendar({
  stages,
  projects,
}: {
  stages: StageWithProject[]
  projects: Project[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const numDays = daysInMonth(year, month)
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month, numDays)

  const monthStartStr = toDateOnly(monthStart.toISOString())
  const monthEndStr = toDateOnly(monthEnd.toISOString())

  // Filter stages that overlap this month
  const visibleStages = useMemo(
    () =>
      stages.filter(
        (s) => s.start_date <= monthEndStr && s.end_date >= monthStartStr
      ),
    [stages, monthStartStr, monthEndStr]
  )

  // Group by project — keep project order stable using projects list
  const projectIds = useMemo(() => {
    const seen = new Set<string>()
    const ids: string[] = []
    projects.forEach((p) => {
      if (visibleStages.some((s) => s.project_id === p.id)) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          ids.push(p.id)
        }
      }
    })
    // Also add any project not in the projects list (edge case)
    visibleStages.forEach((s) => {
      if (!seen.has(s.project_id)) {
        seen.add(s.project_id)
        ids.push(s.project_id)
      }
    })
    return ids
  }, [visibleStages, projects])

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach((p) => map.set(p.id, p))
    return map
  }, [projects])

  const stagesByProject = useMemo(() => {
    const map = new Map<string, StageWithProject[]>()
    visibleStages.forEach((s) => {
      const arr = map.get(s.project_id) ?? []
      arr.push(s)
      map.set(s.project_id, arr)
    })
    return map
  }, [visibleStages])

  // Month navigation
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthName = new Date(year, month, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  // Today's day number (if in this month)
  const todayDay =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : null

  const days = Array.from({ length: numDays }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="text-base font-semibold capitalize min-w-[180px] text-center">
          {monthName}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div style={{ minWidth: `${numDays * 32 + 200}px` }}>
          {/* Day headers */}
          <div
            className="grid border-b bg-muted/50"
            style={{ gridTemplateColumns: `200px repeat(${numDays}, 32px)` }}
          >
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Projeto
            </div>
            {days.map((d) => (
              <div
                key={d}
                className={`py-2 text-center text-xs font-medium leading-none select-none ${
                  d === todayDay
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Project rows */}
          {projectIds.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma etapa neste mês.
            </div>
          ) : (
            projectIds.map((projectId) => {
              const project = projectMap.get(projectId)
              const projectStages = stagesByProject.get(projectId) ?? []
              const projectName = project?.name ?? projectStages[0]?.project_name ?? projectId
              const client = project?.client ?? projectStages[0]?.project_client

              return (
                <div
                  key={projectId}
                  className="grid border-b last:border-0 hover:bg-muted/10 transition-colors"
                  style={{ gridTemplateColumns: `200px repeat(${numDays}, 32px)` }}
                >
                  {/* Project label */}
                  <div className="px-3 py-2 flex flex-col justify-center min-h-[44px]">
                    <p className="text-sm font-medium truncate">{projectName}</p>
                    {client && (
                      <p className="text-xs text-muted-foreground truncate">{client}</p>
                    )}
                  </div>

                  {/* Day cells — position bars using absolute within relative container */}
                  <div
                    className="relative col-span-full"
                    style={{
                      gridColumn: `2 / ${numDays + 2}`,
                      height: '44px',
                    }}
                  >
                    {/* Today highlight */}
                    {todayDay && (
                      <div
                        className="absolute top-0 bottom-0 w-[32px] bg-primary/5 pointer-events-none"
                        style={{ left: `${(todayDay - 1) * 32}px` }}
                      />
                    )}

                    {/* Stage bars */}
                    {projectStages.map((stage) => {
                      const stageStart = new Date(stage.start_date + 'T00:00:00')
                      const stageEnd = new Date(stage.end_date + 'T00:00:00')

                      // Clamp to month
                      const clampedStart = stageStart < monthStart ? monthStart : stageStart
                      const clampedEnd = stageEnd > monthEnd ? monthEnd : stageEnd

                      const startOffset = daysBetween(monthStart, clampedStart)
                      const duration = daysBetween(clampedStart, clampedEnd) + 1

                      const color = STAGE_COLORS[stage.stage_type ?? ''] ?? 'bg-zinc-500/70'

                      return (
                        <div
                          key={stage.id}
                          title={`${stage.name} (${stage.start_date} → ${stage.end_date})`}
                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-sm ${color} ${
                            stage.is_done ? 'opacity-40' : ''
                          } flex items-center px-1.5 overflow-hidden`}
                          style={{
                            left: `${startOffset * 32 + 2}px`,
                            width: `${duration * 32 - 4}px`,
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate leading-none">
                            {stage.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary/5 border border-primary/30" />
          Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-zinc-500/40" />
          Etapa concluída (opaca)
        </span>
      </div>
    </div>
  )
}
