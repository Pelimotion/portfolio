import { createSupabaseServer } from '@/lib/supabase/server'
import { GastosView } from './gastos-view'

export default async function GastosPage() {
  const supabase = await createSupabaseServer()

  const { data: expenses, error } = await supabase
    .schema('personal')
    .from('expenses')
    .select('*')
    .order('competence_date', { ascending: false })
    .order('due_day', { ascending: true })

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar gastos: {error.message}
      </div>
    )
  }

  return <GastosView expenses={expenses ?? []} />
}
