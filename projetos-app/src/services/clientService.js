import { supabase } from '../lib/supabase';

// ============================================
// CLIENT SERVICE — CRUD clients + project_clients
// ============================================

export const clientService = {

  // Listar clientes
  async list({ search = '' } = {}) {
    let query = supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (search.trim()) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Criar cliente
  async create(payload) {
    const { data, error } = await supabase
      .from('clients')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar cliente
  async update(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Deletar cliente
  async destroy(id) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Listar clientes de um projeto
  async listByProject(projectId) {
    const { data, error } = await supabase
      .from('project_clients')
      .select('*, clients(*)')
      .eq('project_id', projectId);
    if (error) throw error;
    return (data || []).map(pc => ({ ...pc.clients, _link_id: pc.id, _role: pc.role }));
  },

  // Vincular cliente a projeto
  async link(projectId, clientId, role = 'client') {
    const { data, error } = await supabase
      .from('project_clients')
      .insert([{ project_id: projectId, client_id: clientId, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Desvincular cliente de projeto
  async unlink(projectId, clientId) {
    const { error } = await supabase
      .from('project_clients')
      .delete()
      .eq('project_id', projectId)
      .eq('client_id', clientId);
    if (error) throw error;
  },
};
