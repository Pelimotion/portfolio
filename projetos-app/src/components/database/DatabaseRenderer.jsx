import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { viewService } from '../../services/viewService';
import { SortableEntityCard, EntityCardOverlay } from './EntityCard';
import { PropertyRenderer } from '../properties/PropertyRenderer';
import { COLOR_MAP } from '../../core/schemas';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Table, List, CalendarDays,
  Plus, Filter, Settings2, MoreHorizontal, ChevronLeft, ChevronRight,
} from 'lucide-react';

const VIEW_ICONS = { kanban: LayoutDashboard, table: Table, list: List, calendar: CalendarDays };
const COLOR_DOT  = { gray:'bg-muted-foreground/50',blue:'bg-blue-500',green:'bg-green-500',yellow:'bg-yellow-500',red:'bg-red-500',purple:'bg-purple-500',orange:'bg-orange-500',pink:'bg-pink-500',cyan:'bg-cyan-500' };

// ============================================
// DATABASE RENDERER v2 — Universal + Views
// ============================================
export function DatabaseRenderer({ databaseId, defaultView }) {
  const { pages, fetchDatabaseItems, createPage } = usePageStore();
  const [properties, setProperties] = useState([]);
  const [allValues, setAllValues] = useState({});   // { pageId: { propId: value } }
  const [views, setViews]         = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);

  const database = pages[databaseId];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, props, dbViews] = await Promise.all([
        fetchDatabaseItems(databaseId),
        propertyService.fetchByDatabase(databaseId),
        viewService.fetchByDatabase(databaseId),
      ]);
      setProperties(props);

      let activeViews = dbViews;
      if (activeViews.length === 0) {
        const def = await viewService.create({ databaseId, name: 'Board', viewType: 'kanban' });
        activeViews = [def];
      }
      setViews(activeViews);

      // Selecionar view padrão
      const preferred = activeViews.find(v => v.view_type === defaultView) || activeViews[0];
      setActiveViewId(preferred.id);

      // Batch fetch dos valores em paralelo
      const valMaps = await Promise.all(items.map(item => propertyService.fetchValues(item.id)));
      const combined = {};
      items.forEach((item, i) => {
        combined[item.id] = {};
        valMaps[i].forEach(v => { combined[item.id][v.property_id] = v.value; });
      });
      setAllValues(combined);
    } catch (e) {
      console.error('DatabaseRenderer error:', e);
    } finally {
      setLoading(false);
    }
  }, [databaseId, fetchDatabaseItems, defaultView]);

  useEffect(() => { load(); }, [load]);

  // Atualizar valor otimisticamente
  const handleValueChange = useCallback(async (pageId, propertyId, value) => {
    setAllValues(prev => ({
      ...prev,
      [pageId]: { ...(prev[pageId] || {}), [propertyId]: value },
    }));
    try {
      await propertyService.upsertValue(pageId, propertyId, value);
    } catch (e) { console.error(e); }
  }, []);

  // Mover item entre colunas (DnD / calendário)
  const handleStatusChange = useCallback(async (itemId, statusPropId, newOptionId) => {
    const newValue = { selected: newOptionId };
    setAllValues(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [statusPropId]: newValue },
    }));
    try {
      await propertyService.upsertValue(itemId, statusPropId, newValue);
    } catch (e) { console.error(e); }
  }, []);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const newItem = await createPage({ title: 'Untitled', parentId: databaseId, pageType: 'database_item' });
      setAllValues(prev => ({ ...prev, [newItem.id]: {} }));
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  }, [createPage, databaseId]);

  const items = usePageStore.getState().getChildren(databaseId);
  const activeView = views.find(v => v.id === activeViewId);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-secondary/40 rounded w-64" />
      <div className="h-52 bg-secondary/20 rounded-xl" />
    </div>
  );

  const sharedProps = { items, properties, allValues, databaseId, onStatusChange: handleStatusChange, onValueChange: handleValueChange };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        {database && (
          <h2 className="text-sm font-semibold text-foreground">{database.title}</h2>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {/* View Switcher */}
          <div className="flex items-center bg-secondary/40 rounded-lg p-0.5 border border-border/50">
            {views.map(view => {
              const Icon = VIEW_ICONS[view.view_type] || LayoutDashboard;
              return (
                <button key={view.id} onClick={() => setActiveViewId(view.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
                    activeViewId === view.id
                      ? 'bg-background shadow-sm border border-border/40 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {view.name}
                </button>
              );
            })}
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCreate} disabled={creating}
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" />
            {creating ? '...' : 'Novo'}
          </button>
        </div>
      </div>

      {/* ── View Content ── */}
      {activeView?.view_type === 'kanban'   && <KanbanView   {...sharedProps} />}
      {activeView?.view_type === 'table'    && <TableView    {...sharedProps} />}
      {activeView?.view_type === 'list'     && <ListView     {...sharedProps} />}
      {activeView?.view_type === 'calendar' && <CalendarView {...sharedProps} />}
    </div>
  );
}

// ============================================
// KANBAN VIEW
// ============================================
function KanbanView({ items, properties, allValues, databaseId, onStatusChange }) {
  const navigate = useNavigate();
  const groupProp = properties.find(p => p.property_type === 'status' || p.property_type === 'select');

  const columns = useMemo(() => {
    if (!groupProp) return [{ id: '__all', label: 'Todos', color: 'gray', items }];
    const opts = groupProp.config?.options || [];
    const cols = opts.map(opt => ({
      ...opt,
      items: items.filter(item => allValues[item.id]?.[groupProp.id]?.selected === opt.id),
    }));
    const unassigned = items.filter(item => !allValues[item.id]?.[groupProp.id]?.selected);
    if (unassigned.length) cols.unshift({ id: '__none', label: 'Sem Status', color: 'gray', items: unassigned });
    return cols;
  }, [items, groupProp, allValues]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeItem, setActiveItem] = useState(null);

  const handleDragEnd = async ({ active, over }) => {
    setActiveItem(null);
    if (!over || !groupProp) return;
    const targetCol = columns.find(c => c.id === over.id);
    if (targetCol && targetCol.id !== '__all') {
      const newOptId = targetCol.id === '__none' ? '' : targetCol.id;
      onStatusChange(active.id, groupProp.id, newOptId);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 items-start">
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={e => setActiveItem(items.find(i => i.id === e.active.id))}
        onDragEnd={handleDragEnd}>
        {columns.map(col => (
          <KanbanColumn key={col.id} col={col} properties={properties} allValues={allValues} navigate={navigate} />
        ))}
        <DragOverlay>
          {activeItem && <EntityCardOverlay item={activeItem} properties={properties} values={allValues[activeItem.id] || {}} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({ col, properties, allValues, navigate }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const colorDot = COLOR_DOT[col.color] || COLOR_DOT.gray;

  return (
    <div ref={setNodeRef} className={`w-72 shrink-0 rounded-xl transition-colors ${isOver ? 'bg-secondary/30' : ''}`}>
      {/* Column Header */}
      <div className="flex items-center gap-2 px-1 py-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${colorDot}`} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">{col.label}</span>
        <span className="text-xs text-muted-foreground/60 bg-secondary/60 px-1.5 rounded-full">{col.items.length}</span>
      </div>
      {/* Cards */}
      <div className="space-y-2.5 min-h-[80px]">
        <SortableContext items={col.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {col.items.map(item => (
            <SortableEntityCard
              key={item.id}
              item={item}
              properties={properties}
              values={allValues[item.id] || {}}
              onClick={() => navigate(`/page/${item.id}`)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ============================================
// TABLE VIEW
// ============================================
function TableView({ items, properties, allValues, onValueChange }) {
  const navigate = useNavigate();
  const visible = properties.filter(p => p.is_visible !== false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/30">
      {/* Header */}
      <div className="grid gap-3 px-4 py-2.5 bg-card border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
        style={{ gridTemplateColumns: `minmax(180px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
        <div>Nome</div>
        {visible.map(p => <div key={p.id}>{p.name}</div>)}
        <div />
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/40">
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
            Nenhum item ainda. Clique em "Novo" para criar.
          </div>
        )}
        {items.map(item => (
          <div key={item.id}
            className="grid gap-3 px-4 py-2.5 items-center hover:bg-secondary/10 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: `minmax(180px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
            <div className="font-medium text-sm text-foreground truncate" onClick={() => navigate(`/page/${item.id}`)}>
              {item.title || 'Untitled'}
            </div>
            {visible.map(prop => (
              <div key={prop.id} onClick={e => e.stopPropagation()}>
                <PropertyRenderer property={prop} value={allValues[item.id]?.[prop.id]}
                  onChange={v => onValueChange(item.id, prop.id, v)} inline />
              </div>
            ))}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// LIST VIEW
// ============================================
function ListView({ items, properties, allValues }) {
  const navigate = useNavigate();
  const statusProp = properties.find(p => p.name === 'Status');

  return (
    <div className="space-y-0.5">
      {items.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground/60">Nenhum item ainda.</div>
      )}
      {items.map(item => {
        const statusVal = statusProp ? allValues[item.id]?.[statusProp.id] : null;
        const opt = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
        const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : null;
        return (
          <div key={item.id} onClick={() => navigate(`/page/${item.id}`)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors group">
            {colors ? (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
            )}
            <span className="text-sm text-foreground flex-1 truncate">{item.title}</span>
            {opt && (
              <span className={`text-[11px] px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{opt.label}</span>
            )}
            <span className="text-xs text-muted-foreground/50">
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// CALENDAR VIEW — Minimalista e funcional
// ============================================
function CalendarView({ items, properties, allValues }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(() => new Date());

  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const statusProp   = properties.find(p => p.name === 'Status');

  const year  = current.getFullYear();
  const month = current.getMonth();

  // Itens indexados por dia
  const itemsByDay = useMemo(() => {
    if (!deadlineProp) return {};
    const map = {};
    for (const item of items) {
      const dateVal = allValues[item.id]?.[deadlineProp.id]?.date;
      if (!dateVal) continue;
      const d = new Date(dateVal);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(item);
      }
    }
    return map;
  }, [items, allValues, deadlineProp, year, month]);

  // Gerar grid de dias
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const weeks = [];
  let dayCounter = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(dayCounter++);
    }
    weeks.push(week);
    if (dayCounter > daysInMonth) break;
  }

  return (
    <div className="space-y-4">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(new Date())}
            className="px-2.5 py-1 text-xs hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            Hoje
          </button>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-card/60">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border/40 border-b border-border/40 last:border-b-0">
            {week.map((day, di) => {
              const inMonth = day >= 1 && day <= daysInMonth;
              const dayItems = inMonth ? (itemsByDay[day] || []) : [];
              return (
                <div key={di} className={`min-h-[90px] p-1.5 transition-colors ${inMonth ? 'bg-background hover:bg-secondary/10' : 'bg-card/20'}`}>
                  {inMonth && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs font-medium ml-auto
                        ${isToday(day) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayItems.slice(0, 3).map(item => {
                          const statusVal = statusProp ? allValues[item.id]?.[statusProp.id] : null;
                          const opt = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
                          const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : COLOR_MAP.gray;
                          return (
                            <div key={item.id} onClick={() => navigate(`/page/${item.id}`)}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity font-medium ${colors.bg} ${colors.text}`}>
                              {item.title}
                            </div>
                          );
                        })}
                        {dayItems.length > 3 && (
                          <div className="text-[10px] text-muted-foreground/60 px-1">+{dayItems.length - 3}</div>
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

      {!deadlineProp && (
        <p className="text-xs text-muted-foreground/60 text-center">
          Adicione uma propriedade "Deadline" ou "Entrega" para ver itens no calendário.
        </p>
      )}
    </div>
  );
}
