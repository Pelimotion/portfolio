import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { fmtYMD } from './calendarUtils';

export function DayView({ events, current }) {
  const navigate = useNavigate();
  const dateStr = fmtYMD(current);
  const dayEvents = events.filter(ev => ev.dateStr === dateStr);

  if (dayEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-1 border border-subtle rounded-xl text-muted-foreground/40">
        <CalendarDays className="w-7 h-7 mb-2" />
        <span className="text-small">Nenhum evento neste dia.</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-subtle rounded-xl divide-y divide-border-subtle overflow-hidden">
      {dayEvents.map(ev => (
        <div
          key={ev.id}
          className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${!ev.isMilestone && !ev.isGlobal ? 'cursor-pointer hover:bg-surface-2' : ''} ${ev.isGlobal ? 'opacity-60' : ''}`}
          onClick={() => !ev.isMilestone && !ev.isGlobal && navigate(`/page/${ev.id}`)}
        >
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ev.colors.bg.replace('bg-', 'bg-').split(' ')[0]}`} />
          <div className="flex-1 min-w-0">
            <div className="text-small font-semibold text-foreground truncate">
              {ev.isMilestone ? '⭐ ' : ''}{ev.title}
            </div>
            {ev.statusOpt && <div className="text-caption text-muted-foreground">{ev.statusOpt.label}</div>}
            {ev.isGlobal && <div className="text-caption text-muted-foreground/60">Outro projeto</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
