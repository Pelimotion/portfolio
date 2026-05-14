import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Board } from './components/Board';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { Settings2, Filter, Plus } from 'lucide-react';

export default function Dashboard() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar da View */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">Board Principal</h1>
          <div className="h-4 w-[1px] bg-border mx-2" />
          {/* Breadcrumb ou contexto */}
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
            Pipeline Ativo
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary/50 rounded-md p-0.5 border border-border">
            <button className="px-3 py-1 text-xs font-medium bg-background shadow-sm rounded border border-border/50">Board</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Table</button>
          </div>

          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Settings2 className="w-4 h-4" />
            Display
          </button>

          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors ml-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>
      </header>

      {/* Área Principal Kanban */}
      <main className="flex-1 p-6 overflow-hidden">
        {/* Passa um hack prop para forçar refresh na board, o ideal é global state, mas farei via trigger depois se necessário */}
        <Board />
      </main>

      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          window.location.reload(); 
        }}
      />
      <ProjectDetailModal />
    </div>
  );
}
