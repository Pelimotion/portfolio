import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { bootstrapProjectPipeline } from '../../core/databaseFactory';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { PropertyRenderer } from '../../components/properties/PropertyRenderer';
import { COLOR_MAP } from '../../core/schemas';
import {
  ArrowLeft, MoreHorizontal, Share, Star, Plus,
  LayoutDashboard, FileText, Calendar, FolderOpen,
  Activity, Settings2, Clock, ChevronDown, Pencil,
} from 'lucide-react';

// ============================================
// PROJECT PAGE — Hub Operacional por Projeto
// Tabs: Overview | Pipeline | Calendar | Notes
// ============================================

const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'pipeline',  label: 'Pipeline',  Icon: LayoutDashboard },
  { id: 'notes',     label: 'Notes',     Icon: FileText },
  { id: 'assets',    label: 'Assets',    Icon: FolderOpen },
  { id: 'activity',  label: 'Activity',  Icon: Activity },
];

export default function ProjectPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { pages, fetchPage, updatePage } = usePageStore();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [properties, setProperties] = useState([]);
  const [propValues, setPropValues] = useState({});
  const [pipeline, setPipeline] = useState(null); // database filho "Pipeline"
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);

  const page = pages[pageId];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Buscar a página se não estiver no cache
        if (!pages[pageId]) await fetchPage(pageId);

        // Buscar propriedades do Hub pai (schema de projeto)
        const hubId = '00000000-0000-0000-0000-000000000000';
        const [props, vals, pipelineDb] = await Promise.all([
          propertyService.fetchByDatabase(hubId),
          propertyService.fetchValues(pageId),
          bootstrapProjectPipeline(pageId),
        ]);

        setProperties(props);
        const valMap = {};
        for (const v of vals) valMap[v.property_id] = v.value;
        setPropValues(valMap);
        setPipeline(pipelineDb);
      } catch (e) {
        console.error('ProjectPage load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pageId, fetchPage]);

  const handlePropChange = useCallback(async (propertyId, value) => {
    setPropValues(prev => ({ ...prev, [propertyId]: value }));
    try {
      await propertyService.upsertValue(pageId, propertyId, value);
    } catch (e) {
      console.error('Property save error:', e);
    }
  }, [pageId]);

  const handleTitleBlur = useCallback(async (e) => {
    const newTitle = e.target.innerText.trim();
    if (newTitle && newTitle !== page?.title) {
      await updatePage(pageId, { title: newTitle });
    }
    setEditingTitle(false);
  }, [pageId, page, updatePage]);

  const handleContentChange = useCallback(async (html) => {
    await updatePage(pageId, { content: html });
  }, [pageId, updatePage]);

  // Extrair status e cliente para o header
  const statusProp = useMemo(() => properties.find(p => p.name === 'Status'), [properties]);
  const clienteProp = useMemo(() => properties.find(p => p.name === 'Cliente'), [properties]);
  const priorityProp = useMemo(() => properties.find(p => p.name === 'Prioridade'), [properties]);
  const deadlineProp = useMemo(() => properties.find(p => p.name === 'Deadline'), [properties]);

  const statusVal = statusProp ? propValues[statusProp.id] : null;
  const statusOption = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const statusColors = statusOption ? COLOR_MAP[statusOption.color] || COLOR_MAP.gray : COLOR_MAP.gray;

  if (loading || !page) {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="h-14 bg-card/50 border-b border-border" />
        <div className="h-44 bg-gradient-to-r from-blue-900/10 to-purple-900/10" />
        <div className="max-w-5xl mx-auto w-full px-8 pt-10 space-y-4">
          <div className="h-10 bg-secondary/50 rounded w-64" />
          <div className="h-4 bg-secondary/30 rounded w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── Topbar ── */}
      <header className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm min-w-0">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <span className="text-xs">Projects Hub</span>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{page.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><Star className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><Share className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* ── Cover ── */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-blue-900/25 via-purple-900/15 to-slate-900/20 border-b border-border/40 group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-800/20 via-transparent to-transparent" />
          <button className="absolute bottom-3 right-4 text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity bg-background/30 backdrop-blur-sm px-2 py-1 rounded border border-border/30">
            + Add Cover
          </button>
        </div>

        {/* ── Project Header ── */}
        <div className="max-w-5xl mx-auto px-8 pt-8 pb-0">
          <div className="space-y-3">
            {/* Icon + Title */}
            <div className="flex items-start gap-3">
              <span className="text-4xl cursor-pointer hover:opacity-80 transition-opacity mt-1" title="Change icon">
                {page.icon || '🎬'}
              </span>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-3xl font-bold text-foreground focus:outline-none leading-tight"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleTitleBlur}
                  onClick={() => setEditingTitle(true)}
                >
                  {page.title}
                </h1>
              </div>
            </div>

            {/* ── Properties Bar ── */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 border-t border-border/30 mt-4">
              {/* Status — destaque */}
              {statusProp && (
                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="text-xs text-muted-foreground w-14">Status</span>
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium transition-opacity group-hover:opacity-80 ${statusColors.bg} ${statusColors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                    {statusOption?.label || '—'}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </span>
                </div>
              )}

              {/* Cliente */}
              {clienteProp && (
                <div className="flex items-center gap-2 group">
                  <span className="text-xs text-muted-foreground w-14">Cliente</span>
                  <div className="min-w-[100px]">
                    <PropertyRenderer property={clienteProp} value={propValues[clienteProp.id]} onChange={v => handlePropChange(clienteProp.id, v)} inline />
                  </div>
                </div>
              )}

              {/* Prioridade */}
              {priorityProp && (
                <div className="flex items-center gap-2 group">
                  <span className="text-xs text-muted-foreground w-14">Prioridade</span>
                  <PropertyRenderer property={priorityProp} value={propValues[priorityProp.id]} onChange={v => handlePropChange(priorityProp.id, v)} inline />
                </div>
              )}

              {/* Deadline */}
              {deadlineProp && (
                <div className="flex items-center gap-2 group">
                  <span className="text-xs text-muted-foreground w-14 flex items-center gap-1"><Clock className="w-3 h-3" />Deadline</span>
                  <PropertyRenderer property={deadlineProp} value={propValues[deadlineProp.id]} onChange={v => handlePropChange(deadlineProp.id, v)} inline />
                </div>
              )}

              {/* Created at */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[11px] text-muted-foreground/60">
                  Criado em {new Date(page.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-0 mt-8 border-b border-border">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Stats */}
              <div className="col-span-3 grid grid-cols-3 gap-4">
                <StatCard label="Total de Cenas" value="—" sub="Nenhuma cena ainda" color="blue" />
                <StatCard label="Em Produção" value="—" sub="Nenhuma ativa" color="yellow" />
                <StatCard label="Aprovadas" value="—" sub="Nenhuma aprovada" color="green" />
              </div>
              {/* Quick view do pipeline */}
              {pipeline && (
                <div className="col-span-3">
                  <h2 className="text-base font-semibold mb-4 text-foreground">Pipeline Resumo</h2>
                  <DatabaseRenderer databaseId={pipeline.id} defaultView="list" />
                </div>
              )}
            </div>
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && pipeline && (
            <div className="space-y-2">
              <DatabaseRenderer databaseId={pipeline.id} />
            </div>
          )}

          {/* NOTES TAB — Rich Text livre */}
          {activeTab === 'notes' && (
            <div className="max-w-[820px] space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <h2 className="font-semibold text-foreground">Briefing & Notas</h2>
              </div>
              <RichTextEditor
                content={page.content || ''}
                onChange={handleContentChange}
                placeholder="Briefing criativo, referências, notas de produção... Pressione '/' para comandos"
              />
            </div>
          )}

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Asset Library</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Em breve — integração com Google Drive e storage</p>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Activity Log</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Em breve — histórico de alterações em tempo real</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ---- STAT CARD ----
function StatCard({ label, value, sub, color }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <div className={`rounded-xl border border-border/50 p-5 bg-card/40 space-y-1`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </div>
  );
}
