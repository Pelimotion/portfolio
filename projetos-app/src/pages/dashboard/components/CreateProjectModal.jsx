import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Briefcase, Wand2 } from 'lucide-react';
import { usePageStore } from '../../../stores/usePageStore';
import { bootstrapProjectPipeline } from '../../../core/databaseFactory';
import { propertyService } from '../../../services/propertyService';
import { ROOT_HUB_ID, PROJECT_PROPERTY_SCHEMA } from '../../../core/schemas';
import { useNavigate } from 'react-router-dom';

// ============================================
// CREATE PROJECT MODAL v2
// Usa databaseFactory para bootstrap automático
// ============================================

const QUICK_TEMPLATES = [
  { id: 'motion',    label: 'Motion Design',      icon: '🎬' },
  { id: 'cgi',       label: 'CGI / 3D',            icon: '🧊' },
  { id: 'branding',  label: 'Branding',            icon: '✨' },
  { id: 'social',    label: 'Social Media',        icon: '📱' },
  { id: 'blank',     label: 'Em branco',           icon: '📄' },
];

export function CreateProjectModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { createPage } = usePageStore();
  const [title, setTitle]         = useState('');
  const [client, setClient]       = useState('');
  const [template, setTemplate]   = useState('blank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar a página do projeto
      const page = await createPage({
        title: title.trim(),
        parentId: ROOT_HUB_ID,
        pageType: 'database_item',
        icon: QUICK_TEMPLATES.find(t => t.id === template)?.icon || '🎬',
      });

      // 2. Bootstrap do pipeline de cenas (em background)
      bootstrapProjectPipeline(page.id).catch(console.error);

      // 3. Salvar cliente se preenchido
      if (client.trim()) {
        const hubProps = await propertyService.fetchByDatabase(ROOT_HUB_ID);
        const clienteProp = hubProps.find(p => p.name === 'Cliente');
        if (clienteProp) {
          await propertyService.upsertValue(page.id, clienteProp.id, { text: client.trim() });
        }
      }

      // 4. Redirecionar para a página do projeto
      onOpenChange(false);
      reset();
      navigate(`/project/${page.id}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setTitle('');
    setClient('');
    setTemplate('blank');
    setError(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/70 backdrop-blur-md z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" aria-describedby="dialog-description">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <Dialog.Title className="text-base font-semibold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              Novo Projeto
            </Dialog.Title>
            <Dialog.Description id="dialog-description" className="text-sm text-muted-foreground mt-1">
              Configure e comece sua produção em segundos.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Template Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Projeto</label>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_TEMPLATES.map(t => (
                  <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center ${
                      template === t.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-muted-foreground/40 hover:bg-secondary/20'
                    }`}>
                    <span className="text-xl leading-none">{t.icon}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nome do Projeto <span className="text-destructive">*</span>
              </label>
              <input
                autoFocus
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Campanha Verão 2026 — Hero Shots"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</label>
              <input
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="Nome do cliente ou marca"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button type="submit" disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Criar Projeto
                  </>
                )}
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
