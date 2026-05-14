import { create } from 'zustand';
import { userService } from '../services/userService';

// ============================================
// TEAM STORE — Gerenciamento de Membros Reais
// ============================================

export const useTeamStore = create((set, get) => ({
  members: [],
  projectMembers: [],
  loading: false,

  fetchMembers: async () => {
    set({ loading: true });
    try {
      // Busca perfis reais do Supabase
      const profiles = await userService.fetchProfiles();
      
      const members = profiles.map(p => ({
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || 'Usuário',
        role: 'Membro', // Role pode ser expandida futuramente
        avatar: p.full_name ? p.full_name.charAt(0).toUpperCase() : 'U',
        email: p.email
      }));

      set({ members, loading: false });
    } catch (e) {
      console.warn('TeamStore: Usando fallback (profiles não encontrados)', e);
      // Fallback seguro se a tabela profiles ainda não estiver pronta
      const mockMembers = [
        { id: '1', name: 'Felipe (Local)', role: 'Diretor', avatar: 'F' },
      ];
      set({ members: mockMembers, loading: false });
    }
  },

  fetchProjectMembers: async (projectId) => {
    set({ loading: true });
    try {
      const data = await userService.fetchProjectMembers(projectId);
      set({ projectMembers: data, loading: false });
    } catch (e) {
      console.error('Error fetching project members:', e);
      set({ loading: false });
    }
  },

  addProjectMember: async (projectId, userId, role) => {
    try {
      await userService.addMemberToProject(projectId, userId, role);
      const data = await userService.fetchProjectMembers(projectId);
      set({ projectMembers: data });
    } catch (e) {
      console.error('Error adding project member:', e);
      throw e;
    }
  },

  removeProjectMember: async (projectId, userId) => {
    try {
      await userService.removeMemberFromProject(projectId, userId);
      set((state) => ({
        projectMembers: state.projectMembers.filter((m) => m.id !== userId),
      }));
    } catch (e) {
      console.error('Error removing project member:', e);
      throw e;
    }
  },
}));
