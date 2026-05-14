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
      <div className="h-14 flex items-center px-4 border-b border-border/50 hover:bg-secondary/40 cursor-pointer transition-colors justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
            P
          </div>
          <span className="font-semibold text-sm truncate">Pelimotion</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </div>

      <div className="p-2 flex-1 overflow-y-auto space-y-5">

        {/* Search */}
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground rounded-md transition-colors text-left mt-1">
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1">Buscar</span>
          <span className="text-[10px] bg-secondary border border-border px-1.5 rounded font-mono">⌘K</span>
        </button>

        {/* Navigation */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Sistema</div>
          <nav className="space-y-0.5">
            <NavLink to="/" end className={({isActive}) =>
              `flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Projects Hub</span>
            </NavLink>
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md text-muted-foreground/40 cursor-not-allowed justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Em breve</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md text-muted-foreground/40 cursor-not-allowed justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Asset Library</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Em breve</span>
            </div>
          </nav>
        </div>

        {/* Projects */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center justify-between">
            <span>Projetos</span>
            <Plus className="w-3.5 h-3.5 hover:text-foreground cursor-pointer transition-colors" />
          </div>
          <nav className="space-y-0.5">
            {projects.slice(0, 10).map(project => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                className={({isActive}) =>
                  `flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors group ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'}`}
              >
                <span className="text-base leading-none shrink-0">{project.icon || '🎬'}</span>
                <span className="truncate flex-1 text-xs">{project.title}</span>
                <MoreHorizontal className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
              </NavLink>
            ))}
            {projects.length === 0 && (
              <p className="px-2.5 py-1.5 text-xs text-muted-foreground/50 italic">Nenhum projeto ainda</p>
            )}
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
