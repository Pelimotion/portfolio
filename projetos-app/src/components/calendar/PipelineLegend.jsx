import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pipeline-hidden-projects';

function loadHidden() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveHidden(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

// ============================================
// PIPELINE LEGEND — Painel lateral colapsável
// Controla visibilidade de projetos no CalendarView
// ============================================

export function PipelineLegend({ projects, onHiddenChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(loadHidden);

  useEffect(() => {
    onHiddenChange?.(hidden);
  }, [hidden, onHiddenChange]);

  const toggle = useCallback((id) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveHidden(next);
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    const empty = new Set();
    setHidden(empty);
    saveHidden(empty);
  }, []);

  const hideAll = useCallback(() => {
    const all = new Set(projects.map(p => p.id));
    setHidden(all);
    saveHidden(all);
  }, [projects]);

  return (
    <div className={cn(
      "flex flex-col shrink-0 border-l border-subtle bg-surface-1 transition-all duration-200 overflow-hidden",
      collapsed ? "w-8" : "w-[180px]"
    )}>
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-center h-8 w-full text-muted-foreground/50 hover:text-foreground hover:bg-surface-2 transition-colors shrink-0"
        title={collapsed ? 'Expandir legenda' : 'Recolher legenda'}
      >
        {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {!collapsed && (
        <>
          <div className="px-3 py-1.5 border-b border-subtle">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
              Projetos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors",
                  "hover:bg-surface-2 rounded-none",
                  hidden.has(p.id) ? "opacity-40" : "opacity-100"
                )}
                title={p.title}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: p.color || 'var(--color-primary)' }}
                />
                <span className="text-caption text-foreground truncate">{p.title || 'Untitled'}</span>
              </button>
            ))}

            {projects.length === 0 && (
              <p className="px-3 py-3 text-caption text-muted-foreground/40">Sem projetos</p>
            )}
          </div>

          <div className="border-t border-subtle px-2 py-2 flex gap-1">
            <button
              onClick={showAll}
              className="flex-1 text-[10px] text-muted-foreground/60 hover:text-foreground py-1 rounded hover:bg-surface-2 transition-colors"
            >
              Mostrar todos
            </button>
            <button
              onClick={hideAll}
              className="flex-1 text-[10px] text-muted-foreground/60 hover:text-foreground py-1 rounded hover:bg-surface-2 transition-colors"
            >
              Ocultar todos
            </button>
          </div>
        </>
      )}
    </div>
  );
}
