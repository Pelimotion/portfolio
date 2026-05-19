import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { COLOR_MAP } from '../../../core/colors';

const COLOR_DOT = { gray:'bg-muted-foreground/50',blue:'bg-blue-500',green:'bg-green-500',yellow:'bg-yellow-500',red:'bg-red-500',purple:'bg-purple-500',orange:'bg-orange-500',pink:'bg-pink-500',cyan:'bg-cyan-500' };

export function CalendarView({ items, properties, allValues, databaseId }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(() => new Date());

  const [globalItems,  setGlobalItems]  = useState([]);
  const [globalValues, setGlobalValues] = useState({});
  const [globalProps,  setGlobalProps]  = useState([]);

  useEffect(() => {
    const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';
    if (databaseId !== ROOT_HUB_ID) {
      async function loadGlobal() {
        try {
          const [projs, props, valsArr] = await Promise.all([
            import('../../../services/pageService').then(m => m.pageService.fetchDatabaseItems(ROOT_HUB_ID)),
            import('../../../services/propertyService').then(m => m.propertyService.fetchByDatabase(ROOT_HUB_ID)),
            import('../../../services/propertyService').then(m => m.propertyService.fetchAllValues(ROOT_HUB_ID)),
          ]);
          const vMap = {};
          for (const v of valsArr) {
            if (!vMap[v.page_id]) vMap[v.page_id] = {};
            vMap[v.page_id][v.property_id] = { date: v.value?.date, selected: v.value?.selected };
          }
          setGlobalItems(projs || []);
          setGlobalProps(props || []);
          setGlobalValues(vMap);
        } catch (e) { console.error('Failed to load global calendar context', e); }
      }
      loadGlobal();
    }
  }, [databaseId]);

  const deadlineProp       = properties.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const statusProp         = properties.find(p => p.property_type === 'status' || p.name === 'Status');
  const globalDeadlineProp = globalProps.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const globalStatusProp   = globalProps.find(p => p.property_type === 'status' || p.name === 'Status');

  const year  = current.getFullYear();
  const month = current.getMonth();

  const itemsByDay = useMemo(() => {
    const map = {};

    if (deadlineProp) {
      for (const item of (items || [])) {
        const dateVal = (allValues || {})[item.id]?.[deadlineProp.id]?.date;
        if (!dateVal) continue;
        const d = new Date(dateVal);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({ type: 'entity', data: item, date: d });
        }
      }
    }

    if (statusProp && statusProp.config?.options) {
      for (const opt of statusProp.config.options) {
        if (!opt.deadline && !opt.startDate) continue;
        const [y, m, d_str] = (opt.deadline || opt.startDate).split('-');
        const d = new Date(Number(y), Number(m) - 1, Number(d_str));
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({ type: 'milestone', data: opt, date: d });
        }
      }
    }

    if (globalDeadlineProp) {
      for (const gItem of globalItems) {
        const dateVal = globalValues[gItem.id]?.[globalDeadlineProp.id]?.date;
        if (!dateVal) continue;
        const d = new Date(dateVal);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({ type: 'entity', data: gItem, date: d, isGlobal: true });
        }
      }
    }

    if (globalStatusProp && globalStatusProp.config?.options) {
      for (const opt of globalStatusProp.config.options) {
        if (!opt.deadline && !opt.startDate) continue;
        const [y, m, d_str] = (opt.deadline || opt.startDate).split('-');
        const d = new Date(Number(y), Number(m) - 1, Number(d_str));
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({ type: 'milestone', data: opt, date: d, isGlobal: true });
        }
      }
    }

    return map;
  }, [items, allValues, deadlineProp, statusProp, year, month, globalItems, globalValues, globalDeadlineProp, globalStatusProp]);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();
  const isToday     = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const weeks = [];
  let dayCounter = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) week.push(dayCounter++);
    weeks.push(week);
    if (dayCounter > daysInMonth) break;
  }

  const createGCalLink = (title, description, dateObj, includeMeet = false) => {
    const start = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end   = new Date(dateObj.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
    if (includeMeet) url += `&add=meet`;
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-[var(--surface-1)] border border-border/50 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground capitalize tracking-tight">
            {current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
            Visão Geral de Entregas
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary/30 p-1 rounded-xl border border-border/40">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(new Date())} className="px-4 py-1.5 text-xs font-bold hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-sm">
            Hoje
          </button>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border/60 rounded-2xl overflow-hidden shadow-sm bg-[var(--surface-1)]">
        <div className="grid grid-cols-7 border-b border-border/60 bg-secondary/20">
          {['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map((d, i) => (
            <div key={d} className={`py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest ${i === 0 || i === 6 ? 'text-primary/60' : ''}`}>
              {d.substring(0, 3)}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border/40 border-b border-border/40 last:border-b-0">
            {week.map((day, di) => {
              const inMonth  = day >= 1 && day <= daysInMonth;
              const dayItems = inMonth ? (itemsByDay[day] || []) : [];
              const todayFlag = isToday(day);

              return (
                <div key={di} className={`min-h-[140px] p-2 transition-all relative group/day ${inMonth ? 'bg-[var(--surface-0)] hover:bg-[var(--surface-2)]' : 'bg-[var(--surface-1)] opacity-40'}`}>
                  {inMonth && (
                    <>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-3 text-xs font-bold ml-auto transition-colors ${todayFlag ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110' : 'text-muted-foreground group-hover/day:text-foreground group-hover/day:bg-secondary/50'}`}>
                        {day}
                      </div>
                      <div className="space-y-1.5">
                        {dayItems.slice(0, 5).map((itemWrap, i) => {
                          const isGlobal     = itemWrap.isGlobal;
                          const opacityClass = isGlobal ? 'opacity-40 hover:opacity-80' : 'opacity-100';

                          if (itemWrap.type === 'milestone') {
                            const opt    = itemWrap.data;
                            const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
                            return (
                              <DropdownMenu.Root key={`ms-${opt.id}-${i}`}>
                                <DropdownMenu.Trigger asChild>
                                  <div className={`text-[10px] px-2 py-1.5 rounded-lg truncate font-bold border ${colors.bg} ${colors.text} border-${opt.color}-500/20 shadow-sm cursor-pointer hover:brightness-110 transition-all flex items-center gap-1.5 ${opacityClass}`}>
                                    <span>⭐</span> {isGlobal ? `(Global) ` : ''}{opt.label}
                                  </div>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content align="start" className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95">
                                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground border-b border-border/50 mb-1">Milestone: {opt.label}</div>
                                    <DropdownMenu.Item className="outline-none">
                                      <a href={createGCalLink(`Milestone: ${opt.label}`, `Entrega da fase de ${opt.label}`, itemWrap.date, false)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors">
                                        <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> Adicionar ao Google Calendar
                                      </a>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="outline-none">
                                      <a href={createGCalLink(`Reunião: ${opt.label}`, `Discussão de entregáveis da fase de ${opt.label}`, itemWrap.date, true)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors mt-0.5">
                                        <span className="w-3.5 h-3.5 flex items-center justify-center bg-green-500/20 text-green-500 rounded text-[8px] font-bold">M</span> Criar Google Meet
                                      </a>
                                    </DropdownMenu.Item>
                                    {!isGlobal && (
                                      <DropdownMenu.Item
                                        onSelect={() => {
                                          const dt = prompt("Nova data final (YYYY-MM-DD):", opt.deadline || "");
                                          if (dt) {
                                            const newOpts = statusProp.config.options.map(o => o.id === opt.id ? { ...o, deadline: dt } : o);
                                            import('../../../services/propertyService').then(m => m.propertyService.update(statusProp.id, { config: { ...statusProp.config, options: newOpts } }))
                                              .then(() => window.location.reload())
                                              .catch(console.error);
                                          }
                                        }}
                                        className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors outline-none mt-0.5 text-orange-400"
                                      >
                                        ✏️ Editar Prazo
                                      </DropdownMenu.Item>
                                    )}
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            );
                          } else {
                            const item             = itemWrap.data;
                            const activeStatusProp = isGlobal ? globalStatusProp : statusProp;
                            const statusVal        = isGlobal ? globalValues[item.id]?.[globalStatusProp?.id] : (statusProp ? allValues[item.id]?.[statusProp.id] : null);
                            const opt              = activeStatusProp?.config?.options?.find(o => o.id === statusVal?.selected);
                            const colors           = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : COLOR_MAP.gray;
                            return (
                              <DropdownMenu.Root key={`sc-${item.id}-${i}`}>
                                <DropdownMenu.Trigger asChild>
                                  <div className={`text-[10px] px-2 py-1.5 rounded-lg truncate cursor-pointer shadow-sm hover:scale-[1.02] transition-all font-medium border border-border/20 ${colors.bg} ${colors.text} flex items-center gap-1.5 ${opacityClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[opt?.color] || COLOR_DOT.gray}`} />
                                    {isGlobal ? `(Proj) ` : ''}{item.title}
                                  </div>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content align="start" className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95">
                                    <div className="px-2 py-1.5 text-xs font-bold text-foreground border-b border-border/50 mb-1 truncate">{item.title}</div>
                                    <DropdownMenu.Item onSelect={() => navigate(`/page/${item.id}`)} className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors outline-none">
                                      <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" /> Abrir Detalhes
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="outline-none mt-0.5">
                                      <a href={createGCalLink(`Entrega: ${item.title}`, `Entrega agendada. Status atual: ${opt?.label || 'Sem status'}`, itemWrap.date, false)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors">
                                        <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> Agendar no GCal
                                      </a>
                                    </DropdownMenu.Item>
                                    {!isGlobal && deadlineProp && (
                                      <DropdownMenu.Item
                                        onSelect={() => {
                                          const dt = prompt("Nova data de entrega (YYYY-MM-DD):", itemWrap.date.toISOString().split('T')[0]);
                                          if (dt) {
                                            import('../../../services/propertyService').then(m => m.propertyService.upsertValue(item.id, deadlineProp.id, { date: dt }))
                                              .then(() => window.location.reload())
                                              .catch(console.error);
                                          }
                                        }}
                                        className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded-lg cursor-pointer transition-colors outline-none mt-0.5 text-orange-400"
                                      >
                                        ✏️ Editar Entrega
                                      </DropdownMenu.Item>
                                    )}
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            );
                          }
                        })}
                        {dayItems.length > 5 && (
                          <div className="text-[10px] text-muted-foreground/60 px-2 py-1 font-bold bg-secondary/30 rounded-lg text-center mt-1">
                            +{dayItems.length - 5} itens
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {(!deadlineProp && !statusProp) && (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface-1)] border border-dashed border-border/50 rounded-2xl">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-xs text-muted-foreground font-medium">O calendário está vazio.</p>
          <p className="text-[11px] text-muted-foreground/50 mt-1">Adicione propriedades de Data ("Deadline", "Entrega") ou configure datas nos Status.</p>
        </div>
      )}
    </div>
  );
}
