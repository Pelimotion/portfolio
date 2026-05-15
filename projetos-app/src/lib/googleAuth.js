/**
 * GOOGLE AUTH SERVICE (Client Side)
 * Gerencia o fluxo de OAuth 2.0 Implicit Flow para obter Access Tokens do Drive
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'PENDENTE_CONFIGURAR';
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

export const googleAuth = {
  
  /**
   * Solicita um token de acesso ao usuário
   */
  async getAccessToken() {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google SDK não carregado. Verifique sua conexão.'));
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            // Salva no sessionStorage para persistência na sessão
            sessionStorage.setItem('gdrive_token', response.access_token);
            sessionStorage.setItem('gdrive_token_expires', Date.now() + (response.expires_in * 1000));
            resolve(response.access_token);
          }
        },
      });

      client.requestAccessToken();
    });
  },

  /**
   * Recupera o token da sessão ou solicita um novo se expirado
   */
  async ensureToken() {
    const token = sessionStorage.getItem('gdrive_token');
    const expires = sessionStorage.getItem('gdrive_token_expires');
    
    if (token && expires && Date.now() < parseInt(expires)) {
      return token;
    }
    
    return this.getAccessToken();
  }
};
