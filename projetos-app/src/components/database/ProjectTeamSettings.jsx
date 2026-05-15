import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, Trash2, Shield, Loader2 } from 'lucide-react';
import { useTeamStore } from '../../stores/useTeamStore';
import { TeamSearchInput } from './TeamSearchInput';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';

// ============================================
// PROJECT TEAM SETTINGS — Manage project members
// ============================================

export function ProjectTeamSettings({ projectId, open, onOpenChange }) {
  const { projectMembers, loading, fetchProjectMembers, addProjectMember, removeProjectMember } = useTeamStore();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      if (open && projectId) {
        await fetchProjectMembers(projectId);
        
        // AUTO-REPAIR: Usamos o estado direto do store que já foi atualizado
        const currentMembers = useTeamStore.getState().projectMembers || [];
        
        if (currentMembers.length === 0) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await addProjectMember(projectId, user.id, 'admin');
          }
        }
      }
    }
    load();
  }, [open, projectId, fetchProjectMembers, addProjectMember]);

  const handleAddMember = async (user) => {
    try {
      await addProjectMember(projectId, user.id, 'editor');
      addToast(`${user.full_name || user.email} adicionado ao projeto!`, 'success');
    } catch (e) {
      addToast('Erro ao adicionar membro. Ele já pode estar no projeto.', 'error');
      console.error(e);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remover este membro do projeto?')) return;
    try {
      await removeProjectMember(projectId, userId);
      addToast('Membro removido com sucesso.', 'info');
    } catch (e) {
      addToast('Erro ao remover membro.', 'error');
      console.error(e);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/70 backdrop-blur-md z-[100] animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden flex flex-col h-[500px]"
          aria-describedby="team-settings-description"
        >
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <Dialog.Title className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Equipe do Projeto
            </Dialog.Title>
            <Dialog.Description id="team-settings-description" className="text-xs text-muted-foreground mt-1">
              Gerencie quem tem acesso a este projeto e suas permissões.
            </Dialog.Description>
          </div>

          {/* Search Area */}
          <div className="p-4 bg-secondary/10 border-b border-border/40">
            <TeamSearchInput 
              onSelect={handleAddMember} 
              excludeIds={(projectMembers || []).map(m => m.id)}
              placeholder="Convidar por e-mail..."
            />
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {(loading && (projectMembers || []).length === 0) ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
              </div>
            ) : (projectMembers || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Users className="w-10 h-10 mb-3" />
                <p className="text-xs font-medium">Nenhum membro além de você.</p>
              </div>
            ) : (
              (projectMembers || []).map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/40 group hover:border-border transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-[11px] text-white flex items-center justify-center font-bold shadow-sm">
                    {member.full_name ? member.full_name.charAt(0).toUpperCase() : member.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">{member.full_name || member.email?.split('@')[0] || 'Usuário'}</span>
                      {member.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
                  </div>
                  
                  {member.role !== 'admin' && (
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-secondary/10 border-t border-border/50 flex justify-end">
            <Dialog.Close asChild>
              <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
                Concluído
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
