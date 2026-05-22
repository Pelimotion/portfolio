import { createSupabaseServer } from '@/lib/supabase/server'
import { StageCalendar } from '@/components/pelimotion/stage-calendar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CalendarioPage() {
  const supabase = await createSupabaseServer()

  // Fetch projects + stages (all active — calendar component filters by month client-side)
  const [{ data: projects, error: errProjects }, { data: stages, error: errStages }] =
    await Promise.all([
      supabase
        .schema('pelimotion')
        .from('projects')
        .select('*')
        .neq('stage', 'concluido')
        .order('name'),
      supabase
        .schema('pelimotion')
        .from('project_stages')
        .select('*, projects!inner(name, client)')
        .order('start_date'),
    ])

  const error = errProjects ?? errStages
  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar dados: {error.message}
      </div>
    )
  }

  // Flatten join — Supabase retorna projects como objeto aninhado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatStages = (stages ?? []).map((s: any) => ({
    ...s,
    project_name: s.projects?.name ?? '',
    project_client: s.projects?.client ?? null,
    projects: undefined,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projetos"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Calendário de Etapas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Barras contínuas por etapa de projeto
          </p>
        </div>
      </div>

      <StageCalendar stages={flatStages} projects={projects ?? []} />
    </div>
  )
}
