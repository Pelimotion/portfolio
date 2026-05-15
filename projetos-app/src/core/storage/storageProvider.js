/**
 * GOOGLE DRIVE PROVIDER
 * Abstração para comunicação com a Google Drive API v3
 */

export const googleDriveProvider = {
  
  /**
   * Busca conteúdos (pastas e arquivos) de um diretório pai
   */
  async listContents(parentId, accessToken) {
    if (!accessToken) throw new Error('Google Drive: Access Token ausente');

    // Busca pastas E arquivos. Filtra lixeira.
    const q = `'${parentId}' in parents and trashed = false`;
    const fields = 'files(id, name, mimeType, webViewLink, thumbnailLink, iconLink, parents, size)';
    
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
      console.error('googleDriveProvider.listContents error:', e);
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

  async crawlProject(rootId, accessToken, maxDepth = 3) {
    const tree = [];
    
    const walk = async (parentId, currentPath = '', depth = 0) => {
      if (depth > maxDepth) return;
      
      const contents = await this.listContents(parentId, accessToken);
      for (const item of contents) {
        const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        tree.push({
          id: item.id,
          name: item.name,
          parentId: parentId,
          path: fullPath,
          mimeType: item.mimeType,
          webViewLink: item.webViewLink,
          thumbnail: item.thumbnailLink || item.iconLink
        });
        
        // Recursão apenas se for pasta
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          await walk(item.id, fullPath, depth + 1);
        }
      }
    };

    await walk(rootId, '', 0);
    return tree;
  }
};
