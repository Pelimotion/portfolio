import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca o role do usuário para redirecionar ao módulo correto
  const { data: profile } = await supabase
    .schema('public')
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Admin e editor vão para Pelimotion, viewer vai para Personal
  if (profile?.role === 'viewer') {
    redirect('/tasks')
  }

  redirect('/projetos')
}
