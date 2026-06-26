/**
 * shared/auth.js — Auth unificado Pelimotion
 *
 * Usado por: blog-generator/cms.html, admin/index.html, login/index.html
 * Mesmo projeto Supabase do projetos-app (gfaqnkmmbozmhroicqyc).
 *
 * Roles (profiles.role):
 *   admin  → acesso total: admin panel + blog-generator + projetos
 *   editor → blog-generator + projetos; SEM admin panel
 *   viewer → projetos (read-only); SEM outros sistemas
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let _supabase = null;
let _profile = null;    // cache do perfil do usuário atual

async function getSupabase() {
    if (_supabase) return _supabase;
    const res = await fetch('/api/config');
    const { supabaseUrl, supabaseAnonKey } = await res.json();
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
}

/** Retorna instância Supabase (lazy-loaded, cacheada) */
export async function getClient() {
    return getSupabase();
}

/**
 * Busca e cacheia o profile do usuário logado.
 * Retorna { id, email, full_name, role, avatar_url, ... } ou null.
 */
export async function getUserProfile() {
    if (_profile) return _profile;
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', session.user.id)
        .single();

    if (error || !data) {
        // Perfil não existe ainda — retorna role padrão baseado no email
        _profile = { id: session.user.id, email: session.user.email, role: 'editor' };
    } else {
        _profile = data;
    }
    return _profile;
}

/** Retorna o role do usuário logado ('admin' | 'editor' | 'viewer' | null) */
export async function getUserRole() {
    const profile = await getUserProfile();
    return profile?.role ?? null;
}

/**
 * Verifica se há sessão ativa. Se não houver, redireciona para /login.
 * Retorna a sessão se válida, null se redirecionou.
 */
export async function requireAuth(redirectTo = '/login') {
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = `${redirectTo}?next=${encodeURIComponent(window.location.href)}`;
        return null;
    }
    return session;
}

/**
 * Verifica sessão E role. Redireciona se não autorizado.
 * @param {string[]} allowedRoles  Ex: ['admin'] ou ['admin', 'editor']
 * @param {string}   redirectTo    Para onde ir se não autorizado
 * @returns {{ session, profile }} | null
 */
export async function requireRole(allowedRoles, redirectTo = '/login') {
    const session = await requireAuth(redirectTo);
    if (!session) return null;

    const profile = await getUserProfile();
    const role = profile?.role;

    if (!role || !allowedRoles.includes(role)) {
        window.location.href = `${redirectTo}?error=unauthorized&next=${encodeURIComponent(window.location.href)}`;
        return null;
    }

    return { session, profile };
}

/** Encerra sessão e redireciona para /login */
export async function signOut() {
    const supabase = await getSupabase();
    _profile = null;
    await supabase.auth.signOut();
    window.location.href = '/login';
}

/** Login com email e senha */
export async function signIn(email, password) {
    const supabase = await getSupabase();
    return supabase.auth.signInWithPassword({ email, password });
}
