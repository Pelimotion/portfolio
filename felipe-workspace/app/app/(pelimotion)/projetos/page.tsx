import { createSupabaseServer } from '@/lib/supabase/server'
import { ProjetosView } from './projetos-view'

export default async function ProjetosPage() {
  const supabase = await createSupabaseServer()

  const { data: projects, error } = await supabase
    .schema('pelimotion')
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar projetos: {error.message}
      </div>
    )
  }

  return <ProjetosView projects={projects ?? []} />
}
