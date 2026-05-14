import { supabase } from '../lib/supabase';

// ============================================
// PAGE SERVICE — CRUD universal de páginas
// ============================================

export const pageService = {

  // Buscar todas as páginas raiz (sem parent)
  async fetchRootPages() {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .is('parent_id', null)
      .eq('is_archived', false)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Buscar filhas de uma página
  async fetchChildren(parentId) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_archived', false)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Buscar uma página pelo ID
  async fetchById(pageId) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  // Buscar items de um database (pages cujo parent é o database)
  async fetchDatabaseItems(databaseId) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('parent_id', databaseId)
      .eq('page_type', 'database_item')
      .eq('is_archived', false)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Criar página
  async create({ id, title, parentId, pageType = 'page', content = '', icon = null, cover = null, createdBy = null }) {
    const payload = {
      title,
      parent_id: parentId || null,
      page_type: pageType,
      content,
      icon,
      cover,
      created_by: createdBy,
      assigned_to: createdBy,
    };
    
    // Só adiciona ID se ele foi passado explicitamente (ex: ROOT_HUB_ID)
    if (id) payload.id = id;

    const { data, error } = await supabase
      .from('pages')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar página
  async update(pageId, updates) {
    const { data, error } = await supabase
      .from('pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', pageId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Deletar página (soft delete via archive)
  async archive(pageId) {
    return this.update(pageId, { is_archived: true });
  },

  // Hard delete
  async destroy(pageId) {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);
    if (error) throw error;
  },
};
