import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getDaysInMonth, startOfMonth, getDay, getYear, getMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { groupByDay, fmtYMD } from './calendarUtils';

const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DOT = { gray: 'bg-muted-foreground/40', blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', purple: 'bg-purple-500', orange: 'bg-orange-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500' };

function gCalLink(title, dateObj) {
  const s = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const e = new Date(+dateObj + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${s}/${e}`;
}

export function MonthView({ events, current, onReschedule, rangeEvents = [], mode = 'project' }) {
  const navigate = useNavigate();
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const year = getYear(current);
  const month = getMonth(current);
  const daysInMonth = getDaysInMonth(current);
  // Monday-first: Sun(0)→6, Mon(1)→0, Tue(2)→1, …
  const firstDow = (getDay(startOfMonth(current)) + 6) % 7;

  const byDay = useMemo(() => groupByDay(events), [events]);
  const todayStr = fmtYMD(new Date());

  const cells = [...Array(firstDow).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="border border-subtle rounded-xl overflow-hidden bg-surface-1">
      <div className="grid grid-cols-7 border-b border-subtle bg-surface-2">
        {WEEK_LABELS.map(d => (
          <div key={d} className="py-2.5 text-center text-caption font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 divide-x divide-border-subtle border-b border-subtle last:border-b-0">
          {week.map((day, di) => {
            if (!day) return <div key={di} className="min-h-[130px] bg-surface-2/30" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = byDay[dateStr] || [];
            const isT = dateStr === todayStr;
            const isOver = dropTarget === dateStr;

            return (
              <div
                key={di}
                className={`min-h-[130px] p-1.5 transition-colors ${isOver ? 'bg-surface-3' : 'bg-surface-0 hover:bg-surface-2/30'}`}
                onDragOver={e => { e.preventDefault(); setDropTarget(dateStr); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => {
                  e.preventDefault(); setDropTarget(null);
                  if (dragId) {
                    const ev = events.find(x => x.id === dragId);
                    onReschedule?.(dragId, dateStr);
                    const label = format(new Date(dateStr + 'T12:00:00'), 'dd/MM', { locale: ptBR });
                    if (ev) toast.success(`${ev.title} → ${label}`);
                    setDragId(null);
                  }
                }}
              >
                {/* Range bars (stages / pipeline) */}
                {rangeEvents
                  .filter(r => (r.type === 'stage' || r.type === 'pipeline-stage') && dateStr >= r.startStr && dateStr <= r.endStr)
                  .slice(0, mode === 'pipeline' ? 4 : 2)
                  .map(r => (
                    <div
                      key={r.id}
                      title={r.title}
                      className={`-mx-1.5 mb-0.5 ${mode === 'pipeline' ? 'h-1.5' : 'h-1'}`}
                      style={{
                        backgroundColor: r.color,
                        opacity: mode === 'pipeline' ? 0.75 : 0.25,
                        borderRadius: dateStr === r.startStr ? '0 2px 2px 0' : dateStr === r.endStr ? '2px 0 0 2px' : '0',
                      }}
                    />
                  ))
                }
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-small font-semibold mb-1.5 ml-auto ${isT ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 4).map(ev => (
                    <EventChip
                      key={ev.id} ev={ev}
                      onDragStart={() => setDragId(ev.id)}
                      onNavigate={() => navigate(`/page/${ev.id}`)}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <div className="text-caption text-muted-foreground/50 px-1.5">+{dayEvents.length - 4}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function EventChip({ ev, onDragStart, onNavigate }) {
  const draggable = !ev.isGlobal && !ev.isMilestone;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div
          draggable={draggable}
          onDragStart={draggable ? (e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); } : undefined}
          className={`text-caption px-1.5 py-0.5 rounded-md truncate cursor-pointer font-medium flex items-center gap-1 select-none ${ev.colors.bg} ${ev.colors.text} ${ev.isGlobal ? 'opacity-50' : ''}`}
        >
          {ev.isMilestone && <span>⭐</span>}
          <span className="truncate">{ev.isGlobal ? '(Proj) ' : ''}{ev.title}</span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={4} align="start" className="z-50 min-w-[180px] bg-surface-1 border border-subtle rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1.5 text-small font-semibold border-b border-subtle mb-1 truncate">{ev.title}</div>
          {!ev.isMilestone && (
            <DropdownMenu.Item onSelect={onNavigate} className="flex items-center gap-2 px-2 py-1.5 text-small rounded-lg cursor-pointer outline-none hover:bg-surface-2 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" /> Abrir
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item className="outline-none">
            <a href={gCalLink(ev.isMilestone ? `Milestone: ${ev.title}` : `Entrega: ${ev.title}`, ev.date)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 text-small rounded-lg cursor-pointer hover:bg-surface-2 transition-colors">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> Google Calendar
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
