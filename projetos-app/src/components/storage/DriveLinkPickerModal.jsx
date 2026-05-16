import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Link2, AlertTriangle } from 'lucide-react';

function extractDriveFileId(url) {
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return folderMatch?.[1] ?? fileMatch?.[1] ?? null;
}

export function DriveLinkPickerModal({ slot, isScene, open, onClose, onLink }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleSave = async () => {
    if (!url.trim()) {
      alert("A URL é obrigatória.");
      return;
    }
    const fileId = extractDriveFileId(url);
    if (!fileId) {
      alert("Não foi possível extrair o ID do arquivo/pasta da URL fornecida. Verifique se é um link válido do Google Drive.");
      return;
    }
    await onLink(url, fileId, name || 'Link Vinculado');
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in-0 zoom-in-95"
          aria-describedby="drive-link-picker-description"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" /> Vincular {slot.display_name}
            </Dialog.Title>
            <Dialog.Description id="drive-link-picker-description" className="sr-only">
              Insira um link direto do Google Drive para este slot.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cole a URL do Google Drive</label>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome de exibição</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                placeholder="Ex: 03_OUTPUT (Opcional)"
              />
            </div>

            {isScene && (
              <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500/90 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>Ao vincular um link específico aqui, esta cena deixará de usar o link herdado do projeto para este slot.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors">Cancelar</button>
            </Dialog.Close>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
              Vincular
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
