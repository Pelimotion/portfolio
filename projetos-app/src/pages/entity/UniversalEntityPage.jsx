import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { bootstrapProjectPipeline } from '../../core/databaseFactory';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { PropertyRenderer } from '../../components/properties/PropertyRenderer';
import { GenerativeCover } from '../../components/ui/cover/GenerativeCover';
import { AssetsPanel } from '../../components/storage/AssetsPanel';
import { COLOR_MAP } from '../../core/schemas';
import {
  ArrowLeft, MoreHorizontal, Share, Star,
  BarChart2, FileText, CalendarDays, FolderOpen,
  Activity, Clock, ChevronDown, AlertTriangle,
  CheckCircle2, Loader2, Users, TrendingUp, Zap,
  Circle, ArrowRight,
} from 'lucide-react';

// ── Tabs ────────────────────────────────────────
const PROJECT_TABS = [
  { id: 'dashboard', label: 'Dashboard',  Icon: BarChart2 },
  { id: 'pipeline',  label: 'Pipeline',   Icon: Zap },
  { id: 'calendar',  label: 'Calendar',   Icon: CalendarDays },
  { id: 'notes',     label: 'Notes',      Icon: FileText },
  { id: 'assets',    label: 'Assets',     Icon: FolderOpen },
  { id: 'activity',  label: 'Activity',   Icon: Activity },
];

const SCENE_TABS = [
  { id: 'notes',    label: 'Notes',    Icon: FileText },
  { id: 'assets',  label: 'Assets',   Icon: FolderOpen },
  { id: 'activity',label: 'Activity', Icon: Activity },
];

// Root Hub ID (must match databaseFactory)
const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';

// ============================================
// UNIVERSAL ENTITY PAGE v3
// Full-width, operational, cinematographic
// ============================================
export function UniversalEntityPage() {
  const { pageId } = useParams();
  const navigate   = useNavigate();
  const { pages, fetchPage, updatePage } = usePageStore();

  const [activeTab,     setActiveTab]     = useState('notes');
  const [properties,    setProperties]    = useState([]);
  const [propValues,    setPropValues]    = useState({});
  const [childDatabase, setChildDatabase] = useState(null);
  const [allItems,      setAllItems]      = useState([]);
  const [allItemValues, setAllItemValues] = useState({});
  const [loading,       setLoading]       = useState(true);

  const page     = pages[pageId];
  const isProject = page?.parent_id === ROOT_HUB_ID;

  // ── Load ──────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const cached = usePageStore.getState().pages[pageId];
        if (!cached) await fetchPage(pageId);
        const current = usePageStore.getState().pages[pageId];
        if (!current || !isMounted) return;

        const parentId = current.parent_id;
        if (parentId) {
          const props = await propertyService.fetchByDatabase(parentId);
          if (isMounted) setProperties(props);
        }

        const vals = await propertyService.fetchValues(pageId);
        const valMap = {};
        for (const v of vals) valMap[v.property_id] = v.value;
        if (isMounted) setPropValues(valMap);

        if (parentId === ROOT_HUB_ID) {
          const pipelineDb = await bootstrapProjectPipeline(pageId);
          if (isMounted) {
            setChildDatabase(pipelineDb);
            setActiveTab('dashboard');

            // Carregar items para o Dashboard
            const items = await pageService.fetchDatabaseItems(pipelineDb.id);
            const itemProps = await propertyService.fetchByDatabase(pipelineDb.id);

            const itemValMaps = await Promise.all(
              items.map(item => propertyService.fetchValues(item.id))
            );
            const combined = {};
            items.forEach((item, i) => {
              combined[item.id] = {};
              itemValMaps[i].forEach(v => { combined[item.id][v.property_id] = v.value; });
            });
            if (isMounted) {
              setAllItems(items);
              setAllItemValues(combined);
              setProperties(prev => prev.length ? prev : itemProps);
            }
          }
        } else {
          if (isMounted) setActiveTab('notes');
        }

      } catch (e) {
        console.error('UniversalEntityPage load error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [pageId, fetchPage]);

  const handlePropChange = useCallback(async (propertyId, value) => {
    setPropValues(prev => ({ ...prev, [propertyId]: value }));
    try { await propertyService.upsertValue(pageId, propertyId, value); }
    catch (e) { console.error(e); }
  }, [pageId]);

  const handleTitleBlur = useCallback(async (e) => {
    const newTitle = e.target.innerText.trim();
    if (newTitle && newTitle !== page?.title) await updatePage(pageId, { title: newTitle });
  }, [pageId, page, updatePage]);

  const handleContentChange = useCallback(async (html) => {
    await updatePage(pageId, { content: html });
  }, [pageId, updatePage]);

  if (loading && !page) return <PageSkeleton />;
  if (!page) return null;

  const tabs     = isProject ? PROJECT_TABS : SCENE_TABS;
  const isWide   = ['dashboard', 'pipeline', 'calendar'].includes(activeTab);

  const statusProp   = properties.find(p => p.name === 'Status');
  const priorityProp = properties.find(p => p.name === 'Prioridade');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const clienteProp  = properties.find(p => p.name === 'Cliente');
  const otherProps   = properties.filter(p => !['Status', 'Prioridade', 'Deadline', 'Entrega', 'Cliente'].includes(p.name));

  const statusVal    = statusProp ? propValues[statusProp.id] : null;
  const statusOption = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const statusColors = statusOption ? COLOR_MAP[statusOption.color] || COLOR_MAP.gray : COLOR_MAP.gray;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── Topbar Flutuante ── */}
      <header className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-border/30 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm min-w-0">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0 text-xs">
            <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/')}>Projects Hub</span>
            <ArrowRight className="w-3 h-3 opacity-40 shrink-0" />
            <span className="text-foreground font-medium truncate">{page.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><Star className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><Share className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      {/* ── Main Scroll ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Hero (compacto) ── */}
        <div className="relative">
          <GenerativeCover seed={page.title || page.id} className="h-40" />
          {/* Icon flutuante */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 w-14 h-14 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center text-3xl z-10">
            {page.icon || '🎬'}
          </div>
        </div>

        {/* ── Entity Header ── */}
        <div className="px-6 pt-10 pb-0">
          <div className="flex items-start justify-between gap-4">
            {/* Título */}
            <div className="min-w-0 flex-1">
              <h1
                className="text-2xl font-bold text-foreground focus:outline-none leading-snug"
                contentEditable
                suppressContentEditableWarning
                onBlur={handleTitleBlur}
              >
                {page.title || 'Untitled'}
              </h1>
              {clienteProp && propValues[clienteProp.id]?.text && (
                <p className="text-sm text-muted-foreground mt-0.5">{propValues[clienteProp.id].text}</p>
              )}
            </div>

            {/* Status Pill + Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {statusProp && (
                <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 ${statusColors.bg} ${statusColors.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                  {statusOption?.label || 'Sem Status'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              )}
            </div>
          </div>

          {/* ── Properties Bar (horizontal, compacta) ── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pb-4 border-b border-border/30">
            {priorityProp && (
              <PropertyField label="Prioridade">
                <PropertyRenderer property={priorityProp} value={propValues[priorityProp.id]} onChange={v => handlePropChange(priorityProp.id, v)} inline />
              </PropertyField>
            )}
            {deadlineProp && (
              <PropertyField label="Deadline">
                <PropertyRenderer property={deadlineProp} value={propValues[deadlineProp.id]} onChange={v => handlePropChange(deadlineProp.id, v)} inline />
              </PropertyField>
            )}
            {otherProps.slice(0, 4).map(prop => (
              <PropertyField key={prop.id} label={prop.name}>
                <PropertyRenderer property={prop} value={propValues[prop.id]} onChange={v => handlePropChange(prop.id, v)} inline />
              </PropertyField>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-0.5 mt-0 -mx-1 overflow-x-auto no-scrollbar">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content Area ── */}
        <div className={`${isWide ? 'px-4 py-6 max-w-none' : 'max-w-3xl mx-auto px-6 py-8'}`}>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && childDatabase && (
            <ProductionDashboard
              items={allItems}
              properties={properties}
              allValues={allItemValues}
              projectTitle={page.title}
            />
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && childDatabase && (
            <DatabaseRenderer databaseId={childDatabase.id} defaultView="kanban" />
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && childDatabase && (
            <DatabaseRenderer databaseId={childDatabase.id} defaultView="calendar" />
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <RichTextEditor
              key={pageId}
              content={page.content || ''}
              onChange={handleContentChange}
              placeholder="Pressione '/' para comandos. Escreva briefing, roteiro, notas técnicas..."
            />
          )}

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <AssetsPanel pageId={pageId} isProject={isProject} />
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <EmptyState Icon={Activity} title="Log de Atividade" sub="Histórico completo de modificações em breve." />
          )}

        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCTION DASHBOARD — Operational Widgets
// ============================================
function ProductionDashboard({ items, properties, allValues, projectTitle }) {
  const statusProp   = properties.find(p => p.name === 'Status');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');

  const statusOptions = statusProp?.config?.options || [];
  const today = new Date();

  // ── Compute KPIs ──
  const kpis = useMemo(() => {
    const total    = items.length;
    const delivered = items.filter(i => {
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt  = statusOptions.find(o => o.id === sel);
      return opt?.label?.toLowerCase().includes('entregue') || opt?.label?.toLowerCase().includes('approved');
    }).length;
    const inProgress = items.filter(i => {
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt  = statusOptions.find(o => o.id === sel);
      return ['em_progresso','motion','compositing','ai generation','upscale'].some(k =>
        opt?.label?.toLowerCase().includes(k.toLowerCase())
      );
    }).length;
    const overdue = deadlineProp ? items.filter(i => {
      const dateStr = allValues[i.id]?.[deadlineProp.id]?.date;
      if (!dateStr) return false;
      return new Date(dateStr) < today;
    }).length : 0;

    const progress = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return { total, delivered, inProgress, overdue, progress };
  }, [items, allValues, statusProp, deadlineProp, statusOptions, today]);

  // ── Next Deadlines ──
  const nextDeadlines = useMemo(() => {
    if (!deadlineProp) return [];
    return items
      .filter(i => allValues[i.id]?.[deadlineProp.id]?.date)
      .map(i => ({ ...i, deadline: new Date(allValues[i.id][deadlineProp.id].date) }))
      .filter(i => i.deadline >= today)
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 6);
  }, [items, allValues, deadlineProp, today]);

  // ── Status Distribution ──
  const statusDist = useMemo(() => {
    if (!statusProp) return [];
    return statusOptions.map(opt => ({
      ...opt,
      count: items.filter(i => allValues[i.id]?.[statusProp.id]?.selected === opt.id).length,
    })).filter(o => o.count > 0);
  }, [items, allValues, statusProp, statusOptions]);

  return (
    <div className="space-y-6">

      {/* ── KPI Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Circle className="w-4 h-4" />}  label="Total Cenas"    value={kpis.total}      color="default" />
        <KpiCard icon={<Loader2 className="w-4 h-4" />} label="Em Produção"    value={kpis.inProgress} color="blue" />
        <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Atrasadas" value={kpis.overdue}   color={kpis.overdue > 0 ? 'red' : 'default'} />
        <KpiCard icon={<CheckCircle2 className="w-4 h-4" />} label="Entregues" value={kpis.delivered}  color="green" />
      </div>

      {/* ── Progress Bar ── */}
      <div className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Progresso Geral</span>
          <span className="text-muted-foreground font-mono">{kpis.delivered}/{kpis.total} cenas entregues · {kpis.progress}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${kpis.progress}%` }}
          />
        </div>
      </div>

      {/* ── Middle Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Pipeline Snapshot — 2/3 */}
        <div className="lg:col-span-2 bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Pipeline Snapshot
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusDist.length === 0 && (
              <p className="text-xs text-muted-foreground/60 italic">Nenhum item com status ainda.</p>
            )}
            {statusDist.map(opt => {
              const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
              const pct = kpis.total > 0 ? Math.round((opt.count / kpis.total) * 100) : 0;
              return (
                <div key={opt.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} border border-current/10`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>{opt.label}</span>
                  <span className={`text-[10px] font-mono ${colors.text} opacity-70`}>{opt.count} · {pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Mini bar chart */}
          {statusDist.length > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden gap-px">
              {statusDist.map(opt => {
                const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
                const pct = kpis.total > 0 ? (opt.count / kpis.total) * 100 : 0;
                return (
                  <div key={opt.id} title={`${opt.label}: ${opt.count}`}
                    className={`h-full transition-all ${colors.bg}`}
                    style={{ width: `${pct}%` }} />
                );
              })}
            </div>
          )}
        </div>

        {/* Production Health — 1/3 */}
        <div className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Saúde do Projeto
          </h3>
          <HealthRow label="Atrasos"       value={kpis.overdue}    type={kpis.overdue > 0 ? 'danger' : 'ok'} />
          <HealthRow label="Em produção"   value={kpis.inProgress} type="info" />
          <HealthRow label="% concluído"   value={`${kpis.progress}%`} type={kpis.progress >= 80 ? 'ok' : kpis.progress >= 40 ? 'warn' : 'info'} />
          <HealthRow label="Total"         value={kpis.total}      type="neutral" />
        </div>
      </div>

      {/* ── Next Deadlines ── */}
      <div className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> Próximas Entregas
        </h3>
        {nextDeadlines.length === 0 && (
          <p className="text-xs text-muted-foreground/60 italic">Nenhuma entrega próxima registrada.</p>
        )}
        <div className="space-y-1.5">
          {nextDeadlines.map(item => {
            const isLate   = item.deadline < today;
            const diffDays = Math.ceil((item.deadline - today) / (1000 * 60 * 60 * 24));
            const sel      = allValues[item.id]?.[statusProp?.id]?.selected;
            const opt      = statusOptions.find(o => o.id === sel);
            const colors   = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : COLOR_MAP.gray;
            return (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot || 'bg-muted-foreground/50'}`} />
                  <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {opt && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors.bg} ${colors.text}`}>{opt.label}</span>
                  )}
                  <span className={`text-xs font-mono ${isLate ? 'text-red-400' : diffDays <= 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                    {isLate ? `${Math.abs(diffDays)}d atraso` : diffDays === 0 ? 'Hoje' : `+${diffDays}d`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ============================================
// UI PRIMITIVES
// ============================================
function KpiCard({ icon, label, value, color }) {
  const palette = {
    default: { bg: 'bg-card/60 border-border/40', text: 'text-foreground', sub: 'text-muted-foreground' },
    blue:    { bg: 'bg-blue-500/8 border-blue-500/20', text: 'text-blue-400', sub: 'text-blue-400/70' },
    red:     { bg: 'bg-red-500/8 border-red-500/20', text: 'text-red-400', sub: 'text-red-400/70' },
    green:   { bg: 'bg-emerald-500/8 border-emerald-500/20', text: 'text-emerald-400', sub: 'text-emerald-400/70' },
    yellow:  { bg: 'bg-yellow-500/8 border-yellow-500/20', text: 'text-yellow-400', sub: 'text-yellow-400/70' },
  };
  const p = palette[color] || palette.default;
  return (
    <div className={`rounded-xl border p-4 space-y-2 ${p.bg}`}>
      <div className={`flex items-center gap-2 ${p.sub}`}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-3xl font-bold font-mono ${p.text}`}>{value}</div>
    </div>
  );
}

function HealthRow({ label, value, type }) {
  const typeMap = {
    ok:      'text-emerald-400',
    danger:  'text-red-400',
    warn:    'text-yellow-400',
    info:    'text-blue-400',
    neutral: 'text-muted-foreground',
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold font-mono ${typeMap[type] || 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function PropertyField({ label, children }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider shrink-0">{label}:</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function EmptyState({ Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-xl border border-border/30 border-dashed">
      <Icon className="w-10 h-10 text-muted-foreground/30 mb-3" />
      <p className="text-foreground font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse bg-background">
      <div className="h-12 bg-card/50 border-b border-border" />
      <div className="h-40 bg-secondary/20" />
      <div className="px-6 pt-10 space-y-4">
        <div className="h-8 bg-secondary/40 rounded w-64" />
        <div className="h-4 bg-secondary/20 rounded w-48" />
      </div>
    </div>
  );
}
