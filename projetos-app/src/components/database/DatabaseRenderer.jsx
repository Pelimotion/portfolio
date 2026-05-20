import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { viewService } from '../../services/viewService';
import { savePreference, loadPreference } from '../../lib/viewPreferences';
import { DatabaseToolbar } from './DatabaseToolbar';
import { KanbanView }   from './views/KanbanView';
import { TableView }    from './views/TableView';
import { ListView }     from './views/ListView';
import { CalendarView } from './views/CalendarView';

// Density context — exported so EntityCard can consume it
const DensityCtx = createContext('comfortable');
export const useDensity = () => useContext(DensityCtx);

// ============================================
// DATABASE RENDERER v4 — Orchestrator
// ============================================
export function DatabaseRenderer({ databaseId, defaultView, addButtonLabel = 'Nova Cena', entityType = 'project' }) {
  const { pages = {}, fetchDatabaseItems, createPage } = usePageStore();
  const [properties,  setProperties]  = useState([]);
  const [allValues,   setAllValues]   = useState({});
  const [localItems,  setLocalItems]  = useState([]);
  const [views,       setViews]       = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [creating,    setCreating]    = useState(false);
  const [density,     setDensity]     = useState(() => loadPreference(databaseId, 'density', 'comfortable'));
  const [cardFields,  setCardFields]  = useState(() => {
    const saved = localStorage.getItem(`peli-card-fields-${databaseId}`);
    return saved ? JSON.parse(saved) : {};
  });

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
        { name: 'Kanban',    viewType: 'kanban' },
        { name: 'Tabela',    viewType: 'table' },
        { name: 'Lista',     viewType: 'list' },
        { name: 'Calendário', viewType: 'calendar' },
      ];
      for (const req of requiredViews) {
        if (!activeViews.some(v => v.view_type === req.viewType)) {
          const newView = await viewService.create({ databaseId, name: req.name, viewType: req.viewType });
          activeViews.push(newView);
        }
      }
      setViews(activeViews);

      const savedViewType = loadPreference(databaseId, 'activeViewType', null);
      const preferred = activeViews.find(v => v.id === activeViewId)
        || (savedViewType && activeViews.find(v => v.view_type === savedViewType))
        || activeViews.find(v => v.view_type === defaultView)
        || activeViews[0];
      setActiveViewId(preferred?.id);

      const valMaps  = await Promise.all((items || []).map(item => propertyService.fetchValues(item.id)));
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

  useEffect(() => { load(); }, [databaseId]);

  const handleValueChange = useCallback(async (pageId, propertyId, value) => {
    setAllValues(prev => ({ ...prev, [pageId]: { ...(prev[pageId] || {}), [propertyId]: value } }));
    try { await propertyService.upsertValue(pageId, propertyId, value); }
    catch (e) { console.error(e); }
  }, []);

  const handleStatusChange = useCallback(async (itemId, statusPropId, newOptionId) => {
    const newValue = { selected: newOptionId };
    setAllValues(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [statusPropId]: newValue } }));
    try { await propertyService.upsertValue(itemId, statusPropId, newValue); }
    catch (e) { console.error(e); }
  }, []);

  const handleReorderPersist = useCallback(async (orderedIds) => {
    await Promise.all(orderedIds.map((id, index) => pageService.update(id, { position: index }).catch(console.error)));
  }, []);

  const handleDelete = useCallback(async (itemId) => {
    try {
      await usePageStore.getState().archivePage(itemId);
      setLocalItems(prev => prev.filter(i => i.id !== itemId));
    } catch (e) { console.error(e); }
  }, []);

  const toggleCardField = (propId) => {
    setCardFields(prev => {
      const next = { ...prev, [propId]: !prev[propId] };
      localStorage.setItem(`peli-card-fields-${databaseId}`, JSON.stringify(next));
      return next;
    });
  };

  const handleViewChange = useCallback((viewId) => {
    setActiveViewId(viewId);
    const view = views.find(v => v.id === viewId);
    if (view) savePreference(databaseId, 'activeViewType', view.view_type);
  }, [views, databaseId]);

  const handleDensityChange = useCallback((d) => {
    setDensity(d);
    savePreference(databaseId, 'density', d);
  }, [databaseId]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const newItem = await createPage({ title: 'Nova Cena', parentId: databaseId, pageType: 'database_item', icon: null });
      setLocalItems(prev => [...prev, newItem]);
      setAllValues(prev => ({ ...prev, [newItem.id]: {} }));
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  }, [createPage, databaseId]);

  const handleCreateWithStatus = useCallback(async (statusPropId, statusOptionId) => {
    setCreating(true);
    try {
      const newItem = await createPage({ title: 'Nova Cena', parentId: databaseId, pageType: 'database_item', icon: null });
      setLocalItems(prev => [...prev, newItem]);
      const initialValue = statusOptionId && statusOptionId !== '__all' && statusOptionId !== '__none'
        ? { selected: statusOptionId }
        : {};
      setAllValues(prev => ({ ...prev, [newItem.id]: { [statusPropId]: initialValue } }));
      if (initialValue.selected) {
        await propertyService.upsertValue(newItem.id, statusPropId, initialValue);
      }
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
    onStatusChange:  handleStatusChange,
    onValueChange:   handleValueChange,
    onReorder:       (newItems) => setLocalItems(newItems),
    onReorderPersist: handleReorderPersist,
    onDelete:        handleDelete,
    onCreateWithStatus: handleCreateWithStatus,
    onPropertyUpdate: (propertyId, newProperty) => setProperties(prev => prev.map(p => p.id === propertyId ? newProperty : p)),
    density,
    cardFields,
    entityType,
  };

  return (
    <DensityCtx.Provider value={density}>
      <div className="space-y-4">
        <DatabaseToolbar
          database={database}
          views={views}
          activeViewId={activeViewId}
          onViewChange={handleViewChange}
          density={density}
          onDensityChange={handleDensityChange}
          properties={properties}
          cardFields={cardFields}
          onToggleCardField={toggleCardField}
          databaseId={databaseId}
          onRefreshProperties={refreshProperties}
          onAdd={handleCreate}
          adding={creating}
          addButtonLabel={addButtonLabel}
        />
        {activeView?.view_type === 'kanban'   && <KanbanView   {...sharedProps} activeView={activeView} />}
        {activeView?.view_type === 'table'    && <TableView    {...sharedProps} />}
        {activeView?.view_type === 'list'     && <ListView     {...sharedProps} />}
        {activeView?.view_type === 'calendar' && <CalendarView {...sharedProps} />}
      </div>
    </DensityCtx.Provider>
  );
}
