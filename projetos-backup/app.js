/*
 * RESPONSABILIDADE: app.js
 * - Configuração do Supabase client
 * - checkAuth()        → verifica sessão; redireciona se não autenticado
 * - signInWithGoogle() → OAuth Google via Supabase
 * - signOut()          → encerra sessão e redireciona para /
 * - getParam(name)     → lê query params da URL atual
 * - showError(msg)     → exibe mensagem de erro visível na UI
 */

console.log("Iniciando App V2 - Autenticação por Email");

// ─── Configuração do Supabase ────────────────────────────────────────────────
const SUPABASE_URL      = 'https://gfaqnkmmbozmhroicqyc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFua21tYm96bWhyb2ljcXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTcxNDQsImV4cCI6MjA5NDI3MzE0NH0.vYhdQjfr1d92t_uhU504XyP2UxkANUO96X1hKOu3e-g';

const { createClient } = supabase;       // vem do CDN @supabase/supabase-js@2

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


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
 * Inicia login com e-mail e senha via Supabase Auth.
 */
async function signInWithPassword(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.querySelector('#input-email').value.trim();
  const password = form.querySelector('#input-password').value;
  const btn = form.querySelector('#btn-login');
  const errorDiv = document.getElementById('login-error');
  
  btn.disabled = true;
  btn.textContent = 'Entrando...';
  errorDiv.setAttribute('hidden', '');

  try {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Em caso de sucesso, o onAuthStateChange (em index.html) transita a interface automaticamente
  } catch (err) {
    errorDiv.textContent = 'Erro ao entrar: ' + err.message;
    errorDiv.removeAttribute('hidden');
    btn.disabled = false;
    btn.textContent = 'Entrar';
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
 * Exibe uma notificação Toast na UI (sucesso ou erro) sem bloquear o uso.
 * @param {string} msg Mensagem
 * @param {string} type 'success' ou 'error'
 */
function showToast(msg, type = 'error') {
  let toast = document.getElementById('ui-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ui-toast';
    document.body.appendChild(toast);
  }
  
  toast.className = 'ui-toast ' + (type === 'success' ? 'toast-success' : 'toast-error');
  toast.textContent = (type === 'success' ? '✓ ' : '⚠ ') + msg;
  
  // Força refluxo para resetar animação CSS se já estiver visível
  toast.classList.remove('show');
  void toast.offsetWidth; 
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Para manter compatibilidade com outras partes
function showError(msg) {
  showToast(msg, 'error');
}
