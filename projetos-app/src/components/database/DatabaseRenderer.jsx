import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { viewService } from '../../services/viewService';
import { PropertyRenderer } from '../properties/PropertyRenderer';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Table,
  GalleryHorizontalEnd,
  List,
  Plus,
  Filter,
  Settings2,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react';

// ============================================
// DATABASE RENDERER — Switch de views
// Renderiza Kanban, Table, Gallery ou List
// ============================================

export function DatabaseRenderer({ databaseId }) {
  const { pages, fetchDatabaseItems } = usePageStore();
  const [properties, setProperties] = useState([]);
  const [allValues, setAllValues] = useState({});
  const [views, setViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [loading, setLoading] = useState(true);

  const database = pages[databaseId];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [items, props, dbViews] = await Promise.all([
          fetchDatabaseItems(databaseId),
          propertyService.fetchByDatabase(databaseId),
          viewService.fetchByDatabase(databaseId),
        ]);
        setProperties(props);

        // Criar view default se não existe
        if (dbViews.length === 0) {
          const defaultView = await viewService.create({
            databaseId,
            name: 'Default',
            viewType: 'kanban',
          });
          setViews([defaultView]);
          setActiveViewId(defaultView.id);
        } else {
          setViews(dbViews);
          setActiveViewId(dbViews[0].id);
        }

        // Batch fetch values
        const valuesMap = {};
        for (const item of items) {
          const vals = await propertyService.fetchValues(item.id);
          valuesMap[item.id] = {};
          for (const v of vals) valuesMap[item.id][v.property_id] = v.value;
        }
        setAllValues(valuesMap);
      } catch (e) {
        console.error('DatabaseRenderer load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [databaseId, fetchDatabaseItems]);

  const activeView = views.find((v) => v.id === activeViewId);
  const items = usePageStore.getState().getChildren(databaseId);

  const VIEW_ICONS = {
    kanban: LayoutDashboard,
    table: Table,
    gallery: GalleryHorizontalEnd,
    list: List,
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-secondary/50 rounded w-48" />
        <div className="h-64 bg-secondary/30 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Database Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {database?.title || 'Database'}
        </h2>
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center bg-secondary/50 rounded-md p-0.5 border border-border">
            {views.map((view) => {
              const Icon = VIEW_ICONS[view.view_type] || LayoutDashboard;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveViewId(view.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                    activeViewId === view.id
                      ? 'bg-background shadow-sm border border-border/50 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {view.name}
                </button>
              );
            })}
          </div>

          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Properties
          </button>
          <NewItemButton databaseId={databaseId} />
        </div>
      </div>

      {/* View Content */}
      {activeView?.view_type === 'kanban' && (
        <KanbanView
          items={items}
          properties={properties}
          allValues={allValues}
          view={activeView}
          databaseId={databaseId}
        />
      )}
      {activeView?.view_type === 'table' && (
        <TableView
          items={items}
          properties={properties}
          allValues={allValues}
        />
      )}
      {(!activeView || activeView?.view_type === 'list') && (
        <ListView items={items} />
      )}
    </div>
  );
}

// ---- NEW ITEM BUTTON ----
function NewItemButton({ databaseId }) {
  const { createPage } = usePageStore();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createPage({
        title: 'Untitled',
        parentId: databaseId,
        pageType: 'database_item',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={creating}
      className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
    >
      <Plus className="w-3.5 h-3.5" />
      {creating ? 'Creating...' : 'New'}
    </button>
  );
}

// ============================================
// KANBAN VIEW — Colunas dinâmicas
// ============================================
function KanbanView({ items, properties, allValues, view, databaseId }) {
  const navigate = useNavigate();
  const { updatePage } = usePageStore();

  // Descobrir a propriedade de agrupamento (status ou select)
  const groupProp = properties.find(
    (p) => p.property_type === 'status' || p.property_type === 'select'
  );

  // Gerar colunas a partir das options da propriedade
  const columns = useMemo(() => {
    if (!groupProp) {
      return [{ id: '__all', label: 'All', color: 'gray', items }];
    }
    const options = groupProp.config?.options || [];
    const cols = options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      color: opt.color || 'gray',
      items: items.filter((item) => {
        const val = allValues[item.id]?.[groupProp.id];
        return val?.selected === opt.id;
      }),
    }));
    // Coluna para items sem status
    const unassigned = items.filter((item) => {
      const val = allValues[item.id]?.[groupProp.id];
      return !val?.selected;
    });
    if (unassigned.length > 0) {
      cols.unshift({ id: '__none', label: 'No Status', color: 'gray', items: unassigned });
    }
    return cols;
  }, [items, groupProp, allValues]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [activeItem, setActiveItem] = useState(null);

  const handleDragStart = (event) => {
    const item = items.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  };

  const handleDragEnd = async (event) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || !groupProp) return;

    const overId = over.id;
    // Verificar se foi solto em uma coluna
    const targetCol = columns.find((c) => c.id === overId);
    if (targetCol && targetCol.id !== '__all') {
      const newValue = targetCol.id === '__none' ? { selected: '' } : { selected: targetCol.id };
      try {
        await propertyService.upsertValue(active.id, groupProp.id, newValue);
        // Refresh
        usePageStore.getState().fetchDatabaseItems(databaseId);
      } catch (e) {
        console.error('DnD update error:', e);
      }
    }
  };

  const colorMap = {
    gray: 'bg-secondary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-4 items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} colorMap={colorMap} navigate={navigate} />
        ))}
        <DragOverlay>
          {activeItem && <KanbanCard item={activeItem} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({ column, colorMap, navigate }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${colorMap[column.color] || colorMap.gray}`} />
        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {column.label}
        </span>
        <span className="text-xs text-muted-foreground bg-secondary px-1.5 rounded-full ml-1">
          {column.items.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[100px]">
        <SortableContext items={column.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {column.items.map((item) => (
            <SortableKanbanCard key={item.id} item={item} onClick={() => navigate(`/page/${item.id}`)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableKanbanCard({ item, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 shadow-sm cursor-pointer hover:border-muted-foreground/50 transition-colors"
    >
      <h4 className="font-medium text-sm text-card-foreground truncate">{item.title}</h4>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shrink-0" />
        <span className="truncate">{item.assigned_to || 'Unassigned'}</span>
      </div>
    </div>
  );
}

const KanbanCard = memo(({ item }) => (
  <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
    <h4 className="font-medium text-sm text-card-foreground">{item.title}</h4>
  </div>
));

// ============================================
// TABLE VIEW — Colunas dinâmicas
// ============================================
function TableView({ items, properties, allValues }) {
  const navigate = useNavigate();
  const visibleProps = properties.filter((p) => p.is_visible);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      {/* Header */}
      <div
        className="grid gap-4 p-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-card"
        style={{ gridTemplateColumns: `2fr ${visibleProps.map(() => '1fr').join(' ')} auto` }}
      >
        <div>Title</div>
        {visibleProps.map((p) => (
          <div key={p.id}>{p.name}</div>
        ))}
        <div className="w-8" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/50">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/page/${item.id}`)}
            className="grid gap-4 p-3 items-center hover:bg-secondary/20 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: `2fr ${visibleProps.map(() => '1fr').join(' ')} auto` }}
          >
            <div className="font-medium text-sm text-foreground truncate">{item.title}</div>
            {visibleProps.map((prop) => (
              <div key={prop.id} onClick={(e) => e.stopPropagation()}>
                <PropertyRenderer
                  property={prop}
                  value={allValues[item.id]?.[prop.id]}
                  onChange={() => {}}
                  inline
                />
              </div>
            ))}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-secondary rounded text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// LIST VIEW — Compacta
// ============================================
function ListView({ items }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(`/page/${item.id}`)}
          className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/20 rounded-md cursor-pointer transition-colors group"
        >
          <span className="text-sm text-foreground">{item.title}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
