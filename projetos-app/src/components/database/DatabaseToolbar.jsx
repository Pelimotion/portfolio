import React from 'react';
import {
  LayoutDashboard, Table, List, CalendarDays,
  Plus, ChevronDown, Check,
  AlignJustify, LayoutGrid, LayoutList,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropertyManagerModal } from './PropertyManagerModal';

const VIEW_CONFIG = [
  { id: 'kanban',    label: 'Board',      Icon: LayoutDashboard },
  { id: 'table',     label: 'Tabela',     Icon: Table           },
  { id: 'list',      label: 'Lista',      Icon: List            },
  { id: 'calendar',  label: 'Calendário', Icon: CalendarDays    },
];

const DENSITY_CONFIG = [
  { id: 'compact',     Icon: AlignJustify, label: 'Compacto'    },
  { id: 'comfortable', Icon: LayoutGrid,   label: 'Confortável' },
  { id: 'detailed',    Icon: LayoutList,   label: 'Detalhado'   },
];

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
  const activeView = views.find(v => v.id === activeViewId);
  const activeViewType = activeView?.view_type ?? 'kanban';
  const activeConfig = VIEW_CONFIG.find(c => c.id === activeViewType) ?? VIEW_CONFIG[0];
  const ActiveIcon = activeConfig.Icon;

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {database && (
        <h2 className="text-sm font-semibold text-foreground">{database.title}</h2>
      )}
      <div className="flex items-center gap-2 ml-auto">

        {/* Board ▾ — view switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/50 px-2.5 py-1.5 rounded-lg transition-colors">
              <ActiveIcon className="w-3.5 h-3.5 text-primary" />
              {activeConfig.label}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="start" className="z-50 min-w-[160px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95">
              <DropdownMenu.RadioGroup value={activeViewType} onValueChange={val => {
                const target = views.find(v => v.view_type === val);
                if (target) onViewChange(target.id);
              }}>
                {VIEW_CONFIG.map(({ id, label, Icon }) => (
                  <DropdownMenu.RadioItem
                    key={id}
                    value={id}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-60" />
                    <span className="flex-1">{label}</span>
                    <DropdownMenu.ItemIndicator>
                      <Check className="w-3 h-3 text-primary" />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Exibição ▾ — densidade + campos do card + gerenciador de propriedades */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/50 px-2.5 py-1.5 rounded-lg transition-colors">
              Exibição
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-50 min-w-[210px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95">

              {/* Densidade */}
              <div className="px-2.5 pt-1 pb-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Densidade</span>
              </div>
              <DropdownMenu.RadioGroup value={density} onValueChange={onDensityChange}>
                {DENSITY_CONFIG.map(({ id, Icon, label }) => (
                  <DropdownMenu.RadioItem
                    key={id}
                    value={id}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-60" />
                    <span className="flex-1">{label}</span>
                    <DropdownMenu.ItemIndicator>
                      <Check className="w-3 h-3 text-primary" />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>

              {/* Campos visíveis no card */}
              {properties.length > 0 && (
                <>
                  <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1.5" />
                  <div className="px-2.5 pt-1 pb-0.5">
                    <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Exibir no Card</span>
                  </div>
                  {properties.map(p => (
                    <DropdownMenu.CheckboxItem
                      key={p.id}
                      checked={cardFields[p.id] !== false}
                      onCheckedChange={() => onToggleCardField(p.id)}
                      className="flex items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none"
                    >
                      <span className="flex-1">{p.name}</span>
                      <DropdownMenu.ItemIndicator>
                        <Check className="w-3 h-3 text-primary" />
                      </DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>
                  ))}
                </>
              )}

            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Gerenciador de propriedades — Dialog próprio, fora do dropdown */}
        <PropertyManagerModal
          databaseId={databaseId}
          properties={properties}
          onUpdate={onRefreshProperties}
        />

        {/* + Novo (condicional — não aparece no Dashboard) */}
        {addButtonLabel && (
          <button onClick={onAdd} disabled={adding}
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" />
            {adding ? '...' : addButtonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
