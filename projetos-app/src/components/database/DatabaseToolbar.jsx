import React from 'react';
import {
  LayoutDashboard, Table, List, CalendarDays,
  Plus, ChevronDown, Check, Search, X,
  AlignJustify, LayoutGrid, LayoutList,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropertyManagerModal } from './PropertyManagerModal';

const SORT_FIELDS = [
  { id: 'created_at', label: 'Data de criação' },
  { id: 'updated_at', label: 'Última atualização' },
  { id: 'title',      label: 'Nome' },
  { id: 'status',     label: 'Status' },
  { id: 'deadline',   label: 'Deadline' },
];

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
  sortField = 'created_at',
  sortDir = 'desc',
  onSortChange,
  filterText = '',
  onFilterChange,
}) {
  const activeView = views.find(v => v.id === activeViewId);
  const activeViewType = activeView?.view_type ?? 'kanban';
  const activeConfig = VIEW_CONFIG.find(c => c.id === activeViewType) ?? VIEW_CONFIG[0];
  const ActiveIcon = activeConfig.Icon;
  const activeSortLabel = SORT_FIELDS.find(f => f.id === sortField)?.label || 'Ordenar';
  const SortDirIcon = sortDir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {database && (
        <h2 className="text-sm font-semibold text-foreground">{database.title}</h2>
      )}
      <div className="flex items-center gap-2 ml-auto">
        {/* Inline filter search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={e => onFilterChange?.(e.target.value)}
            placeholder="Filtrar…"
            className="pl-6 pr-6 py-1.5 text-xs bg-secondary/40 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 w-28 focus:w-44 transition-all placeholder:text-muted-foreground/30"
          />
          {filterText && (
            <button onClick={() => onFilterChange?.('')} className="absolute right-1.5 text-muted-foreground/40 hover:text-foreground transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort ▾ */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/50 px-2.5 py-1.5 rounded-lg transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden sm:inline">{activeSortLabel}</span>
              <SortDirIcon className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="start" className="z-50 min-w-[180px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95">
              <div className="px-2.5 pt-1 pb-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Ordenar por</span>
              </div>
              <DropdownMenu.RadioGroup value={sortField} onValueChange={f => onSortChange?.(f, sortDir)}>
                {SORT_FIELDS.map(({ id, label }) => (
                  <DropdownMenu.RadioItem key={id} value={id}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none">
                    <span className="flex-1">{label}</span>
                    <DropdownMenu.ItemIndicator><Check className="w-3 h-3 text-primary" /></DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
              <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1" />
              <div className="px-2.5 pt-1 pb-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Direção</span>
              </div>
              <DropdownMenu.RadioGroup value={sortDir} onValueChange={d => onSortChange?.(sortField, d)}>
                <DropdownMenu.RadioItem value="asc" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none">
                  <ArrowUp className="w-3.5 h-3.5 opacity-60" /><span className="flex-1">Crescente</span>
                  <DropdownMenu.ItemIndicator><Check className="w-3 h-3 text-primary" /></DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="desc" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-lg cursor-pointer outline-none">
                  <ArrowDown className="w-3.5 h-3.5 opacity-60" /><span className="flex-1">Decrescente</span>
                  <DropdownMenu.ItemIndicator><Check className="w-3 h-3 text-primary" /></DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

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
