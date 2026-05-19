import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  format, isSameDay, isToday, parseISO, startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLOR_MAP } from '../../core/colors';

// Brazilian locale, week starts Monday
const LOCALE = ptBR;
const WEEK_OPTS = { weekStartsOn: 1 };

// ── Formatters ──────────────────────────────────────────────
export const fmtMonth  = (d) => format(d, 'MMMM yyyy', { locale: LOCALE });
export const fmtDay    = (d) => format(d, "EEEE, d 'de' MMMM", { locale: LOCALE });
export const fmtShort  = (d) => format(d, 'd MMM', { locale: LOCALE });
export const fmtYMD    = (d) => format(d, 'yyyy-MM-dd');

export const fmtWeekRange = (d) => {
  const start = startOfWeek(d, WEEK_OPTS);
  const end   = endOfWeek(d, WEEK_OPTS);
  return `${fmtShort(start)} – ${fmtShort(end)} ${format(end, 'yyyy')}`;
};

// ── Navigation ──────────────────────────────────────────────
export const navigate = (view, current, dir) => {
  if (view === 'month')  return dir > 0 ? addMonths(current, 1) : subMonths(current, 1);
  if (view === 'week')   return dir > 0 ? addWeeks(current, 1)  : subWeeks(current, 1);
  if (view === 'day')    return dir > 0 ? addDays(current, 1)   : subDays(current, 1);
  return dir > 0 ? addDays(current, 7) : subDays(current, 7); // agenda
};

// Days of a week (Mon–Sun) containing `date`
export const weekDays = (d) =>
  eachDayOfInterval({ start: startOfWeek(d, WEEK_OPTS), end: endOfWeek(d, WEEK_OPTS) });

// ── Event building ──────────────────────────────────────────
function makeEvent({ item, date, statusProp, statusVal, isGlobal = false }) {
  const opt    = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const colors = opt ? (COLOR_MAP[opt.color] || COLOR_MAP.gray) : COLOR_MAP.gray;
  return {
    id: item.id,
    title: item.title || 'Untitled',
    icon: item.icon,
    date,
    dateStr: fmtYMD(date),
    statusOpt: opt,
    colors,
    isGlobal,
    isMilestone: false,
  };
}

function makeMilestone({ opt, date, isGlobal = false }) {
  const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
  return {
    id: `ms-${opt.id}`,
    title: opt.label,
    date,
    dateStr: fmtYMD(date),
    colors,
    isGlobal,
    isMilestone: true,
    milestoneData: opt,
  };
}

/**
 * Build a flat event list from items + status milestones.
 * Returns array of event objects sorted by date.
 */
export function buildEvents({
  items, allValues, deadlineProp, statusProp,
  globalItems = [], globalValues = {}, globalDeadlineProp, globalStatusProp,
  filterMode = 'all', currentUserId,
}) {
  const events = [];

  // Local items
  if (deadlineProp) {
    for (const item of (items || [])) {
      const dateVal = allValues[item.id]?.[deadlineProp.id]?.date;
      if (!dateVal) continue;
      const date = parseISO(dateVal);
      events.push(makeEvent({ item, date, statusProp, statusVal: allValues[item.id]?.[statusProp?.id] }));
    }
  }

  // Local status milestones
  if (statusProp?.config?.options) {
    for (const opt of statusProp.config.options) {
      const dateStr = opt.deadline || opt.startDate;
      if (!dateStr) continue;
      events.push(makeMilestone({ opt, date: parseISO(dateStr) }));
    }
  }

  // Global items (other projects)
  if (globalDeadlineProp) {
    for (const item of globalItems) {
      const dateVal = globalValues[item.id]?.[globalDeadlineProp.id]?.date;
      if (!dateVal) continue;
      const date = parseISO(dateVal);
      events.push(makeEvent({ item, date, statusProp: globalStatusProp, statusVal: globalValues[item.id]?.[globalStatusProp?.id], isGlobal: true }));
    }
  }

  if (globalStatusProp?.config?.options) {
    for (const opt of globalStatusProp.config.options) {
      const dateStr = opt.deadline || opt.startDate;
      if (!dateStr) continue;
      events.push(makeMilestone({ opt, date: parseISO(dateStr), isGlobal: true }));
    }
  }

  return events.sort((a, b) => a.date - b.date);
}

/** Events grouped by 'YYYY-MM-DD' string */
export function groupByDay(events) {
  const map = {};
  for (const ev of events) {
    if (!map[ev.dateStr]) map[ev.dateStr] = [];
    map[ev.dateStr].push(ev);
  }
  return map;
}

export { isToday, isSameDay, startOfDay };

// ── Project calendar (stages + scene dots) ──────────────────

/**
 * Build range events from project.stages and scene deadline dots.
 * - Range: { id, type:'stage', title, startStr, endStr, color, projectId }
 * - Dot:   { id, type:'scene', title, startStr, color, projectId }
 */
export function buildProjectEvents({ project, scenes = [], allValues = {}, deadlinePropId }) {
  const events = [];
  const stages = project?.stages || [];

  for (const stage of stages) {
    if (!stage.start_date || !stage.end_date) continue;
    events.push({
      id: `stage-${project.id}-${stage.id}`,
      type: 'stage',
      title: stage.name || stage.id,
      startStr: stage.start_date,
      endStr: stage.end_date,
      color: stage.color || '#6366f1',
      projectId: project.id,
    });
  }

  if (deadlinePropId) {
    for (const scene of scenes) {
      const dateVal = allValues[scene.id]?.[deadlinePropId]?.date;
      if (!dateVal) continue;
      events.push({
        id: scene.id,
        type: 'scene',
        title: scene.title || 'Untitled',
        startStr: dateVal,
        color: '#6366f1',
        projectId: project.id,
      });
    }
  }
  return events;
}

// ── Pipeline calendar (all projects) ────────────────────────

export const PROJECT_PALETTE = [
  '#6366f1','#f59e0b','#10b981','#ef4444',
  '#8b5cf6','#3b82f6','#f97316','#ec4899',
];

/**
 * Build compact pipeline events across all projects.
 * - Stage ranges get assigned the project color
 * - Scene dots are 5px dots with tooltip info
 */
export function buildPipelineEvents({ projects = [], allScenes = [], allValues = {}, deadlinePropId }) {
  const events = [];
  projects.forEach((project, idx) => {
    const color = PROJECT_PALETTE[idx % PROJECT_PALETTE.length];
    const stages = project?.stages || [];

    for (const stage of stages) {
      if (!stage.start_date || !stage.end_date) continue;
      events.push({
        id: `pl-stage-${project.id}-${stage.id}`,
        type: 'pipeline-stage',
        title: `${project.title} — ${stage.name}`,
        startStr: stage.start_date,
        endStr: stage.end_date,
        color,
        projectId: project.id,
        projectTitle: project.title,
        stageName: stage.name,
      });
    }

    const scenes = allScenes.filter(s => s.parent_id === project.id);
    if (deadlinePropId) {
      for (const scene of scenes) {
        const dateVal = allValues[scene.id]?.[deadlinePropId]?.date;
        if (!dateVal) continue;
        events.push({
          id: `pl-scene-${scene.id}`,
          type: 'pipeline-scene',
          title: scene.title || 'Untitled',
          startStr: dateVal,
          color,
          projectId: project.id,
          projectTitle: project.title,
          status: allValues[scene.id]?.[deadlinePropId]?.selected,
        });
      }
    }
  });
  return events;
}
