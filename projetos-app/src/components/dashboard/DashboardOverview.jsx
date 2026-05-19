import React, { useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { usePageStore } from '../../stores/usePageStore';
import { Calendar, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardOverview() {
  const { pages = {} } = usePageStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcoming = [];
    const stageStats = {};
    let doneCount = 0;

    const pageList = pages && typeof pages === 'object' ? Object.values(pages) : [];
    if (!pageList.length) return { upcoming: [], totalCount: 0, stageStats: {}, doneCount: 0 };

    pageList.forEach(page => {
      if (!page || page.archived) return;

      const deadline = page.deadline || page.due_date || null;
      if (deadline) {
        const d = new Date(deadline);
        if (d >= today && d <= nextWeek) upcoming.push({ id: page.id, title: page.title, date: d });
      }

      const statusVal = page.status || null;
      if (statusVal) {
        if (!stageStats[statusVal]) stageStats[statusVal] = { total: 0, done: 0 };
        stageStats[statusVal].total++;
        if (statusVal === 'concluido' || statusVal === 'entregue') {
          stageStats[statusVal].done++;
          doneCount++;
        }
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => a.date - b.date),
      totalCount: pageList.length,
      stageStats,
      doneCount,
    };
  }, [pages]);

  if (stats.totalCount === 0) return null;

  const activeStageCount = Object.keys(stats.stageStats).filter(s => s !== 'concluido' && s !== 'entregue').length;

  return (
    <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] shrink-0">
      {/* Chip: Próximas Datas */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] transition-colors">
            <Calendar className="w-3 h-3 text-primary shrink-0" />
            <span>{stats.upcoming.length} {stats.upcoming.length === 1 ? 'prazo' : 'prazos'} esta semana</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-50 min-w-[260px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95"
          >
            <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-2 py-1">Próximas Datas</p>
            {stats.upcoming.length > 0 ? stats.upcoming.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(`/page/${item.id}`)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg hover:bg-[var(--surface-2)] transition-colors group"
              >
                <span className="truncate text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 ml-2">
                  {item.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </button>
            )) : (
              <p className="text-xs text-muted-foreground/40 italic px-2 py-1.5">Sem entregas para esta semana.</p>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <span className="text-muted-foreground/20 text-xs select-none">•</span>

      {/* Chip: Etapas Ativas */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] transition-colors">
            <Clock className="w-3 h-3 shrink-0 opacity-60" />
            <span>{activeStageCount} {activeStageCount === 1 ? 'etapa ativa' : 'etapas ativas'}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-50 min-w-[240px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95"
          >
            <p className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-2 py-1">Etapas Ativas</p>
            {Object.entries(stats.stageStats)
              .filter(([s]) => s !== 'concluido' && s !== 'entregue')
              .map(([label, s]) => (
                <div key={label} className="px-2 py-1.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate pr-2">{label}</span>
                    <span className="text-muted-foreground/60 shrink-0">{s.total}</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${s.total > 0 ? (s.done / s.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            {activeStageCount === 0 && (
              <p className="text-xs text-muted-foreground/40 italic px-2 py-1.5">Nenhuma etapa ativa.</p>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <span className="text-muted-foreground/20 text-xs select-none">•</span>

      {/* Chip: Concluídos */}
      <div className="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium text-muted-foreground/60">
        <CheckCircle2 className="w-3 h-3 text-green-500/60 shrink-0" />
        <span>{stats.doneCount} {stats.doneCount === 1 ? 'concluído' : 'concluídos'}</span>
      </div>
    </div>
  );
}
