import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from '../../services/storageService';
import { useDriveSlots } from '../../hooks/useDriveSlots';
import { DriveSlotCard } from './DriveSlotCard';
import { DriveSlotEditModal } from './DriveSlotEditModal';
import { DriveLinkPickerModal } from './DriveLinkPickerModal';
import { AddDriveSlotButton } from './AddDriveSlotButton';
import { googleDriveProvider } from '../../core/storage/storageProvider';
import { googleAuth } from '../../lib/googleAuth';
import {
  FolderOpen, Link2, CheckCircle2, Plus, ExternalLink,
  HardDrive, RefreshCw, Unlink, Zap, Loader2
} from 'lucide-react';

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

function DriveConnectionSection({ projectId }) {
  const [connection, setConnection] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  useEffect(() => {
    storageService.getConnection(projectId).then(setConnection).catch(console.error);
  }, [projectId]);

  const handleConnectDrive = async () => {
    setConnecting(true);
    try {
      const folderUrl = window.prompt(
        '📁 Cole a URL da pasta raiz do Google Drive:\n(Ex: https://drive.google.com/drive/folders/FOLDER_ID)'
      );
      if (!folderUrl) { setConnecting(false); return; }

      const match = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const folderId   = match?.[1] || 'manual_' + Date.now();
      const folderName = folderUrl.split('/').pop() || 'Pasta do Projeto';

      const conn = await storageService.upsertConnection({
        projectPageId: projectId,
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
      await storageService.removeConnection(projectId);
      setConnection(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden mb-6">
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
  );
}

export function AssetsPanel({ pageId, isProject, parentProjectId }) {
  // O projectId é a pageId se isProject for true, senão é parentProjectId
  const projectId = isProject ? pageId : parentProjectId;
  // A isScene é o oposto de isProject
  const isScene = !isProject;

  const { slots, loading, updateSlot, addSlot, removeSlot, upsertLink, removeLink } = 
    useDriveSlots({ projectId, pageId, isScene });

  const [editingSlot, setEditingSlot] = useState(null);
  const [linkingSlot, setLinkingSlot] = useState(null);

  return (
    <div className="space-y-6">
      {/* Seção de conexão do Google Drive (só na view do projeto) */}
      {!isScene && <DriveConnectionSection projectId={projectId} />}

      {/* Grid de slots */}
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5" /> Pastas Vinculadas
          </h3>
        </header>

        {loading ? (
          <div className="flex justify-center py-8 text-muted-foreground opacity-50">
             <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {slots.map(slot => (
              <DriveSlotCard
                key={slot.id}
                slot={slot}
                isProjectView={!isScene}
                onEditSlot={() => setEditingSlot(slot)}
                onLinkSlot={() => setLinkingSlot(slot)}
                onRemoveSlot={removeSlot}
                onRemoveLink={isScene ? () => removeLink(slot.id) : undefined}
              />
            ))}
            
            {/* Botão adicionar — só no projeto */}
            {!isScene && (
              <AddDriveSlotButton onAdd={addSlot} />
            )}
          </div>
        )}
      </section>

      {/* Modais */}
      <DriveSlotEditModal
        slot={editingSlot}
        open={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={async (name, type) => {
          await updateSlot(editingSlot.id, { display_name: name, slot_type: type });
          setEditingSlot(null);
        }}
      />

      <DriveLinkPickerModal
        slot={linkingSlot || {}}
        isScene={isScene}
        open={!!linkingSlot}
        onClose={() => setLinkingSlot(null)}
        onLink={async (url, fileId, driveName) => {
          await upsertLink(linkingSlot.id, { drive_url: url, drive_file_id: fileId, drive_name: driveName });
          setLinkingSlot(null);
        }}
      />
    </div>
  );
}
