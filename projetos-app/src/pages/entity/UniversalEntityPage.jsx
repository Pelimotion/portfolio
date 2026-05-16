import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { useTeamStore } from '../../stores/useTeamStore';
import { propertyService } from '../../services/propertyService';
import { pageService } from '../../services/pageService';
import { bootstrapProjectPipeline } from '../../core/databaseFactory';
import { useDriveSlots } from '../../hooks/useDriveSlots';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { DatabaseRenderer } from '../../components/database/DatabaseRenderer';
import { PropertyRenderer } from '../../components/properties/PropertyRenderer';
import { GenerativeCover } from '../../components/ui/cover/GenerativeCover';
import { AssetsPanel } from '../../components/storage/AssetsPanel';
import { ProjectTeamSettings } from '../../components/database/ProjectTeamSettings';
import { googleDriveProvider } from '../../core/storage/storageProvider';
import { googleAuth } from '../../lib/googleAuth';
import { COLOR_MAP } from '../../core/colors';
import {
  ArrowLeft, MoreHorizontal, Share, Star,
  BarChart2, FileText, CalendarDays, FolderOpen,
  Activity, Clock, ChevronDown, AlertTriangle,
  CheckCircle2, Loader2, Users, TrendingUp, Zap,
  Circle, ArrowRight, Trash2, Home, ChevronRight,
  LayoutDashboard, Database, Share2, Plus, Settings,
  Copy, ExternalLink, MessageCircle, Link2
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProjectArtPattern } from '../../components/ui/ProjectArtPattern';
import { getAccentColorFromId } from '../../lib/artPatternEngine';
import { TamagochiAvatar } from '../../components/ui/TamagochiAvatar';
import { hashString } from '../../lib/avatarEngine';
import { useAuth } from '../../contexts/AuthContext';

// ── Tabs ────────────────────────────────────────
const PROJECT_TABS = [
  { id: 'dashboard', label: 'Dashboard',  Icon: BarChart2 },
  { id: 'pipeline',  label: 'Pipeline',   Icon: Zap },
  { id: 'assets',    label: 'Assets',     Icon: FolderOpen },
];

const SCENE_TABS = [
  { id: 'notes',    label: 'Notes',    Icon: FileText },
  { id: 'assets',  label: 'Assets',   Icon: FolderOpen },
];

const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';

export function UniversalEntityPage() {
  const { pageId } = useParams();
  const navigate   = useNavigate();
  const { user, profile } = useAuth();
  const { pages, fetchPage, updatePage, archivePage } = usePageStore();

  const [activeTab,     setActiveTab]     = useState('notes');
  const [properties,    setProperties]    = useState([]);
  const [propValues,    setPropValues]    = useState({});
  const [childDatabase, setChildDatabase] = useState(null);
  const [allItems,      setAllItems]      = useState([]);
  const [allItemValues, setAllItemValues] = useState({});
  const [pipelineProps, setPipelineProps] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);
  const [grandparentPageId, setGrandparentPageId] = useState(null);

  const page     = pages[pageId];
  const isProject = page?.parent_id === ROOT_HUB_ID;

  useEffect(() => {
    if (!isProject && page?.parent_id) {
      pageService.fetchById(page.parent_id)
        .then(dbPage => {
          if (dbPage?.parent_id) setGrandparentPageId(dbPage.parent_id);
        })
        .catch(console.error);
    }
  }, [isProject, page?.parent_id]);

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
                setPipelineProps(itemProps || []);
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
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega' || p.name === 'Data de Entrega' || p.property_type === 'date');
  const clienteProp  = properties.find(p => p.name === 'Cliente');
  const otherProps   = properties.filter(p => !['Status', 'Prioridade', 'Deadline', 'Entrega', 'Data de Entrega', 'Cliente'].includes(p.name));

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
            <button onClick={() => navigate(`/page/${page.parent_id}`)} className="hover:text-foreground transition-colors truncate max-w-[150px]">
              {pages.find(p => p.id === page.parent_id)?.title || 'Projeto Pai'}
            </button>
            <ChevronRight className="w-3 h-3 opacity-30" />
          </>
        )}
        <span className="text-foreground/80 truncate font-bold">{page?.title}</span>
      </div>

      {/* ── PROJECT COVER ── */}
      <div className="h-48 w-full bg-[var(--surface-2)] relative overflow-hidden group/cover shrink-0">
        <ProjectArtPattern 
          projectId={pageId} 
          size="full" 
          opacity={0.15} 
          style="geometric"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)]/80 to-transparent" />
        
        {/* Change Cover Button (UI only for now) */}
        <button className="absolute bottom-4 right-8 opacity-0 group-hover/cover:opacity-100 transition-all bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
          Alterar Capa
        </button>
      </div>

      {/* ── PROJECT HEADER ── */}
      <div className="relative -mt-12 pt-0 pb-0 px-8 border-b border-[var(--border-subtle)] bg-transparent overflow-hidden shrink-0">
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-center text-3xl shadow-2xl">
              {page?.icon || (isProject ? <FolderOpen className="w-8 h-8 text-muted-foreground/30" /> : <Database className="w-8 h-8 text-muted-foreground/30" />)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{page?.title}</h1>
                {statusProp && (
                  <div className="mt-2">
                    <PropertyRenderer property={statusProp} value={statusVal} onChange={v => handlePropChange(statusProp.id, v)} inline />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                   {isProject ? 'Projeto Motion' : 'Cena / Take'}
                 </span>
                 {page?.description && (
                   <span className="text-xs text-muted-foreground/40 font-medium">• {page.description}</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1 bg-[var(--surface-1)]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border-subtle)]">
            {isProject && (
              <button 
                onClick={() => setTeamSettingsOpen(true)}
                className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]"
                title="Configurações da Equipe"
              >
                <Users className="w-4 h-4" />
              </button>
            )}

            {/* Share Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]">
                  <Share2 className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="z-50 min-w-[180px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
                  <DropdownMenu.Item 
                    onSelect={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copiado!');
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none"
                  >
                    <Link2 className="w-4 h-4" /> Copiar Link
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onSelect={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://api.whatsapp.com/send?text=Confira este projeto na Pelimotion: ${url}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-green-500/10 rounded-lg cursor-pointer outline-none"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* More Actions Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 hover:bg-[var(--surface-3)] rounded-xl text-muted-foreground transition-all border border-transparent hover:border-[var(--border-subtle)]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="z-50 min-w-[180px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
                  <DropdownMenu.Item 
                    onSelect={() => setShowHeaderEditor(!showHeaderEditor)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none"
                  >
                    <Settings className="w-4 h-4" /> Editar Propriedades
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none">
                    <Copy className="w-4 h-4" /> Duplicar Projeto
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1" />
                  <DropdownMenu.Item 
                    onSelect={() => {
                      if (confirm('Excluir este projeto permanentemente? Todos os cards internos serão removidos.')) {
                        archivePage(pageId).then(() => navigate('/'));
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir Projeto
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <div className="w-px h-8 bg-border/50 mx-2" />
            <button onClick={() => navigate('/profile')} className="transition-transform hover:scale-110 shrink-0">
              <TamagochiAvatar size={36} seed={profile?.avatar_seed ?? hashString(user?.id || '0')} accentColor={profile?.accent_color ?? '#3b82f6'} />
            </button>
          </div>
        </div>

        {/* ── HEADER EDITOR PANEL ── */}
        {showHeaderEditor && (
          <div className="relative z-10 mt-6 p-4 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Configurações do Projeto</h3>
              <button onClick={() => setShowHeaderEditor(false)} className="p-1 hover:bg-[var(--surface-3)] rounded-lg transition-colors">
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Informações Básicas</label>
                <div className="space-y-2">
                  <input 
                    defaultValue={page?.title} 
                    onBlur={(e) => updatePage(pageId, { title: e.target.value })}
                    className="w-full bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Título do Projeto"
                  />
                  <textarea 
                    defaultValue={page?.description} 
                    onBlur={(e) => updatePage(pageId, { description: e.target.value })}
                    className="w-full bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[80px]"
                    placeholder="Descrição breve..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Propriedades Rápidas</label>
                <div className="space-y-3">
                  {statusProp && (
                    <div className="flex items-center justify-between gap-4 p-2 bg-[var(--surface-3)] rounded-lg border border-[var(--border-subtle)]">
                      <span className="text-xs font-medium text-muted-foreground">Status Global</span>
                      <PropertyRenderer property={statusProp} value={statusVal} onChange={v => handlePropChange(statusProp.id, v)} inline />
                    </div>
                  )}
                  {priorityProp && (
                    <div className="flex items-center justify-between gap-4 p-2 bg-[var(--surface-3)] rounded-lg border border-[var(--border-subtle)]">
                      <span className="text-xs font-medium text-muted-foreground">Prioridade</span>
                      <PropertyRenderer property={priorityProp} value={propValues[priorityProp.id]} onChange={v => handlePropChange(priorityProp.id, v)} inline />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Ações de Risco</label>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
                  <p className="text-[10px] text-red-500/80 leading-relaxed font-medium">Estas ações são permanentes e afetam todos os dados vinculados a este projeto.</p>
                  <button 
                    onClick={() => {
                      if (confirm('Tem certeza que deseja arquivar este projeto?')) {
                        archivePage(pageId).then(() => navigate('/'));
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Arquivar Projeto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              properties={pipelineProps}
              allValues={allItemValues}
              projectTitle={page.title}
              pageId={pageId}
              pageContent={page.content || ''}
              onContentChange={handleContentChange}
              onGoToAssets={() => setActiveTab('assets')}
            />
          )}
          {activeTab === 'pipeline' && childDatabase && (
            <DatabaseRenderer key="pipeline" databaseId={childDatabase.id} defaultView="kanban" />
          )}
          {activeTab === 'assets' && (
            <AssetsPanel 
              pageId={pageId} 
              isProject={isProject} 
              parentProjectId={!isProject ? grandparentPageId : null}
            />
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



function ProductionDashboard({ items, properties, allValues, projectTitle, pageId, pageContent, onContentChange, onGoToAssets }) {
  const statusProp    = properties.find(p => p.property_type === 'status' || p.name === 'Status');
  const deadlineProp  = properties.find(p => p.property_type === 'date' || p.name === 'Data de Entrega' || p.name === 'Deadline');
  const assigneeProp  = properties.find(p => p.name === 'Responsavel' || p.name === 'Responsável');
  const atoProp       = properties.find(p => p.name === 'Ato');
  const doneProp      = properties.find(p => p.property_type === 'checkbox' && (p.name.toLowerCase().includes('feito') || p.name.toLowerCase().includes('concluí')));
  const statusOptions = statusProp?.config?.options || [];
  const today = new Date();

  // Status aliases: styleframes = "Em Styleframes", backlog = "Stand By", animacao = "Em Animação", finalizacao = "Finalização"
  const DONE_IDS     = ['finalizacao', 'entregue', 'concluido', 'done', 'approved', 'finalizado'];
  const ACTIVE_IDS   = ['styleframes', 'animacao', 'em_progresso', 'producao', 'revisao'];
  const STANDBY_IDS  = ['backlog', 'a_fazer', 'pendente', 'stand_by'];

  const getStatus = (itemId) => {
    const sel = allValues[itemId]?.[statusProp?.id]?.selected;
    return statusOptions.find(o => o.id === sel);
  };

  const kpis = useMemo(() => {
    const total      = items.length;
    const done       = items.filter(i => {
      const isChecked = doneProp && allValues[i.id]?.[doneProp.id]?.checkbox === true;
      if (isChecked) return true;
      const st = getStatus(i.id);
      return st && DONE_IDS.some(k => st.id.includes(k) || st.label.toLowerCase().includes(k));
    }).length;

    const active     = items.filter(i => {
      const isChecked = doneProp && allValues[i.id]?.[doneProp.id]?.checkbox === true;
      if (isChecked) return false;
      const st = getStatus(i.id);
      return st && ACTIVE_IDS.some(k => st.id.includes(k));
    }).length;

    const standby    = items.filter(i => {
      const isChecked = doneProp && allValues[i.id]?.[doneProp.id]?.checkbox === true;
      if (isChecked) return false;
      const st = getStatus(i.id);
      return st && STANDBY_IDS.some(k => st.id.includes(k));
    }).length;

    const overdue    = deadlineProp ? items.filter(i => {
      const d = allValues[i.id]?.[deadlineProp.id]?.date;
      const st = getStatus(i.id);
      const isDone = (doneProp && allValues[i.id]?.[doneProp.id]?.checkbox === true) || (st && DONE_IDS.some(k => st.id.includes(k)));
      return d && !isDone && new Date(d) < today;
    }).length : 0;

    let totalProgressSum = 0;
    items.forEach(i => {
      const isChecked = doneProp && allValues[i.id]?.[doneProp.id]?.checkbox === true;
      if (isChecked) {
        totalProgressSum += 100;
        return;
      }
      const st = getStatus(i.id);
      if (st) {
        if (DONE_IDS.some(k => st.id.includes(k) || st.label.toLowerCase().includes(k))) {
          totalProgressSum += 100;
          return;
        }
        if (statusOptions.length > 1) {
          const idx = statusOptions.findIndex(o => o.id === st.id);
          if (idx > 0) {
            totalProgressSum += (idx / (statusOptions.length - 1)) * 100;
          }
        }
      }
    });

    const progress = total > 0 ? Math.round(totalProgressSum / total) : 0;
    return { total, done, active, standby, overdue, progress };
  }, [items, allValues, statusProp, deadlineProp, doneProp, statusOptions]);

  // Stage deadlines: group scenes by status, find latest deadline per stage, or use status milestone deadline
  const stageSummary = useMemo(() => {
    return statusOptions.map(opt => {
      const stageItems = items.filter(i => allValues[i.id]?.[statusProp?.id]?.selected === opt.id);
      const dates = stageItems.map(i => allValues[i.id]?.[deadlineProp?.id]?.date).filter(Boolean);
      const latestDate = dates.length > 0 ? dates.reduce((a, b) => a > b ? a : b) : null;
      const finalDeadline = opt.deadline || latestDate;
      const isDone = DONE_IDS.some(k => opt.id.includes(k));
      return { ...opt, count: stageItems.length, deadline: finalDeadline, isDone };
    }).filter(s => s.count > 0 || s.deadline);
  }, [items, allValues, statusProp, deadlineProp, statusOptions]);

  // Workload by assignee (select type)
  const workloadDist = useMemo(() => {
    if (!assigneeProp) return [];
    const counts = {};
    items.forEach(i => {
      const isDone = DONE_IDS.some(k => getStatus(i.id)?.id?.includes(k));
      if (isDone) return;
      const sel = allValues[i.id]?.[assigneeProp.id]?.selected;
      if (!sel) return;
      const label = assigneeProp.config?.options?.find(o => o.id === sel)?.label || sel;
      counts[label] = (counts[label] || 0) + 1;
    });
    const total = items.filter(i => !DONE_IDS.some(k => getStatus(i.id)?.id?.includes(k))).length || 1;
    return Object.entries(counts).map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [items, allValues, assigneeProp, statusProp]);

  // Workload by Ato
  const atoDist = useMemo(() => {
    if (!atoProp) return [];
    const opts = atoProp.config?.options || [];
    return opts.map(opt => ({
      ...opt,
      total: items.filter(i => allValues[i.id]?.[atoProp.id]?.selected === opt.id).length,
      done:  items.filter(i => allValues[i.id]?.[atoProp.id]?.selected === opt.id && DONE_IDS.some(k => getStatus(i.id)?.id?.includes(k))).length,
    })).filter(a => a.total > 0);
  }, [items, allValues, atoProp, statusProp]);

  const health = [
    { label: 'Cenas em Stand By',   value: kpis.standby,           type: kpis.standby > items.length * 0.5 ? 'warn' : 'info' },
    { label: 'Cenas em Produção',   value: kpis.active,            type: 'blue' },
    { label: 'Entregas Atrasadas',  value: kpis.overdue,           type: kpis.overdue > 0 ? 'danger' : 'ok' },
    { label: 'Taxa de Conclusão',   value: `${kpis.progress}%`,    type: kpis.progress >= 80 ? 'ok' : kpis.progress >= 40 ? 'warn' : 'info' },
    { label: 'Total de Cenas',      value: `${kpis.done}/${kpis.total}`, type: 'neutral' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={<Circle className="w-3.5 h-3.5"/>}        label="Total de Cenas"  value={kpis.total}    color="default"/>
        <KpiCard icon={<Loader2 className="w-3.5 h-3.5"/>}       label="Em Produção"     value={kpis.active}   color="blue"/>
        <KpiCard icon={<AlertTriangle className="w-3.5 h-3.5"/>} label="Stand By"        value={kpis.standby}  color={kpis.standby > 0 ? 'yellow' : 'default'}/>
        <KpiCard icon={<CheckCircle2 className="w-3.5 h-3.5"/>}  label="Finalizadas"     value={kpis.done}     color="green"/>
      </div>

      {/* Progress bar */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">Progresso Geral</span>
            <div className="text-2xl font-black text-foreground">{kpis.progress}% <span className="text-xs text-muted-foreground/50 font-normal">completo</span></div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border-subtle)]">{kpis.done} / {kpis.total} CENAS</span>
        </div>
        <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-1000" style={{ width: `${kpis.progress}%` }}/>
        </div>
      </div>

      {/* Documentos do Projeto */}
      <DocsSectionDashboard projectId={pageId} onGoToAssets={onGoToAssets} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Stage deadline table */}
        <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-500"/> Etapas do Pipeline
          </h3>
          <div className="space-y-1.5">
            {stageSummary.length === 0 && <p className="text-[11px] text-muted-foreground/40 italic">Nenhum item com status ainda.</p>}
            {stageSummary.map(stage => {
              const colors  = COLOR_MAP[stage.color] || COLOR_MAP.gray;
              const dDate   = stage.deadline ? new Date(stage.deadline) : null;
              const isLate  = dDate && dDate < today && !stage.isDone;
              const diffDays = dDate ? Math.ceil((dDate - today) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={stage.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text} shrink-0`}>{stage.label}</span>
                  <span className="text-xs text-muted-foreground flex-1">{stage.count} {stage.count === 1 ? 'cena' : 'cenas'}</span>
                  <div className="w-24 h-1 bg-[var(--surface-3)] rounded-full overflow-hidden shrink-0">
                    <div className={`h-full ${colors.bg}`} style={{ width: `${(stage.count / kpis.total) * 100}%` }}/>
                  </div>
                  {dDate ? (
                    <span className={`text-[10px] font-mono shrink-0 ${isLate ? 'text-red-400' : diffDays <= 7 ? 'text-yellow-400' : 'text-muted-foreground/50'}`}>
                      {isLate ? `${Math.abs(diffDays)}d atraso` : dDate.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                    </span>
                  ) : <span className="text-[10px] text-muted-foreground/30 shrink-0">—</span>}
                </div>
              );
            })}
          </div>
          {/* Stacked bar */}
          {stageSummary.length > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-2">
              {stageSummary.map(s => {
                const colors = COLOR_MAP[s.color] || COLOR_MAP.gray;
                return <div key={s.id} title={`${s.label}: ${s.count}`} className={`h-full ${colors.bg}`} style={{ width: `${(s.count / kpis.total) * 100}%` }}/>;
              })}
            </div>
          )}
        </div>

        {/* Health */}
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500"/> Saúde do Projeto
          </h3>
          <div className="space-y-1">
            {health.map(h => <HealthRow key={h.label} label={h.label} value={h.value} type={h.type}/>)}
          </div>
        </div>
      </div>

      {/* Workload + Ato breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
            <Users className="w-3.5 h-3.5"/> Workload por Responsável
          </h3>
          {workloadDist.length === 0 && <p className="text-xs text-muted-foreground/50 italic">Nenhum responsável atribuído.</p>}
          <div className="space-y-2">
            {workloadDist.map(w => (
              <div key={w.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[8px] text-primary font-bold uppercase">{w.name.charAt(0)}</div>
                    <span className="text-xs font-medium text-foreground">{w.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{w.count} cenas · {w.pct}%</span>
                </div>
                <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 transition-all" style={{ width: `${w.pct}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5"/> Progresso por Ato
          </h3>
          {atoDist.length === 0 && <p className="text-xs text-muted-foreground/50 italic">Nenhum Ato definido.</p>}
          <div className="space-y-2">
            {atoDist.map(a => {
              const colors = COLOR_MAP[a.color] || COLOR_MAP.gray;
              const pct = a.total > 0 ? Math.round((a.done / a.total) * 100) : 0;
              return (
                <div key={a.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{a.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{a.done}/{a.total} · {pct}%</span>
                  </div>
                  <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div className={`h-full ${colors.bg} transition-all`} style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes integradas */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
        <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
          <FileText className="w-3.5 h-3.5"/> Notas do Projeto
        </h3>
        <RichTextEditor
          key={pageId}
          content={pageContent}
          onChange={onContentChange}
          placeholder="Briefing, roteiro, decisões técnicas, links importantes..."
        />
      </div>

    </div>
  );
}


// ── Seção de Documentos do Projeto no Dashboard ──
function DocsSectionDashboard({ projectId, onGoToAssets }) {
  const { slots, loading } = useDriveSlots({ projectId, pageId: projectId, isScene: false });
  const [files, setFiles] = useState([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [driveError, setDriveError] = useState(null);

  // Apenas slots de documento que têm link
  const docSlots    = useMemo(() => slots.filter(s => s.slot_key?.includes('doc') || s.display_name?.toLowerCase().includes('doc')), [slots]);
  const linkedDocSlots = useMemo(() => docSlots.filter(s => s.link?.drive_url), [docSlots]);

  const loadFiles = useCallback(async (forceAuth = false) => {
    if (linkedDocSlots.length === 0) return;

    let token = localStorage.getItem('gdrive_token');
    const expires = localStorage.getItem('gdrive_token_expires');
    
    if (forceAuth || !token || Date.now() > Number(expires)) {
      if (!forceAuth) return; // Silent fail auto-fetch
      try {
        token = await googleAuth.getAccessToken();
      } catch (e) {
        setDriveError(e.message);
        return;
      }
    }
    
    if (!token) return;
    
    setFetchingFiles(true);
    setDriveError(null);
    try {
      const allFiles = [];
      for (const slot of linkedDocSlots) {
        const folderId = slot.link.drive_file_id;
        if (folderId) {
          const contents = await googleDriveProvider.listContents(folderId, token);
          allFiles.push(...contents.map(c => ({ ...c, slotName: slot.display_name })));
        }
      }
      setFiles(allFiles);
    } catch (e) {
      console.error(e);
      setDriveError('Sessão expirada ou acesso negado. Reconecte o Drive.');
      localStorage.removeItem('gdrive_token');
    } finally {
      setFetchingFiles(false);
    }
  }, [linkedDocSlots]);

  useEffect(() => {
    loadFiles(false);
  }, [loadFiles]);

  if (loading) return null;

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] flex items-center gap-2">
          <FileText className="w-3.5 h-3.5"/> Documentos do Projeto
        </h3>
        {linkedDocSlots.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/40">
              {files.length} arquivo{files.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={() => loadFiles(true)} 
              disabled={fetchingFiles}
              className="text-[10px] font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              Sincronizar Drive
            </button>
          </div>
        )}
      </div>

      {linkedDocSlots.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-muted-foreground/30"/>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pasta de Documentos não vinculada</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">Aguardando a sincronização da pasta padrão "Docs" na aba Assets.</p>
          </div>
          <button
            onClick={onGoToAssets}
            className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            Sincronizar em Assets →
          </button>
        </div>
      ) : driveError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div className="text-xs text-red-400">{driveError}</div>
          <button onClick={() => loadFiles(true)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded text-xs font-bold hover:bg-red-500/20 transition-colors">
            Conectar Google Drive
          </button>
        </div>
      ) : fetchingFiles && files.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--surface-2)]">
          <div className="text-[11px] text-muted-foreground/50">Nenhum arquivo encontrado nesta pasta.</div>
          <button onClick={() => loadFiles(true)} className="text-[10px] text-primary hover:underline">Autenticar para ler arquivos</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {files.map(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <a
                key={file.id}
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="shrink-0 w-6 h-6 rounded flex items-center justify-center bg-white/5">
                  {file.iconLink ? (
                    <img src={file.iconLink} alt="" className="w-4 h-4" />
                  ) : isFolder ? (
                    <FolderOpen className="w-4 h-4 text-blue-400"/>
                  ) : (
                    <FileText className="w-4 h-4 text-gray-400"/>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{file.name}</p>
                  <p className="text-[9px] text-muted-foreground/40 truncate">{file.slotName}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }) {
  const p = {
    default: { bg: 'bg-[var(--surface-1)] border-[var(--border-subtle)]', text: 'text-foreground', iconCls: 'text-muted-foreground/40' },
    blue:    { bg: 'bg-blue-500/5 border-blue-500/10', text: 'text-blue-400', iconCls: 'text-blue-400/50' },
    red:     { bg: 'bg-red-500/5 border-red-500/10', text: 'text-red-400', iconCls: 'text-red-400/50' },
    green:   { bg: 'bg-emerald-500/5 border-emerald-500/10', text: 'text-emerald-400', iconCls: 'text-emerald-400/50' },
    yellow:  { bg: 'bg-yellow-500/5 border-yellow-500/10', text: 'text-yellow-400', iconCls: 'text-yellow-400/50' },
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
