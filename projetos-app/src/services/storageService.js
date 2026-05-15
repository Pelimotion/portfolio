import { supabase } from '../lib/supabase';

// ============================================
// STORAGE SERVICE — Supabase CRUD
// Gerencia conexões, pastas e arquivos indexados
// ============================================

export const storageService = {

  // ── Connections (uma por projeto) ──

  async getConnection(projectPageId) {
    const { data, error } = await supabase
      .from('storage_connections')
      .select('*')
      .eq('project_page_id', projectPageId)
      .maybeSingle();
    if (error) throw error;
    return data; // null se não conectado ainda
  },

  async upsertConnection({ projectPageId, provider, rootFolderId, rootFolderName, metadata = {} }) {
    const { data, error } = await supabase
      .from('storage_connections')
      .upsert({
        project_page_id: projectPageId,
        provider,
        root_folder_id: rootFolderId,
        root_folder_name: rootFolderName,
        metadata,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'project_page_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeConnection(projectPageId) {
    const { error } = await supabase
      .from('storage_connections')
      .delete()
      .eq('project_page_id', projectPageId);
    if (error) throw error;
  },

  // ── Indexed Folders ──

  async saveFolders(connectionId, folders) {
    // folders: [{ provider_id, name, path, parent_id, metadata }]
    const rows = folders.map(f => ({
      connection_id: connectionId,
      provider_folder_id: f.id,
      name: f.name,
      path: f.path || f.name,
      parent_provider_id: f.parentId || null,
      metadata: {
        mimeType: f.mimeType,
        thumbnail: f.thumbnail,
        webViewLink: f.webViewLink
      },
      indexed_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('storage_folders')
      .upsert(rows, { onConflict: 'connection_id,provider_folder_id' });
    if (error) throw error;
  },

  async listFolders(connectionId) {
    const { data, error } = await supabase
      .from('storage_folders')
      .select('*')
      .eq('connection_id', connectionId)
      .order('name');
    if (error) throw error;
    return data;
  },

  // ── Entity ↔ Folder Relations ──

  async linkEntityFolder({ entityPageId, connectionId, folderProvId, folderName, role, label, targetType, mimeType }) {
    // role: 'root' | 'renders' | 'references' | 'assets' | 'exports' | custom
    const { data, error } = await supabase
      .from('entity_folder_relations')
      .upsert({
        entity_page_id: entityPageId,
        connection_id: connectionId,
        provider_folder_id: folderProvId,
        folder_name: folderName,
        role,
        label,
        target_type: targetType || 'folder',
        mime_type: mimeType
      }, { onConflict: 'entity_page_id,role' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getEntityFolders(entityPageId, parentProjectId = null) {
    // Busca links próprios
    let { data, error } = await supabase
      .from('entity_folder_relations')
      .select('*')
      .eq('entity_page_id', entityPageId);
    
    if (error) throw error;

    // Se estivermos em uma cena e não tiver links, busca do projeto pai (Herança)
    if ((!data || data.length === 0) && parentProjectId) {
      const { data: parentData, error: parentError } = await supabase
        .from('entity_folder_relations')
        .select('*')
        .eq('entity_page_id', parentProjectId);
      
      if (parentError) throw parentError;
      return (parentData || []).map(link => ({ ...link, inherited: true }));
    }

    return data || [];
  },
};
