import React, { useState } from 'react';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { useUIStore } from '../../stores/useUIStore';
import { LayoutDashboard, Plus, Search } from 'lucide-react';
import { ROOT_HUB_ID } from '../../core/schemas';
import { ensureRootHub } from '../../core/databaseFactory';

// ============================================
// DASHBOARD — Projects Hub Universal
// Renderiza o database raiz de projetos
// ============================================

export default function Dashboard() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(true);

  React.useEffect(() => {
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
        <div className="animate-pulse text-muted-foreground">Inicializando Workspace...</div>
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
          {/* Search */}
          <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 w-52 text-sm text-muted-foreground">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar projetos..."
              className="bg-transparent focus:outline-none w-full text-sm placeholder:text-muted-foreground/60"
            />
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
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
    </div>
  );
}
