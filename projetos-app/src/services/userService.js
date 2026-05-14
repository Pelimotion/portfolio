import { supabase } from '../lib/supabase';

// ============================================
// USER SERVICE — Gestão de Perfis e Equipe
// ============================================

export const userService = {

  // Buscar todos os perfis públicos
  async fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return data;
  },

  // Buscar perfil por ID
  async fetchById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Buscar usuários por email (para autocomplete)
  async searchByEmail(query) {
    if (!query || query.length < 3) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${query}%`)
      .limit(5);
    if (error) throw error;
    return data;
  },

  // --- MEMBROS DE PROJETO ---

  async fetchProjectMembers(projectId) {
    const { data, error } = await supabase
      .from('project_members')
      .select('*, profiles(*)')
      .eq('project_id', projectId);
    if (error) throw error;
    return data.map(m => ({
      ...m.profiles,
      project_member_id: m.id,
      role: m.role
    }));
  },

  async addMemberToProject(projectId, userId, role = 'editor') {
    const { data, error } = await supabase
      .from('project_members')
      .insert([{ project_id: projectId, user_id: userId, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeMemberFromProject(projectId, userId) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Buscar o perfil do usuário logado
  async getMyProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.fetchById(user.id);
  }
};
