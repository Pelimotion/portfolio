import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Temporário */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
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

      {/* Área Principal (Placeholder) */}
      <main className="flex-1 p-8">
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="text-lg">O Motor Kanban está sendo construído (Fase 3)...</p>
          <p className="text-sm mt-2">Sua sessão foi autenticada com sucesso através do React Router.</p>
        </div>
      </main>
    </div>
  );
}
