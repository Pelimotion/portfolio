'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  CheckSquare,
  Wallet,
  Heart,
  FolderKanban,
  LogOut,
  ArrowLeft,
  ChevronUp,
} from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import type { Profile } from '@/lib/supabase/types'

const NAV_ITEMS = [
  { label: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { label: 'Gastos', href: '/gastos', icon: Wallet },
  { label: 'Saude', href: '/saude', icon: Heart },
  { label: 'Projetos', href: '/projetos-pessoais', icon: FolderKanban },
]

export function PersonalSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/tasks" className="text-lg font-bold">
          Pessoal
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Empresa</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/projetos" />}>
                  <ArrowLeft className="size-4" />
                  <span>Pelimotion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate text-sm">
              <p className="font-medium leading-none truncate">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {profile?.email}
              </p>
            </div>
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
