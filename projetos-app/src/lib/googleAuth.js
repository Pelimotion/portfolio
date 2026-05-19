/**
 * GOOGLE AUTH SERVICE (Produção)
 * Gerencia o fluxo de OAuth 2.0 para acesso ao Google Drive
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export const googleAuth = {
  
  /**
   * Valida se a configuração do ambiente está presente
   */
  checkConfig() {
    if (!CLIENT_ID || CLIENT_ID === 'PENDENTE_CONFIGURAR') {
      throw new Error('Configuração Ausente: VITE_GOOGLE_CLIENT_ID não encontrado no ambiente.');
    }
  },

  /**
   * Solicita um token de acesso ao usuário via pop-up
   */
  async getAccessToken() {
    this.checkConfig();

    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.accounts) {
        reject(new Error('Google SDK não carregado. Verifique sua conexão ou bloqueadores de script.'));
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            // Trata cancelamento ou erro de permissão
            if (response.error === 'access_denied') {
              reject(new Error('Acesso negado: Você precisa autorizar a leitura do Google Drive.'));
            } else {
              reject(new Error(`Erro Google Auth: ${response.error_description || response.error}`));
            }
          } else {
            // Sucesso: Persiste token + versão do escopo
            localStorage.setItem('gdrive_token', response.access_token);
            localStorage.setItem('gdrive_token_expires', Date.now() + (response.expires_in * 1000));
            localStorage.setItem('gdrive_scope_version', '2');
            resolve(response.access_token);
          }
        },
        error_callback: (err) => {
          reject(new Error(`Falha ao abrir pop-up: ${err.message || 'Verifique se o navegador bloqueou a janela.'}`));
        }
      });
 
      // Força a abertura do pop-up de login
      client.requestAccessToken({ prompt: 'consent' });
    });
  },
 
  /**
   * Garante um token válido, disparando login se necessário.
   * Se o token foi emitido com escopo anterior (metadata.readonly),
   * invalida e solicita novo consentimento com drive.readonly.
   */
  async ensureToken() {
    const token = localStorage.getItem('gdrive_token');
    const expires = localStorage.getItem('gdrive_token_expires');
    const scopeVersion = localStorage.getItem('gdrive_scope_version');

    // Versão 2 = drive.readonly (suficiente para exportar conteúdo)
    const CURRENT_SCOPE_VERSION = '2';

    if (token && expires && scopeVersion === CURRENT_SCOPE_VERSION && Date.now() < parseInt(expires)) {
      return token;
    }

    // Token expirado, escopo antigo ou ausente — força novo consentimento
    return this.getAccessToken();
  }
};
