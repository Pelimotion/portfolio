/*
 * RESPONSABILIDADE: app.js
 * - Configuração do Supabase client
 * - checkAuth()        → verifica sessão; redireciona se não autenticado
 * - signInWithGoogle() → OAuth Google via Supabase
 * - signOut()          → encerra sessão e redireciona para /
 * - getParam(name)     → lê query params da URL atual
 * - showError(msg)     → exibe mensagem de erro visível na UI
 */

// ─── Configuração do Supabase ────────────────────────────────────────────────
const SUPABASE_URL      = 'https://gfaqnkmmbozmhroicqyc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFua21tYm96bWhyb2ljcXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTcxNDQsImV4cCI6MjA5NDI3MzE0NH0.vYhdQjfr1d92t_uhU504XyP2UxkANUO96X1hKOu3e-g';

const { createClient } = supabase;       // vem do CDN @supabase/supabase-js@2

// IMPORTANTE: flowType 'implicit' é obrigatório para apps HTML estáticos sem backend.
// O fluxo PKCE (padrão do v2) exige troca de código server-side, o que causa
// perda de sessão e 401 em apps sem servidor.
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType:          'implicit',   // implicit = token direto no hash da URL
    persistSession:    true,         // guarda sessão no localStorage
    detectSessionInUrl: true,        // lê o token do hash após redirect OAuth
  },
});


// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Verifica se há sessão ativa.
 * Páginas protegidas (projeto.html, cena.html) devem chamar isto no topo.
 * @returns {Promise<object>} dados da sessão
 */
async function checkAuth() {
  try {
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      window.location.href = '/projetos/index.html';
    }
    return data.session;
  } catch (err) {
    showError('Erro ao verificar autenticação: ' + err.message);
    return null;
  }
}

/**
 * Inicia login com Google OAuth.
 * Após autenticação, Supabase redireciona de volta para index.html.
 */
async function signInWithGoogle() {
  try {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:    'https://portfolio-pelimotionart-6049s-projects.vercel.app/projetos/index.html',
        scopes:        'email profile',
        queryParams:   { access_type: 'online', prompt: 'select_account' },
      },
    });
    if (error) throw error;
  } catch (err) {
    showError('Erro ao entrar com Google: ' + err.message);
  }
}

/**
 * Encerra a sessão atual e redireciona para a raiz do site.
 */
async function signOut() {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    window.location.href = '/';
  } catch (err) {
    showError('Erro ao sair: ' + err.message);
  }
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Lê um query param da URL atual.
 * @param {string} name - nome do parâmetro
 * @returns {string|null}
 */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Exibe uma mensagem de erro na UI.
 * Procura um elemento #error-banner; cria e injeta se não existir.
 * @param {string} msg
 */
function showError(msg) {
  let banner = document.getElementById('error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-banner';
    banner.className = 'error-banner';
    document.body.prepend(banner);
  }
  banner.textContent = '⚠ ' + msg;
  banner.removeAttribute('hidden');

  // Auto-ocultar após 6 segundos
  clearTimeout(banner._timeout);
  banner._timeout = setTimeout(() => {
    banner.setAttribute('hidden', '');
  }, 6000);
}
