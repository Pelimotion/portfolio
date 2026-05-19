import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STAGE_DEFS = [
  { id: 'briefing',  name: 'Briefing',  color: '#3b82f6' },
  { id: 'producao',  name: 'Produção',  color: '#f59e0b' },
  { id: 'revisao',   name: 'Revisão',   color: '#8b5cf6' },
  { id: 'entregue',  name: 'Entregue',  color: '#10b981' },
];

export function StageEditor({ project, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stages, setStages] = useState(() => {
    const saved = project?.stages || [];
    return STAGE_DEFS.map(def => {
      const s = saved.find(x => x.id === def.id);
      return { ...def, start_date: s?.start_date || '', end_date: s?.end_date || '' };
    });
  });

  const update = (id, field, value) =>
    setStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = stages
        .filter(s => s.start_date || s.end_date)
        .map(({ id, name, color, start_date, end_date }) => ({ id, name, color, start_date, end_date }));
      const { error } = await supabase.from('pages').update({ stages: payload }).eq('id', project.id);
      if (error) throw error;
      onUpdate?.(payload);
      toast.success('Etapas salvas');
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar etapas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] transition-colors"
      >
        <span>Configurar etapas do projeto</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--border-subtle)] bg-[var(--surface-0)]">
          {stages.map(stage => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
              <span className="text-xs font-medium w-20 shrink-0 text-muted-foreground">{stage.name}</span>
              <input
                type="date" value={stage.start_date}
                onChange={e => update(stage.id, 'start_date', e.target.value)}
                className="flex-1 text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded px-2 py-1 focus:outline-none focus:border-primary/50"
              />
              <span className="text-muted-foreground/40 text-xs shrink-0">→</span>
              <input
                type="date" value={stage.end_date}
                onChange={e => update(stage.id, 'end_date', e.target.value)}
                className="flex-1 text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded px-2 py-1 focus:outline-none focus:border-primary/50"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave} disabled={saving}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? 'Salvando...' : 'Salvar etapas'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
