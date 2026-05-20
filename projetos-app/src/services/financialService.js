import { supabase } from '../lib/supabase';

// ============================================
// FINANCIAL SERVICE — CRUD financial_records
// ============================================

export const financialService = {

  // Listar registros (opcionalmente por projeto)
  async list({ projectId = null, status = null, limit = 100 } = {}) {
    let query = supabase
      .from('financial_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq('project_id', projectId);
    if (status)    query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Criar registro
  async create(payload) {
    const { data, error } = await supabase
      .from('financial_records')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar registro
  async update(id, updates) {
    const { data, error } = await supabase
      .from('financial_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Deletar registro
  async destroy(id) {
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Resumo financeiro (últimos 6 meses) para o Dashboard
  async summary() {
    const { data, error } = await supabase
      .from('financial_records')
      .select('amount, status, record_type, due_date, paid_date, created_at');
    if (error) throw error;

    const now = new Date();
    const totals = { paid: 0, pending: 0, overdue: 0 };
    // Últimos 6 meses: mês[0] = mais antigo, mês[5] = atual
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { label: d.toLocaleString('pt-BR', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), total: 0 };
    });

    for (const r of data || []) {
      const amt = Number(r.amount) || 0;
      if (r.status === 'paid') totals.paid += amt;
      else if (['draft', 'sent'].includes(r.status)) totals.pending += amt;
      else if (r.status === 'overdue') totals.overdue += amt;

      // distribuir nos meses pelo paid_date (se pago) ou due_date
      const dateStr = r.paid_date || r.due_date || r.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
        if (idx !== -1) months[idx].total += amt;
      }
    }

    return { totals, months };
  },

  // Export CSV
  exportCSV(records) {
    const headers = ['Descrição', 'Tipo', 'Status', 'Valor (BRL)', 'Vencimento', 'Pagamento', 'Categoria'];
    const rows = records.map(r => [
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.record_type,
      r.status,
      Number(r.amount).toFixed(2),
      r.due_date || '',
      r.paid_date || '',
      r.category || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
