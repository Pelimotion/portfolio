'use client'

import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/supabase/types'

// ─── Kanban columns (agrupamento lógico dos stages) ──────────────────────────

const KANBAN_COLUMNS = [
  {
    id: 'negociacao',
    label: 'Negociação',
    color: 'border-blue-500/50 bg-blue-500/5',
    headerColor: 'text-blue-400',
    stages: ['negociacao'],
  },
  {
    id: 'producao',
    label: 'Produção',
    color: 'border-orange-500/50 bg-orange-500/5',
    headerColor: 'text-orange-400',
    stages: ['briefing', 'debriefing', 'roteiro', 'storyboard', 'montagem', 'criacao', 'animacao'],
  },
  {
    id: 'revisao',
    label: 'Revisão',
    color: 'border-yellow-500/50 bg-yellow-500/5',
    headerColor: 'text-yellow-400',
    stages: ['aprovacao_1', 'alteracao', 'espera'],
  },
  {
    id: 'fechamento',
    label: 'Fechamento',
    color: 'border-teal-500/50 bg-teal-500/5',
    headerColor: 'text-teal-400',
    stages: ['finalizacao', 'pagamento', 'fixo'],
  },
  {
    id: 'concluido',
    label: 'Concluído',
    color: 'border-emerald-500/50 bg-emerald-500/5',
    headerColor: 'text-emerald-400',
    stages: ['concluido'],
  },
]

const STAGE_LABELS: Record<string, string> = {
  negociacao: 'Negociação',
  briefing: 'Briefing',
  debriefing: 'Debriefing',
  roteiro: 'Roteiro',
  storyboard: 'Storyboard',
  montagem: 'Montagem',
  criacao: 'Criação',
  animacao: 'Animação',
  aprovacao_1: 'Aprovação',
  alteracao: 'Alteração',
  finalizacao: 'Finalização',
  espera: 'Espera',
  concluido: 'Concluído',
  fixo: 'Fixo',
  pagamento: 'Pagamento',
}

function fmtBRL(value: number | null | undefined) {
  if (value == null) return null
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: {
  project: Project
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border bg-card p-3 shadow-sm hover:shadow-md hover:border-accent transition-all"
    >
      <p className="font-medium text-sm leading-snug">{project.name}</p>
      {project.client && (
        <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {STAGE_LABELS[project.stage] ?? project.stage}
        </span>
        {project.total_value != null && (
          <span className="text-xs font-medium">{fmtBRL(project.total_value)}</span>
        )}
      </div>
      {project.next_delivery_at && (
        <p className="text-xs text-muted-foreground mt-1">
          Entrega: {new Date(project.next_delivery_at).toLocaleDateString('pt-BR')}
        </p>
      )}
    </button>
  )
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function ProjetosKanban({ projects }: { projects: Project[] }) {
  const router = useRouter()

  const byColumn = KANBAN_COLUMNS.map((col) => ({
    ...col,
    projects: projects.filter((p) => col.stages.includes(p.stage)),
  }))

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {byColumn.map((col) => (
        <div
          key={col.id}
          className={`shrink-0 w-64 rounded-lg border ${col.color} flex flex-col`}
        >
          {/* Column header */}
          <div className="p-3 border-b border-inherit">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${col.headerColor}`}>
                {col.label}
              </span>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {col.projects.length}
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="p-2 flex flex-col gap-2 flex-1 min-h-[120px]">
            {col.projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Vazio</p>
            ) : (
              col.projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => router.push(`/projetos/${p.id}`)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
