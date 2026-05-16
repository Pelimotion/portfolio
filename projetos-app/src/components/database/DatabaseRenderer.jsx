import React, { useEffect, useState, useMemo, useCallback, memo, createContext, useContext } from 'react';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { viewService } from '../../services/viewService';
import { SortableEntityCard, EntityCardOverlay } from './EntityCard';
import { PropertyRenderer } from '../properties/PropertyRenderer';
import { COLOR_MAP } from '../../core/colors';
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

      let activeViews = [...(dbViews || [])];
      const requiredViews = [
        { name: 'Kanban', viewType: 'kanban' },
        { name: 'Tabela', viewType: 'table' },
        { name: 'Lista', viewType: 'list' },
        { name: 'Calendário', viewType: 'calendar' }
      ];
      
      let viewsChanged = false;
      for (const req of requiredViews) {
        if (!activeViews.some(v => v.view_type === req.viewType)) {
          const newView = await viewService.create({ databaseId, name: req.name, viewType: req.viewType });
          activeViews.push(newView);
          viewsChanged = true;
        }
      }
      setViews(activeViews);

      const preferred = activeViews.find(v => v.id === activeViewId) || activeViews.find(v => v.view_type === defaultView) || activeViews[0];
      setActiveViewId(preferred?.id);

      // Batch fetch valores em paralelo
      const valMaps = await Promise.all((items || []).map(item => propertyService.fetchValues(item.id)));
      const combined = {};
      (items || []).forEach((item, i) => {
        combined[item.id] = {};
        (valMaps[i] || []).forEach(v => { combined[item.id][v.property_id] = v.value; });
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
      const newItem = await createPage({ title: 'Nova Cena', parentId: databaseId, pageType: 'database_item', icon: null });
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
    onCreateWithStatus: async (statusPropId, statusOptionId) => {
      setCreating(true);
      try {
        const newItem = await createPage({ title: 'Nova Cena', parentId: databaseId, pageType: 'database_item', icon: null });
        setLocalItems(prev => [...prev, newItem]);
        const initialValue = statusOptionId && statusOptionId !== '__all' && statusOptionId !== '__none' 
          ? { selected: statusOptionId } 
          : {};
        
        setAllValues(prev => ({ 
          ...prev, 
          [newItem.id]: { [statusPropId]: initialValue } 
        }));
        
        if (initialValue.selected) {
          await propertyService.upsertValue(newItem.id, statusPropId, initialValue);
        }
      } catch (e) { console.error(e); }
      finally { setCreating(false); }
    },
    onPropertyUpdate: (propertyId, newProperty) => {
      setProperties(prev => prev.map(p => p.id === propertyId ? newProperty : p));
    },
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
function KanbanView({ items, properties, allValues, databaseId, onStatusChange, onReorder, onReorderPersist, onCreateWithStatus, onPropertyUpdate, density }) {
  const navigate = useNavigate();
  const groupProp = properties.find(p => p.property_type === 'status' || p.property_type === 'select');

  // Local columns with mutable items for optimistic DnD
  const [localAllValues, setLocalAllValues] = useState(allValues);
  useEffect(() => { setLocalAllValues(allValues); }, [allValues]);

  // Column order state for reordering
  const [colOrder, setColOrder] = useState(null);

  const baseColumns = useMemo(() => {
    if (!groupProp) return [{ id: '__all', label: 'Todos', color: 'gray', items }];
    const opts = groupProp.config?.options || [];
    const cols = opts.map(opt => ({
      ...opt,
      items: (items || []).filter(item => (localAllValues || {})[item.id]?.[groupProp.id]?.selected === opt.id),
    }));
    const unassigned = (items || []).filter(item => !(localAllValues || {})[item.id]?.[groupProp.id]?.selected);
    if (unassigned.length) cols.unshift({ id: '__none', label: 'Sem Status', color: 'gray', items: unassigned });
    return cols;
  }, [items, groupProp, localAllValues]);

  const columns = useMemo(() => {
    if (!colOrder) return baseColumns;
    const ordered = [];
    for (const id of colOrder) {
      const col = baseColumns.find(c => c.id === id);
      if (col) ordered.push(col);
    }
    // add any new columns not in order yet
    for (const col of baseColumns) {
      if (!ordered.find(c => c.id === col.id)) ordered.push(col);
    }
    return ordered;
  }, [baseColumns, colOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const [activeItem, setActiveItem] = useState(null);
  const [activeColId, setActiveColId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [isDraggingCol, setIsDraggingCol] = useState(false);

  const findColumnOfItem = useCallback((itemId) => {
    return columns.find(col => col.items.some(i => i.id === itemId));
  }, [columns]);

  const handleDragStart = useCallback(({ active }) => {
    // Is it a column drag?
    if (columns.some(c => c.id === active.id)) {
      setActiveColId(active.id);
      setIsDraggingCol(true);
    } else {
      setActiveItem(items.find(i => i.id === active.id));
      setIsDraggingCol(false);
    }
  }, [items, columns]);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) { setOverId(null); return; }
    setOverId(over.id);
  }, []);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveItem(null);
    setActiveColId(null);
    setIsDraggingCol(false);
    setOverId(null);
    if (!over) return;

    const activeId = active.id;
    const overId   = over.id;

    // Column reorder
    if (isDraggingCol || columns.some(c => c.id === activeId)) {
      const oldIndex = columns.findIndex(c => c.id === activeId);
      const newIndex = columns.findIndex(c => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedIds = arrayMove(columns.map(c => c.id), oldIndex, newIndex);
        setColOrder(reorderedIds);
        
        // Persist to DB if it's a configurable property
        if (groupProp && groupProp.config && groupProp.config.options) {
          const newOptions = [];
          for (const id of reorderedIds) {
            const opt = groupProp.config.options.find(o => o.id === id);
            if (opt) newOptions.push(opt);
          }
          // add back any options that might have been filtered out (unlikely but safe)
          for (const opt of groupProp.config.options) {
            if (!newOptions.find(o => o.id === opt.id)) newOptions.push(opt);
          }
          const updatedProp = { ...groupProp, config: { ...groupProp.config, options: newOptions } };
          onPropertyUpdate?.(groupProp.id, updatedProp);
          
          propertyService.update(groupProp.id, { 
            config: updatedProp.config
          }).catch(console.error);
        }
      }
      return;
    }

    if (!groupProp) return;

    // Determine target column
    const isColumn = columns.some(c => c.id === overId);
    const targetCol = isColumn
      ? columns.find(c => c.id === overId)
      : findColumnOfItem(overId);

    if (!targetCol) return;

    const sourceCol = findColumnOfItem(activeId);
    const newStatusId = targetCol.id === '__none' ? '' : (targetCol.id === '__all' ? '' : targetCol.id);

    if (!sourceCol || sourceCol.id !== targetCol.id) {
      setLocalAllValues(prev => ({
        ...prev,
        [activeId]: { ...(prev[activeId] || {}), [groupProp.id]: { selected: newStatusId } },
      }));
      onStatusChange(activeId, groupProp.id, newStatusId);
      return;
    }

    if (!isColumn) {
      const colItems  = targetCol.items.map(i => i.id);
      const oldIndex  = colItems.indexOf(activeId);
      const newIndex  = colItems.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(colItems, oldIndex, newIndex);
        onReorderPersist(reordered);
      }
    }
  }, [columns, groupProp, findColumnOfItem, onStatusChange, onReorderPersist, isDraggingCol]);

  const colWidth = density === 'compact' ? 'w-60' : density === 'detailed' ? 'w-96' : 'w-72';
  const activeCol = activeColId ? columns.find(c => c.id === activeColId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
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
              onAdd={() => onCreateWithStatus(groupProp?.id, col.id)}
            />
          ))}
          {groupProp && (
            <button 
              onClick={async () => {
                const newLabel = prompt("Nome da nova etapa:");
                if (!newLabel) return;
                try {
                  const opts = groupProp.config?.options || [];
                  const newOpts = [...opts, { id: `opt_${Date.now()}`, label: newLabel, color: 'gray' }];
                  await propertyService.update(groupProp.id, { config: { ...groupProp.config, options: newOpts } });
                  // Trigger reload (assuming parent will reload on update or we just reload window for simplicity, but ideally we have an onUpdate callback)
                  window.location.reload();
                } catch(e) { console.error(e); }
              }}
              className={`${colWidth} shrink-0 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all h-[42px] mt-0`}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Nova Etapa</span>
            </button>
          )}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeItem && (
          <EntityCardOverlay item={activeItem} properties={properties} values={localAllValues[activeItem.id] || {}} />
        )}
        {activeCol && (
          <div className={`${colWidth} shrink-0 rounded-xl bg-[var(--surface-2)] border-2 border-primary/30 opacity-80 p-3`}>
            <span className="text-xs font-bold text-muted-foreground">{activeCol.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
function KanbanColumn({ col, colWidth, properties, allValues, navigate, density, isOver, onAdd }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: col.id });
  const colorDot = COLOR_DOT[col.color] || COLOR_DOT.gray;
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${colWidth} shrink-0 rounded-xl transition-all ${isOver ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}
    >
      {/* Column Header — draggable */}
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col gap-1 px-2 py-2 mb-2 group/header cursor-grab active:cursor-grabbing rounded-lg hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.08em] flex-1">{col.label}</span>
          <span className="text-[10px] text-muted-foreground/40 bg-secondary/30 px-1.5 py-0.5 rounded-md font-mono font-bold">{col.items.length}</span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-all">
            <button onClick={onAdd} className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors" title="Nova Cena">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dates Row */}
        {col.id !== '__all' && col.id !== '__none' && (
          <div 
            onClick={(e) => {
               // To avoid dragging when clicking
               e.stopPropagation();
               const novoInicio = prompt("Data de Início (YYYY-MM-DD):", col.startDate || "");
               if (novoInicio === null) return;
               const novaEntrega = prompt("Data Final (YYYY-MM-DD):", col.deadline || "");
               if (novaEntrega === null) return;
               
               const newOpts = groupProp.config.options.map(o => 
                 o.id === col.id ? { ...o, startDate: novoInicio, deadline: novaEntrega } : o
               );
               propertyService.update(groupProp.id, { config: { ...groupProp.config, options: newOpts } })
                 .then(() => window.location.reload())
                 .catch(console.error);
            }}
            className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider mt-0.5 cursor-pointer hover:text-primary transition-colors"
          >
            <CalendarDays className="w-3 h-3 opacity-50" />
            {(col.startDate || col.deadline) ? (
              <span>
                {col.startDate ? new Date(col.startDate + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '?'} 
                {' - '} 
                {col.deadline ? new Date(col.deadline + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '?'}
              </span>
            ) : (
              <span className="opacity-60 border-b border-dashed border-muted-foreground/40">+ Definir Prazo</span>
            )}
          </div>
        )}
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
        {(items || []).length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
            Nenhuma cena ainda. Clique em "Nova Cena" para criar.
          </div>
        )}
        {(items || []).map(item => (
          <div key={item.id}
            className="grid gap-3 px-4 py-2.5 items-center hover:bg-secondary/10 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: `minmax(200px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
            <div className="font-medium text-sm text-foreground truncate" onClick={() => navigate(`/page/${item.id}`)}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.title || 'Untitled'}
            </div>
            {visible.map(prop => (
              <div key={prop.id} onClick={e => e.stopPropagation()}>
                <PropertyRenderer property={prop} value={(allValues || {})[item.id]?.[prop.id]}
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
      {(items || []).length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground/60">Nenhuma cena ainda.</div>
      )}
      {(items || []).map(item => {
        const statusVal = statusProp ? (allValues || {})[item.id]?.[statusProp.id] : null;
        const opt = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
        const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : null;
        const deadline = deadlineProp ? (allValues || {})[item.id]?.[deadlineProp.id]?.date : null;
        const isOverdue = deadline && new Date(deadline) < today;
        return (
          <div key={item.id} onClick={() => navigate(`/page/${item.id}`)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors group">
            {item.icon && <span className="text-base">{item.icon}</span>}
            {/* list view dot removed */}
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
// CALENDAR VIEW — Sophisticated Modern Calendar
// ============================================
function CalendarView({ items, properties, allValues, databaseId }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(() => new Date());
  
  // Global context for when we are inside a project
  const [globalItems, setGlobalItems] = useState([]);
  const [globalValues, setGlobalValues] = useState({});
  const [globalProps, setGlobalProps] = useState([]);

  useEffect(() => {
    const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';
    if (databaseId !== ROOT_HUB_ID) {
      async function loadGlobal() {
        try {
          const [projs, props, valsArr] = await Promise.all([
            import('../../services/pageService').then(m => m.pageService.fetchDatabaseItems(ROOT_HUB_ID)),
            import('../../services/propertyService').then(m => m.propertyService.fetchByDatabase(ROOT_HUB_ID)),
            import('../../services/propertyService').then(m => m.propertyService.fetchAllValues(ROOT_HUB_ID))
          ]);
          const vMap = {};
          for (const v of valsArr) {
            if (!vMap[v.page_id]) vMap[v.page_id] = {};
            vMap[v.page_id][v.property_id] = { date: v.value?.date, selected: v.value?.selected }; // simplified for calendar
          }
          setGlobalItems(projs || []);
          setGlobalProps(props || []);
          setGlobalValues(vMap);
        } catch(e) { console.error('Failed to load global calendar context', e); }
      }
      loadGlobal();
    }
  }, [databaseId]);

  // Local properties
  const deadlineProp = properties.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const statusProp   = properties.find(p => p.property_type === 'status' || p.name === 'Status');
  
  // Global properties
  const globalDeadlineProp = globalProps.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const globalStatusProp   = globalProps.find(p => p.property_type === 'status' || p.name === 'Status');

  const year  = current.getFullYear();
  const month = current.getMonth();

  const itemsByDay = useMemo(() => {
    const map = {};
    
    // Process scene/project deadlines
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

    // Process status milestones
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
    
    // Process GLOBAL projects (if inside a sub-project)
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
  }, [items, allValues, deadlineProp, statusProp, year, month]);

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
    // Generate ISO without dashes or colons
    const start = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(dateObj.getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, ''); // 1 hour event
    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
    if (includeMeet) {
      // Small trick: setting ctz and a meet placeholder (actual auto-meet generation requires GCal API, but this opens the event creation page where user can click "Add Video Conferencing")
      url += `&add=meet`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-[var(--surface-1)] border border-border/50 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-foreground capitalize tracking-tight">
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
                          const isGlobal = itemWrap.isGlobal;
                          const opacityClass = isGlobal ? 'opacity-40 hover:opacity-80' : 'opacity-100';
                          
                          if (itemWrap.type === 'milestone') {
                            const opt = itemWrap.data;
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
                                            import('../../services/propertyService').then(m => m.propertyService.update(statusProp.id, { config: { ...statusProp.config, options: newOpts } }))
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
                            const item = itemWrap.data;
                            const statusVal = isGlobal ? globalValues[item.id]?.[globalStatusProp?.id] : (statusProp ? allValues[item.id]?.[statusProp.id] : null);
                            const activeStatusProp = isGlobal ? globalStatusProp : statusProp;
                            const opt = activeStatusProp?.config?.options?.find(o => o.id === statusVal?.selected);
                            const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : COLOR_MAP.gray;
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
                                            import('../../services/propertyService').then(m => m.propertyService.upsertValue(item.id, deadlineProp.id, { date: dt }))
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
