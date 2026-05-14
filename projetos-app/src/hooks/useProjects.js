import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const updateProjectStatus = async (projectId, newStatus) => {
    // Optimistic Update
    setProjects((prev) => 
      prev.map((p) => p.id === projectId ? { ...p, status: newStatus } : p)
    );

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar status do projeto:', error.message);
      // Revert in case of failure
      fetchProjects();
    }
  };

  return { projects, loading, updateProjectStatus, fetchProjects };
}
