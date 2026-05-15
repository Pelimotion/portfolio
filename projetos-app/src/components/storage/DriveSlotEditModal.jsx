import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Folder, File as FileIcon } from 'lucide-react';

export function DriveSlotEditModal({ slot, open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('folder');

  useEffect(() => {
    if (slot && open) {
      setName(slot.display_name);
      setType(slot.slot_type);
    }
  }, [slot, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("O nome é obrigatório.");
      return;
    }
    await onSave(name, type);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">Editar Slot de Drive</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome de exibição</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                placeholder="Ex: Renders Finais"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo do Slot</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setType('folder')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${type === 'folder' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-border/80'}`}
                >
                  <Folder className="w-4 h-4" /> Pasta
                </button>
                <button 
                  onClick={() => setType('file')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${type === 'file' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-border/80'}`}
                >
                  <FileIcon className="w-4 h-4" /> Arquivo
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors">Cancelar</button>
            </Dialog.Close>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
              Salvar Alterações
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
