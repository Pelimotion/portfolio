import { createSupabaseServer } from '@/lib/supabase/server'
import { SaudeView } from './saude-view'

export default async function SaudePage() {
  const supabase = await createSupabaseServer()

  const { data: entries, error } = await supabase
    .schema('personal')
    .from('health_log')
    .select('*')
    .order('log_date', { ascending: false })

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar registros de saúde: {error.message}
      </div>
    )
  }

  return <SaudeView entries={entries ?? []} />
}
