import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { parseISO, isValid } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { CalendarHeader } from '../../calendar/CalendarHeader';
import { CalendarKbd } from '../../calendar/CalendarKbd';
import { MonthView } from '../../calendar/MonthView';
import { WeekView } from '../../calendar/WeekView';
import { DayView } from '../../calendar/DayView';
import { AgendaView } from '../../calendar/AgendaView';
import { StageEditor } from '../../project/StageEditor';
import { PipelineLegend } from '../../calendar/PipelineLegend';
import { buildEvents, buildProjectEvents, buildPipelineEvents, navigate as navDate } from '../../calendar/calendarUtils';
import { supabase } from '../../../lib/supabase';
import { ROOT_HUB_ID } from '../../../core/schemas';
import { pageService } from '../../../services/pageService';
import { propertyService } from '../../../services/propertyService';

export function CalendarView({ items, properties, allValues, databaseId, onValueChange }) {
  const [view, setView] = useState('month');
  const [current, setCurrent] = useState(() => new Date());
  const [filterMode, setFilterMode] = useState('all');

  const [globalItems,  setGlobalItems]  = useState([]);
  const [globalValues, setGlobalValues] = useState({});
  const [globalProps,  setGlobalProps]  = useState([]);
  const [hiddenProjects, setHiddenProjects] = useState(new Set());

  // project page data (for stages)
  const [projectPage, setProjectPage] = useState(null);
  const isRoot = databaseId === ROOT_HUB_ID;

  useEffect(() => {
    if (isRoot) return;
    async function loadGlobal() {
      try {
        const [projs, props, valsArr, pageData] = await Promise.all([
          pageService.fetchDatabaseItems(ROOT_HUB_ID),
          propertyService.fetchByDatabase(ROOT_HUB_ID),
          propertyService.fetchAllValues(ROOT_HUB_ID),
          supabase.from('pages').select('id, title, stages').eq('id', databaseId).single().then(r => r.data),
        ]);
        const vMap = {};
        for (const v of valsArr) {
          if (!vMap[v.page_id]) vMap[v.page_id] = {};
          vMap[v.page_id][v.property_id] = { date: v.value?.date, selected: v.value?.selected };
        }
        setGlobalItems(projs || []);
        setGlobalProps(props || []);
        setGlobalValues(vMap);
        setProjectPage(pageData);
      } catch (e) { console.error('CalendarView global load error', e); }
    }
    loadGlobal();
  }, [databaseId, isRoot]);

  const deadlineProp       = properties.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const statusProp         = properties.find(p => p.property_type === 'status' || p.name === 'Status');
  const globalDeadlineProp = globalProps.find(p => p.property_type === 'date' || p.name === 'Deadline' || p.name === 'Entrega');
  const globalStatusProp   = globalProps.find(p => p.property_type === 'status' || p.name === 'Status');

  const allEvents = useMemo(() => buildEvents({
    items, allValues, deadlineProp, statusProp,
    globalItems, globalValues, globalDeadlineProp, globalStatusProp,
  }), [items, allValues, deadlineProp, statusProp, globalItems, globalValues, globalDeadlineProp, globalStatusProp]);

  const events = useMemo(() =>
    filterMode === 'local' ? allEvents.filter(ev => !ev.isGlobal) : allEvents,
    [allEvents, filterMode]);

  // range events for MonthView (stage bars)
  const rangeEventsRaw = useMemo(() => {
    if (isRoot) {
      return buildPipelineEvents({
        projects: globalItems,
        allScenes: items,
        allValues,
        deadlinePropId: deadlineProp?.id,
      });
    }
    if (!projectPage) return [];
    return buildProjectEvents({
      project: projectPage,
      scenes: items,
      allValues,
      deadlinePropId: deadlineProp?.id,
    });
  }, [isRoot, projectPage, globalItems, items, allValues, deadlineProp]);

  const rangeEvents = useMemo(() =>
    hiddenProjects.size === 0
      ? rangeEventsRaw
      : rangeEventsRaw.filter(ev => !hiddenProjects.has(ev.projectId)),
    [rangeEventsRaw, hiddenProjects]
  );

  const handleToday = useCallback(() => setCurrent(new Date()), []);
  const handleNext  = useCallback(() => setCurrent(d => navDate(view, d, +1)), [view]);
  const handlePrev  = useCallback(() => setCurrent(d => navDate(view, d, -1)), [view]);
  const handleGoTo  = useCallback((str) => {
    const d = parseISO(str);
    if (isValid(d)) setCurrent(d);
  }, []);

  const handleReschedule = useCallback(async (eventId, newDateStr) => {
    if (!deadlineProp) return;
    onValueChange?.(eventId, deadlineProp.id, { date: newDateStr });
  }, [deadlineProp, onValueChange]);

  const subViewProps = {
    events, current, onReschedule: handleReschedule,
    rangeEvents,
    mode: isRoot ? 'pipeline' : 'project',
  };

  return (
    <div className="space-y-3">
      <CalendarKbd onToday={handleToday} onNext={handleNext} onPrev={handlePrev} onGoToDate={handleGoTo} />
      <CalendarHeader
        view={view} current={current}
        onViewChange={setView} onToday={handleToday} onNext={handleNext} onPrev={handlePrev}
        filterMode={filterMode} onFilterChange={setFilterMode}
      />

      {/* Stage editor — só aparece em projetos individuais */}
      {!isRoot && projectPage && (
        <StageEditor
          project={projectPage}
          onUpdate={(stages) => setProjectPage(p => ({ ...p, stages }))}
        />
      )}

      <div className="flex gap-0 rounded-xl overflow-hidden border border-subtle">
        <div className="flex-1 min-w-0">
          {view === 'month'  && <MonthView  {...subViewProps} />}
          {view === 'week'   && <WeekView   {...subViewProps} />}
          {view === 'day'    && <DayView    {...subViewProps} />}
          {view === 'agenda' && <AgendaView {...subViewProps} />}
        </div>

        {/* Pipeline Legend — apenas no modo pipeline (root) */}
        {isRoot && (
          <PipelineLegend
            projects={globalItems}
            onHiddenChange={setHiddenProjects}
          />
        )}
      </div>

      {!deadlineProp && !statusProp && (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-1 border border-dashed border-subtle rounded-xl">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-small text-muted-foreground font-medium">Calendário vazio.</p>
          <p className="text-caption text-muted-foreground/50 mt-1">Adicione uma propriedade de Data ("Deadline") ou configure datas nos Status.</p>
        </div>
      )}
    </div>
  );
}
