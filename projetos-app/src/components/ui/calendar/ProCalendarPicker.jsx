import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const SHORTCUTS = [
  { label: 'Hoje', days: 0 },
  { label: 'Amanhã', days: 1 },
  { label: 'Próxima semana', days: 7 },
  { label: 'Em 2 semanas', days: 14 },
  { label: 'Em 30 dias', days: 30 },
];

export function ProCalendarPicker({ value, onChange, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(() => value ? new Date(value) : new Date());
  
  // Helper para adicionar dias sem problemas de timezone
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleShortcut = (days) => {
    const d = addDays(new Date(), days);
    onChange(d.toISOString());
    if(onClose) onClose();
  };

  const handleDayClick = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(d.toISOString());
    if(onClose) onClose();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="w-64 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col text-sm font-sans animate-in fade-in-0 zoom-in-95">
      
      {/* ── Calendar Header ── */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-secondary rounded">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="font-semibold text-foreground capitalize text-[13px]">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-secondary rounded">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* ── Days Grid ── */}
      <div className="p-3">
        <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">
          {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            
            const isSelected = selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === month && 
              selectedDate.getFullYear() === year;
              
            const isToday = new Date().getDate() === day && 
              new Date().getMonth() === month && 
              new Date().getFullYear() === year;

            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={`h-7 w-7 flex items-center justify-center rounded-md text-[13px] transition-colors ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : isToday 
                      ? 'text-primary font-semibold hover:bg-primary/10'
                      : 'text-foreground hover:bg-secondary'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Shortcuts Panel ── */}
      <div className="bg-secondary/30 border-t border-border/50 p-2 space-y-0.5">
        <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Atalhos</div>
        {SHORTCUTS.map(s => (
          <button 
            key={s.label}
            onClick={() => handleShortcut(s.days)}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-secondary text-foreground transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>
      
    </div>
  );
}
