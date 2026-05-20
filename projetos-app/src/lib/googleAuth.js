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
   * Solicita um token de acesso ao usuário via pop-up.
   * @param {boolean} forceConsent - true só quando o escopo mudou (pede consent explícito)
   */
  async getAccessToken(forceConsent = false) {
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
            if (response.error === 'access_denied') {
              reject(new Error('Acesso negado: Você precisa autorizar a leitura do Google Drive.'));
            } else {
              reject(new Error(`Erro Google Auth: ${response.error_description || response.error}`));
            }
          } else {
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

      // prompt: 'consent' só quando o escopo mudou — caso contrário o Google
      // reutiliza a autorização existente sem mostrar a tela de permissão novamente.
      client.requestAccessToken(forceConsent ? { prompt: 'consent' } : {});
    });
  },

  /**
   * Garante um token válido, disparando login se necessário.
   * Só força consent quando o escopo mudou (gdrive_scope_version desatualizado).
   */
  async ensureToken() {
    const token = localStorage.getItem('gdrive_token');
    const expires = localStorage.getItem('gdrive_token_expires');
    const scopeVersion = localStorage.getItem('gdrive_scope_version');
    const CURRENT_SCOPE_VERSION = '2';

    if (token && expires && scopeVersion === CURRENT_SCOPE_VERSION && Date.now() < parseInt(expires)) {
      return token;
    }

    // Se o escopo mudou precisamos de novo consent; se só expirou, basta renovar
    const forceConsent = scopeVersion !== CURRENT_SCOPE_VERSION;
    return this.getAccessToken(forceConsent);
  }
};
