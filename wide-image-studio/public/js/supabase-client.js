// Supabase client — auth + Realtime para o Studio.
// Depende de: config.js (CONFIG), supabase UMD carregado via CDN no HTML.

const _db = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
let _jobChannel = null;

// Aplica tokens vindos do hash da URL (redirect cross-domain do login).
// detectSessionInUrl do Supabase nem sempre processa o hash a tempo quando
// scripts são carregados como <script> simples — chamamos setSession() explicitamente.
async function _applyHashSession() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return;
    const p = new URLSearchParams(hash.slice(1));
    const at = p.get('access_token');
    const rt = p.get('refresh_token');
    if (at && rt) {
        await _db.auth.setSession({ access_token: at, refresh_token: rt });
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
}

async function getSession() {
  const { data, error } = await _db.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}

async function getUser() {
  const { data, error } = await _db.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

// Verifica se o usuário tem role wide_studio em app_metadata.
async function requireWideStudioSession() {
  await _applyHashSession();
  const session = await getSession();
  if (!session) {
    window.location.href = CONFIG.LOGIN_URL + '?next=' + encodeURIComponent(window.location.href);
    return null;
  }
  const user = await getUser();
  if (user?.app_metadata?.role !== 'wide_studio') {
    window.location.href = CONFIG.LOGIN_URL + '?error=unauthorized';
    return null;
  }
  return session;
}

function getAuthHeader(session) {
  return `Bearer ${session.access_token}`;
}

// Subscreve a mudanças no job via Supabase Realtime.
// callback(job) é chamado a cada UPDATE no registro.
function subscribeToJob(jobId, callback) {
  unsubscribeFromJob();
  _jobChannel = _db
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'wide_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe();
}

function unsubscribeFromJob() {
  if (_jobChannel) {
    _db.removeChannel(_jobChannel);
    _jobChannel = null;
  }
}

async function signOut() {
  await _db.auth.signOut();
  window.location.href = CONFIG.LOGIN_URL;
}
