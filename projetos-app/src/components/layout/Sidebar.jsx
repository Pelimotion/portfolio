import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Film, 
  FolderOpen, 
  Calendar, 
  Settings, 
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { user, signOut } = useAuth();
  
  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen flex flex-col shrink-0">
      {/* Workspace Header */}
      <div className="h-14 flex items-center px-4 border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
            P
          </div>
          <span className="font-semibold text-sm truncate">Pelimotion Studio</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {/* Main Navigation */}
      <div className="p-3 flex-1 overflow-y-auto space-y-6">
        
        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-md transition-colors text-left">
            <Search className="w-4 h-4" />
            <span>Search</span>
            <span className="ml-auto text-[10px] bg-secondary border border-border px-1.5 rounded text-muted-foreground font-mono">⌘K</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-md transition-colors text-left">
            <Bell className="w-4 h-4" />
            <span>Inbox</span>
          </button>
        </div>

        <div>
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center justify-between">
            <span>Views</span>
            <Plus className="w-3.5 h-3.5 hover:text-foreground cursor-pointer" />
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/" className={({isActive}) => `w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Board Principal</span>
            </NavLink>
            <NavLink to="/timeline" className={({isActive}) => `w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </NavLink>
            <NavLink to="/assets" className={({isActive}) => `w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <FolderOpen className="w-4 h-4" />
              <span>Asset Library</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center justify-between">
            <span>Projetos Ativos</span>
          </div>
          <nav className="space-y-0.5">
            {/* Mock Projects for visual representation - will be dynamic later */}
            <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="truncate flex-1">Campanha Natura</span>
              <MoreHorizontal className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="truncate flex-1">Rebranding Itaú</span>
              <MoreHorizontal className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
            </div>
          </nav>
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 mt-auto border-t border-border/50">
        <div className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0" />
            <span className="truncate text-muted-foreground group-hover:text-foreground">{user?.email?.split('@')[0]}</span>
          </div>
          <button onClick={signOut} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
