import { supabase } from '../lib/supabase';

// ============================================
// PROPERTY SERVICE — Schema + valores dinâmicos
// ============================================

export const propertyService = {

  // Buscar propriedades de um database
  async fetchByDatabase(databaseId) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('database_id', databaseId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Criar propriedade
  async create({ databaseId, name, propertyType, config = {} }) {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        database_id: databaseId,
        name,
        property_type: propertyType,
        config,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar propriedade (renomear, mudar config)
  async update(propertyId, updates) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Deletar propriedade
  async destroy(propertyId) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    if (error) throw error;
  },

  // ---- VALORES ----

  // Buscar valores de uma página (item de database)
  async fetchValues(pageId) {
    const { data, error } = await supabase
      .from('property_values')
      .select('*, properties(*)')
      .eq('page_id', pageId);
    if (error) throw error;
    return data;
  },

  // Buscar todos os valores de todos os items de um database (batch)
  async fetchAllValues(databaseId) {
    const { data, error } = await supabase
      .from('property_values')
      .select('*, properties!inner(*), pages!inner(id, parent_id)')
      .eq('pages.parent_id', databaseId);
    if (error) throw error;
    return data;
  },

  // Upsert valor (criar ou atualizar)
  async upsertValue(pageId, propertyId, value) {
    const { data, error } = await supabase
      .from('property_values')
      .upsert({
        page_id: pageId,
        property_id: propertyId,
        value,
      }, { onConflict: 'page_id,property_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
