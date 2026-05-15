/**
 * GOOGLE DRIVE PROVIDER
 * Abstração para comunicação com a Google Drive API v3
 */

export const googleDriveProvider = {
  
  /**
   * Busca subpastas de um diretório pai
   */
  async listFolders(parentId, accessToken) {
    if (!accessToken) throw new Error('Google Drive: Access Token ausente');

    const q = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const fields = 'files(id, name, mimeType, webViewLink, parents)';
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=1000`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`Google API Error: ${err.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (e) {
      console.error('googleDriveProvider.listFolders error:', e);
      throw e;
    }
  },

  /**
   * Busca detalhes de uma pasta específica por ID
   */
  async getFolderDetails(folderId, accessToken) {
    const fields = 'id, name, webViewLink, parents';
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?fields=${encodeURIComponent(fields)}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Falha ao buscar detalhes da pasta');
      return await response.json();
    } catch (e) {
      console.error('googleDriveProvider.getFolderDetails error:', e);
      throw e;
    }
  },

  /**
   * Realiza um crawl recursivo para mapear a árvore do projeto
   * (Limitado para evitar excesso de requisições)
   */
  async crawlProject(rootId, accessToken, maxDepth = 3) {
    const tree = [];
    
    const walk = async (parentId, currentPath = '', depth = 0) => {
      if (depth > maxDepth) return;
      
      const folders = await this.listFolders(parentId, accessToken);
      for (const f of folders) {
        const fullPath = currentPath ? `${currentPath}/${f.name}` : f.name;
        tree.push({
          id: f.id,
          name: f.name,
          parentId: parentId,
          path: fullPath,
          webViewLink: f.webViewLink
        });
        // Recursão
        await walk(f.id, fullPath, depth + 1);
      }
    };

    await walk(rootId, '', 0);
    return tree;
  }
};
