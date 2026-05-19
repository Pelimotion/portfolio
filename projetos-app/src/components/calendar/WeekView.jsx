import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { weekDays, fmtYMD, isToday } from './calendarUtils';

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function WeekView({ events, current }) {
  const navigate = useNavigate();
  const days = weekDays(current);

  const byDay = {};
  for (const ev of events) {
    if (!byDay[ev.dateStr]) byDay[ev.dateStr] = [];
    byDay[ev.dateStr].push(ev);
  }

  return (
    <div className="border border-subtle rounded-xl overflow-hidden bg-surface-1">
      <div className="grid grid-cols-7 divide-x divide-border-subtle border-b border-subtle bg-surface-2">
        {days.map((d, i) => {
          const isT = isToday(d);
          return (
            <div key={i} className="p-3 text-center">
              <div className="text-caption text-muted-foreground uppercase tracking-wider mb-1">{DAY_NAMES[i]}</div>
              <div className={`text-h3 font-semibold mx-auto w-8 h-8 rounded-full flex items-center justify-center ${isT ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                {format(d, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 divide-x divide-border-subtle min-h-[280px]">
        {days.map((d, i) => {
          const dateStr = fmtYMD(d);
          const dayEvents = byDay[dateStr] || [];
          const isT = isToday(d);
          return (
            <div key={i} className={`p-2 space-y-1 ${isT ? 'bg-surface-2/40' : ''}`}>
              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  className={`text-caption px-2 py-1 rounded-md font-medium truncate ${ev.colors.bg} ${ev.colors.text} ${ev.isGlobal ? 'opacity-50' : 'cursor-pointer hover:brightness-105'}`}
                  onClick={() => !ev.isMilestone && !ev.isGlobal && navigate(`/page/${ev.id}`)}
                >
                  {ev.isMilestone ? '⭐ ' : ''}{ev.title}
                </div>
              ))}
              {dayEvents.length === 0 && (
                <div className="text-caption text-muted-foreground/25 text-center pt-6">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
