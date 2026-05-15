import { Clock, User, AlertTriangle, Flame, ArrowUp, Minus, ExternalLink, MoreHorizontal, Copy, Trash2, Layout } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// ============================================
// ENTITY CARD v2 — Density-aware, rich data
// Compact | Comfortable | Detailed
// ============================================

// Priority display config
const PRIORITY_MAP = {
  urgent: { icon: <Flame className="w-3.5 h-3.5 text-red-500" />,    label: 'Urgente', cls: 'text-red-500' },
  high:   { icon: <ArrowUp className="w-3.5 h-3.5 text-orange-400" />, label: 'Alta',    cls: 'text-orange-400' },
  medium: { icon: <Minus className="w-3.5 h-3.5 text-yellow-500" />,   label: 'Média',   cls: 'text-yellow-500' },
  low:    { icon: null,                                                  label: 'Baixa',   cls: 'text-muted-foreground' },
};

export const EntityCard = memo(function EntityCard({
  item,
  properties = [],
  values = {},
  onClick,
  isDragOverlay = false,
  density = 'comfortable',
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(item);
    else navigate(`/page/${item.id}`);
  };

  // Extract relevant props
  const statusProp   = properties.find(p => p.name === 'Status');
  const priorityProp = properties.find(p => p.name === 'Prioridade');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const assigneeProp = properties.find(p => p.name === 'Responsável');
  const clienteProp  = properties.find(p => p.name === 'Cliente');
  const tipoProp     = properties.find(p => p.name === 'Tipo');

  const statusVal    = statusProp ? values[statusProp.id] : null;
  const statusOption = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const statusColors = statusOption ? COLOR_MAP[statusOption.color] || COLOR_MAP.gray : null;

  const priorityVal    = priorityProp ? values[priorityProp.id] : null;
  const priorityOption = priorityProp?.config?.options?.find(o => o.id === priorityVal?.selected);
  const priorityConfig = PRIORITY_MAP[priorityOption?.id] || null;

  const tipoVal    = tipoProp ? values[tipoProp.id] : null;
  const tipoOption = tipoProp?.config?.options?.find(o => o.id === tipoVal?.selected);

  const deadline  = deadlineProp ? values[deadlineProp.id]?.date : null;
  const assignee  = assigneeProp ? values[assigneeProp.id]?.people : null;
  const cliente   = clienteProp  ? values[clienteProp.id]?.text   : null;

  const today    = new Date();
  const isOverdue = deadline && new Date(deadline) < today;
  const daysLeft  = deadline ? Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24)) : null;
  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  // ── COMPACT MODE — minimal, dense ──
  if (density === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all select-none
          ${isDragOverlay
            ? 'bg-card border border-primary/50 shadow-xl'
            : 'bg-card border border-border hover:border-muted-foreground/40 hover:bg-card/80'
          }`}
      >
        <span className="text-sm shrink-0">{item.icon || '🎞️'}</span>
        {statusColors && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors.dot}`} />}
        <span className="text-xs font-medium text-foreground flex-1 truncate">{item.title || 'Untitled'}</span>
        {priorityConfig?.icon && <span className="shrink-0">{priorityConfig.icon}</span>}
        {isOverdue && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
        {deadline && !isOverdue && (
          <span className={`text-[10px] font-mono shrink-0 ${isDueSoon ? 'text-yellow-400' : 'text-muted-foreground/50'}`}>
            {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
        <ExternalLink className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 shrink-0" />
      </div>
    );
  }

  // ── DETAILED MODE — maximum info ──
  if (density === 'detailed') {
    return (
      <div
        onClick={handleClick}
        className={`bg-card border rounded-xl p-4 cursor-pointer transition-all select-none group space-y-3
          ${isDragOverlay ? 'border-primary/50 shadow-xl rotate-1 scale-105' : 'border-border hover:border-muted-foreground/40 hover:shadow-md'}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.icon || '🎞️'}</span>
            <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {item.title || 'Untitled'}
            </h4>
          </div>
          {priorityConfig?.icon && <span className="shrink-0 mt-0.5">{priorityConfig.icon}</span>}
        </div>

        {/* Status + Type */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusColors && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors.bg} ${statusColors.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
              {statusOption.label}
            </span>
          )}
          {tipoOption && (
            <span className="text-[11px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{tipoOption.label}</span>
          )}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-medium">
              <AlertTriangle className="w-3 h-3" /> Atrasada
            </span>
          )}
          {isDueSoon && !isOverdue && (
            <span className="text-[11px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded font-medium">Urgente</span>
          )}
        </div>

        {/* Description/client */}
        {(cliente || tipoOption) && (
          <p className="text-xs text-muted-foreground truncate">{cliente || tipoOption?.label}</p>
        )}

        {/* Footer: Assignee + Deadline */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            {assignee ? (
              <>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[9px] text-white font-bold uppercase">
                  {assignee.charAt(0)}
                </div>
                <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">{assignee}</span>
              </>
            ) : (
              <div className="w-5 h-5 rounded-full border border-border/60 border-dashed flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground/50" />
              </div>
            )}
          </div>
          {deadline && (
            <div className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-muted-foreground/70'}`}>
              <Clock className="w-3 h-3" />
              {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── COMFORTABLE MODE (default) ──
  return (
    <div
      onClick={handleClick}
      className={`bg-[var(--surface-2)] border rounded-[var(--radius-lg)] p-3.5 cursor-pointer transition-all select-none group relative
        ${isDragOverlay
          ? 'border-primary/50 shadow-xl rotate-1 scale-105'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:shadow-lg'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 min-h-[24px]">
        <div className="flex items-center gap-1.5">
          {statusColors ? (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors.bg} ${statusColors.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
              {statusOption.label}
            </span>
          ) : <span />}
        </div>
        
        <div className="flex items-center gap-1">
          {priorityConfig?.icon}
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="p-1 rounded hover:bg-[var(--surface-overlay)] text-muted-foreground opacity-0 group-hover:opacity-100 transition-all focus:outline-none"
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-50 min-w-[140px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-md cursor-pointer outline-none">
                  <Layout className="w-3.5 h-3.5" /> Abrir Detalhe
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-md cursor-pointer outline-none">
                  <Copy className="w-3.5 h-3.5" /> Duplicar
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1" />
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer outline-none">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-[13px] text-foreground leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.title || 'Untitled'}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 border border-primary/20 shrink-0 text-[8px] text-primary flex items-center justify-center font-bold uppercase">
                {assignee.charAt(0)}
              </div>
              <span className="text-[10px] text-muted-foreground/80 font-medium truncate max-w-[70px]">{assignee}</span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-border/50 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {deadline && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-muted-foreground/40'}`}>
            <Clock className="w-3 h-3" />
            {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
});

// ── Sortable wrapper ──
export function SortableEntityCard({ item, properties, values, onClick, density }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 999 : 'auto',
      }}
      {...attributes}
      {...listeners}
      className="group"
    >
      <EntityCard item={item} properties={properties} values={values} onClick={onClick} density={density} />
    </div>
  );
}

// ── Overlay durante o drag ──
export const EntityCardOverlay = memo(function EntityCardOverlay({ item, properties, values, density }) {
  return <EntityCard item={item} properties={properties} values={values} isDragOverlay density={density} />;
});
