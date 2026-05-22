import { createSupabaseServer } from '@/lib/supabase/server'
import { TasksView } from './tasks-view'

export default async function TasksPage() {
  const supabase = await createSupabaseServer()

  const { data: tasks, error } = await supabase
    .schema('personal')
    .from('tasks')
    .select('*')
    .order('is_done', { ascending: true })
    .order('task_date', { ascending: true })

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
        Erro ao carregar tarefas: {error.message}
      </div>
    )
  }

  return <TasksView tasks={tasks ?? []} />
}
