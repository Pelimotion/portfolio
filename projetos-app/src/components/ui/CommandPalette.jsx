import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, FolderOpen, ArrowRight, Hash, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { supabase } from '../../lib/supabase';

// ============================================
// COMMAND PALETTE — Global Search (⌘K)
// Inspired by Notion, Linear, VS Code
// ============================================

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Open with ⌘K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) {
          closeCommandPalette();
        } else {
          useUIStore.getState().openCommandPalette();
        }
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, closeCommandPalette]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Search logic
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pages')
        .select('id, title, icon, page_type, parent_id')
        .eq('is_archived', false)
        .ilike('title', `%${q}%`)
        .limit(20);

      // Group results
      const projects = (data || []).filter(p => p.page_type === 'database' && p.parent_id === null);
      const items = (data || []).filter(p => p.page_type === 'database_item');
      const pages = (data || []).filter(p => p.page_type === 'page');

      const grouped = [];
      if (projects.length) grouped.push({ type: 'section', label: 'Projetos' }, ...projects.map(p => ({ ...p, group: 'project' })));
      if (items.length) grouped.push({ type: 'section', label: 'Cenas & Items' }, ...items.map(p => ({ ...p, group: 'item' })));
      if (pages.length) grouped.push({ type: 'section', label: 'Páginas' }, ...pages.map(p => ({ ...p, group: 'page' })));

      setResults(grouped);
      setSelectedIndex(0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard nav
  const selectableResults = results.filter(r => r.type !== 'section');
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, selectableResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectableResults[selectedIndex]) {
      handleSelect(selectableResults[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    closeCommandPalette();
    if (item.group === 'project' || item.page_type === 'database') {
      navigate(`/project/${item.id}`);
    } else {
      navigate(`/page/${item.id}`);
    }
  };

  if (!commandPaletteOpen) return null;

  let selectableIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={closeCommandPalette}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
      
      {/* Panel */}
      <div 
        className="relative w-full max-w-[560px] bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar projetos, cenas, páginas..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5 rounded hover:bg-[var(--surface-3)] text-muted-foreground/40">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[9px] text-muted-foreground/30 bg-[var(--surface-3)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground/50">Buscando...</div>
          )}
          
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground/40">Nenhum resultado encontrado</div>
          )}

          {!loading && results.map((item, i) => {
            if (item.type === 'section') {
              return (
                <div key={`section-${item.label}`} className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider bg-[var(--surface-2)] sticky top-0">
                  {item.label}
                </div>
              );
            }
            selectableIdx++;
            const isSelected = selectableIdx === selectedIndex;
            const Icon = item.group === 'project' ? FolderOpen : item.group === 'item' ? Hash : FileText;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isSelected ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground'}`}
              >
                {item.icon ? <span className="text-sm shrink-0">{item.icon}</span> : <Icon className="w-4 h-4 opacity-50 shrink-0" />}
                <span className="flex-1 truncate">{item.title || 'Untitled'}</span>
                {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary/60 shrink-0" />}
              </button>
            );
          })}

          {!query && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground/30">
              Digite para buscar em todo o workspace
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
