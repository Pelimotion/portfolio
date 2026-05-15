import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UserPlus, Mail, User, Loader2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

export function AddMemberModal({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setLoading(true);
    try {
      const response = await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao convidar membro');

      addToast('Membro convidado com sucesso! Ele receberá um e-mail.', 'success');
      onOpenChange(false);
      setEmail('');
      setFullName('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/70 backdrop-blur-md z-[100] animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
          aria-describedby="add-member-description"
        >
          <Dialog.Title className="sr-only">Cadastrar Novo Membro</Dialog.Title>
          <Dialog.Description id="add-member-description" className="sr-only">
            Convide um novo colaborador para a plataforma inserindo seu nome e e-mail.
          </Dialog.Description>

          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <div className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              Cadastrar Novo Membro
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              O usuário receberá um convite por e-mail para configurar sua senha.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Nome Completo
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" /> E-mail Profissional
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@empresa.com"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
                  Cancelar
                </button>
              </Dialog.Close>
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Convidar Membro
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:bg-secondary transition-all">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
