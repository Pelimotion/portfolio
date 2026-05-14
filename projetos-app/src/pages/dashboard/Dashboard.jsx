import React from 'react';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0 bg-card/50">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">Projects Hub</h1>
        </div>
      </header>

      {/* Main Database Content */}
      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Usamos o ID fixo que definimos no script de migração para o Hub raiz */}
        <DatabaseRenderer databaseId="00000000-0000-0000-0000-000000000000" />
      </main>
    </div>
  );
}
