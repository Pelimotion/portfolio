import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  parseISO, isValid, isToday, format,
  max as dateMax, min as dateMin,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Bar opacity alternates by stage index (P&B palette — white with opacity)
const BAR_OPACITIES = ['bg-white/30', 'bg-white/50', 'bg-white/70', 'bg-white/40', 'bg-white/60'];

function getBarOpacity(idx) {
  return BAR_OPACITIES[idx % BAR_OPACITIES.length];
}

function parseDate(str) {
  if (!str) return null;
  const d = parseISO(str);
  return isValid(d) ? d : null;
}

/**
 * ProjectTimelineView — Gantt-style month view.
 *
 * Props:
 *   projects        — array of page objects with .id, .title, .stages (JSONB), .created_at
 *   current         — Date indicating which month to render
 *   onProjectClick  — (id) => void — navigate to project page
 */
export function ProjectTimelineView({ projects = [], current, onProjectClick }) {
  const navigate = useNavigate();

  const monthStart = useMemo(() => startOfMonth(current), [current]);
  const monthEnd   = useMemo(() => endOfMonth(current),   [current]);
  const days       = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);
  const totalDays  = days.length;

  // Per-project bar data: clipped to month boundaries
  const projectRows = useMemo(() => {
    return (projects || []).map((project) => {
      const stages = Array.isArray(project.stages) && project.stages.length > 0
        ? project.stages
        : null;

      let bars;
      if (stages) {
        bars = stages
          .filter(s => s.start_date && s.end_date)
          .map((stage, idx) => {
            const rawStart = parseDate(stage.start_date);
            const rawEnd   = parseDate(stage.end_date);
            if (!rawStart || !rawEnd) return null;

            const clampedStart = dateMax([rawStart, monthStart]);
            const clampedEnd   = dateMin([rawEnd,   monthEnd]);
            if (clampedStart > clampedEnd) return null; // entirely outside month

            const startDay = clampedStart.getDate(); // 1-based
            const endDay   = clampedEnd.getDate();

            const leftPct  = ((startDay - 1) / totalDays) * 100;
            const widthPct = ((endDay - startDay + 1) / totalDays) * 100;

            return {
              key: stage.id || `s${idx}`,
              label: stage.name || '',
              leftPct,
              widthPct,
              opacityClass: getBarOpacity(idx),
            };
          })
          .filter(Boolean);
      } else {
        // Placeholder bar: created_at → today, clipped to month
        const rawStart = parseDate(project.created_at) || monthStart;
        const rawEnd   = new Date();

        const clampedStart = dateMax([rawStart, monthStart]);
        const clampedEnd   = dateMin([rawEnd,   monthEnd]);

        if (clampedStart <= clampedEnd) {
          const startDay = clampedStart.getDate();
          const endDay   = clampedEnd.getDate();
          const leftPct  = ((startDay - 1) / totalDays) * 100;
          const widthPct = ((endDay - startDay + 1) / totalDays) * 100;
          bars = [{
            key: 'placeholder',
            label: '',
            leftPct,
            widthPct,
            opacityClass: 'bg-white/20',
          }];
        } else {
          bars = [];
        }
      }

      return { project, bars };
    });
  }, [projects, monthStart, monthEnd, totalDays]);

  // Today column index (0-based), or -1 if not in this month
  const todayColIndex = useMemo(() => {
    const today = new Date();
    if (today < monthStart || today > monthEnd) return -1;
    return today.getDate() - 1;
  }, [monthStart, monthEnd]);

  const handleProjectClick = (id) => {
    if (onProjectClick) {
      onProjectClick(id);
    } else {
      navigate(`/page/${id}`);
    }
  };

  // Column width as percentage
  const colW = 100 / totalDays;

  return (
    <div className="bg-[var(--surface-1)] rounded-xl border border-subtle overflow-hidden">
      {/* Outer scroll wrapper — allows horizontal scroll on narrow viewports */}
      <div className="overflow-x-auto">
        {/* Min-width: title column (160px) + at least 28px per day */}
        <div style={{ minWidth: `${160 + totalDays * 28}px` }}>

          {/* Header row: day numbers */}
          <div className="flex border-b border-subtle">
            {/* Title column header */}
            <div className="w-40 shrink-0 px-3 py-2 text-caption text-muted-foreground font-medium border-r border-subtle">
              Projeto
            </div>

            {/* Day columns */}
            <div className="relative flex-1 flex">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 text-center py-2 text-caption font-medium border-r border-subtle last:border-r-0 ${
                    isToday(day) ? 'text-foreground bg-white/5' : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              ))}
            </div>
          </div>

          {/* Day-of-week sub-header */}
          <div className="flex border-b border-subtle">
            <div className="w-40 shrink-0 border-r border-subtle" />
            <div className="flex-1 flex">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 text-center pb-1 text-caption border-r border-subtle last:border-r-0 ${
                    isToday(day) ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  {format(day, 'EEEEE', { locale: ptBR })}
                </div>
              ))}
            </div>
          </div>

          {/* Project rows */}
          {projectRows.length === 0 && (
            <div className="px-4 py-8 text-center text-small text-muted-foreground">
              Nenhum projeto para exibir.
            </div>
          )}

          {projectRows.map(({ project, bars }) => (
            <div key={project.id} className="flex border-b border-subtle last:border-b-0 group hover:bg-white/[0.02] transition-colors">
              {/* Project title */}
              <div className="w-40 shrink-0 px-3 py-3 border-r border-subtle flex items-center">
                <button
                  onClick={() => handleProjectClick(project.id)}
                  className="text-small font-medium text-foreground hover:text-foreground/80 truncate text-left w-full transition-colors"
                  title={project.title || 'Sem título'}
                >
                  {project.icon && <span className="mr-1.5">{project.icon}</span>}
                  {project.title || 'Sem título'}
                </button>
              </div>

              {/* Gantt track */}
              <div className="flex-1 relative py-2 px-0">
                {/* Column grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 border-r border-subtle last:border-r-0 ${
                        isToday(day) ? 'bg-white/5' : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Today marker (vertical line) */}
                {todayColIndex >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white/40 z-10 pointer-events-none"
                    style={{ left: `calc(${(todayColIndex + 0.5) * colW}%)` }}
                  />
                )}

                {/* Stage bars */}
                <div className="relative h-6 mx-1">
                  {bars.map((bar) => (
                    <button
                      key={bar.key}
                      onClick={() => handleProjectClick(project.id)}
                      className={`absolute top-0 h-full rounded ${bar.opacityClass} hover:opacity-90 transition-opacity`}
                      style={{
                        left: `${bar.leftPct}%`,
                        width: `${bar.widthPct}%`,
                        minWidth: '2px',
                      }}
                      title={bar.label || project.title}
                    >
                      {bar.label && bar.widthPct > 8 && (
                        <span className="absolute inset-0 flex items-center px-1.5 text-caption font-medium text-foreground/80 truncate">
                          {bar.label}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Empty row hint */}
                  {bars.length === 0 && (
                    <span className="absolute inset-0 flex items-center px-2 text-caption text-muted-foreground/30 italic">
                      sem etapas neste mês
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
