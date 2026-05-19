import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { TamagochiAvatar } from '../ui/TamagochiAvatar';
import { useNavigate } from 'react-router-dom';

export function UserMenu({ user, profile, signOut }) {
  const navigate = useNavigate();
  const displayName = profile?.display_name || profile?.nickname || user?.email?.split('@')[0];
  const accentColor = profile?.accent_color || '#3b82f6';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors cursor-pointer group border border-transparent hover:border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
            <div className="shrink-0 rounded-xl overflow-hidden border-2" style={{ borderColor: `${accentColor}66` }}>
              <TamagochiAvatar size={28} userId={user?.id} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: accentColor }}>
                {displayName}
              </p>
              {profile?.status_text ? (
                <p className="text-[10px] text-muted-foreground/50 truncate italic">{profile.status_text}</p>
              ) : (
                <p className="text-[10px] text-muted-foreground/30 truncate">{user?.email}</p>
              )}
            </div>
          </div>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={4}
          className="z-50 min-w-[180px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenu.Item
            onSelect={() => navigate('/profile')}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-[var(--surface-2)] rounded-lg cursor-pointer outline-none"
          >
            <User className="w-3.5 h-3.5 opacity-60" />
            Perfil
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground/40 rounded-lg cursor-not-allowed outline-none"
          >
            <Settings className="w-3.5 h-3.5 opacity-40" />
            Configurações
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1" />
          <DropdownMenu.Item
            onSelect={signOut}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
