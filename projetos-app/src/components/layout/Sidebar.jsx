import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Calendar, Search,
  Plus, ChevronDown, LogOut, MoreHorizontal, FileText, Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageStore } from '../../stores/usePageStore';
import { ROOT_HUB_ID } from '../../core/schemas';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { fetchDatabaseItems, getChildren } = usePageStore();
  const projects = getChildren(ROOT_HUB_ID);

  useEffect(() => {
    fetchDatabaseItems(ROOT_HUB_ID);
  }, [fetchDatabaseItems]);

  return (
    <aside className="w-60 border-r border-border bg-sidebar h-screen flex flex-col shrink-0">

      {/* Workspace Header */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border-subtle)] hover:bg-[var(--surface-3)] cursor-pointer transition-all justify-between group">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-primary/10">
            P
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm truncate text-foreground leading-none mb-0.5">Pelimotion</span>
            <span className="text-[10px] text-muted-foreground/60 font-medium truncate">Workspace Pro</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      <div className="p-2 flex-1 overflow-y-auto space-y-5">

        {/* Search */}
        <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-muted-foreground hover:bg-[var(--surface-3)] hover:text-foreground rounded-lg transition-all text-left mt-1 border border-transparent hover:border-[var(--border-subtle)] group">
          <Search className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          <span className="flex-1 font-medium">Buscar...</span>
          <span className="text-[9px] bg-[var(--surface-overlay)] text-muted-foreground/50 border border-[var(--border-subtle)] px-1.5 py-0.5 rounded font-mono font-bold tracking-tighter">⌘K</span>
        </button>

        {/* Navigation */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">Sistema</div>
          <nav className="space-y-1">
            <NavLink to="/" end className={({isActive}) =>
              `flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all border border-transparent ${isActive 
                ? 'bg-[var(--surface-3)] text-foreground font-bold border-[var(--border-subtle)] shadow-sm' 
                : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground'}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Projects Hub</span>
            </NavLink>
            <div className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg text-muted-foreground/20 cursor-not-allowed justify-between group">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Timeline</span>
              </div>
              <span className="text-[8px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-secondary/30 opacity-60">Soon</span>
            </div>
          </nav>
        </div>

        {/* Projects */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] flex items-center justify-between">
            <span>Projetos</span>
            <button className="p-1 hover:bg-[var(--surface-3)] rounded-md text-muted-foreground transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <nav className="space-y-1">
            {projects.slice(0, 15).map(project => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                className={({isActive}) =>
                  `flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all border border-transparent group ${isActive 
                    ? 'bg-[var(--surface-3)] text-foreground font-bold border-[var(--border-strong)]' 
                    : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground'}`}
              >
                {project.icon && <span className="text-sm leading-none shrink-0 filter grayscale group-hover:grayscale-0 transition-all">{project.icon}</span>}
                <span className="truncate flex-1 text-[13px] font-medium">{project.title}</span>
                <MoreHorizontal className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 hover:!opacity-100 shrink-0 transition-opacity" />
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* User Section */}
      <div className="p-2 border-t border-border/50">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-secondary/40 transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
              {user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <span className="truncate text-sm text-muted-foreground group-hover:text-foreground">{user?.email?.split('@')[0]}</span>
          </div>
          <button onClick={signOut} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
