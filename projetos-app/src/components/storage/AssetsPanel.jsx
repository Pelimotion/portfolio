import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from '../../services/storageService';
import {
  FolderOpen, Link2, CheckCircle2, Plus, ExternalLink,
  HardDrive, RefreshCw, Unlink, ChevronRight, Folder,
  Database, Zap
} from 'lucide-react';
import { FolderPickerModal } from './FolderPickerModal';
import { googleDriveProvider } from '../../core/storage/storageProvider';
import { googleAuth } from '../../lib/googleAuth';

// Google Drive SVG logo inline
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" className="w-5 h-5">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const PROVIDERS = [
  { id: 'google_drive', label: 'Google Drive', Icon: GoogleDriveIcon, available: true },
  { id: 'dropbox',      label: 'Dropbox',       Icon: () => <span className="text-xl">📦</span>, available: false },
  { id: 'onedrive',     label: 'OneDrive',      Icon: () => <span className="text-xl">☁️</span>, available: false },
  { id: 'lucidlink',    label: 'LucidLink',     Icon: () => <span className="text-xl">🔗</span>, available: false },
];

const FOLDER_ROLES = [
  { id: 'root',       label: 'Pasta Raiz',     icon: '📁', desc: 'Pasta principal do projeto' },
  { id: 'renders',    label: 'Renders',         icon: '🎞️', desc: 'Renders e outputs finais' },
  { id: 'references', label: 'Referências',     icon: '📌', desc: 'Refs visuais, moodboards' },
  { id: 'assets',     label: 'Assets',          icon: '🎨', desc: 'Texturas, elementos, sources' },
  { id: 'exports',    label: 'Exportações',     icon: '📤', desc: 'Arquivos entregues ao cliente' },
];

// ============================================
// ASSETS TAB — Storage Connection Panel
// ============================================
export function AssetsPanel({ pageId, isProject, parentProjectId }) {
  const [connection, setConnection]   = useState(null);
  const [entityFolders, setEntityFolders] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [connecting, setConnecting]   = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [activeRole, setActiveRole]   = useState(null);
  const [syncing, setSyncing]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const targetId = isProject ? pageId : parentProjectId;
      if (targetId) {
        const conn = await storageService.getConnection(targetId);
        setConnection(conn);
      }
      const folders = await storageService.getEntityFolders(pageId, parentProjectId);
      setEntityFolders(folders);
    } catch (e) {
      console.error('AssetsPanel load error:', e);
    } finally {
      setLoading(false);
    }
  }, [pageId, isProject, parentProjectId]);

  useEffect(() => { load(); }, [load]);

  // Simulate Google Drive OAuth (placeholder until real OAuth is configured)
  const handleConnectDrive = async () => {
    setConnecting(true);
    try {
      // In production: trigger Google OAuth picker
      // For now: show a manual input dialog
      const folderUrl = window.prompt(
        '📁 Cole a URL da pasta raiz do Google Drive:\n(Ex: https://drive.google.com/drive/folders/FOLDER_ID)'
      );
      if (!folderUrl) { setConnecting(false); return; }

      // Extract folder ID from URL
      const match = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
      const folderId   = match?.[1] || 'manual_' + Date.now();
      const folderName = folderUrl.split('/').pop() || 'Pasta do Projeto';

      const conn = await storageService.upsertConnection({
        projectPageId: pageId,
        provider: 'google_drive',
        rootFolderId: folderId,
        rootFolderName: folderName,
        metadata: { url: folderUrl },
      });
      setConnection(conn);
    } catch (e) {
      console.error('Connect Drive error:', e);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Desconectar o Google Drive deste projeto?')) return;
    try {
      await storageService.removeConnection(pageId);
      setConnection(null);
    } catch (e) { console.error(e); }
  };

  const handleLinkFolder = (roleId) => {
    setActiveRole(roleId);
    setPickerOpen(true);
  };

  const onFolderSelect = async (node) => {
    if (!connection) return;
    try {
      await storageService.linkEntityFolder({
        entityPageId: pageId,
        connectionId: connection.id,
        folderProvId: node.id,
        folderName: node.name,
        role: activeRole,
        targetType: node.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: node.mimeType
      });
      await load();
    } catch (e) {
      console.error('onFolderSelect error:', e);
    }
  };

  const handleSyncStructure = async () => {
    if (!connection) return;
    
    setSyncing(true);
    try {
      // Passo A: Forçar login do Google e obter Access Token
      const token = await googleAuth.ensureToken();
      
      // Passo B: Fazer fetch real na API do Google Drive (Crawl)
      // O crawlProject faz requisições recursivas para buscar subpastas
      const folders = await googleDriveProvider.crawlProject(connection.root_folder_id, token);
      
      if (!folders || folders.length === 0) {
        throw new Error('Nenhuma subpasta encontrada dentro da pasta raiz selecionada.');
      }

      // Passo C: Salvar/Inserir na tabela storage_folders do Supabase
      await storageService.saveFolders(connection.id, folders);

      // Passo D: Atualizar a UI
      await load(); // Recarrega conexões e folders vinculados
      alert(`Sucesso! ${folders.length} pastas sincronizadas do Google Drive.`);
      
    } catch (e) {
      console.error('Erro na Sincronização Real:', e);
      // Exibe erro claro para o usuário (Cancelamento, RLS ou API)
      alert(`⚠️ Falha na Sincronização:\n${e.message || 'Erro desconhecido'}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-16 bg-secondary/30 rounded-xl" />
      <div className="h-32 bg-secondary/20 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Project Storage Connection (only shown on Projects) ── */}
      {isProject && (
        <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Armazenamento do Projeto</h3>
                <p className="text-xs text-muted-foreground">Conecte uma pasta raiz para indexação automática</p>
              </div>
            </div>
            {connection && (
              <button onClick={handleDisconnect} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <Unlink className="w-3.5 h-3.5" /> Desconectar
              </button>
            )}
          </div>

          <div className="p-5">
            {!connection ? (
              // ── Not connected ──
              <div>
                {!showProviders ? (
                  <button
                    onClick={() => setShowProviders(true)}
                    className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-all group"
                  >
                    <Plus className="w-4 h-4 group-hover:text-primary" />
                    <span className="text-sm font-medium">Conectar Storage</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        disabled={!p.available || connecting}
                        onClick={p.id === 'google_drive' ? handleConnectDrive : undefined}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                          ${p.available
                            ? 'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                            : 'border-border/30 opacity-40 cursor-not-allowed'
                          }`}
                      >
                        <p.Icon />
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.label}</p>
                          {!p.available && <p className="text-[10px] text-muted-foreground">Em breve</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // ── Connected ──
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Google Drive conectado</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {connection.root_folder_name || connection.root_folder_id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = connection.metadata?.url;
                    if (url) window.open(url, '_blank');
                  }}
                  className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
                  title="Abrir no Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Folder Roles Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5" /> Pastas Vinculadas
          </h3>
          {connection && (
            <button 
              onClick={handleSyncStructure}
              disabled={syncing}
              className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 uppercase tracking-widest transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Estrutura'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FOLDER_ROLES.map(role => {
            const linked = entityFolders.find(f => f.role === role.id);
            return (
              <div
                key={role.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all relative group
                  ${linked
                    ? 'border-border/50 bg-card/40'
                    : 'border-dashed border-border/40 hover:border-primary/30 hover:bg-primary/5 cursor-pointer'
                  }`}
                onClick={() => !linked && (connection) && handleLinkFolder(role.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {linked?.metadata?.thumbnail ? (
                    <img src={linked.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{role.icon}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{role.label}</p>
                    {linked?.inherited && (
                       <span className="text-[8px] font-bold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase">Herança</span>
                    )}
                  </div>
                  {linked ? (
                    <p className="text-xs text-emerald-400 truncate">{linked.folder_name}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">{role.desc}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {linked && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLinkFolder(role.id); }}
                      className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {linked ? (
                    <a
                      href={linked.target_type === 'file' 
                        ? `https://drive.google.com/file/d/${linked.provider_folder_id}/view`
                        : `https://drive.google.com/drive/folders/${linked.provider_folder_id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!connection && isProject && (
          <div className="p-8 border-2 border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
             <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-muted-foreground/40" />
             </div>
             <div className="space-y-1">
               <p className="text-xs font-semibold text-foreground">Automação de Assets</p>
               <p className="text-[10px] text-muted-foreground max-w-[200px]">Conecte seu Google Drive para que o sistema possa mapear a árvore de pastas automaticamente.</p>
             </div>
          </div>
        )}
      </div>

      <FolderPickerModal 
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        connection={connection}
        onSelect={onFolderSelect}
        title={`Vincular Pasta: ${FOLDER_ROLES.find(r => r.id === activeRole)?.label}`}
      />
    </div>
  );
}
