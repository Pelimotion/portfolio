import React, { useState, useEffect } from 'react';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AddMemberModal } from '../../components/database/AddMemberModal';
import { LayoutDashboard, Plus, Search, UserPlus } from 'lucide-react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { useAuth } from '../../contexts/AuthContext';
import { ROOT_HUB_ID } from '../../core/schemas';
import { GenerativePattern } from '../../components/ui/GenerativePattern';
import { TamagochiAvatar } from '../../components/ui/TamagochiAvatar';
import { hashString } from '../../lib/avatarEngine';
import { useNavigate } from 'react-router-dom';

// ============================================
// DASHBOARD — Projects Hub Universal
// ============================================

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    document.title = 'Projects Hub | Pelimotion';
    async function init() {
      try {
        const { ensureRootHub } = await import('../../core/databaseFactory');
        await ensureRootHub();
      } catch (e) {
        console.error('Falha ao inicializar Hub:', e);
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  if (initializing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-xs uppercase tracking-widest">Inicializando Workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface-0)] relative">
      {/* ── Topbar ── */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--surface-1)] relative overflow-hidden">
        {/* Decorative Art Pattern for Hub */}
        <GenerativePattern 
          slug="dashboard-hub" 
          className="absolute inset-0"
          opacity={0.1}
        />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl tracking-tight text-foreground leading-none">Projects Hub</h1>
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider mt-1">Gerenciador de Produção</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border-subtle)]">
            <button
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-[var(--surface-3)] px-3 py-1.5 rounded-lg transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Equipe
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 w-64 text-sm text-muted-foreground focus-within:border-primary/30 focus-within:bg-[var(--surface-3)] transition-all">
            <Search className="w-4 h-4 shrink-0 opacity-40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar projetos..."
              className="bg-transparent focus:outline-none w-full text-[13px] font-medium placeholder:text-muted-foreground/30"
            />
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Novo Projeto
          </button>
          
          <div className="w-px h-8 bg-border/50 mx-2" />
          
          <button onClick={() => navigate('/profile')} className="transition-transform hover:scale-110 shrink-0">
            <TamagochiAvatar size={36} userId={user?.id} />
          </button>
        </div>
      </header>

      {/* ── Summary Overview ── */}
      <DashboardOverview />

      {/* ── Database Content ── */}
      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <DatabaseRenderer databaseId={ROOT_HUB_ID} defaultView="kanban" addButtonLabel="Novo Projeto" />
      </main>

      <CreateProjectModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}
