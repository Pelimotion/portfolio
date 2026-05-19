import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLOR_MAP } from '../../../core/colors';

export function ListView({ items, properties, allValues }) {
  const navigate = useNavigate();
  const statusProp   = properties.find(p => p.name === 'Status');
  const deadlineProp = properties.find(p => p.name === 'Deadline' || p.name === 'Entrega');
  const today = new Date();

  return (
    <div className="space-y-0.5">
      {(items || []).length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground/60">Nenhuma cena ainda.</div>
      )}
      {(items || []).map(item => {
        const statusVal = statusProp ? (allValues || {})[item.id]?.[statusProp.id] : null;
        const opt       = statusProp?.config?.options?.find(o => o.id === statusVal?.selected);
        const colors    = opt ? COLOR_MAP[opt.color] || COLOR_MAP.gray : null;
        const deadline  = deadlineProp ? (allValues || {})[item.id]?.[deadlineProp.id]?.date : null;
        const isOverdue = deadline && new Date(deadline) < today;

        return (
          <div key={item.id} onClick={() => navigate(`/page/${item.id}`)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors group">
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="text-sm text-foreground flex-1 truncate">{item.title}</span>
            {isOverdue && <span className="text-[10px] text-red-400 font-medium shrink-0">ATRASADA</span>}
            {opt && <span className={`text-[11px] px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{opt.label}</span>}
            {deadline && (
              <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-muted-foreground/50'}`}>
                {new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
