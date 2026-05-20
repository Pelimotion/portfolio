import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AddMemberModal } from '../../components/database/AddMemberModal';
import {
  LayoutDashboard, Plus, UserPlus, LayoutGrid,
  List, Rows3, Search, X, ChevronRight,
  AlertTriangle, Clock, CheckCircle2, CalendarOff,
  BarChart2, TrendingUp, ChevronDown,
} from 'lucide-react';
import { GenerativeHeader } from '../../components/ui/GenerativeHeader';
import { GenerativeIcon } from '../../components/ui/GenerativeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { ROOT_HUB_ID } from '../../core/schemas';
import { ensureRootHub } from '../../core/databaseFactory';
import { pageService } from '../../services/pageService';
import { propertyService } from '../../services/propertyService';
import { loadPreference, savePreference } from '../../lib/viewPreferences';
import { COLOR_MAP } from '../../core/colors';
import { financialService } from '../../services/financialService';

// Status order for default sort
const STATUS_ORDER = ['briefing', 'producao', 'revisao', 'entregue'];

const STATUS_LABELS = {
  briefing: 'Briefing',
  producao: 'Produção',
  revisao: 'Revisão',
  entregue: 'Entregue',
};

const STATUS_COLORS = {
  briefing: 'bg-blue-500/60',
  producao: 'bg-yellow-500/60',
  revisao:  'bg-orange-500/60',
  entregue: 'bg-emerald-500/60',
};

// ── Hub views ─────────────────────────────────────────────────────────────────
const HUB_VIEWS = [
  { id: 'board',    label: 'Board',    Icon: LayoutDashboard },
  { id: 'grid',     label: 'Grid',     Icon: LayoutGrid },
  { id: 'timeline', label: 'Timeline', Icon: Rows3 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setCreateOpen]     = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [initializing, setInitializing]   = useState(true);

  // Hub-level state (persisted)
  const [hubView,            setHubView]            = useState(() => loadPreference(ROOT_HUB_ID, 'hubView', 'board'));
  const [quickFilter,        setQuickFilter]        = useState('all');
  const [searchText,         setSearchText]         = useState('');
  const [filterRowCollapsed, setFilterRowCollapsed] = useState(false);

  // Data for grid/timeline/summary (loaded separately from DatabaseRenderer)
  const [projects,    setProjects]    = useState([]);
  const [properties,  setProperties]  = useState([]);
  const [allValues,   setAllValues]   = useState({});
  const [dataLoading, setDataLoading] = useState(true);

  // Financial summary
  const [finSummary,      setFinSummary]      = useState(null);
  const [finSummaryLoading, setFinSummaryLoading] = useState(true);

  useEffect(() => {
    document.title = 'Projects Hub | TOCA HUB';
    async function init() {
      try { await ensureRootHub(); }
      catch (e) { console.error('Falha ao inicializar Hub:', e); }
      finally { setInitializing(false); }
    }
    init();
  }, []);

  // Load financial summary
  useEffect(() => {
    if (initializing) return;
    setFinSummaryLoading(true);
    financialService.summary()
      .then(s => setFinSummary(s))
      .catch(e => console.error('Financial summary error:', e))
      .finally(() => setFinSummaryLoading(false));
  }, [initializing]);

  // Load data for grid/timeline/summary
  useEffect(() => {
    if (initializing) return;
    async function loadData() {
      setDataLoading(true);
      try {
        const [items, props] = await Promise.all([
          pageService.fetchDatabaseItems(ROOT_HUB_ID),
          propertyService.fetchByDatabase(ROOT_HUB_ID),
        ]);
        const valMaps = await Promise.all((items || []).map(i => propertyService.fetchValues(i.id)));
        const combined = {};
        (items || []).forEach((item, idx) => {
          combined[item.id] = {};
          (valMaps[idx] || []).forEach(v => { combined[item.id][v.property_id] = v.value; });
        });
        setProjects(items || []);
        setProperties(props || []);
        setAllValues(combined);
      } catch (e) {
        console.error('Dashboard data load error:', e);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [initializing]);

  const handleHubViewChange = useCallback((v) => {
    setHubView(v);
    savePreference(ROOT_HUB_ID, 'hubView', v);
  }, []);

  // Derived data
  const statusProp   = useMemo(() => properties.find(p => p.property_type === 'status' || p.name === 'Status'), [properties]);
  const deadlineProp = useMemo(() => properties.find(p => p.property_type === 'date' || ['deadline', 'entrega'].includes(p.name?.toLowerCase())), [properties]);

  const getStatusId = useCallback((projectId) => {
    if (!statusProp) return null;
    return allValues[projectId]?.[statusProp.id]?.selected ?? null;
  }, [statusProp, allValues]);

  const getDeadline = useCallback((projectId) => {
    if (!deadlineProp) return null;
    return allValues[projectId]?.[deadlineProp.id]?.date ?? null;
  }, [deadlineProp, allValues]);

  const today = useMemo(() => new Date(), []);

  // Quick filter logic
  const filteredProjects = useMemo(() => {
    let list = projects;

    // Search filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(p => (p.title || '').toLowerCase().includes(q));
    }

    // Quick filter
    if (quickFilter === 'overdue') {
      list = list.filter(p => {
        const d = getDeadline(p.id);
        const s = getStatusId(p.id);
        return d && new Date(d) < today && s !== 'entregue';
      });
    } else if (quickFilter === 'active') {
      list = list.filter(p => {
        const s = getStatusId(p.id);
        return s && !['entregue', 'briefing'].includes(s);
      });
    } else if (quickFilter === 'delivered') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      list = list.filter(p => {
        const s = getStatusId(p.id);
        const d = p.updated_at ? new Date(p.updated_at) : null;
        return s === 'entregue' && d && d >= start && d <= end;
      });
    } else if (quickFilter === 'nodeadline') {
      list = list.filter(p => !getDeadline(p.id));
    }

    // Default sort: status order
    const statusOpts = statusProp?.config?.options || [];
    list = [...list].sort((a, b) => {
      const sa = getStatusId(a.id);
      const sb = getStatusId(b.id);
      const ia = statusOpts.findIndex(o => o.id === sa);
      const ib = statusOpts.findIndex(o => o.id === sb);
      const va = ia === -1 ? 999 : ia;
      const vb = ib === -1 ? 999 : ib;
      return va - vb;
    });

    return list;
  }, [projects, searchText, quickFilter, getStatusId, getDeadline, today, statusProp]);

  // Pipeline summary counts
  const pipelineCounts = useMemo(() => {
    const statusOpts = statusProp?.config?.options || [];
    const result = statusOpts.map(opt => ({
      ...opt,
      count: projects.filter(p => getStatusId(p.id) === opt.id).length,
    }));
    const total = projects.length || 1;
    return { opts: result, total };
  }, [projects, statusProp, getStatusId]);

  // O.4: filterParams for Board view (memoized to avoid creating new object on every render)
  const boardFilterParams = useMemo(() => ({ quickFilter, searchText, today }), [quickFilter, searchText, today]);

  // Quick filter counts
  const qfCounts = useMemo(() => {
    const overdue  = projects.filter(p => { const d = getDeadline(p.id); const s = getStatusId(p.id); return d && new Date(d) < today && s !== 'entregue'; }).length;
    const active   = projects.filter(p => { const s = getStatusId(p.id); return s && !['entregue', 'briefing'].includes(s); }).length;
    const nodeadline = projects.filter(p => !getDeadline(p.id)).length;
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const delivered = projects.filter(p => { const s = getStatusId(p.id); const d = p.updated_at ? new Date(p.updated_at) : null; return s === 'entregue' && d && d >= start && d <= end; }).length;
    return { overdue, active, nodeadline, delivered };
  }, [projects, getDeadline, getStatusId, today]);

  if (initializing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-xs uppercase tracking-widest">Inicializando Workspace…</div>
      </div>
    );
  }

  const QUICK_FILTERS = [
    { id: 'all',        label: 'Todos',              count: projects.length,      Icon: List },
    { id: 'overdue',    label: 'Atrasados',           count: qfCounts.overdue,     Icon: AlertTriangle },
    { id: 'active',     label: 'Em andamento',        count: qfCounts.active,      Icon: Clock },
    { id: 'delivered',  label: 'Entregues este mês',  count: qfCounts.delivered,   Icon: CheckCircle2 },
    { id: 'nodeadline', label: 'Sem deadline',        count: qfCounts.nodeadline,  Icon: CalendarOff },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface-0)] relative">

      {/* ── Topbar consolidado (h-14) ── */}
      <header className="h-14 flex items-center gap-3 px-5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--surface-1)]">
        {/* Esquerda: ícone + título */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          <h1 className="font-semibold text-sm tracking-tight leading-none">Projects Hub</h1>
        </div>

        {/* Centro: busca expandível */}
        <div className="flex-1 flex justify-center">
          <div className="relative flex items-center w-48 focus-within:w-80 transition-all duration-200">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Buscar projeto…"
              className="w-full pl-8 pr-6 py-1.5 text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/30"
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="absolute right-2 text-muted-foreground/40 hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Direita: view toggle + equipe + novo projeto */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
            {HUB_VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleHubViewChange(id)}
                title={label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  hubView === id ? 'bg-[var(--surface-0)] shadow-sm text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setAddMemberOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] px-2.5 py-1.5 rounded-lg transition-all">
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Equipe</span>
          </button>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Novo
          </button>
        </div>
      </header>

      {/* ── Financial Summary Bar ── */}
      {!finSummaryLoading && finSummary && (
        <div className="shrink-0 px-5 py-2 flex items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <span className="text-[10px] text-muted-foreground/30 uppercase tracking-wider shrink-0">Financeiro</span>
          {[
            { label: 'Recebido',  value: finSummary.totals.paid,    color: 'text-emerald-400' },
            { label: 'Pendente',  value: finSummary.totals.pending, color: 'text-blue-400' },
            { label: 'Vencido',   value: finSummary.totals.overdue, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-muted-foreground/40">{label}</span>
              <span className={`text-[11px] font-bold font-mono ${color}`}>
                {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ))}
          <div className="flex-1" />
          {/* Mini SVG bar chart (last 6 months) */}
          {finSummary.months && (() => {
            const max = Math.max(...finSummary.months.map(m => m.total), 1);
            return (
              <div className="flex items-end gap-0.5 h-6 shrink-0">
                {finSummary.months.map((m, i) => (
                  <div key={i} title={`${m.label}: ${m.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    className="w-3 bg-primary/30 hover:bg-primary/60 transition-colors rounded-t-sm"
                    style={{ height: `${Math.max(2, Math.round((m.total / max) * 24))}px` }}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Pipeline + Filtros (colapsável, h-10 quando visível) ── */}
      <div className={`shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] overflow-hidden transition-all duration-200 ${filterRowCollapsed ? 'max-h-0 border-b-0' : 'max-h-24'}`}>
        <div className="px-5 py-2 flex items-center gap-3">
          {/* Pipeline bar inline */}
          {!dataLoading && pipelineCounts.opts.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <BarChart2 className="w-3 h-3 text-muted-foreground/30 shrink-0" />
              <div className="flex h-1.5 w-24 rounded-full overflow-hidden gap-px">
                {pipelineCounts.opts.filter(o => o.count > 0).map(opt => {
                  const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
                  const pct = Math.round((opt.count / pipelineCounts.total) * 100);
                  return (
                    <div key={opt.id} title={`${opt.label}: ${opt.count}`}
                      className={`h-full ${colors.bg}`} style={{ width: `${pct}%` }} />
                  );
                })}
              </div>
              <span className="text-[10px] text-muted-foreground/40">{projects.length}p</span>
            </div>
          )}

          {/* Divider */}
          {!dataLoading && <div className="w-px h-4 bg-[var(--border-subtle)] shrink-0" />}

          {/* Quick filter chips — scrollable */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
            {QUICK_FILTERS.map(({ id, label, count, Icon }) => (
              <button
                key={id}
                onClick={() => setQuickFilter(id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  quickFilter === id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground/50 hover:text-foreground hover:bg-[var(--surface-2)] border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
                {count > 0 && (
                  <span className={`text-[9px] font-bold px-1 rounded ${quickFilter === id ? 'text-primary' : 'text-muted-foreground/40'}`}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setFilterRowCollapsed(c => !c)}
            className="shrink-0 p-1 rounded-md text-muted-foreground/30 hover:text-muted-foreground hover:bg-[var(--surface-2)] transition-all"
            title="Ocultar barra de filtros"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expand button when collapsed */}
      {filterRowCollapsed && (
        <button
          onClick={() => setFilterRowCollapsed(false)}
          className="shrink-0 flex items-center justify-center gap-1 h-5 text-[10px] text-muted-foreground/30 hover:text-muted-foreground hover:bg-[var(--surface-2)] transition-all border-b border-[var(--border-subtle)]"
        >
          <ChevronDown className="w-3 h-3 rotate-180" /> Filtros
        </button>
      )}

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {hubView === 'board' && (
          <div className="p-5">
            <DatabaseRenderer databaseId={ROOT_HUB_ID} defaultView="kanban" addButtonLabel={null} filterParams={boardFilterParams} />
          </div>
        )}

        {hubView === 'grid' && (
          <ProjectGrid
            projects={filteredProjects}
            properties={properties}
            allValues={allValues}
            statusProp={statusProp}
            loading={dataLoading}
            onNavigate={id => navigate(`/page/${id}`)}
            quickFilter={quickFilter}
            searchText={searchText}
          />
        )}

        {hubView === 'timeline' && (
          <ProjectTimeline
            projects={filteredProjects}
            allValues={allValues}
            deadlineProp={deadlineProp}
            loading={dataLoading}
            onNavigate={id => navigate(`/page/${id}`)}
          />
        )}
      </main>

      <CreateProjectModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}

// ── Grid View ─────────────────────────────────────────────────────────────────
function ProjectGrid({ projects, properties, allValues, statusProp, loading, onNavigate, quickFilter, searchText }) {
  if (loading) return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-40 bg-[var(--surface-1)] rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  if (projects.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <TrendingUp className="w-10 h-10 text-muted-foreground/20 mb-4" />
      <p className="text-sm font-semibold text-foreground/60">
        {quickFilter !== 'all' || searchText ? 'Nenhum projeto encontrado com esses filtros.' : 'Nenhum projeto criado ainda.'}
      </p>
      {quickFilter !== 'all' && <p className="text-xs text-muted-foreground/40 mt-1">Tente remover o filtro ativo.</p>}
    </div>
  );

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map(project => {
        const statusVal = statusProp ? allValues[project.id]?.[statusProp.id]?.selected : null;
        const statusOpt = statusProp?.config?.options?.find(o => o.id === statusVal);
        const colors    = statusOpt ? COLOR_MAP[statusOpt.color] || COLOR_MAP.gray : COLOR_MAP.gray;

        return (
          <button
            key={project.id}
            onClick={() => onNavigate(project.id)}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--surface-1)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
          >
            {/* Generative Cover */}
            <div className="h-28 w-full relative overflow-hidden bg-[#050505]">
              <GenerativeHeader slug={project.id} type="project" showIcon={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-1)] via-transparent to-transparent opacity-80" />
              {statusOpt && (
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                  {statusOpt.label}
                </div>
              )}
            </div>
            {/* Content */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  <GenerativeIcon slug={project.id} size={20} type="project" />
                </div>
                <h3 className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {project.title || 'Sem título'}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/40 font-mono">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Timeline (Gantt) View ─────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function ProjectTimeline({ projects, allValues, deadlineProp, loading, onNavigate }) {
  const [viewMonths, setViewMonths] = useState(6); // show 6 months by default

  const today = useMemo(() => new Date(), []);

  // Build a date range: from 2 months ago to viewMonths months ahead
  const startDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return d;
  }, [today]);

  const endDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + viewMonths, 0);
    return d;
  }, [today, viewMonths]);

  const totalDays = useMemo(() => {
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const getLeft = useCallback((date) => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Math.ceil((d - startDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (diff / totalDays) * 100));
  }, [startDate, totalDays]);

  // Month markers
  const months = useMemo(() => {
    const result = [];
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (d <= endDate) {
      const left = getLeft(d);
      if (left !== null && left >= 0 && left <= 100) {
        result.push({ label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, left });
      }
      d.setMonth(d.getMonth() + 1);
    }
    return result;
  }, [startDate, endDate, getLeft]);

  const todayLeft = useMemo(() => getLeft(today), [today, getLeft]);

  if (loading) return (
    <div className="p-6 space-y-3">
      {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-[var(--surface-1)] rounded-xl animate-pulse" />)}
    </div>
  );

  if (projects.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Rows3 className="w-10 h-10 text-muted-foreground/20 mb-4" />
      <p className="text-sm font-semibold text-foreground/60">Nenhum projeto para exibir.</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        {/* Month header */}
        <div className="relative h-7 mb-1 min-w-[600px]" style={{ marginLeft: 180 }}>
          {months.map((m, i) => (
            <span key={i} className="absolute text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider transform -translate-x-1/2"
              style={{ left: `${m.left}%` }}>
              {m.label}
            </span>
          ))}
          {/* Today marker in header */}
          {todayLeft !== null && (
            <div className="absolute top-0 bottom-0 w-px bg-primary/50" style={{ left: `${todayLeft}%` }} />
          )}
        </div>

        {/* Project rows */}
        <div className="space-y-1.5 min-w-[600px]">
          {projects.map(project => (
            <ProjectTimelineRow
              key={project.id}
              project={project}
              allValues={allValues}
              deadlineProp={deadlineProp}
              getLeft={getLeft}
              todayLeft={todayLeft}
              onNavigate={onNavigate}
              startDate={startDate}
              endDate={endDate}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground/40">
        <button onClick={() => setViewMonths(v => Math.max(3, v - 3))} className="hover:text-foreground transition-colors">← Menos meses</button>
        <span>{viewMonths + 2} meses visíveis</span>
        <button onClick={() => setViewMonths(v => Math.min(18, v + 3))} className="hover:text-foreground transition-colors">Mais meses →</button>
      </div>
    </div>
  );
}

function ProjectTimelineRow({ project, allValues, deadlineProp, getLeft, todayLeft, onNavigate, startDate, endDate }) {
  const stages = useMemo(() => {
    const raw = project.stages;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    // Fallback: single bar from created_at to deadline or today
    const start = project.created_at ? project.created_at.substring(0, 10) : null;
    const end   = (deadlineProp && allValues[project.id]?.[deadlineProp.id]?.date) || new Date().toISOString().substring(0, 10);
    if (!start) return [];
    return [{ id: 'default', name: project.title, start_date: start, end_date: end, color: 'blue' }];
  }, [project, deadlineProp, allValues]);

  const deadline = deadlineProp ? allValues[project.id]?.[deadlineProp.id]?.date : null;

  // Stage color rotation (P&B opacities)
  const STAGE_OPACITIES = ['bg-white/20', 'bg-white/30', 'bg-white/40', 'bg-white/50', 'bg-white/35'];

  return (
    <div className="flex items-center gap-0 group">
      {/* Project name column */}
      <button
        onClick={() => onNavigate(project.id)}
        className="w-[180px] shrink-0 flex items-center gap-2 pr-3 text-left"
      >
        <GenerativeIcon slug={project.id} size={16} type="project" className="shrink-0" />
        <span className="text-xs font-medium text-muted-foreground/70 group-hover:text-foreground transition-colors truncate">
          {project.title || 'Sem título'}
        </span>
      </button>

      {/* Gantt bar area */}
      <div className="flex-1 relative h-7 bg-[var(--surface-1)] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
        {/* Today line */}
        {todayLeft !== null && (
          <div className="absolute top-0 bottom-0 w-px bg-primary/40 z-10" style={{ left: `${todayLeft}%` }} />
        )}

        {/* Stage bars */}
        {stages.map((stage, idx) => {
          const left  = getLeft(stage.start_date);
          const right = getLeft(stage.end_date);
          if (left === null || right === null) return null;
          const width = Math.max(0.5, right - left);
          const opacity = STAGE_OPACITIES[idx % STAGE_OPACITIES.length];
          return (
            <button
              key={stage.id || idx}
              onClick={() => onNavigate(project.id)}
              title={`${stage.name}: ${stage.start_date} → ${stage.end_date}`}
              className={`absolute top-1 bottom-1 rounded ${opacity} hover:brightness-150 transition-all`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}

        {/* Deadline marker */}
        {deadline && (() => {
          const dl = getLeft(deadline);
          if (dl === null) return null;
          return (
            <div
              title={`Deadline: ${deadline}`}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500/60 z-10"
              style={{ left: `${dl}%` }}
            />
          );
        })()}
      </div>
    </div>
  );
}
