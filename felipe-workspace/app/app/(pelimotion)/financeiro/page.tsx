import { createSupabaseServer } from '@/lib/supabase/server'
import { FinanceiroView } from './financeiro-view'

export default async function FinanceiroPage() {
  const supabase = await createSupabaseServer()

  const [
    { data: incomeEntries, error: errIncome },
    { data: projectExpenses, error: errExpenses },
    { data: cashFlow, error: errCash },
    { data: projects, error: errProjects },
  ] = await Promise.all([
    supabase.schema('pelimotion').from('income_entries').select('*').order('entry_date', { ascending: false }),
    supabase.schema('pelimotion').from('project_expenses').select('*').order('expense_date', { ascending: false }),
    supabase.schema('pelimotion').from('cash_flow').select('*').order('due_date', { ascending: true }),
    supabase.schema('pelimotion').from('projects').select('id, name'),
  ])

  const error = errIncome ?? errExpenses ?? errCash ?? errProjects
  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar dados financeiros: {error.message}
      </div>
    )
  }

  return (
    <FinanceiroView
      incomeEntries={incomeEntries ?? []}
      projectExpenses={projectExpenses ?? []}
      cashFlow={cashFlow ?? []}
      projects={projects ?? []}
    />
  )
}
