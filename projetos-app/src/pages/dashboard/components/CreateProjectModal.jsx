import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Briefcase, Wand2, UserMinus } from 'lucide-react';
import { usePageStore } from '../../../stores/usePageStore';
import { bootstrapProjectPipeline } from '../../../core/databaseFactory';
import { propertyService } from '../../../services/propertyService';
import { userService } from '../../../services/userService';
import { useTeamStore } from '../../../stores/useTeamStore';
import { ROOT_HUB_ID, PROJECT_PROPERTY_SCHEMA } from '../../../core/schemas';
import { useNavigate } from 'react-router-dom';
import { TeamSearchInput } from '../../../components/database/TeamSearchInput';

// ============================================
// CREATE PROJECT MODAL v3
// Inclusão de membros da equipe
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
  const { addProjectMember } = useTeamStore();
  
  const [title, setTitle]         = useState('');
  const [client, setClient]       = useState('');
  const [template, setTemplate]   = useState('blank');
  const [team, setTeam]           = useState([]); // { id, name, email }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  const handleAddMember = (user) => {
    if (team.some(m => m.id === user.id)) return;
    setTeam(prev => [...prev, {
      id: user.id,
      name: user.full_name || user.email.split('@')[0],
      email: user.email
    }]);
  };

  const handleRemoveMember = (id) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

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

      // 4. Adicionar membros da equipe
      for (const member of team) {
        await userService.addMemberToProject(page.id, member.id);
      }

      // 5. Redirecionar para a página do projeto
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
    setTeam([]);
    setError(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/70 backdrop-blur-md z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" aria-describedby="dialog-description">
          
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nome do Projeto</label>
                  <input
                    autoFocus
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Campanha Verão..."
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Cliente */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</label>
                  <input
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    placeholder="Nome da marca"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Template Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_TEMPLATES.map(t => (
                      <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center ${
                          template === t.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-muted-foreground/40 hover:bg-secondary/20'
                        }`}>
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Team Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Equipe do Projeto</label>
                  <TeamSearchInput 
                    onSelect={handleAddMember} 
                    excludeIds={team.map(m => m.id)}
                    placeholder="Adicionar membro..." 
                  />
                </div>

                <div className="space-y-2 min-h-[120px] max-h-[160px] overflow-y-auto p-1">
                  {team.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-border/40 rounded-xl">
                      <UserMinus className="w-6 h-6 text-muted-foreground/20 mb-2" />
                      <p className="text-[10px] text-muted-foreground italic">Nenhum membro convidado</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {team.map(m => (
                        <div key={m.id} className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full bg-secondary/50 border border-border/50 animate-in fade-in-0 zoom-in-95">
                          <div className="w-4 h-4 rounded-full bg-primary/20 text-[8px] text-primary flex items-center justify-center font-bold">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-medium text-foreground max-w-[80px] truncate">{m.name}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                  Cancelar
                </button>
              </Dialog.Close>
              <button type="submit" disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
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

          <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

