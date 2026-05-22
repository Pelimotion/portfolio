import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProjetoTabs } from './projeto-tabs'

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  negociacao: 'Negociação', briefing: 'Briefing', debriefing: 'Debriefing',
  roteiro: 'Roteiro', storyboard: 'Storyboard', montagem: 'Montagem',
  criacao: 'Criação', animacao: 'Animação', aprovacao_1: 'Aprovação',
  alteracao: 'Alteração', finalizacao: 'Finalização', espera: 'Espera',
  concluido: 'Concluído', fixo: 'Fixo', pagamento: 'Pagamento',
}

const STAGE_COLORS: Record<string, string> = {
  negociacao: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  briefing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  debriefing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  roteiro: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  storyboard: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  montagem: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  criacao: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  animacao: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  aprovacao_1: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  alteracao: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  finalizacao: 'bg-green-500/15 text-green-400 border-green-500/30',
  espera: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  concluido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  fixo: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  pagamento: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
}

function fmtBRL(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const [
    { data: project, error: errProject },
    { data: stages, error: errStages },
    { data: tasks, error: errTasks },
    { data: expenses, error: errExpenses },
  ] = await Promise.all([
    supabase.schema('pelimotion').from('projects').select('*').eq('id', id).single(),
    supabase.schema('pelimotion').from('project_stages').select('*').eq('project_id', id).order('sort_order'),
    supabase.schema('pelimotion').from('tasks').select('*').eq('project_id', id).order('task_date'),
    supabase.schema('pelimotion').from('project_expenses').select('*').eq('project_id', id).order('expense_date'),
  ])

  if (errProject || !project) return notFound()

  const stageColor = STAGE_COLORS[project.stage] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Link
          href="/projetos"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Projetos
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold flex-1">{project.name}</h1>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${stageColor}`}
          >
            {STAGE_LABELS[project.stage] ?? project.stage}
          </span>
        </div>
        {project.client && (
          <p className="text-muted-foreground">{project.client}</p>
        )}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinCard label="Valor Total" value={fmtBRL(project.total_value)} />
        <FinCard label="Lucro" value={fmtBRL(project.profit)} highlight />
        <FinCard label="A Receber" value={fmtBRL(project.amount_receivable)} />
        <FinCard label="A Pagar" value={fmtBRL(project.amount_payable)} />
      </div>

      {/* Dates */}
      <div className="flex gap-6 text-sm flex-wrap">
        <div>
          <span className="text-muted-foreground">Próxima entrega: </span>
          <span>{fmtDate(project.next_delivery_at)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Próximo pgto: </span>
          <span>{fmtDate(project.next_payment_at)}</span>
        </div>
        {project.closed_at && (
          <div>
            <span className="text-muted-foreground">Fechado em: </span>
            <span>{fmtDate(project.closed_at)}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Entregue: </span>
          <span className={project.is_delivered ? 'text-emerald-400' : 'text-muted-foreground'}>
            {project.is_delivered ? 'Sim' : 'Não'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Pago: </span>
          <span className={project.is_paid ? 'text-emerald-400' : 'text-muted-foreground'}>
            {project.is_paid ? 'Sim' : 'Não'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      {(errStages ?? errTasks ?? errExpenses) ? (
        <p className="text-sm text-red-400">Erro ao carregar detalhes do projeto.</p>
      ) : (
        <ProjetoTabs
          stages={stages ?? []}
          tasks={tasks ?? []}
          expenses={expenses ?? []}
        />
      )}
    </div>
  )
}

function FinCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-semibold mt-1 ${highlight ? 'text-emerald-400' : ''}`}>
        {value}
      </p>
    </div>
  )
}
