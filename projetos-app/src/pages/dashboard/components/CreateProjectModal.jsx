import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, LayoutTemplate, Briefcase } from 'lucide-react';
import { usePageStore } from '../../../stores/usePageStore';

export function CreateProjectModal({ open, onOpenChange, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { createPage } = usePageStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const page = await createPage({
        title,
        content: description,
        parentId: '00000000-0000-0000-0000-000000000000',
        pageType: 'database_item'
      });
      
      onSuccess(page);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDriveUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-2xl sm:rounded-xl animate-in fade-in-0 zoom-in-95 duration-200">
          
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Novo Projeto de Produção
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Configure o briefing inicial. Ele será adicionado à coluna de entrada.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nome do Projeto <span className="text-destructive">*</span>
              </label>
              <input 
                autoFocus
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Campanha de Inverno 2026"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Descrição Breve</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Qual o escopo central dessa produção?"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Pasta Raiz (Google Drive)</label>
              <input 
                type="url"
                value={driveUrl}
                onChange={e => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button 
                type="button"
                className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <LayoutTemplate className="w-4 h-4" />
                Usar Template
              </button>
              
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-secondary hover:text-secondary-foreground h-10 px-4 py-2">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isSubmitting ? 'Criando pipeline...' : 'Criar Projeto'}
                </button>
              </div>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
