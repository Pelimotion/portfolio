import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Search,
  Plus, LogOut, MoreHorizontal, Trash2,
  PanelLeftClose, PanelLeft, Sun, Moon,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePageStore } from '../../stores/usePageStore';
import { useUIStore } from '../../stores/useUIStore';
import { ROOT_HUB_ID } from '../../core/schemas';
import { TamagochiAvatar } from '../ui/TamagochiAvatar';
import { GamificationWidget } from '../ui/GamificationWidget';
import { GenerativeIcon } from '../ui/GenerativeIcon';
import { UserMenu } from './UserMenu';

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { fetchDatabaseItems, getChildren, archivePage } = usePageStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const projects = getChildren(ROOT_HUB_ID);

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('peli-sidebar-w');
    return saved ? parseInt(saved) : 240;
  });
  const isResizing = useRef(false);

  useEffect(() => {
    fetchDatabaseItems(ROOT_HUB_ID);
  }, [fetchDatabaseItems]);

  // Keyboard shortcut: Cmd+\ to toggle sidebar
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  // Resize logic
  const startResize = (e) => {
    e.preventDefault();
    isResizing.current = true;
    const onMove = (moveEvent) => {
      if (!isResizing.current) return;
      const newW = Math.max(200, Math.min(400, moveEvent.clientX));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      isResizing.current = false;
      localStorage.setItem('peli-sidebar-w', String(sidebarWidth));
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Excluir este projeto permanentemente?')) return;
    try {
      await archivePage(projectId);
    } catch (e) { console.error(e); }
  };

  // Collapsed sidebar — icon-only mode
  if (!sidebarOpen) {
    return (
      <aside className="w-12 border-r border-[var(--border-subtle)] bg-[var(--sidebar)] h-screen flex flex-col items-center py-3 shrink-0 transition-all duration-200">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-muted-foreground hover:text-foreground transition-colors mb-4" title="Expandir Sidebar">
          <PanelLeft className="w-4 h-4" />
        </button>
        <NavLink to="/" end className={({isActive}) => `p-2 rounded-lg mb-1 transition-colors ${isActive ? 'bg-[var(--surface-3)] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)]'}`} title="Projects Hub">
          <LayoutDashboard className="w-4 h-4" />
        </NavLink>

        <div className="flex-1" />

        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-muted-foreground hover:text-foreground transition-colors mb-2" title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={() => navigate('/profile')} className="mb-2 transition-transform hover:scale-110" title="Perfil">
          <TamagochiAvatar size={28} userId={user?.id} />
        </button>
        <button onClick={signOut} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Sair">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="border-r border-[var(--border-subtle)] bg-[var(--sidebar)] h-screen flex flex-col shrink-0 relative transition-all duration-200"
      style={{ width: sidebarWidth }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-20"
      />

      {/* Workspace Header */}
      <div className="h-12 flex items-center px-3 border-b border-[var(--border-subtle)] justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold text-[10px] shrink-0">
            T
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-[13px] truncate text-foreground leading-none">TOCA HUB</span>
          </div>
        </div>
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-[var(--surface-3)] text-muted-foreground/50 hover:text-foreground transition-all" title="Recolher Sidebar (⌘\\)">
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-4">

        {/* Search trigger */}
        <button 
          onClick={() => useUIStore.getState().openCommandPalette()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-muted-foreground/60 hover:bg-[var(--surface-2)] hover:text-muted-foreground rounded-md transition-all text-left group"
        >
          <Search className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70" />
          <span className="flex-1">Buscar projetos, cenas e ações</span>
          <span className="text-[9px] text-muted-foreground/30 font-mono">⌘K</span>
        </button>

        {/* Navigation */}
        <div>
          <nav className="space-y-0.5">
            <NavLink to="/" end className={({isActive}) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md transition-all ${isActive 
                ? 'bg-[var(--surface-3)] text-foreground font-semibold' 
                : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground'}`}>
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              <span>Projects Hub</span>
            </NavLink>
          </nav>
        </div>

        {/* Projects */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider flex items-center justify-between">
            <span>Projetos</span>
            <button className="p-0.5 hover:bg-[var(--surface-3)] rounded text-muted-foreground/40 hover:text-muted-foreground transition-all">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <nav className="space-y-0.5">
            {projects.slice(0, 20).map(project => (
              <div key={project.id} className="group relative flex items-center">
                <NavLink
                  to={`/project/${project.id}`}
                  className={({isActive}) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md transition-all flex-1 min-w-0 ${isActive 
                      ? 'bg-[var(--surface-3)] text-foreground font-semibold' 
                      : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground'}`}
                >
                  <GenerativeIcon slug={project.id} size={16} className="shrink-0" />
                  <span className="truncate flex-1 text-[13px]">{project.title}</span>
                </NavLink>

                {/* Project context menu */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="absolute right-1 p-1 rounded hover:bg-[var(--surface-3)] text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:!text-foreground transition-all shrink-0 z-10" onClick={e => e.stopPropagation()}>
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="start" side="right" sideOffset={4} className="z-50 min-w-[160px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-lg shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
                      <DropdownMenu.Item 
                        onSelect={() => navigate(`/project/${project.id}`)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-[var(--surface-2)] rounded cursor-pointer outline-none"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Abrir Projeto
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-0.5" />
                      <DropdownMenu.Item 
                        onSelect={() => handleDeleteProject(project.id)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer: Theme + User Identity */}
      <div className="p-2 border-t border-[var(--border-subtle)] space-y-1.5">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground rounded-md transition-all text-left">
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 opacity-60" /> : <Moon className="w-3.5 h-3.5 opacity-60" />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        {/* Gamification mini bar */}
        {profile && <GamificationWidget profile={profile} compact />}

        {/* User identity card */}
        <UserMenu user={user} profile={profile} signOut={signOut} />
      </div>
    </aside>
  );
}
