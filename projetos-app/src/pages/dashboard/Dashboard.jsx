import React, { useState, useEffect } from 'react';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AddMemberModal } from '../../components/database/AddMemberModal';
import { LayoutDashboard, Plus, Search, Sparkles, UserPlus } from 'lucide-react';
import { ROOT_HUB_ID } from '../../core/schemas';
import { ensureRootHub } from '../../core/databaseFactory';
import { generateMockData } from '../../scripts/mockData';

// ============================================
// DASHBOARD — Projects Hub Universal
// ============================================

export default function Dashboard() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [isMocking, setIsMocking] = useState(false);

  useEffect(() => {
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

  const handleMock = async () => {
    setIsMocking(true);
    await generateMockData();
    setIsMocking(false);
  };

  if (initializing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-xs uppercase tracking-widest">Inicializando Workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">

      {/* ── Topbar ── */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-base">Projects Hub</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Member */}
          <button
            onClick={() => setAddMemberOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-3 py-2 rounded-xl transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Membros
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Mock Button */}
          <button
            onClick={handleMock}
            disabled={isMocking}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 px-3 py-2 rounded-xl transition-colors border border-purple-500/20 disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" />
            {isMocking ? 'Gerando...' : 'Mock'}
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 w-52 text-sm text-muted-foreground">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar projetos..."
              className="bg-transparent focus:outline-none w-full text-xs placeholder:text-muted-foreground/60"
            />
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 px-5 py-2 rounded-xl transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>
      </header>

      {/* ── Database Content ── */}
      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <DatabaseRenderer databaseId={ROOT_HUB_ID} defaultView="kanban" />
      </main>

      <CreateProjectModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}
