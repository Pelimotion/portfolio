import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ============================================
// TEAM STORE — Gerenciamento de Membros
// ============================================

export const useTeamStore = create((set, get) => ({
  members: [],
  loading: false,

  fetchMembers: async (projectId) => {
    set({ loading: true });
    try {
      // Tenta buscar membros reais do Supabase
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        // Se a tabela não existir, usamos mock
        throw error;
      }
      set({ members: data || [], loading: false });
    } catch (e) {
      // Fallback para Mock Mappers para não quebrar a UI
      const mockMembers = [
        { id: '1', name: 'Felipe Conceição', role: 'Diretor', avatar: 'F' },
        { id: '2', name: 'Ana Silva', role: 'Motion Designer', avatar: 'A' },
        { id: '3', name: 'Carlos Sousa', role: 'Compositor', avatar: 'C' },
        { id: '4', name: 'Julia Martins', role: '3D Artist', avatar: 'J' },
      ];
      set({ members: mockMembers, loading: false });
    }
  },
}));
