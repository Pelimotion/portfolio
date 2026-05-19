import React, { useState, useDeferredValue, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { buildSearchIndex, searchAll, extractSnippet } from '../../lib/searchUtils';
import { useSmartSearch } from '../../lib/useSmartSearch';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '@/lib/utils';

// ============================================
// SMART SEARCH MODAL — Full-text client-side (⌘⇧F)
// Fuse.js index built once per modal open
// ============================================

function renderHighlight(snippet) {
  if (!snippet) return null;
  const parts = snippet.split(/(\[\[MARK\]\].*?\[\[\/MARK\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[MARK\]\](.*)\[\[\/MARK\]\]$/);
    if (m) return <mark key={i} className="bg-yellow-200/40 dark:bg-yellow-900/40 rounded px-0.5 not-italic">{m[1]}</mark>;
    return <span key={i}>{part}</span>;
  });
}

const GROUP_LABEL = { database: 'Projetos', database_item: 'Cenas', page: 'Páginas' };

export function SmartSearchModal() {
  const { smartSearchOpen, closeSmartSearch } = useSmartSearch();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [fuseIndex, setFuseIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ⌘⇧F hotkey
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        smartSearchOpen
          ? closeSmartSearch()
          : useSmartSearch.getState().openSmartSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [smartSearchOpen, closeSmartSearch]);

  // Load + index when modal opens
  useEffect(() => {
    if (!smartSearchOpen) {
      setQuery('');
      setFuseIndex(null);
      return;
    }
    setLoading(true);
    async function load() {
      try {
        const { data } = await supabase
          .from('pages')
          .select('id, title, page_type, parent_id, content')
          .eq('is_archived', false)
          .limit(500);
        const items = (data || []).map(p => ({
          id: p.id,
          title: p.title || '',
          page_type: p.page_type,
          parent_id: p.parent_id,
          description: typeof p.content === 'string' ? p.content.replace(/[#*`>_~\[\]]/g, '').slice(0, 300) : '',
        }));
        setFuseIndex(buildSearchIndex(items));
      } catch (e) {
        console.error('SmartSearch load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [smartSearchOpen]);

  const results = useMemo(() => {
    if (!fuseIndex || deferredQuery.length < 2) return [];
    return searchAll(deferredQuery, fuseIndex);
  }, [fuseIndex, deferredQuery]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of results) {
      const label = GROUP_LABEL[r.item.page_type] ?? 'Páginas';
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(r);
    }
    return [...map.entries()];
  }, [results]);

  const handleSelect = useCallback((item) => {
    closeSmartSearch();
    navigate(item.page_type === 'database' ? `/project/${item.id}` : `/page/${item.id}`);
  }, [closeSmartSearch, navigate]);

  return (
    <Dialog.Root open={smartSearchOpen} onOpenChange={(open) => !open && closeSmartSearch()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <Dialog.Content
          aria-label="Busca avançada"
          className={cn(
            "fixed left-1/2 top-[10vh] z-[101] w-full max-w-2xl -translate-x-1/2",
            "bg-surface-1 border border-strong rounded-xl shadow-2xl overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150"
          )}
        >
          <Command shouldFilter={false} loop>
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
              <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar em todos os documentos..."
                className="flex-1 bg-transparent text-small text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
              <kbd className="text-[9px] text-muted-foreground/30 bg-surface-3 border border-subtle px-1.5 py-0.5 rounded font-mono shrink-0">ESC</kbd>
            </div>

            {/* Results */}
            <Command.List className="max-h-[440px] overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="px-4 py-4 space-y-2.5">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-5/6" />
                </div>
              )}

              {!loading && !deferredQuery && (
                <div className="px-4 py-10 text-center text-small text-muted-foreground/30">
                  Digite para buscar em todos os documentos
                </div>
              )}

              {!loading && deferredQuery.length >= 2 && results.length === 0 && (
                <Command.Empty className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/60">
                  <Search className="w-5 h-5 opacity-40" />
                  <span className="text-small">Nenhum resultado para &ldquo;{deferredQuery}&rdquo;</span>
                </Command.Empty>
              )}

              {!loading && grouped.map(([group, hits]) => (
                <Command.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/40 [&_[cmdk-group-heading]]:bg-surface-2 [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0"
                >
                  {hits.map(({ item }) => {
                    const snippet = extractSnippet(item.description, deferredQuery);
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleSelect(item)}
                        className={cn(
                          "flex flex-col gap-0.5 px-4 py-2.5 text-left cursor-pointer transition-colors",
                          "aria-selected:bg-primary/10 aria-selected:text-foreground",
                          "hover:bg-surface-2 hover:text-foreground"
                        )}
                      >
                        <span className="text-small text-foreground truncate">{item.title || 'Untitled'}</span>
                        {snippet && (
                          <span className="text-caption text-muted-foreground/60 line-clamp-1">
                            {renderHighlight(snippet)}
                          </span>
                        )}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
