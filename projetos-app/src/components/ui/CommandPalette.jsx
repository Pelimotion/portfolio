import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, FileText, FolderOpen, Hash } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { supabase } from '../../lib/supabase';
import { cn } from '@/lib/utils';

// ============================================
// COMMAND PALETTE — Global Search (⌘K)
// Powered by cmdk + Radix Dialog
// ============================================

const ICON = { project: FolderOpen, item: Hash, page: FileText };

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState([]);
  const navigate = useNavigate();

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        commandPaletteOpen
          ? closeCommandPalette()
          : useUIStore.getState().openCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, closeCommandPalette]);

  // Reset when closed
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setProjects([]);
      setItems([]);
      setPages([]);
    }
  }, [commandPaletteOpen]);

  // Debounced Supabase search
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setProjects([]);
      setItems([]);
      setPages([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pages')
        .select('id, title, icon, page_type, parent_id')
        .eq('is_archived', false)
        .ilike('title', `%${q}%`)
        .limit(20);

      const all = data || [];
      setProjects(all.filter(p => p.page_type === 'database' && p.parent_id === null));
      setItems(all.filter(p => p.page_type === 'database_item'));
      setPages(all.filter(p => p.page_type === 'page'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = useCallback((item) => {
    closeCommandPalette();
    navigate(item.page_type === 'database' ? `/project/${item.id}` : `/page/${item.id}`);
  }, [closeCommandPalette, navigate]);

  const hasResults = projects.length > 0 || items.length > 0 || pages.length > 0;

  return (
    <Dialog.Root open={commandPaletteOpen} onOpenChange={(open) => !open && closeCommandPalette()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />

        {/* Panel */}
        <Dialog.Content
          aria-label="Command palette"
          className={cn(
            "fixed left-1/2 top-[15vh] z-[101] w-full max-w-[560px] -translate-x-1/2",
            "bg-surface-1 border border-strong rounded-xl shadow-2xl overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150"
          )}
        >
          <Command shouldFilter={false} loop>
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
              <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar projetos, cenas, páginas..."
                className="flex-1 bg-transparent text-small text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
              <kbd className="text-[9px] text-muted-foreground/30 bg-surface-3 border border-subtle px-1.5 py-0.5 rounded font-mono shrink-0">ESC</kbd>
            </div>

            {/* Results */}
            <Command.List className="max-h-[380px] overflow-y-auto custom-scrollbar">
              {/* Empty states */}
              {!query && (
                <div className="px-4 py-8 text-center text-small text-muted-foreground/30">
                  Digite para buscar em todo o workspace
                </div>
              )}
              {loading && (
                <div className="px-4 py-6 text-center text-small text-muted-foreground/50">
                  Buscando...
                </div>
              )}
              {!loading && query.length >= 2 && !hasResults && (
                <Command.Empty className="px-4 py-8 text-center text-small text-muted-foreground/40">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </Command.Empty>
              )}

              {/* Groups */}
              {!loading && projects.length > 0 && (
                <Command.Group heading="Projetos" className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/40 [&_[cmdk-group-heading]]:bg-surface-2 [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0">
                  {projects.map(p => (
                    <ResultItem key={p.id} item={p} group="project" onSelect={handleSelect} />
                  ))}
                </Command.Group>
              )}

              {!loading && items.length > 0 && (
                <Command.Group heading="Cenas & Items" className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/40 [&_[cmdk-group-heading]]:bg-surface-2 [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0">
                  {items.map(p => (
                    <ResultItem key={p.id} item={p} group="item" onSelect={handleSelect} />
                  ))}
                </Command.Group>
              )}

              {!loading && pages.length > 0 && (
                <Command.Group heading="Páginas" className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/40 [&_[cmdk-group-heading]]:bg-surface-2 [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0">
                  {pages.map(p => (
                    <ResultItem key={p.id} item={p} group="page" onSelect={handleSelect} />
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResultItem({ item, group, onSelect }) {
  const Icon = ICON[group] ?? FileText;
  return (
    <Command.Item
      value={item.id}
      onSelect={() => onSelect(item)}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-left text-small cursor-pointer transition-colors",
        "text-muted-foreground",
        "aria-selected:bg-primary/10 aria-selected:text-foreground",
        "hover:bg-surface-2 hover:text-foreground"
      )}
    >
      {item.icon
        ? <span className="text-small shrink-0">{item.icon}</span>
        : <Icon className="w-4 h-4 opacity-50 shrink-0" />
      }
      <span className="flex-1 truncate">{item.title || 'Untitled'}</span>
    </Command.Item>
  );
}
