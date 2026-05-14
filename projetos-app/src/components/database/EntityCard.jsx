import React, { useMemo, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { COLOR_MAP } from '../../core/schemas';
import { Calendar, User, Flame, ExternalLink, Clock } from 'lucide-react';

// ============================================
// ENTITY CARD — Card genérico e reutilizável
// Funciona para Projetos, Cenas e qualquer
// database_item. Config via 'schema' prop.
// ============================================

export const EntityCard = memo(function EntityCard({
  item,
  properties = [],
  values = {},
  onClick,
  isDragOverlay = false,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(item);
    else navigate(`/page/${item.id}`);
  };

  // Extrair propriedades relevantes para o card
  const statusProp   = properties.find(p => p.name === 'Status');
  const clienteProp  = properties.find(p => p.name === 'Cliente');
  const priorityProp = properties.find(p => p.name === 'Prioridade');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const assigneeProp = properties.find(p => p.name === 'Responsável');
  const tipoProp     = properties.find(p => p.name === 'Tipo');

  const statusVal = statusProp ? values[statusProp.id] : null;
  const statusOption = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
  const statusColors = statusOption ? COLOR_MAP[statusOption.color] || COLOR_MAP.gray : null;

  const priorityVal = priorityProp ? values[priorityProp.id] : null;
  const priorityOption = priorityProp?.config?.options?.find(o => o.id === priorityVal?.selected);

  const tipoVal = tipoProp ? values[tipoProp.id] : null;
  const tipoOption = tipoProp?.config?.options?.find(o => o.id === tipoVal?.selected);

  const deadline = deadlineProp ? values[deadlineProp.id]?.date : null;
  const isOverdue = deadline && new Date(deadline) < new Date();

  const assignee = assigneeProp ? values[assigneeProp.id]?.people : null;
  const cliente  = clienteProp  ? values[clienteProp.id]?.text   : null;

  return (
    <div
      onClick={handleClick}
      className={`bg-card border rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-150 group select-none
        ${isDragOverlay
          ? 'border-primary/50 shadow-xl rotate-1 scale-105'
          : 'border-border hover:border-muted-foreground/40 hover:shadow-md'
        }`}
    >
      {/* ── Header: Status + Priority ── */}
      <div className="flex items-center justify-between mb-3 min-h-[20px]">
        {statusColors ? (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors.bg} ${statusColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {statusOption.label}
          </span>
        ) : (
          <span />
        )}

        {priorityOption?.id === 'urgent' && (
          <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" title="Urgente" />
        )}
        {priorityOption?.id === 'high' && (
          <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" title="Alta" />
        )}
      </div>

      {/* ── Title ── */}
      <h4 className="font-semibold text-sm text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {item.title || 'Untitled'}
      </h4>

      {/* ── Sub-info: Cliente ou Tipo ── */}
      {(cliente || tipoOption) && (
        <p className="text-xs text-muted-foreground mb-3 truncate">
          {cliente || tipoOption?.label}
        </p>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shrink-0 text-[9px] text-white flex items-center justify-center font-bold uppercase">
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

        {/* Deadline */}
        {deadline && (
          <div className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-400' : 'text-muted-foreground/70'}`}>
            <Clock className="w-3 h-3" />
            {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
});

// Versão Sortable para DnD
export function SortableEntityCard({ item, properties, values, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <EntityCard item={item} properties={properties} values={values} onClick={onClick} />
    </div>
  );
}

// Overlay durante o drag
export const EntityCardOverlay = memo(function EntityCardOverlay({ item, properties, values }) {
  return <EntityCard item={item} properties={properties} values={values} isDragOverlay />;
});
