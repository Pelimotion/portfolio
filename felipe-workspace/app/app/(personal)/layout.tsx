import { SidebarProvider } from '@/components/ui/sidebar'
import { PersonalSidebar } from '@/components/personal/sidebar'
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PersonalLayout({
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

  return (
    <SidebarProvider>
      <PersonalSidebar profile={profile} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </SidebarProvider>
  )
}
