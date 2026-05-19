import React, { useState, useEffect } from 'react';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AddMemberModal } from '../../components/database/AddMemberModal';
import { LayoutDashboard, Plus, UserPlus } from 'lucide-react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { useAuth } from '../../contexts/AuthContext';
import { ROOT_HUB_ID } from '../../core/schemas';
import { GenerativePattern } from '../../components/ui/GenerativePattern';
import { ensureRootHub } from '../../core/databaseFactory';

// ============================================
// DASHBOARD — Projects Hub Universal
// ============================================

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    document.title = 'Projects Hub | Pelimotion';
    async function init() {
      try {
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
            <h1 className="font-semibold text-xl tracking-tight text-foreground leading-none">Projects Hub</h1>
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider mt-1">Gerenciador de Produção</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border-subtle)]">
            <button
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-[var(--surface-3)] px-3 py-1.5 rounded-lg transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Equipe
            </button>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Novo Projeto
          </button>
        </div>
      </header>

      {/* ── Summary Overview ── */}
      <DashboardOverview />

      {/* ── Database Content ── */}
      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <DatabaseRenderer databaseId={ROOT_HUB_ID} defaultView="kanban" addButtonLabel={null} />
      </main>

      <CreateProjectModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}
