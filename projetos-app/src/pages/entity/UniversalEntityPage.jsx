import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { useTeamStore } from '../../stores/useTeamStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { bootstrapProjectPipeline } from '../../core/databaseFactory';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { PropertyRenderer } from '../../components/properties/PropertyRenderer';
import { GenerativeCover } from '../../components/ui/cover/GenerativeCover';
import { AssetsPanel } from '../../components/storage/AssetsPanel';
import { ProjectTeamSettings } from '../../components/database/ProjectTeamSettings';
import { COLOR_MAP } from '../../core/schemas';
import {
  ArrowLeft, MoreHorizontal, Share, Star,
  BarChart2, FileText, CalendarDays, FolderOpen,
  Activity, Clock, ChevronDown, AlertTriangle,
  CheckCircle2, Loader2, Users, TrendingUp, Zap,
  Circle, ArrowRight, Trash2, Home, ChevronRight,
  LayoutDashboard, Database, Share2
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProjectArtPattern } from '../../components/ui/ProjectArtPattern';
import { getAccentColorFromId } from '../../lib/artPatternEngine';

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

const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';

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
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);

  const page     = pages[pageId];
  const isProject = page?.parent_id === ROOT_HUB_ID;

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

            const items = await pageService.fetchDatabaseItems(pipelineDb.id);
            const itemProps = await propertyService.fetchByDatabase(pipelineDb.id);
            const itemValMaps = await Promise.all(items.map(item => propertyService.fetchValues(item.id)));
            const combined = {};
            items.forEach((item, i) => {
              combined[item.id] = {};
              itemValMaps[i].forEach(v => { combined[item.id][v.property_id] = v.value; });
            });
              if (isMounted) {
                setAllItems(items || []);
                setAllItemValues(combined || {});
                setProperties(prev => (prev || []).length ? prev : (itemProps || []));
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
    <div className="flex flex-col h-full bg-[var(--surface-0)] relative overflow-hidden">
      
      {/* ── BREADCRUMBS ── */}
      <div className="h-10 flex items-center px-6 gap-2 text-[11px] font-medium text-muted-foreground/60 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
        <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="w-3 h-3" /> Hub
        </button>
        <ChevronRight className="w-3 h-3 opacity-30" />
        {page?.parent_id && page.parent_id !== ROOT_HUB_ID && (
          <>
            <button onClick={() => navigate(`/project/${page.parent_id}`)} className="hover:text-foreground transition-colors">
              Projeto Pai
            </button>
            <ChevronRight className="w-3 h-3 opacity-30" />
          </>
        )}
        <span className="text-foreground/80 truncate font-bold">{page?.title}</span>
      </div>

      {/* ── PROJECT HEADER ── */}
      <div className="relative pt-8 pb-0 px-8 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] overflow-hidden shrink-0">
        {/* Background Art Pattern */}
        <ProjectArtPattern 
          projectId={pageId} 
          size="header" 
          opacity={0.08} 
          className="mask-header"
        />
        <style>{`
          .mask-header {
            mask-image: linear-gradient(to bottom, black, transparent);
            -webkit-mask-image: linear-gradient(to bottom, black, transparent);
          }
        `}</style>

        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-center text-3xl shadow-2xl">
              {page?.icon || (isProject ? '🎬' : '🎞️')}
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">{page?.title}</h1>
              <div className="flex items-center gap-3">
                 <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAccentColorFromId(pageId) }} />
                   {isProject ? 'Projeto Motion' : 'Cena / Take'}
                 </span>
                 {page?.description && (
                   <span className="text-xs text-muted-foreground/40 font-medium">• {page.description}</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            {isProject && (
              <button 
                onClick={() => setTeamSettingsOpen(true)}
                className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]"
                title="Configurações da Equipe"
              >
                <Users className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="relative z-10 flex items-center gap-6 mt-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all relative group whitespace-nowrap ${
                  isActive ? 'text-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'opacity-50'}`} />
                {tab.label}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-in slide-in-from-bottom-1"
                    style={{ backgroundColor: getAccentColorFromId(pageId) }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto bg-[var(--surface-0)]">
        <div className="px-8 py-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8 py-4 px-6 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl">
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
        </div>

        <div className={`${isWide ? 'px-4 py-6 max-w-none' : 'max-w-3xl mx-auto px-6 py-8'}`}>
          {activeTab === 'dashboard' && childDatabase && (
            <ProductionDashboard
              items={allItems}
              properties={properties}
              allValues={allItemValues}
              projectTitle={page.title}
            />
          )}
          {activeTab === 'pipeline' && childDatabase && (
            <DatabaseRenderer databaseId={childDatabase.id} defaultView="kanban" />
          )}
          {activeTab === 'calendar' && childDatabase && (
            <DatabaseRenderer databaseId={childDatabase.id} defaultView="calendar" />
          )}
          {activeTab === 'notes' && (
            <RichTextEditor
              key={pageId}
              content={page.content || ''}
              onChange={handleContentChange}
              placeholder="Pressione '/' para comandos. Escreva briefing, roteiro, notas técnicas..."
            />
          )}
          {activeTab === 'assets' && (
            <AssetsPanel 
              pageId={pageId} 
              isProject={isProject} 
              parentProjectId={!isProject ? page?.parent_id : null}
            />
          )}
          {activeTab === 'activity' && (
            <EmptyState Icon={Activity} title="Log de Atividade" sub="Histórico completo de modificações em breve." />
          )}
        </div>
      </div>

      <ProjectTeamSettings 
        projectId={pageId} 
        open={teamSettingsOpen} 
        onOpenChange={setTeamSettingsOpen} 
      />
    </div>
  );
}

function ProductionDashboard({ items, properties, allValues, projectTitle }) {
  const statusProp   = properties.find(p => p.name === 'Status');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const statusOptions = statusProp?.config?.options || [];
  const today = new Date();
  const { members } = useTeamStore();

  const kpis = useMemo(() => {
    const total = items.length;
    if (total === 0) return { total: 0, delivered: 0, inProgress: 0, overdue: 0, progress: 0 };
    const deliveredKeywords = ['entregue', 'concluído', 'concluido', 'done', 'approved', 'finalizado', 'ready'];
    const progressKeywords  = ['em progresso', 'produção', 'producao', 'doing', 'motion', 'compositing', 'edit', 'rendering'];
    const delivered = items.filter(i => {
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt = statusOptions.find(o => o.id === sel);
      return opt && deliveredKeywords.some(k => opt.label.toLowerCase().includes(k));
    }).length;
    const inProgress = items.filter(i => {
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt = statusOptions.find(o => o.id === sel);
      return opt && progressKeywords.some(k => opt.label.toLowerCase().includes(k));
    }).length;
    const overdue = deadlineProp ? items.filter(i => {
      const dateStr = allValues[i.id]?.[deadlineProp.id]?.date;
      if (!dateStr) return false;
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt = statusOptions.find(o => o.id === sel);
      const isDelivered = opt && deliveredKeywords.some(k => opt.label.toLowerCase().includes(k));
      return !isDelivered && new Date(dateStr) < today;
    }).length : 0;
    return { total, delivered, inProgress, overdue, progress: total > 0 ? Math.round((delivered / total) * 100) : 0 };
  }, [items, allValues, statusProp, deadlineProp, statusOptions, today]);

  const nextDeadlines = useMemo(() => {
    if (!deadlineProp) return [];
    return items
      .filter(i => allValues[i.id]?.[deadlineProp.id]?.date)
      .map(i => ({ ...i, deadline: new Date(allValues[i.id][deadlineProp.id].date) }))
      .filter(i => i.deadline >= today)
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 6);
  }, [items, allValues, deadlineProp, today]);

  const statusDist = useMemo(() => {
    if (!statusProp) return [];
    return statusOptions.map(opt => ({
      ...opt,
      count: items.filter(i => allValues[i.id]?.[statusProp.id]?.selected === opt.id).length,
    })).filter(o => o.count > 0);
  }, [items, allValues, statusProp, statusOptions]);

  const assigneeProp = properties.find(p => p.name === 'Responsável' || p.property_type === 'people');
  const workloadDist = useMemo(() => {
    if (!assigneeProp) return [];
    const counts = {};
    items.forEach(i => {
      const sel = allValues[i.id]?.[statusProp?.id]?.selected;
      const opt = statusOptions.find(o => o.id === sel);
      const isDelivered = opt && ['entregue', 'concluído', 'concluido', 'done', 'approved', 'finalizado', 'ready'].some(k => opt.label.toLowerCase().includes(k));
      if (isDelivered) return;
      const assigneeIdOrName = allValues[i.id]?.[assigneeProp.id]?.people;
      if (assigneeIdOrName) {
        const member = members.find(m => m.id === assigneeIdOrName || m.name === assigneeIdOrName);
        const displayName = member ? member.name : assigneeIdOrName;
        counts[displayName] = (counts[displayName] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [items, allValues, assigneeProp, statusProp, statusOptions, members]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={<Circle className="w-3.5 h-3.5" />}  label="Total de Cenas"    value={kpis.total}      color="default" />
        <KpiCard icon={<Loader2 className="w-3.5 h-3.5" />} label="Em Produção"    value={kpis.inProgress} color="blue" />
        <KpiCard icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Cenas Atrasadas" value={kpis.overdue}   color={kpis.overdue > 0 ? 'red' : 'default'} />
        <KpiCard icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Concluídas" value={kpis.delivered}  color="green" />
      </div>

      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">Progresso de Produção</span>
            <span className="text-xl font-black text-foreground">{kpis.progress}% <span className="text-xs text-muted-foreground/60 font-medium tracking-normal ml-1">COMPLETADO</span></span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 bg-[var(--surface-2)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
            {kpis.delivered} / {kpis.total} CENAS
          </span>
        </div>
        <div className="h-3 bg-[var(--surface-3)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out" 
            style={{ width: `${kpis.progress}%` }} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Pipeline Snapshot
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {statusDist.length === 0 && <p className="text-[11px] text-muted-foreground/40 italic">Nenhum item com status ainda.</p>}
            {statusDist.map(opt => {
              const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
              return (
                <div key={opt.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all`}>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-[11px] font-bold text-foreground/80`}>{opt.label}</span>
                  <span className={`text-[11px] font-black opacity-30`}>{opt.count}</span>
                </div>
              );
            })}
          </div>
          {statusDist.length > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
              {statusDist.map(opt => {
                const colors = COLOR_MAP[opt.color] || COLOR_MAP.gray;
                return <div key={opt.id} title={`${opt.label}: ${opt.count}`} className={`h-full transition-all ${colors.bg}`} style={{ width: `${(opt.count / kpis.total) * 100}%` }} />;
              })}
            </div>
          )}
        </div>
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Saúde do Projeto
          </h3>
          <div className="space-y-3">
            <HealthRow label="Entregas Atrasadas" value={kpis.overdue} type={kpis.overdue > 0 ? 'danger' : 'ok'} />
            <HealthRow label="Fila de Produção" value={kpis.inProgress} type="info" />
            <HealthRow label="Taxa de Conclusão" value={`${kpis.progress}%`} type={kpis.progress >= 80 ? 'ok' : kpis.progress >= 40 ? 'warn' : 'info'} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Team Workload</h3>
          {workloadDist.length === 0 && <p className="text-xs text-muted-foreground/60 italic">Nenhum responsável atribuído a cenas ativas.</p>}
          <div className="space-y-2">
            {workloadDist.map(w => (
              <div key={w.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[9px] text-white font-bold uppercase">{w.name.charAt(0)}</div>
                  <span className="text-sm text-foreground">{w.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{w.count} cenas</span>
                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${Math.min((w.count / 10) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Próximas Entregas</h3>
          {nextDeadlines.length === 0 && <p className="text-xs text-muted-foreground/60 italic">Nenhuma entrega próxima registrada.</p>}
          <div className="space-y-1.5">
            {nextDeadlines.map(item => {
              const isLate = item.deadline < today;
              const diffDays = Math.ceil((item.deadline - today) / (1000 * 60 * 60 * 24));
              const sel = allValues[item.id]?.[statusProp?.id]?.selected;
              const opt = statusOptions.find(o => o.id === sel);
              const colors = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : COLOR_MAP.gray;
              return (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 min-w-0"><span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot || 'bg-muted-foreground/50'}`} /><span className="text-sm font-medium text-foreground truncate">{item.title}</span></div>
                  <div className="flex items-center gap-2 shrink-0">
                    {opt && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors.bg} ${colors.text}`}>{opt.label}</span>}
                    <span className={`text-xs font-mono ${isLate ? 'text-red-400' : diffDays <= 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>{isLate ? `${Math.abs(diffDays)}d atraso` : diffDays === 0 ? 'Hoje' : `+${diffDays}d`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }) {
  const p = {
    default: { bg: 'bg-[var(--surface-1)] border-[var(--border-subtle)]', text: 'text-foreground', iconCls: 'text-muted-foreground/40' },
    blue:    { bg: 'bg-blue-500/5 border-blue-500/10', text: 'text-blue-400', iconCls: 'text-blue-400/50' },
    red:     { bg: 'bg-red-500/5 border-red-500/10', text: 'text-red-400', iconCls: 'text-red-400/50' },
    green:   { bg: 'bg-emerald-500/5 border-emerald-500/10', text: 'text-emerald-400', iconCls: 'text-emerald-400/50' },
  }[color] || { bg: 'bg-[var(--surface-1)] border-[var(--border-subtle)]', text: 'text-foreground', iconCls: 'text-muted-foreground/40' };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 transition-all hover:border-[var(--border-strong)] hover:shadow-lg group ${p.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">{label}</span>
        <div className={`${p.iconCls} group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
      <div className={`text-4xl font-black tracking-tight ${p.text}`}>{value}</div>
    </div>
  );
}

function HealthRow({ label, value, type }) {
  const color = { ok: 'text-emerald-400', danger: 'text-red-400', warn: 'text-yellow-400', info: 'text-blue-400', neutral: 'text-muted-foreground' }[type] || 'text-foreground';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  );
}

function PropertyField({ label, children }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0"><span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider shrink-0">{label}:</span><div className="min-w-0">{children}</div></div>
  );
}

function EmptyState({ Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-xl border border-border/30 border-dashed"><Icon className="w-10 h-10 text-muted-foreground/30 mb-3" /><p className="text-foreground font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground mt-1">{sub}</p></div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse bg-background"><div className="h-12 bg-card/50 border-b border-border" /><div className="h-40 bg-secondary/20" /><div className="px-6 pt-10 space-y-4"><div className="h-8 bg-secondary/40 rounded w-64" /><div className="h-4 bg-secondary/20 rounded w-48" /></div></div>
  );
}
