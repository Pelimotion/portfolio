import React, { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../services/clientService';
import { Plus, Trash2, Check, X, Search, Users, Pencil, Link, Unlink } from 'lucide-react';
import { toast } from 'sonner';

const CLIENT_TYPE_LABELS = { company: 'Empresa', person: 'Pessoa', agency: 'Agência' };

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', client_type: 'company' };

// ── ClientsManager — usado na rota /clients (standalone) ──────────────────────
export function ClientsManager() {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientService.list({ search });
      setClients(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (c)  => {
    setEditing(c.id);
    setForm({ name: c.name, company: c.company || '', email: c.email || '', phone: c.phone || '', client_type: c.client_type || 'company' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      if (editing) {
        const updated = await clientService.update(editing, form);
        setClients(prev => prev.map(c => c.id === editing ? updated : c));
        toast.success('Cliente atualizado');
      } else {
        const created = await clientService.create(form);
        setClients(prev => [created, ...prev]);
        toast.success('Cliente criado');
      }
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await clientService.destroy(id);
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente excluído');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao excluir cliente');
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold">Clientes</h1>
          <span className="text-[10px] text-muted-foreground/30 font-mono">({clients.length})</span>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-all">
          <Plus className="w-3.5 h-3.5" /> Novo cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente…"
          className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground/70">{editing ? 'Editar cliente' : 'Novo cliente'}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name',    label: 'Nome *',    placeholder: 'Nome completo ou razão social' },
              { key: 'company', label: 'Empresa',   placeholder: 'Nome da empresa (opcional)' },
              { key: 'email',   label: 'E-mail',    placeholder: 'contato@empresa.com' },
              { key: 'phone',   label: 'Telefone',  placeholder: '(11) 99999-9999' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Tipo</label>
              <select
                value={form.client_type}
                onChange={e => setForm(f => ({ ...f, client_type: e.target.value }))}
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {Object.entries(CLIENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => setShowForm(false)} disabled={saving}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-[var(--surface-2)] px-3 py-1.5 rounded-lg transition-all">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
              <Check className="w-3.5 h-3.5" /> {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[var(--surface-1)] rounded-xl animate-pulse" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-8 h-8 text-muted-foreground/10 mb-3" />
          <p className="text-xs text-muted-foreground/40">
            {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado. Clique em Novo cliente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {clients.map(c => (
            <div key={c.id}
              className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 hover:bg-[var(--surface-2)] transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                  <span className="text-[10px] text-muted-foreground/30 bg-[var(--surface-2)] px-1.5 py-0.5 rounded shrink-0">
                    {CLIENT_TYPE_LABELS[c.client_type] || c.client_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.company && <span className="text-[10px] text-muted-foreground/40">{c.company}</span>}
                  {c.email   && <span className="text-[10px] text-muted-foreground/30">{c.email}</span>}
                  {c.phone   && <span className="text-[10px] text-muted-foreground/30">{c.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(c)}
                  className="p-1 rounded-md hover:bg-[var(--surface-0)] text-muted-foreground/40 hover:text-foreground transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LinkClientPanel — usado dentro da tab Financeiro de um projeto ─────────────
export function LinkClientPanel({ projectId }) {
  const [linked,    setLinked]    = useState([]);
  const [allClients,setAllClients] = useState([]);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    try {
      const [lnk, all] = await Promise.all([
        clientService.listByProject(projectId),
        clientService.list(),
      ]);
      setLinked(lnk || []);
      setAllClients(all || []);
    } catch (e) { console.error(e); }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const isLinked = (cid) => linked.some(c => c.id === cid);

  const toggle = async (cid) => {
    setSaving(true);
    try {
      if (isLinked(cid)) {
        await clientService.unlink(projectId, cid);
        setLinked(prev => prev.filter(c => c.id !== cid));
      } else {
        await clientService.link(projectId, cid);
        const full = allClients.find(c => c.id === cid);
        if (full) setLinked(prev => [...prev, full]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar vínculo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-[var(--border-subtle)] pt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider flex items-center gap-1.5">
          <Link className="w-3 h-3" /> Clientes vinculados
        </span>
        <button onClick={() => setOpen(o => !o)}
          className="text-[11px] text-primary hover:underline">
          {open ? 'Fechar' : 'Gerenciar'}
        </button>
      </div>

      {linked.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {linked.map(c => (
            <span key={c.id} className="flex items-center gap-1 text-[11px] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
              {c.name}
              <button onClick={() => toggle(c.id)} disabled={saving} className="ml-0.5 text-muted-foreground/30 hover:text-red-400 transition-colors">
                <Unlink className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl divide-y divide-[var(--border-subtle)]">
          {allClients.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 p-3 text-center">
              Nenhum cliente cadastrado. Crie um na seção Clientes.
            </p>
          ) : allClients.map(c => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              disabled={saving}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--surface-2)] transition-all ${isLinked(c.id) ? 'text-primary' : 'text-foreground'}`}
            >
              <span className="text-xs font-medium">{c.name}{c.company ? ` — ${c.company}` : ''}</span>
              {isLinked(c.id) ? <Check className="w-3.5 h-3.5 text-primary" /> : <Plus className="w-3.5 h-3.5 text-muted-foreground/30" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
