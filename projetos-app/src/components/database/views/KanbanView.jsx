import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import { SortableEntityCard, EntityCardOverlay } from '../EntityCard';
import { propertyService } from '../../../services/propertyService';
import { ProCalendarPicker } from '../../ui/calendar/ProCalendarPicker';

const COLOR_DOT = { gray:'bg-muted-foreground/50',blue:'bg-blue-500',green:'bg-green-500',yellow:'bg-yellow-500',red:'bg-red-500',purple:'bg-purple-500',orange:'bg-orange-500',pink:'bg-pink-500',cyan:'bg-cyan-500' };

export function KanbanView({ items, properties, allValues, databaseId, onStatusChange, onReorder, onReorderPersist, onCreateWithStatus, onPropertyUpdate, onDelete, density, activeView, cardFields, entityType }) {
  const navigate = useNavigate();
  const [groupPropId, setGroupPropId] = useState(null);

  const statusProps = useMemo(() => properties.filter(p => p.property_type === 'status' || p.property_type === 'select'), [properties]);

  const groupProp = useMemo(() => {
    if (groupPropId) return properties.find(p => p.id === groupPropId);
    return statusProps[0];
  }, [properties, statusProps, groupPropId]);

  const [localAllValues, setLocalAllValues] = useState(allValues);
  useEffect(() => { setLocalAllValues(allValues); }, [allValues]);

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
    if (columns.some(c => c.id === active.id)) {
      setActiveColId(active.id);
      setIsDraggingCol(true);
    } else {
      setActiveItem(items.find(i => i.id === active.id));
      setIsDraggingCol(false);
    }
  }, [items, columns]);

  const handleDragOver = useCallback(({ over }) => {
    setOverId(over ? over.id : null);
  }, []);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveItem(null);
    setActiveColId(null);
    setIsDraggingCol(false);
    setOverId(null);
    if (!over) return;

    const activeId = active.id;
    const overId   = over.id;

    if (isDraggingCol || columns.some(c => c.id === activeId)) {
      const oldIndex = columns.findIndex(c => c.id === activeId);
      const newIndex = columns.findIndex(c => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedIds = arrayMove(columns.map(c => c.id), oldIndex, newIndex);
        setColOrder(reorderedIds);
        if (groupProp?.config?.options) {
          const newOptions = [];
          for (const id of reorderedIds) {
            const opt = groupProp.config.options.find(o => o.id === id);
            if (opt) newOptions.push(opt);
          }
          for (const opt of groupProp.config.options) {
            if (!newOptions.find(o => o.id === opt.id)) newOptions.push(opt);
          }
          const updatedProp = { ...groupProp, config: { ...groupProp.config, options: newOptions } };
          onPropertyUpdate?.(groupProp.id, updatedProp);
          propertyService.update(groupProp.id, { config: updatedProp.config }).catch(console.error);
        }
      }
      return;
    }

    if (!groupProp) return;

    const isColumn  = columns.some(c => c.id === overId);
    const targetCol = isColumn ? columns.find(c => c.id === overId) : findColumnOfItem(overId);
    if (!targetCol) return;

    const sourceCol    = findColumnOfItem(activeId);
    const newStatusId  = (targetCol.id === '__none' || targetCol.id === '__all') ? '' : targetCol.id;

    if (!sourceCol || sourceCol.id !== targetCol.id) {
      setLocalAllValues(prev => {
        const itemValues = { ...(prev[activeId] || {}), [groupProp.id]: { selected: newStatusId } };
        const doneProp = properties.find(p => p.property_type === 'checkbox' && (p.name.toLowerCase() === 'feito' || p.name.toLowerCase() === 'concluído'));
        if (doneProp) {
          itemValues[doneProp.id] = { checked: false };
          propertyService.upsertValue(activeId, doneProp.id, { checked: false }).catch(console.error);
        }
        return { ...prev, [activeId]: itemValues };
      });
      onStatusChange(activeId, groupProp.id, newStatusId);
      return;
    }

    if (!isColumn) {
      const colItems  = targetCol.items.map(i => i.id);
      const oldIndex  = colItems.indexOf(activeId);
      const newIndex  = colItems.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onReorderPersist(arrayMove(colItems, oldIndex, newIndex));
      }
    }
  }, [columns, groupProp, findColumnOfItem, onStatusChange, onReorderPersist, isDraggingCol, properties]);

  const colWidth  = density === 'compact' ? 'w-60' : density === 'detailed' ? 'w-96' : 'w-72';
  const activeCol = activeColId ? columns.find(c => c.id === activeColId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center gap-4 mb-4 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg border border-border/40 shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agrupar por:</span>
          <select
            value={groupProp?.id || ''}
            onChange={(e) => setGroupPropId(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
          >
            {statusProps.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

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
              groupProp={groupProp}
              onPropertyUpdate={onPropertyUpdate}
              onDelete={onDelete}
              cardFields={cardFields}
              entityType={entityType}
            />
          ))}
          {groupProp && (
            <button
              onClick={async () => {
                const newLabel = prompt("Nome da nova etapa:");
                if (!newLabel) return;
                try {
                  const opts    = groupProp.config?.options || [];
                  const newOpts = [...opts, { id: `opt_${Date.now()}`, label: newLabel, color: 'gray' }];
                  await propertyService.update(groupProp.id, { config: { ...groupProp.config, options: newOpts } });
                  window.location.reload();
                } catch (e) { console.error(e); }
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
          <EntityCardOverlay
            item={activeItem}
            properties={properties}
            values={localAllValues[activeItem.id] || {}}
            onPropertyUpdate={onPropertyUpdate}
            density={density}
            cardFields={cardFields}
            entityType={entityType}
          />
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

function KanbanColumn({ col, colWidth, properties, allValues, navigate, density, isOver, onAdd, groupProp, onPropertyUpdate, onDelete, cardFields, entityType }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: col.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setDatePickerOpen(false);
    }
    if (datePickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [datePickerOpen]);

  const handleSetDate = (field, dateStr) => {
    const onlyDate  = dateStr.split('T')[0];
    const newOpts   = groupProp.config.options.map(o => o.id === col.id ? { ...o, [field]: onlyDate } : o);
    const updatedProp = { ...groupProp, config: { ...groupProp.config, options: newOpts } };
    onPropertyUpdate?.(groupProp.id, updatedProp);
    propertyService.update(groupProp.id, { config: updatedProp.config }).catch(console.error);
  };

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
          <input
            defaultValue={col.label}
            onKeyDown={async (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            onBlur={async (e) => {
              const newLabel = e.target.value;
              if (newLabel && newLabel !== col.label) {
                try {
                  const opts    = groupProp.config?.options || [];
                  const newOpts = opts.map(o => o.id === col.id ? { ...o, label: newLabel } : o);
                  const updatedProp = { ...groupProp, config: { ...groupProp.config, options: newOpts } };
                  onPropertyUpdate?.(groupProp.id, updatedProp);
                  await propertyService.update(groupProp.id, { config: updatedProp.config });
                } catch (e) { console.error(e); }
              }
            }}
            className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.08em] flex-1 bg-transparent border-none focus:outline-none focus:bg-[var(--surface-3)] px-1 rounded transition-colors cursor-text"
          />
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${col.items.length > 10 ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground/40 bg-secondary/30'}`}>
            {col.items.length}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-all">
            <button onClick={onAdd} className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors" title="Nova Cena">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {col.id !== '__all' && col.id !== '__none' && (
          <div className="relative" ref={containerRef}>
            <div
              onClick={(e) => { e.stopPropagation(); setDatePickerOpen(!datePickerOpen); }}
              className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider mt-0.5 cursor-pointer hover:text-primary transition-colors"
            >
              <CalendarDays className="w-3 h-3 opacity-50" />
              {(col.startDate || col.deadline) ? (
                <span>
                  {col.startDate ? new Date(col.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '?'}
                  {' - '}
                  {col.deadline ? new Date(col.deadline + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '?'}
                </span>
              ) : (
                <span className="opacity-60 border-b border-dashed border-muted-foreground/40">+ Definir Prazo</span>
              )}
            </div>

            {datePickerOpen && (
              <div
                className="absolute top-full left-0 mt-2 z-50 flex gap-2 bg-card border border-border shadow-2xl rounded-2xl p-3 animate-in fade-in zoom-in-95"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Início da Etapa</span>
                  <ProCalendarPicker value={col.startDate ? col.startDate + 'T12:00:00Z' : null} onChange={d => handleSetDate('startDate', d)} />
                </div>
                <div className="w-[1px] bg-border/50 mx-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Entrega (Final)</span>
                  <ProCalendarPicker value={col.deadline ? col.deadline + 'T12:00:00Z' : null} onChange={d => handleSetDate('deadline', d)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={col.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[150px] pb-10 pt-1">
          {col.items.length === 0 && (
            <p className="text-sm text-muted-foreground/40 px-3 py-2 italic">Sem cards</p>
          )}
          {col.items.map(item => (
            <SortableEntityCard
              key={item.id}
              item={item}
              properties={properties}
              values={allValues[item.id] || {}}
              onClick={() => navigate(`/page/${item.id}`)}
              onDelete={onDelete}
              onPropertyUpdate={onPropertyUpdate}
              density={density}
              cardFields={cardFields}
              entityType={entityType}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
