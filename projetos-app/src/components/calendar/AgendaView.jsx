import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { fmtYMD, fmtDay, isToday, groupByDay } from './calendarUtils';

const DOT = { gray: 'bg-muted-foreground/40', blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', purple: 'bg-purple-500', orange: 'bg-orange-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500' };

export function AgendaView({ events, current }) {
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const byDay = groupByDay(events);
    const result = [];
    for (let i = 0; i < 60; i++) {
      const d = addDays(current, i);
      const dateStr = fmtYMD(d);
      if (byDay[dateStr]) result.push({ date: d, dateStr, dayEvents: byDay[dateStr] });
    }
    return result;
  }, [events, current]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-1 border border-subtle rounded-xl text-muted-foreground/40">
        <CalendarDays className="w-8 h-8 mb-3" />
        <span className="text-small">Sem eventos nos próximos 60 dias.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {grouped.map(({ date, dateStr, dayEvents }) => {
        const isT = isToday(date);
        return (
          <div key={dateStr} className="border border-subtle rounded-xl overflow-hidden">
            <div className={`px-4 py-2 border-b border-subtle ${isT ? 'bg-primary/10' : 'bg-surface-2'}`}>
              <span className={`text-small font-semibold capitalize ${isT ? 'text-primary' : 'text-foreground'}`}>
                {fmtDay(date)}
              </span>
              {isT && <span className="ml-2 text-caption text-primary/70">Hoje</span>}
            </div>
            <div className="divide-y divide-border-subtle bg-surface-1">
              {dayEvents.map(ev => {
                const color = ev.statusOpt?.color || ev.milestoneData?.color || 'gray';
                return (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${!ev.isMilestone && !ev.isGlobal ? 'cursor-pointer hover:bg-surface-2' : ''} ${ev.isGlobal ? 'opacity-60' : ''}`}
                    onClick={() => !ev.isMilestone && !ev.isGlobal && navigate(`/page/${ev.id}`)}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[color] || DOT.gray}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-small font-medium text-foreground truncate">
                        {ev.isMilestone ? '⭐ ' : ''}{ev.title}
                      </div>
                      {ev.statusOpt && <div className="text-caption text-muted-foreground">{ev.statusOpt.label}</div>}
                      {ev.isGlobal && <div className="text-caption text-muted-foreground/60">Outro projeto</div>}
                    </div>
                    {ev.isMilestone && <span className="text-caption text-muted-foreground/50">Marco</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
