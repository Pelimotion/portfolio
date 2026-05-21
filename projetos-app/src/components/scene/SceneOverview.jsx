import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { PropertyRenderer } from '../properties/PropertyRenderer';
import { SceneCompletionToggle } from './SceneCompletionToggle';

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function SceneOverview({ page, properties, propValues, onPropChange, ancestorProjectId, ancestorProjectTitle, donePropId, doneChecked, onDoneChange }) {
  const navigate = useNavigate();

  const statusProp   = properties?.find(p => p.property_type === 'status' || p.name === 'Status');
  const deadlineProp = properties?.find(p => p.property_type === 'date' || p.name?.toLowerCase().includes('deadline') || p.name?.toLowerCase().includes('entrega'));
  const otherProps   = properties?.filter(p => p !== statusProp && p !== deadlineProp && p.id !== donePropId) ?? [];

  return (
    <div className="space-y-4">
      {/* Back to project */}
      {ancestorProjectId && (
        <button
          onClick={() => navigate(`/page/${ancestorProjectId}`)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {ancestorProjectTitle || 'Projeto'}
        </button>
      )}

      {/* Completion Toggle */}
      {donePropId && (
        <div className="flex items-center gap-3 p-4 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl">
          <SceneCompletionToggle 
            pageId={page?.id} 
            donePropId={donePropId} 
            checked={doneChecked} 
            onChange={onDoneChange} 
          />
          <div className="text-xs text-muted-foreground ml-auto">
            {doneChecked ? 'Cena finalizada — pronta para próxima fase' : 'Marcar quando a produção estiver concluída'}
          </div>
        </div>
      )}

      {/* Metadata card */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Detalhes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statusProp && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wide">Status</span>
              <PropertyRenderer
                property={statusProp}
                value={propValues?.[statusProp.id]}
                onChange={v => onPropChange?.(statusProp.id, v)}
                inline
              />
            </div>
          )}
          {deadlineProp && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wide">Deadline</span>
              <PropertyRenderer
                property={deadlineProp}
                value={propValues?.[deadlineProp.id]}
                onChange={v => onPropChange?.(deadlineProp.id, v)}
                inline
              />
            </div>
          )}
          {otherProps.slice(0, 4).map(prop => (
            <div key={prop.id} className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wide">{prop.name}</span>
              <PropertyRenderer
                property={prop}
                value={propValues?.[prop.id]}
                onChange={v => onPropChange?.(prop.id, v)}
                inline
              />
            </div>
          ))}
        </div>
      </div>

      {/* Activity card */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Atividade</p>

        <div className="space-y-2">
          {page?.created_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Criado {timeAgo(page.created_at)}</span>
            </div>
          )}
          {page?.updated_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Atualizado {timeAgo(page.updated_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
