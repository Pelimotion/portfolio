import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { propertyService } from '../../services/propertyService';
import { bootstrapProjectPipeline } from '../../core/databaseFactory';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { PropertyRenderer } from '../../components/properties/PropertyRenderer';
import { GenerativeCover } from '../../components/ui/cover/GenerativeCover';
import { COLOR_MAP } from '../../core/schemas';
import {
  ArrowLeft, MoreHorizontal, Share, Star, 
  LayoutDashboard, FileText, Calendar, FolderOpen,
  Activity, Clock, ChevronDown
} from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'pipeline',  label: 'Sub-Items', Icon: LayoutDashboard },
  { id: 'notes',     label: 'Notes',     Icon: FileText },
  { id: 'assets',    label: 'Assets',    Icon: FolderOpen },
  { id: 'activity',  label: 'Activity',  Icon: Activity },
];

export function UniversalEntityPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { pages, fetchPage, updatePage } = usePageStore();

  const [activeTab, setActiveTab] = useState('notes');
  const [properties, setProperties] = useState([]);
  const [propValues, setPropValues] = useState({});
  const [childDatabase, setChildDatabase] = useState(null); // Para projetos, é o pipeline. Para cenas, pode ser sub-tasks.
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);

  const page = pages[pageId];

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const currentPage = usePageStore.getState().pages[pageId];
        if (!currentPage) await fetchPage(pageId);
        const fetchedPage = usePageStore.getState().pages[pageId];
        if (!fetchedPage || !isMounted) return;

        // Se for filho direto do Root Hub, é um Projeto. Pegamos o schema do Root Hub.
        // Se for filho do Pipeline (Cena), pegamos o schema do Pipeline.
        const parentId = fetchedPage.parent_id;
        if (parentId) {
          const props = await propertyService.fetchByDatabase(parentId);
          if (isMounted) setProperties(props);
        }

        const vals = await propertyService.fetchValues(pageId);
        const valMap = {};
        for (const v of vals) valMap[v.property_id] = v.value;
        if (isMounted) setPropValues(valMap);

        // Se a entidade é um Projeto (pai = RootHub), carregamos o pipeline
        // Se a entidade é uma Cena (pai != RootHub), ela ainda pode ter sub-tasks futuramente.
        if (parentId === '00000000-0000-0000-0000-000000000000') {
          const pipelineDb = await bootstrapProjectPipeline(pageId);
          if (isMounted) {
            setChildDatabase(pipelineDb);
            setActiveTab('pipeline'); // Default for projects
          }
        } else {
          if (isMounted) setActiveTab('notes'); // Default for scenes
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

  // Só mostra loading global se não tivermos NADA da página ainda
  const isInitialLoading = loading && !page;

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full animate-pulse bg-background">
        <div className="h-14 bg-card/50 border-b border-border" />
        <div className="h-44 bg-secondary/20" />
        <div className="max-w-4xl mx-auto w-full px-8 pt-10 space-y-4">
          <div className="h-10 bg-secondary/50 rounded w-64" />
          <div className="h-4 bg-secondary/30 rounded w-48" />
        </div>
      </div>
    );
  }

  if (!page) return null;

  const statusProp = properties.find(p => p.name === 'Status');
  const priorityProp = properties.find(p => p.name === 'Prioridade');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const otherProps = properties.filter(p => !['Status', 'Prioridade', 'Deadline', 'Entrega'].includes(p.name));

  const statusVal = statusProp ? propValues[statusProp.id] : null;
  const statusOption = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const statusColors = statusOption ? COLOR_MAP[statusOption.color] || COLOR_MAP.gray : COLOR_MAP.gray;

  // Renderizar Tabs baseadas no contexto (cenas não precisam de overview se não tiverem childDatabase)
  const availableTabs = TABS.filter(t => {
    if ((t.id === 'overview' || t.id === 'pipeline') && !childDatabase) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">

      {/* ── Topbar ── */}
      <header className="absolute top-0 w-full h-12 flex items-center justify-between px-5 border-b border-border/10 bg-background/20 backdrop-blur-md z-10 hover:bg-background/80 transition-colors">
        <div className="flex items-center gap-3 text-sm min-w-0">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <span className="text-xs">{page.parent_id === '00000000-0000-0000-0000-000000000000' ? 'Project' : 'Entity'}</span>
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

        {/* ── Procedural Generative Cover ── */}
        <GenerativeCover seed={page.title || page.id} className="h-56" />

        {/* ── Entity Header ── */}
        <div className="max-w-4xl mx-auto px-8 pb-0 -mt-8 relative z-10">
          <div className="space-y-4">
            
            {/* Icon + Title */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-card border border-border/50 shadow-lg flex items-center justify-center text-4xl cursor-pointer hover:opacity-80 transition-opacity" title="Change icon">
                {page.icon || '📝'}
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <h1
                  className="text-4xl font-bold text-foreground focus:outline-none leading-tight"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleTitleBlur}
                  onClick={() => setEditingTitle(true)}
                >
                  {page.title || 'Untitled'}
                </h1>
              </div>
            </div>

            {/* ── Properties Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4">
              
              {/* Status */}
              {statusProp && (
                <div className="flex flex-col gap-1.5 group cursor-pointer">
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Status</span>
                  <span className={`inline-flex items-center w-max gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-opacity group-hover:opacity-80 ${statusColors.bg} ${statusColors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                    {statusOption?.label || '—'}
                    <ChevronDown className="w-3 h-3 opacity-60 ml-1" />
                  </span>
                </div>
              )}

              {/* Priority */}
              {priorityProp && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Prioridade</span>
                  <PropertyRenderer property={priorityProp} value={propValues[priorityProp.id]} onChange={v => handlePropChange(priorityProp.id, v)} inline />
                </div>
              )}

              {/* Deadline */}
              {deadlineProp && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Deadline</span>
                  <PropertyRenderer property={deadlineProp} value={propValues[deadlineProp.id]} onChange={v => handlePropChange(deadlineProp.id, v)} inline />
                </div>
              )}

              {/* Outras propriedades dinâmicas */}
              {otherProps.map(prop => (
                <div key={prop.id} className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider truncate" title={prop.name}>{prop.name}</span>
                  <PropertyRenderer property={prop} value={propValues[prop.id]} onChange={v => handlePropChange(prop.id, v)} inline />
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-2 mt-10 border-b border-border/40">
            {availableTabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && childDatabase && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 grid grid-cols-3 gap-4">
                <StatCard label="Total Items" value="—" sub="Nenhum item ainda" color="blue" />
                <StatCard label="Em Andamento" value="—" sub="Nenhum ativo" color="yellow" />
                <StatCard label="Concluídos" value="—" sub="Nenhum finalizado" color="green" />
              </div>
              <div className="col-span-3">
                <h2 className="text-base font-semibold mb-4 text-foreground">Resumo</h2>
                <DatabaseRenderer databaseId={childDatabase.id} defaultView="list" />
              </div>
            </div>
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && childDatabase && (
            <div className="space-y-2">
              <DatabaseRenderer databaseId={childDatabase.id} />
            </div>
          )}

          {/* NOTES / CONTENT TAB — Rich Text livre */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <RichTextEditor
                key={pageId}
                content={page.content || ''}
                onChange={handleContentChange}
                placeholder="Pressione '/' para comandos. Escreva briefing, roteiro, observações..."
              />
            </div>
          )}

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-xl border border-border/30 border-dashed">
              <FolderOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium text-sm">Nenhum Asset Linkado</p>
              <p className="text-xs text-muted-foreground mt-1">Conecte Pastas do Google Drive ou Frame.io aqui.</p>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-xl border border-border/30 border-dashed">
              <Activity className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium text-sm">Log de Atividade</p>
              <p className="text-xs text-muted-foreground mt-1">Histórico completo de modificações em breve.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <div className={`rounded-xl border border-border/30 p-5 bg-card/20 space-y-1 hover:bg-card/40 transition-colors`}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </div>
  );
}
