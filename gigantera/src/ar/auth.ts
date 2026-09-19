/**
 * auth.ts — Controle de Acesso Restrito via Link e Código
 * Suporta Magic Link com query params (?key=, ?access=, ?token=) e PIN na tela de bloqueio.
 */

const STORAGE_KEY = 'gigantera_espinhaco_ar_authorized';

const VALID_PASSCODES = new Set([
  'ESPINHACO',
  'ESPINHAÇO',
  'GIGANTERA',
  'PELIMOTION',
  '2026',
  'ARTEVIVA'
]);

export class AuthManager {
  private authorized: boolean = false;

  constructor() {
    this.checkInitialAccess();
  }

  private checkInitialAccess(): void {
    // 1. Verifica se já está autorizado nesta sessão
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      this.authorized = true;
      return;
    }

    // 2. Verifica se a URL contém um token/chave válida (?key=, ?access=, ?token=)
    const urlParams = new URLSearchParams(window.location.search);
    const key = (
      urlParams.get('key') ||
      urlParams.get('access') ||
      urlParams.get('token') ||
      ''
    ).trim().toUpperCase();

    if (key && VALID_PASSCODES.has(key)) {
      this.grantAccess();
    }
  }

  public isAuthorized(): boolean {
    return this.authorized;
  }

  public validatePasscode(input: string): boolean {
    const clean = input.trim().toUpperCase();
    if (VALID_PASSCODES.has(clean)) {
      this.grantAccess();
      return true;
    }
    return false;
  }

  public grantAccess(): void {
    this.authorized = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage exceptions on private browsing quotas
    }
  }

  public revokeAccess(): void {
    this.authorized = false;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
