import React, { useEffect, useState, useMemo, useCallback, memo, createContext, useContext } from 'react';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { viewService } from '../../services/viewService';
import { SortableEntityCard, EntityCardOverlay } from './EntityCard';
import { PropertyRenderer } from '../properties/PropertyRenderer';
import { COLOR_MAP } from '../../core/schemas';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Table, List, CalendarDays,
  Plus, Filter, Settings2, MoreHorizontal, ChevronLeft, ChevronRight,
  LayoutGrid, AlignJustify, LayoutList, Trash2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { PropertyManagerModal } from './PropertyManagerModal';

const VIEW_ICONS = { kanban: LayoutDashboard, table: Table, list: List, calendar: CalendarDays };
const COLOR_DOT  = { gray:'bg-muted-foreground/50',blue:'bg-blue-500',green:'bg-green-500',yellow:'bg-yellow-500',red:'bg-red-500',purple:'bg-purple-500',orange:'bg-orange-500',pink:'bg-pink-500',cyan:'bg-cyan-500' };

// Context for density mode
const DensityCtx = createContext('comfortable');
export const useDensity = () => useContext(DensityCtx);

// ============================================
// DATABASE RENDERER v3 — Fixed DnD + Density
// ============================================
export function DatabaseRenderer({ databaseId, defaultView }) {
  const { pages, fetchDatabaseItems, createPage } = usePageStore();
  const [properties, setProperties] = useState([]);
  const [allValues, setAllValues]   = useState({});
  const [localItems, setLocalItems] = useState([]); // local sorted copy for optimistic DnD
  const [views, setViews]           = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [density, setDensity]       = useState('comfortable'); // compact | comfortable | detailed

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
      setLocalItems(items);

      let activeViews = dbViews;
      if (activeViews.length === 0) {
        const def = await viewService.create({ databaseId, name: 'Board', viewType: 'kanban' });
        activeViews = [def];
      }
      setViews(activeViews);

      const preferred = activeViews.find(v => v.id === activeViewId) || activeViews.find(v => v.view_type === defaultView) || activeViews[0];
      setActiveViewId(preferred.id);

      // Batch fetch valores em paralelo
      const valMaps = await Promise.all(items.map(item => propertyService.fetchValues(item.id)));
      const combined = {};
      items.forEach((item, i) => {
        combined[item.id] = {};
        valMaps[i].forEach(v => { combined[item.id][v.property_id] = v.value; });
      });
      setAllValues(combined);
    } catch (e) {
      console.error('DatabaseRenderer load error:', e);
    } finally {
      setLoading(false);
    }
  }, [databaseId, fetchDatabaseItems, defaultView, activeViewId]);

  const refreshProperties = useCallback(async () => {
    try {
      const props = await propertyService.fetchByDatabase(databaseId);
      setProperties(props);
    } catch (e) { console.error(e); }
  }, [databaseId]);

  useEffect(() => { load(); }, [databaseId]); // Reload only when DB ID changes

  // ── Optimistic value update ──
  const handleValueChange = useCallback(async (pageId, propertyId, value) => {
    setAllValues(prev => ({
      ...prev,
      [pageId]: { ...(prev[pageId] || {}), [propertyId]: value },
    }));
    try { await propertyService.upsertValue(pageId, propertyId, value); }
    catch (e) { console.error(e); }
  }, []);

  // ── Status change (column move) ──
  const handleStatusChange = useCallback(async (itemId, statusPropId, newOptionId) => {
    const newValue = { selected: newOptionId };
    setAllValues(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [statusPropId]: newValue },
    }));
    try { await propertyService.upsertValue(itemId, statusPropId, newValue); }
    catch (e) { console.error(e); }
  }, []);

  // ── Position update (reorder within column) ──
  const handleReorderPersist = useCallback(async (orderedIds) => {
    const updates = orderedIds.map((id, index) =>
      pageService.update(id, { position: index }).catch(console.error)
    );
    await Promise.all(updates);
  }, []);

  const handleDelete = useCallback(async (itemId) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await usePageStore.getState().archivePage(itemId);
      setLocalItems(prev => prev.filter(i => i.id !== itemId));
    } catch (e) { console.error(e); }
  }, []);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const newItem = await createPage({ title: 'Nova Cena', parentId: databaseId, pageType: 'database_item', icon: '🎞️' });
      setLocalItems(prev => [...prev, newItem]);
      setAllValues(prev => ({ ...prev, [newItem.id]: {} }));
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  }, [createPage, databaseId]);

  const activeView = views.find(v => v.id === activeViewId);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-secondary/40 rounded w-64" />
      <div className="h-52 bg-secondary/20 rounded-xl" />
    </div>
  );

  const sharedProps = {
    items: localItems,
    properties,
    allValues,
    databaseId,
    onStatusChange: handleStatusChange,
    onValueChange: handleValueChange,
    onReorder: (newItems) => setLocalItems(newItems),
    onReorderPersist: handleReorderPersist,
    onDelete: handleDelete,
    density,
  };

  return (
    <DensityCtx.Provider value={density}>
      <div className="space-y-4">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

            {/* Density Switcher */}
            <div className="flex items-center bg-secondary/40 rounded-lg p-0.5 border border-border/50">
              {[
                { id: 'compact',     Icon: AlignJustify,  title: 'Compact' },
                { id: 'comfortable', Icon: LayoutGrid,     title: 'Comfortable' },
                { id: 'detailed',    Icon: LayoutList,     title: 'Detailed' },
              ].map(({ id, Icon, title }) => (
                <button key={id} onClick={() => setDensity(id)} title={title}
                  className={`p-1.5 rounded transition-all ${density === id ? 'bg-background shadow-sm border border-border/40 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </button>

            {/* Gerenciador de Propriedades */}
            <PropertyManagerModal 
              databaseId={databaseId} 
              properties={properties} 
              onUpdate={refreshProperties} 
            />

            <button onClick={handleCreate} disabled={creating}
              className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" />
              {creating ? '...' : 'Nova Cena'}
            </button>
          </div>
        </div>

        {/* ── View Content ── */}
        {activeView?.view_type === 'kanban'   && <KanbanView   {...sharedProps} />}
        {activeView?.view_type === 'table'    && <TableView    {...sharedProps} />}
        {activeView?.view_type === 'list'     && <ListView     {...sharedProps} />}
        {activeView?.view_type === 'calendar' && <CalendarView {...sharedProps} />}
      </div>
    </DensityCtx.Provider>
  );
}

// ============================================
// KANBAN VIEW — Fixed DnD persistence
// ============================================
function KanbanView({ items, properties, allValues, databaseId, onStatusChange, onReorder, onReorderPersist, density }) {
  const navigate = useNavigate();
  const groupProp = properties.find(p => p.property_type === 'status' || p.property_type === 'select');

  // Local columns with mutable items for optimistic DnD
  const [localAllValues, setLocalAllValues] = useState(allValues);
  useEffect(() => { setLocalAllValues(allValues); }, [allValues]);

  const columns = useMemo(() => {
    if (!groupProp) return [{ id: '__all', label: 'Todos', color: 'gray', items }];
    const opts = groupProp.config?.options || [];
    const cols = opts.map(opt => ({
      ...opt,
      items: items.filter(item => localAllValues[item.id]?.[groupProp.id]?.selected === opt.id),
    }));
    const unassigned = items.filter(item => !localAllValues[item.id]?.[groupProp.id]?.selected);
    if (unassigned.length) cols.unshift({ id: '__none', label: 'Sem Status', color: 'gray', items: unassigned });
    return cols;
  }, [items, groupProp, localAllValues]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const [activeItem, setActiveItem] = useState(null);
  const [overId, setOverId] = useState(null);

  // Find which column an item belongs to
  const findColumnOfItem = useCallback((itemId) => {
    return columns.find(col => col.items.some(i => i.id === itemId));
  }, [columns]);

  const handleDragStart = useCallback(({ active }) => {
    setActiveItem(items.find(i => i.id === active.id));
  }, [items]);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) { setOverId(null); return; }
    setOverId(over.id);
  }, []);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveItem(null);
    setOverId(null);
    if (!over || !groupProp) return;

    const activeId = active.id;
    const overId   = over.id;

    // Determine target column
    const isColumn = columns.some(c => c.id === overId);
    const targetCol = isColumn
      ? columns.find(c => c.id === overId)
      : findColumnOfItem(overId);

    if (!targetCol) return;

    const sourceCol = findColumnOfItem(activeId);
    const newStatusId = targetCol.id === '__none' ? '' : (targetCol.id === '__all' ? '' : targetCol.id);

    // --- Cross-column move: update status ---
    if (!sourceCol || sourceCol.id !== targetCol.id) {
      // Optimistic local update
      setLocalAllValues(prev => ({
        ...prev,
        [activeId]: { ...(prev[activeId] || {}), [groupProp.id]: { selected: newStatusId } },
      }));
      onStatusChange(activeId, groupProp.id, newStatusId);
      return;
    }

    // --- Same-column reorder ---
    if (!isColumn) {
      const colItems  = targetCol.items.map(i => i.id);
      const oldIndex  = colItems.indexOf(activeId);
      const newIndex  = colItems.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(colItems, oldIndex, newIndex);
        // Persist position
        onReorderPersist(reordered);
      }
    }
  }, [columns, groupProp, findColumnOfItem, onStatusChange, onReorderPersist]);

  // Column widths based on density
  const colWidth = density === 'compact' ? 'w-60' : density === 'detailed' ? 'w-96' : 'w-72';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-6 items-start -mx-1 px-1">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            colWidth={colWidth}
            properties={properties}
            allValues={localAllValues}
            navigate={navigate}
            density={density}
            isOver={overId === col.id}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeItem && (
          <EntityCardOverlay item={activeItem} properties={properties} values={localAllValues[activeItem.id] || {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ col, colWidth, properties, allValues, navigate, density, isOver }) {
  const { setNodeRef } = useDroppable({ id: col.id });
  const colorDot = COLOR_DOT[col.color] || COLOR_DOT.gray;

  return (
    <div
      ref={setNodeRef}
      className={`${colWidth} shrink-0 rounded-xl transition-all ${isOver ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${colorDot}`} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">{col.label}</span>
        <span className="text-[10px] text-muted-foreground/60 bg-secondary/60 px-1.5 py-0.5 rounded-full font-mono">{col.items.length}</span>
      </div>

      {/* Cards */}
      <SortableContext items={col.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[80px]">
          {col.items.map(item => (
            <SortableEntityCard
              key={item.id}
              item={item}
              properties={properties}
              values={allValues[item.id] || {}}
              onClick={() => navigate(`/page/${item.id}`)}
              density={density}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ============================================
// TABLE VIEW
// ============================================
function TableView({ items, properties, allValues, onValueChange, onDelete }) {
  const navigate = useNavigate();
  const visible = properties.filter(p => p.is_visible !== false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/30">
      <div className="grid gap-3 px-4 py-2.5 bg-card border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
        style={{ gridTemplateColumns: `minmax(200px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
        <div>Nome</div>
        {visible.map(p => <div key={p.id}>{p.name}</div>)}
        <div />
      </div>
      <div className="divide-y divide-border/40">
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
            Nenhuma cena ainda. Clique em "Nova Cena" para criar.
          </div>
        )}
        {items.map(item => (
          <div key={item.id}
            className="grid gap-3 px-4 py-2.5 items-center hover:bg-secondary/10 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: `minmax(200px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
            <div className="font-medium text-sm text-foreground truncate" onClick={() => navigate(`/page/${item.id}`)}>
              <span className="mr-2">{item.icon || '🎞️'}</span>
              {item.title || 'Untitled'}
            </div>
            {visible.map(prop => (
              <div key={prop.id} onClick={e => e.stopPropagation()}>
                <PropertyRenderer property={prop} value={allValues[item.id]?.[prop.id]}
                  onChange={v => onValueChange(item.id, prop.id, v)} inline />
              </div>
            ))}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-1 rounded hover:bg-secondary text-muted-foreground focus:outline-none">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="z-50 min-w-[120px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 p-1">
                    <DropdownMenu.Item
                      onSelect={() => onDelete(item.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
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
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const today = new Date();

  return (
    <div className="space-y-0.5">
      {items.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground/60">Nenhuma cena ainda.</div>
      )}
      {items.map(item => {
        const statusVal = statusProp ? allValues[item.id]?.[statusProp.id] : null;
        const opt = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
        const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : null;
        const deadline = deadlineProp ? allValues[item.id]?.[deadlineProp.id]?.date : null;
        const isOverdue = deadline && new Date(deadline) < today;
        return (
          <div key={item.id} onClick={() => navigate(`/page/${item.id}`)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors group">
            <span className="text-base">{item.icon || '🎞️'}</span>
            {colors ? <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} /> : <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />}
            <span className="text-sm text-foreground flex-1 truncate">{item.title}</span>
            {isOverdue && <span className="text-[10px] text-red-400 font-medium shrink-0">ATRASADA</span>}
            {opt && <span className={`text-[11px] px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{opt.label}</span>}
            {deadline && (
              <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-muted-foreground/50'}`}>
                {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// CALENDAR VIEW
// ============================================
function CalendarView({ items, properties, allValues }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(() => new Date());

  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const statusProp   = properties.find(p => p.name === 'Status');

  const year  = current.getFullYear();
  const month = current.getMonth();

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrent(new Date())} className="px-2.5 py-1 text-xs hover:bg-secondary rounded-md text-muted-foreground transition-colors">Hoje</button>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-card/60">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border/40 border-b border-border/40 last:border-b-0">
            {week.map((day, di) => {
              const inMonth  = day >= 1 && day <= daysInMonth;
              const dayItems = inMonth ? (itemsByDay[day] || []) : [];
              return (
                <div key={di} className={`min-h-[90px] p-1.5 transition-colors ${inMonth ? 'bg-background hover:bg-secondary/10' : 'bg-card/20'}`}>
                  {inMonth && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs font-medium ml-auto ${isToday(day) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
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
                        {dayItems.length > 3 && <div className="text-[10px] text-muted-foreground/60 px-1">+{dayItems.length - 3}</div>}
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
