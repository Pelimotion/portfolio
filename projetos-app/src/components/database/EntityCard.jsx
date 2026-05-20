import React, { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { hashString } from '../../lib/avatarEngine';
import { GenerativeIcon } from '../ui/GenerativeIcon';
import {
  Clock, User, Flame, ArrowUp, Minus,
  MoreHorizontal, Trash2, Layout, Check,
  CheckSquare, Lock, ShieldCheck, AlertCircle, Bookmark,
  ChevronRight, ExternalLink
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { COLOR_MAP } from '../../core/colors';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// ENTITY CARD v3 — GLOBAL EXCELLENCE STANDARD
// Inspired by Linear, Jira, and Notion
// ============================================

const PRIORITY_CONFIG = {
  urgent: { icon: <Flame className="w-3.5 h-3.5 text-red-500" />,    label: 'Urgente', color: 'red' },
  high:   { icon: <ArrowUp className="w-3.5 h-3.5 text-orange-400" />, label: 'Alta',    color: 'orange' },
  medium: { icon: <Minus className="w-3.5 h-3.5 text-yellow-500" />,   label: 'Média',   color: 'yellow' },
  low:    { icon: <Minus className="w-3.5 h-3.5 opacity-20" />,        label: 'Baixa',   color: 'gray' },
};

const TYPE_ICONS = {
  task:     <CheckSquare className="w-3 h-3 text-blue-400" />,
  bug:      <AlertCircle className="w-3 h-3 text-red-500" />,
  epic:     <Bookmark className="w-3 h-3 text-purple-500" />,
  feature:  <ShieldCheck className="w-3 h-3 text-emerald-500" />,
  story:    <Bookmark className="w-3 h-3 text-orange-400" />,
};

export const EntityCard = memo(function EntityCard({
  item,
  properties = [],
  values = {},
  onClick,
  onDelete,
  onPropertyUpdate,
  isDragOverlay = false,
  density = 'comfortable',
  cardFields = {},
  entityType = 'project',
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(item);
    else navigate(`/page/${item.id}`);
  };

  // ── Info Extraction ──
  const info = useMemo(() => {
    const propsArr = Array.isArray(properties) ? properties : [];
    
    // Find key properties
    const findProp = (name, type) => propsArr.find(p => p.name.toLowerCase() === name.toLowerCase() || p.property_type === type);
    
    const statusP   = findProp('Status', 'status') || findProp('Etapa', 'status');
    const priorityP = findProp('Prioridade', 'select');
    const typeP     = findProp('Tipo', 'select');
    const deadlineP = propsArr.find(p => ['deadline', 'entrega', 'prazo'].includes(p.name.toLowerCase()) || p.property_type === 'date');
    const ownerP    = propsArr.find(p => ['responsavel', 'responsável', 'assignee', 'dono'].includes(p.name.toLowerCase()) || p.property_type === 'people');
    const coverP    = propsArr.find(p => ['capa', 'cover', 'thumbnail', 'imagem'].includes(p.name.toLowerCase()));
    const blockP    = findProp('Bloqueado', 'checkbox');
    const doneP     = findProp('Feito', 'checkbox') || findProp('Concluído', 'checkbox');
    const pointsP   = findProp('Pontos', 'number') || findProp('Esforço', 'number');

    const isVisible = (id) => !id || cardFields?.[id] !== false;

    // Values
    const statusVal = statusP ? values[statusP.id] : null;
    const statusOpt = statusP?.config?.options?.find(o => o.id === statusVal?.selected);
    
    const priorityVal = priorityP ? values[priorityP.id] : null;
    const priorityOpt = priorityP?.config?.options?.find(o => o.id === priorityVal?.selected);
    
    const typeVal = typeP ? values[typeP.id] : null;
    const typeOpt = typeP?.config?.options?.find(o => o.id === typeVal?.selected);

    const deadline = deadlineP && isVisible(deadlineP.id) ? values[deadlineP.id]?.date : null;
    const isDone   = doneP ? values[doneP.id]?.checked : false;
    const isBlocked = blockP && isVisible(blockP.id) ? values[blockP.id]?.checked : false;
    const points   = pointsP && isVisible(pointsP.id) ? values[pointsP.id]?.number : null;
    const coverUrl = coverP && isVisible(coverP.id) ? values[coverP.id]?.text : null;

    const ownerVal = ownerP && isVisible(ownerP.id) ? values[ownerP.id] : null;
    const owner    = ownerVal?.selected || ownerVal?.people || (Array.isArray(ownerVal) ? ownerVal[0] : null);

    const today = new Date();
    const isOverdue = deadline && new Date(deadline) < today && !isDone;
    const daysLeft = deadline ? Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24)) : null;

    // Tags (all other select/status props)
    const tags = propsArr
      .filter(p => (p.property_type === 'select' || p.property_type === 'status') && ![statusP?.id, priorityP?.id, typeP?.id].includes(p.id))
      .filter(p => isVisible(p.id))
      .map(p => {
        const val = values[p.id];
        const opt = p.config?.options?.find(o => o.id === val?.selected);
        return opt ? { ...opt, propName: p.name } : null;
      })
      .filter(Boolean);

    return {
      status: isVisible(statusP?.id) ? statusOpt : null,
      priority: isVisible(priorityP?.id) ? priorityOpt : null,
      type: isVisible(typeP?.id) ? typeOpt : null,
      deadline,
      owner,
      isDone,
      isBlocked,
      isOverdue,
      daysLeft,
      points,
      coverUrl,
      tags,
      donePropId: doneP?.id,
    };
  }, [properties, values, cardFields]);

  const { 
    status, priority, type, deadline, owner, 
    isDone, isBlocked, isOverdue, daysLeft, 
    points, coverUrl, tags, donePropId 
  } = info;

  const priorityConfig = PRIORITY_CONFIG[priority?.id] || null;
  const typeIcon = TYPE_ICONS[type?.id?.toLowerCase()] || TYPE_ICONS.task;
  const statusColors = status ? COLOR_MAP[status.color] || COLOR_MAP.gray : null;

  // ── Done checkbox (optimistic local state) ──
  const [localDone, setLocalDone] = useState(isDone);
  useEffect(() => { setLocalDone(isDone); }, [isDone]);

  const handleDoneToggle = async (e) => {
    e.stopPropagation();
    if (!donePropId) return;
    const next = !localDone;
    setLocalDone(next);
    try { await propertyService.upsertValue(item.id, donePropId, { checked: next }); }
    catch (err) { setLocalDone(!next); console.error(err); }
  };

  // ── Render Helpers ──
  const Badge = ({ children, color = 'gray', icon: Icon }) => {
    const c = COLOR_MAP[color] || COLOR_MAP.gray;
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-current transition-all ${c.bg} ${c.text} opacity-80 hover:opacity-100`}>
        {Icon && <Icon className="w-2.5 h-2.5" />}
        {children}
      </span>
    );
  };

  const isOwn = owner && (user?.email?.includes(owner) || owner.includes(user?.email?.split('@')[0]));

  // ── CARD COMPONENTS ──

  const CardHeader = () => (
    <div className="flex items-start justify-between gap-2 mb-2.5">
       <div className="flex items-center gap-2">
          {donePropId ? (
            <button
              onClick={handleDoneToggle}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                localDone
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-muted-foreground/25 text-transparent hover:border-emerald-500/60 hover:text-emerald-500/40'
              }`}
              title={localDone ? 'Desmarcar feito' : 'Marcar como feito'}
            >
              <Check className="w-2 h-2 stroke-[4px]" />
            </button>
          ) : (
            <GenerativeIcon slug={item.id} size={16} className="shrink-0 rounded-md" type={entityType} />
          )}
          {status && (
            <Badge color={status.color}>{status.label}</Badge>
          )}
          {isBlocked && (
            <span className="text-red-500 animate-pulse" title="Bloqueado">
              <Lock className="w-3 h-3" />
            </span>
          )}
       </div>
       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="p-1 rounded hover:bg-white/10 text-muted-foreground transition-all focus:outline-none"
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95">
                <DropdownMenu.Item onClick={() => navigate(`/page/${item.id}`)} className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-white/5 rounded-lg cursor-pointer outline-none font-medium">
                  <Layout className="w-3.5 h-3.5" /> Ver Detalhes
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-white/5 rounded-lg cursor-pointer outline-none font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir em Nova Aba
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                <DropdownMenu.Item 
                  onSelect={() => onDelete && confirm('Excluir?') && onDelete(item.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
       </div>
    </div>
  );

  const CardFooter = () => (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
       <div className="flex items-center gap-3">
          {owner ? (
            <div className="flex items-center -space-x-1">
               <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-semibold border-2 border-[var(--surface-2)] shadow-sm ${
                 isOwn ? 'bg-primary text-white ring-1 ring-primary/30' : 'bg-[var(--surface-3)] text-muted-foreground'
               }`}>
                 {owner.charAt(0).toUpperCase()}
               </div>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center">
               <User className="w-2.5 h-2.5 text-muted-foreground/20" />
            </div>
          )}

       </div>

       <div className="flex items-center gap-2">
          {points && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-muted-foreground/50">
              {points}
            </span>
          )}
          {deadline && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${
              isOverdue ? 'bg-red-500/10 border-red-500/30 text-red-500' :
              daysLeft <= 3 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
              'bg-white/5 border-white/5 text-muted-foreground/40'
            }`}>
              <Clock className="w-2.5 h-2.5" />
              {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
       </div>
    </div>
  );

  // ── DENSITY RENDERERS ──

  if (density === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none
          ${isDragOverlay ? 'bg-[var(--surface-3)] border-primary shadow-2xl scale-105 rotate-1' : 'bg-[var(--surface-1)] border-transparent hover:border-white/10 hover:bg-[var(--surface-2)] shadow-sm'}
        `}
      >
        {donePropId ? (
          <button
            onClick={handleDoneToggle}
            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              localDone
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-muted-foreground/25 text-transparent hover:border-emerald-500/60'
            }`}
          >
            <Check className="w-1.5 h-1.5 stroke-[4px]" />
          </button>
        ) : (
          <div className="shrink-0">{typeIcon}</div>
        )}
        <h4 className={`text-[12px] font-bold truncate flex-1 ${localDone ? 'line-through text-muted-foreground/40' : 'text-foreground/90'}`}>
          {item.title}
        </h4>
        {priorityConfig?.icon && <div className="shrink-0">{priorityConfig.icon}</div>}
        {deadline && (
          <span className={`text-[9px] font-semibold uppercase ${isOverdue ? 'text-red-500' : 'text-muted-foreground/20'}`}>
            {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col bg-[var(--surface-1)] rounded-2xl transition-all cursor-pointer select-none overflow-hidden
        ${isDragOverlay
          ? 'shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] ring-1 ring-primary/50 rotate-1 scale-[1.03] z-[100]'
          : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }
        ${localDone ? 'opacity-60 grayscale-[0.5]' : ''}
        ${isBlocked ? 'ring-2 ring-red-500/20' : ''}
      `}
    >
      {/* Priority accent side bar */}
      {priorityConfig && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-60 transition-opacity group-hover:opacity-100`} 
             style={{ backgroundColor: `var(--${priorityConfig.color}-500)` }} />
      )}

      {/* Card Cover */}
      {coverUrl && density !== 'compact' && (
        <div className="h-24 w-full relative overflow-hidden bg-black/20">
           <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-2)] to-transparent" />
        </div>
      )}

      <div className={`p-3.5 ${coverUrl ? 'pt-2' : ''}`}>
        <CardHeader />
        
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            {donePropId && (
              <button
                onClick={handleDoneToggle}
                className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                  localDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground/25 text-transparent hover:border-emerald-500/60 hover:text-emerald-500/40'
                }`}
                title={localDone ? 'Desmarcar feito' : 'Marcar como feito'}
              >
                <Check className="w-2 h-2 stroke-[4px]" />
              </button>
            )}
            <h4 className={`text-[13px] font-semibold leading-[1.3] transition-colors ${
              localDone ? 'text-muted-foreground/40 line-through' : 'text-foreground group-hover:text-primary'
            }`}>
              {item.title || 'Sem título'}
            </h4>
          </div>

          {/* Tags Display */}
          {tags.length > 0 && density !== 'compact' && (
            <div className="flex flex-wrap gap-1.5 py-1">
               {tags.slice(0, 3).map((t, idx) => (
                 <Badge key={idx} color={t.color}>{t.label}</Badge>
               ))}
               {tags.length > 3 && (
                 <span className="text-[9px] font-semibold text-muted-foreground/30 px-1">+{tags.length - 3}</span>
               )}
            </div>
          )}
        </div>

        {density === 'detailed' && (
          <p className="text-[11px] text-muted-foreground/40 line-clamp-3 leading-relaxed mt-2 italic">
            Clique para visualizar o histórico e detalhamento técnico desta tarefa.
          </p>
        )}

        <CardFooter />
      </div>

      {/* Overdue Alert Strip */}
      {isOverdue && (
        <div className="bg-red-500 h-0.5 w-full opacity-50" />
      )}
    </div>
  );
});

// ── Sortable wrapper ──
export function SortableEntityCard(props) {
  const { item } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 'auto',
      }}
      {...attributes}
      {...listeners}
      className="outline-none"
    >
      <EntityCard {...props} />
    </div>
  );
}

// ── Overlay durante o drag ──
export const EntityCardOverlay = memo(function EntityCardOverlay(props) {
  return <EntityCard {...props} isDragOverlay />;
});
