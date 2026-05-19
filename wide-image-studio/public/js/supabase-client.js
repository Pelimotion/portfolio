// Supabase client — auth + Realtime para o Studio.
// Depende de: config.js (CONFIG), supabase UMD carregado via CDN no HTML.

const _db = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
let _jobChannel = null;

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
