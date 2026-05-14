import { supabase } from '../lib/supabase';

// ============================================
// DATABASE VIEW SERVICE — Configuração de views
// ============================================

export const viewService = {

  // Buscar views de um database
  async fetchByDatabase(databaseId) {
    const { data, error } = await supabase
      .from('database_views')
      .select('*')
      .eq('database_id', databaseId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Criar view
  async create({ databaseId, name, viewType = 'table', config = {} }) {
    const { data, error } = await supabase
      .from('database_views')
      .insert([{
        database_id: databaseId,
        name,
        view_type: viewType,
        config,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar view
  async update(viewId, updates) {
    const { data, error } = await supabase
      .from('database_views')
      .update(updates)
      .eq('id', viewId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Deletar view
  async destroy(viewId) {
    const { error } = await supabase
      .from('database_views')
      .delete()
      .eq('id', viewId);
    if (error) throw error;
  },
};
