import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropertyRenderer } from '../../properties/PropertyRenderer';

export function TableView({ items, properties, allValues, onValueChange, onDelete }) {
  const navigate = useNavigate();
  const visible = properties.filter(p => p.is_visible !== false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/30">
      <div className="grid gap-3 px-4 py-2.5 bg-card border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
        style={{ gridTemplateColumns: `minmax(200px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
        <div>Nome</div>
        {visible.map(p => <div key={p.id}>{p.name}</div>)}
        <div />
      </div>
      <div className="divide-y divide-border/40">
        {(items || []).length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
            Nenhuma cena ainda. Clique em "Nova Cena" para criar.
          </div>
        )}
        {(items || []).map(item => (
          <div key={item.id}
            className="grid gap-3 px-4 py-2.5 items-center hover:bg-secondary/10 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: `minmax(200px,2fr) ${visible.map(() => 'minmax(100px,1fr)').join(' ')} 32px` }}>
            <div className="font-medium text-sm text-foreground truncate" onClick={() => navigate(`/page/${item.id}`)}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.title || 'Untitled'}
            </div>
            {visible.map(prop => (
              <div key={prop.id} onClick={e => e.stopPropagation()}>
                <PropertyRenderer property={prop} value={(allValues || {})[item.id]?.[prop.id]}
                  onChange={v => onValueChange(item.id, prop.id, v)} inline />
              </div>
            ))}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-1 rounded hover:bg-secondary text-muted-foreground focus:outline-none">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="z-50 min-w-[120px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 p-1">
                    <DropdownMenu.Item
                      onSelect={() => onDelete(item.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
