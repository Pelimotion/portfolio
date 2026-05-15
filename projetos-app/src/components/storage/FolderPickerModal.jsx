import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, RefreshCw } from 'lucide-react';
import { DirectoryExplorer } from './DirectoryExplorer';
import { storageService } from '../../services/storageService';

/**
 * FOLDER PICKER MODAL
 * Permite selecionar uma pasta indexada para vincular a uma role/cena
 */
export function FolderPickerModal({ 
  open, 
  onOpenChange, 
  connection, 
  onSelect,
  title = "Selecionar Pasta"
}) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && connection) {
      loadFolders();
    }
  }, [open, connection]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await storageService.listFolders(connection.id);
      // Converte do banco para o formato do Explorer
      const formatted = data.map(f => ({
        id: f.provider_folder_id,
        name: f.name,
        parentId: f.parent_provider_id,
        path: f.path
      }));
      setFolders(formatted);
    } catch (e) {
      console.error('FolderPickerModal error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = folders.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/70 backdrop-blur-md z-[100] animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden flex flex-col h-[600px]"
          aria-describedby="folder-picker-description"
        >
          <Dialog.Title className="text-base font-semibold text-foreground px-6 pt-6 sr-only">{title}</Dialog.Title>
          <Dialog.Description id="folder-picker-description" className="text-xs text-muted-foreground px-6 pt-1 sr-only">
            Escolha uma pasta da estrutura do Google Drive para vincular.
          </Dialog.Description>

          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Estrutura do Google Drive indexada</p>
          </div>

          {/* Search */}
          <div className="p-4 bg-secondary/10 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Filtrar pastas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Explorer */}
          <div className="flex-1 overflow-y-auto p-2">
            <DirectoryExplorer 
              folders={filtered} 
              loading={loading}
              onSelect={(node) => {
                onSelect(node);
                onOpenChange(false);
              }}
            />
          </div>

          <div className="p-4 bg-secondary/10 border-t border-border/50 flex items-center justify-between">
            <button 
              onClick={loadFolders}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Cache
            </button>
            <Dialog.Close asChild>
              <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
                Cancelar
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
