import React, { useState, useEffect, useCallback } from 'react';
import { financialService } from '../../services/financialService';
import { clientService } from '../../services/clientService';
import {
  Plus, Trash2, Check, X, Download, DollarSign,
  ChevronDown, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: 'Rascunho',   bg: 'bg-zinc-500/20',     text: 'text-zinc-400' },
  sent:      { label: 'Enviado',    bg: 'bg-blue-500/20',     text: 'text-blue-400' },
  paid:      { label: 'Pago',       bg: 'bg-emerald-500/20',  text: 'text-emerald-400' },
  overdue:   { label: 'Vencido',    bg: 'bg-red-500/20',      text: 'text-red-400' },
  cancelled: { label: 'Cancelado',  bg: 'bg-orange-500/20',   text: 'text-orange-400' },
};

const TYPE_LABELS = {
  invoice: 'Fatura',
  expense: 'Despesa',
  payment: 'Pagamento',
  quote:   'Orçamento',
};

const EMPTY_FORM = {
  record_type: 'invoice',
  description: '',
  amount: '',
  status: 'draft',
  due_date: '',
  paid_date: '',
  category: '',
};

// ── FinancialTab ──────────────────────────────────────────────────────────────
export function FinancialTab({ projectId }) {
  const [records,  setRecords]  = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // record id being edited
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, cls] = await Promise.all([
        financialService.list({ projectId }),
        clientService.listByProject(projectId),
      ]);
      setRecords(recs || []);
      setClients(cls || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar registros financeiros');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (rec) => {
    setEditing(rec.id);
    setForm({
      record_type: rec.record_type,
      description: rec.description || '',
      amount:      String(rec.amount),
      status:      rec.status,
      due_date:    rec.due_date || '',
      paid_date:   rec.paid_date || '',
      category:    rec.category || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description.trim()) return toast.error('Descrição obrigatória');
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt < 0)    return toast.error('Valor inválido');
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount:   amt,
        project_id: projectId,
        due_date:  form.due_date  || null,
        paid_date: form.paid_date || null,
        category:  form.category  || null,
      };
      if (editing) {
        const updated = await financialService.update(editing, payload);
        setRecords(prev => prev.map(r => r.id === editing ? updated : r));
        toast.success('Registro atualizado');
      } else {
        const created = await financialService.create(payload);
        setRecords(prev => [created, ...prev]);
        toast.success('Registro criado');
      }
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await financialService.destroy(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Registro excluído');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao excluir registro');
    }
  };

  const handleExport = () => {
    financialService.exportCSV(records);
    toast.success('CSV exportado');
  };

  // Totals
  const totals = records.reduce((acc, r) => {
    const a = Number(r.amount) || 0;
    if (r.status === 'paid')                         acc.paid    += a;
    else if (['draft','sent'].includes(r.status))    acc.pending += a;
    else if (r.status === 'overdue')                 acc.overdue += a;
    return acc;
  }, { paid: 0, pending: 0, overdue: 0 });

  const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-4">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Recebido',  value: totals.paid,    color: 'text-emerald-400' },
          { label: 'Pendente',  value: totals.pending, color: 'text-blue-400' },
          { label: 'Vencido',   value: totals.overdue, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-sm font-bold font-mono ${color}`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* ── Clients linked ── */}
      {clients.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Clientes:</span>
          {clients.map(c => (
            <span key={c.id} className="text-[11px] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
              {c.name}{c.company ? ` — ${c.company}` : ''}
            </span>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
          Registros <span className="text-muted-foreground/30 font-mono normal-case">({records.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-[var(--surface-2)] px-2.5 py-1 rounded-lg transition-all">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
          <button onClick={openCreate}
            className="flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
      </div>

      {/* ── Inline form ── */}
      {showForm && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground/70">{editing ? 'Editar registro' : 'Novo registro'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Descrição *</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Motion Design — Campanha X"
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Valor (BRL) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Tipo</label>
              <select
                value={form.record_type}
                onChange={e => setForm(f => ({ ...f, record_type: e.target.value }))}
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Vencimento</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Data pagamento</label>
              <input
                type="date"
                value={form.paid_date}
                onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))}
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block mb-1">Categoria</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Ex: Produção, Locação, Pós-produção…"
                className="w-full text-xs bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
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

      {/* ── Records list ── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[var(--surface-1)] rounded-xl animate-pulse" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="w-8 h-8 text-muted-foreground/10 mb-3" />
          <p className="text-xs text-muted-foreground/40">Nenhum registro financeiro. Clique em Adicionar para começar.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {records.map(rec => {
            const sc = STATUS_CONFIG[rec.status] || STATUS_CONFIG.draft;
            return (
              <div key={rec.id}
                className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 hover:bg-[var(--surface-2)] transition-all group">
                {/* Type + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/30 uppercase tracking-wider font-mono shrink-0">
                      {TYPE_LABELS[rec.record_type] || rec.record_type}
                    </span>
                    {rec.category && (
                      <span className="text-[10px] text-muted-foreground/20">· {rec.category}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{rec.description || '—'}</p>
                </div>
                {/* Due date */}
                {rec.due_date && (
                  <span className="text-[10px] text-muted-foreground/30 font-mono shrink-0">
                    {new Date(rec.due_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                )}
                {/* Status chip */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${sc.bg} ${sc.text}`}>
                  {sc.label}
                </span>
                {/* Amount */}
                <span className="text-xs font-bold font-mono text-foreground shrink-0 min-w-[80px] text-right">
                  {Number(rec.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(rec)}
                    className="p-1 rounded-md hover:bg-[var(--surface-0)] text-muted-foreground/40 hover:text-foreground transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rec.id)}
                    className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
