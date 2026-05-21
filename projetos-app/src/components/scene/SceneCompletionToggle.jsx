import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export function SceneCompletionToggle({ pageId, donePropId, checked, onChange, showLabel = true }) {
  const [localChecked, setLocalChecked] = useState(checked);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  const handleToggle = async () => {
    if (!donePropId) return;
    
    const next = !localChecked;
    setLocalChecked(next);
    
    if (next) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      
      toast.success('Cena marcada como feita', {
        action: {
          label: 'Desfazer',
          onClick: () => revertToggle(false)
        },
        duration: 5000
      });
    }

    try {
      await propertyService.upsertValue(pageId, donePropId, { checked: next });
      if (onChange) onChange(next);
    } catch (err) {
      console.error(err);
      setLocalChecked(!next);
      toast.error('Erro ao atualizar a cena.');
    }
  };

  const revertToggle = async (targetState) => {
    setLocalChecked(targetState);
    try {
      await propertyService.upsertValue(pageId, donePropId, { checked: targetState });
      if (onChange) onChange(targetState);
    } catch (err) {
      console.error(err);
      setLocalChecked(!targetState);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`group relative flex items-center gap-3 transition-colors rounded-xl focus:outline-none`}
    >
      {/* Circle Toggle */}
      <div className="relative">
        <div 
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ease-out
            ${localChecked 
              ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm shadow-emerald-500/20' 
              : 'border-[var(--border-strong)] text-transparent hover:border-emerald-500/50 group-hover:bg-[var(--surface-3)]'}
          `}
        >
          <Check className={`w-3 h-3 stroke-[3px] transition-transform duration-150 ${localChecked ? 'text-white scale-100' : 'scale-50 opacity-0 group-hover:opacity-20 group-hover:text-emerald-500/50'}`} />
        </div>
        
        {/* Micro-animation Particles */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/2 left-1/2 -mt-1 -ml-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" style={{ animationDuration: '600ms' }}></span>
            <span className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-emerald-300 animate-pulse delay-75"></span>
            <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-150"></span>
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col items-start">
          <span className={`text-sm font-semibold transition-colors ${localChecked ? 'text-emerald-500' : 'text-foreground group-hover:text-emerald-500/70'}`}>
            {localChecked ? '✓ Feita' : 'Marcar como feita'}
          </span>
        </div>
      )}
    </button>
  );
}
