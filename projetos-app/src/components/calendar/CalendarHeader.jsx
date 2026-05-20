import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { fmtMonth, fmtWeekRange, fmtDay } from './calendarUtils';

const VIEWS = [
  { id: 'month',    label: 'Mês' },
  { id: 'week',     label: 'Semana' },
  { id: 'day',      label: 'Dia' },
  { id: 'agenda',   label: 'Agenda' },
  { id: 'timeline', label: 'Geral do Mês' },
];

export function CalendarHeader({ view, current, onViewChange, onToday, onNext, onPrev, filterMode, onFilterChange }) {
  const title =
    view === 'month'    ? fmtMonth(current) :
    view === 'week'     ? fmtWeekRange(current) :
    view === 'day'      ? fmtDay(current) :
    view === 'timeline' ? fmtMonth(current) :
    'Agenda';

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap bg-surface-1 border border-subtle p-3 rounded-xl">
      {/* Left: title + nav */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5 border border-subtle">
          <button onClick={onPrev} className="p-1.5 hover:bg-surface-3 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onToday} className="px-3 py-1 text-small font-medium hover:bg-surface-3 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            Hoje
          </button>
          <button onClick={onNext} className="p-1.5 hover:bg-surface-3 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-h3 font-semibold text-foreground capitalize">{title}</h3>
      </div>

      {/* Right: view switcher + filter */}
      <div className="flex items-center gap-2">
        {/* Filter */}
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5 border border-subtle">
          {[
            { id: 'all',  label: 'Todos' },
            { id: 'local', label: 'Projeto' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => onFilterChange(id)}
              className={`px-2.5 py-1 text-small font-medium rounded transition-all ${filterMode === id ? 'bg-surface-1 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5 border border-subtle">
          {VIEWS.map(({ id, label }) => (
            <button key={id} onClick={() => onViewChange(id)}
              className={`px-2.5 py-1 text-small font-medium rounded transition-all ${view === id ? 'bg-surface-1 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Kbd hint */}
        <div className="hidden md:flex items-center gap-1 text-caption text-muted-foreground/40">
          <CalendarDays className="w-3 h-3" />
          <span>T·J/K·G</span>
        </div>
      </div>
    </div>
  );
}
