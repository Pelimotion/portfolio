import { createSupabaseServer } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Project = Database['personal']['Tables']['projects']['Row']

const STATUS_STYLE: Record<string, string> = {
  planejando: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  executando: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pausado: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  arquivado: 'bg-muted/40 text-muted-foreground border-border',
}

function fmtBRL(v: number | null) {
  if (!v) return null
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  })
}

export default async function ProjetosPessoaisPage() {
  const supabase = await createSupabaseServer()

  const { data: projects, error } = await supabase
    .schema('personal')
    .from('projects')
    .select('*')
    .order('project_date', { ascending: false })

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar projetos: {error.message}
      </div>
    )
  }

  const ativos = (projects ?? []).filter((p) => p.status !== 'arquivado')
  const arquivados = (projects ?? []).filter((p) => p.status === 'arquivado')

  function ProjectRow({ p }: { p: Project }) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{p.name}</p>
          {p.project_date && (
            <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(p.project_date)}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {fmtBRL(p.total_value) && (
            <span className="text-sm text-muted-foreground">{fmtBRL(p.total_value)}</span>
          )}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
              STATUS_STYLE[p.status] ?? ''
            }`}
          >
            {p.status}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projetos Pessoais</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{ativos.length} ativos</p>
      </div>

      {ativos.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          {ativos.map((p) => <ProjectRow key={p.id} p={p} />)}
        </div>
      )}

      {arquivados.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Arquivados ({arquivados.length})
          </h2>
          <div className="rounded-lg border overflow-hidden opacity-60">
            {arquivados.map((p) => <ProjectRow key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {(projects ?? []).length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum projeto encontrado.
        </p>
      )}
    </div>
  )
}
