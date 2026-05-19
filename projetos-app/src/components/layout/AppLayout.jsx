import React from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { CommandPalette } from '../ui/CommandPalette';
import { SmartSearchModal } from '../search/SmartSearchModal';
import { DocSearchModal } from '../search/DocSearchModal';

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
      <CommandPalette />
      <SmartSearchModal />
      <DocSearchModal />
    </div>
  );
}
