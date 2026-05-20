import React from 'react';
import { Folder, File as FileIcon, ExternalLink, MoreHorizontal, Link2, Trash2, Edit2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { resolveSlotLink } from '../../lib/driveSlotUtils';

// Slots de sistema: fixos, padrão e inalteráveis pelos usuários
const SYSTEM_SLOT_KEYS = new Set(['docs', 'projeto', 'render']);

export function DriveSlotCard({ slot, isProjectView, onEditSlot, onLinkSlot, onRemoveLink, onRemoveSlot }) {
  const { link: effectiveLink, source } = resolveSlotLink(slot);
  const Icon = slot.slot_type === 'folder' ? Folder : FileIcon;
  const isSystem = SYSTEM_SLOT_KEYS.has(slot.slot_key);

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/40 border border-border/50 rounded-lg cursor-pointer hover:bg-secondary/60 hover:border-border transition-all relative group">
      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate flex items-center gap-2">
          {slot.display_name}
          {source === 'own' && !isProjectView && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 rounded px-1.5 py-0.5">próprio</span>
          )}
        </div>
        
        {source === 'none' && (
          <div className="text-[11px] text-muted-foreground/60 mt-0.5">Nenhum link vinculado</div>
        )}
        {source === 'own' && effectiveLink && (
          <div className="text-[11px] text-green-500 mt-0.5 truncate">{effectiveLink.drive_name || 'Link vinculado'}</div>
        )}
        {source === 'inherited' && effectiveLink && (
          <div className="text-[11px] text-muted-foreground/80 italic mt-0.5 truncate">Herdado do projeto ({effectiveLink.drive_name})</div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {effectiveLink && (
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(effectiveLink.drive_url, '_blank'); }}
            className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors"
            title="Abrir no Drive"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {source === 'none' && (
          <button onClick={(e) => { e.stopPropagation(); onLinkSlot(); }} className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1">
            + Link
          </button>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
              {isProjectView ? (
                <>
                  {!isSystem && (
                    <DropdownMenu.Item onClick={onEditSlot} className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-secondary rounded cursor-pointer outline-none">
                      <Edit2 className="w-3.5 h-3.5" /> Editar Slot
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item onClick={onLinkSlot} className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-secondary rounded cursor-pointer outline-none">
                    <Link2 className="w-3.5 h-3.5" /> Vincular Arquivo/Pasta
                  </DropdownMenu.Item>
                  {!isSystem && (
                    <>
                      <DropdownMenu.Separator className="h-px bg-border my-1" />
                      <DropdownMenu.Item onClick={() => {
                        if(confirm(`Tem certeza que deseja remover o slot "${slot.display_name}"? Isso apagará os links em todas as cenas.`)) {
                          onRemoveSlot(slot.id);
                        }
                      }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none">
                        <Trash2 className="w-3.5 h-3.5" /> Remover Slot
                      </DropdownMenu.Item>
                    </>
                  )}
                </>
              ) : (
                <>
                  <DropdownMenu.Item onClick={onLinkSlot} className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-secondary rounded cursor-pointer outline-none">
                    <Link2 className="w-3.5 h-3.5" /> Sobrescrever com link da cena
                  </DropdownMenu.Item>
                  {source === 'own' && onRemoveLink && (
                    <DropdownMenu.Item onClick={() => {
                      if(confirm(`Remover o link próprio desta cena e voltar para o herdado do projeto?`)) {
                        onRemoveLink();
                      }
                    }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none">
                      <Trash2 className="w-3.5 h-3.5" /> Remover link próprio
                    </DropdownMenu.Item>
                  )}
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
