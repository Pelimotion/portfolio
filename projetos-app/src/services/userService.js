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
  async fetchProfileById(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // Buscar o perfil do usuário logado
  async getMyProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.fetchProfileById(user.id);
  }
};
