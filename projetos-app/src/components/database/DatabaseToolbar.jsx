import React from 'react';
import {
  LayoutDashboard, Table, List, CalendarDays,
  Plus, Settings2, AlignJustify, LayoutGrid, LayoutList, Check,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropertyManagerModal } from './PropertyManagerModal';

const VIEW_ICONS = { kanban: LayoutDashboard, table: Table, list: List, calendar: CalendarDays };

export function DatabaseToolbar({
  database,
  views,
  activeViewId,
  onViewChange,
  density,
  onDensityChange,
  properties,
  cardFields,
  onToggleCardField,
  databaseId,
  onRefreshProperties,
  onAdd,
  adding,
  addButtonLabel,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {database && (
        <h2 className="text-sm font-semibold text-foreground">{database.title}</h2>
      )}
      <div className="flex items-center gap-2 ml-auto">
        {/* View Switcher */}
        <div className="flex items-center bg-secondary/40 rounded-lg p-0.5 border border-border/50">
          {views.map(view => {
            const Icon = VIEW_ICONS[view.view_type] || LayoutDashboard;
            return (
              <button key={view.id} onClick={() => onViewChange(view.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
                  activeViewId === view.id
                    ? 'bg-background shadow-sm border border-border/40 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {view.name}
              </button>
            );
          })}
        </div>

        {/* Density Switcher */}
        <div className="flex items-center bg-secondary/40 rounded-lg p-0.5 border border-border/50">
          {[
            { id: 'compact',      Icon: AlignJustify, title: 'Compact' },
            { id: 'comfortable',  Icon: LayoutGrid,   title: 'Comfortable' },
            { id: 'detailed',     Icon: LayoutList,   title: 'Detailed' },
          ].map(({ id, Icon, title }) => (
            <button key={id} onClick={() => onDensityChange(id)} title={title}
              className={`p-1.5 rounded transition-all ${density === id ? 'bg-background shadow-sm border border-border/40 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Configurações do Card */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors">
              <Settings2 className="w-3.5 h-3.5" />
              Card
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-50 min-w-[200px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 mb-1">
                <span className="text-eyebrow uppercase text-muted-foreground/40">Exibir no Card</span>
              </div>
              {properties.map(p => (
                <DropdownMenu.CheckboxItem
                  key={p.id}
                  checked={cardFields[p.id] !== false}
                  onCheckedChange={() => onToggleCardField(p.id)}
                  className="flex items-center justify-between px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none font-medium"
                >
                  {p.name}
                  <DropdownMenu.ItemIndicator>
                    <Check className="w-3 h-3 text-primary" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Gerenciador de Propriedades */}
        <PropertyManagerModal
          databaseId={databaseId}
          properties={properties}
          onUpdate={onRefreshProperties}
        />

        <button onClick={onAdd} disabled={adding}
          className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" />
          {adding ? '...' : addButtonLabel}
        </button>
      </div>
    </div>
  );
}
