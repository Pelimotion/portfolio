import { SidebarProvider } from '@/components/ui/sidebar'
import { PelimotionSidebar } from '@/components/pelimotion/sidebar'
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PelimotionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .schema('public')
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Viewer não tem acesso ao módulo Pelimotion
  if (profile?.role === 'viewer') redirect('/tasks')

  return (
    <SidebarProvider>
      <PelimotionSidebar profile={profile} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </SidebarProvider>
  )
}
