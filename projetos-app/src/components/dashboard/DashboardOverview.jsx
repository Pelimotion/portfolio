import React, { useMemo } from 'react';
import { usePageStore } from '../../stores/usePageStore';
import { Calendar, CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardOverview() {
  const { pages } = usePageStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcoming = [];
    const stageStats = {};

    // pages is a dict: { [pageId]: page }
    const pageList = pages ? Object.values(pages) : [];

    if (!pageList.length) return { upcoming: [], totalCount: 0, stageStats: {} };

    pageList.forEach(page => {
      if (!page || page.archived) return;

      // Check for deadline-like date in page properties or content
      const deadline = page.deadline || page.due_date || null;
      if (deadline) {
        const d = new Date(deadline);
        if (d >= today && d <= nextWeek) {
          upcoming.push({ id: page.id, title: page.title, date: d });
        }
      }

      // Group by status if present
      const statusVal = page.status || null;
      if (statusVal) {
        if (!stageStats[statusVal]) stageStats[statusVal] = { total: 0, done: 0 };
        stageStats[statusVal].total++;
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => a.date - b.date),
      totalCount: pageList.length,
      stageStats,
    };
  }, [pages]);

  if (stats.totalCount === 0) return null;


  return (
    <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--surface-0)]">
      {/* Upcoming Dates */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Próximas Datas
          </div>
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{stats.upcoming.length}</span>
        </div>
        
        <div className="space-y-3">
          {stats.upcoming.length > 0 ? stats.upcoming.map(item => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/page/${item.id}`)}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {item.isFeito ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                {item.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground/40 italic">Sem entregas para esta semana.</p>
          )}
        </div>
      </div>

      {/* Active Stages Stats */}
      <div className="col-span-1 md:col-span-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Etapas Ativas
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats.stageStats).map(([label, s]) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-foreground truncate pr-2">{label}</span>
                <span className="text-muted-foreground">{s.done}/{s.total}</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${(s.done / s.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {Object.keys(stats.stageStats).length === 0 && (
            <p className="text-xs text-muted-foreground/40 italic col-span-full">Nenhuma etapa com cards ativos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
