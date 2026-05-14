import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Board } from './components/Board';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground h-screen overflow-hidden">
      {/* Header Temporário */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Pelimotion" className="h-6" />
          <span className="font-semibold text-lg">Projetos</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <button 
            onClick={signOut}
            className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Área Principal Kanban */}
      <main className="flex-1 p-6 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
