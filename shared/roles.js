/**
 * shared/roles.js — Matriz de Permissões Pelimotion
 *
 * Roles globais (stored in profiles.role):
 *   admin  → acesso irrestrito a todos os sistemas
 *   editor → blog-generator + projetos; sem admin panel
 *   viewer → projetos read-only; sem outros sistemas
 *
 * Para adicionar um novo sistema ou permissão:
 *   1. Adicione a entrada em PERMISSIONS[role]
 *   2. Use can(role, system, action) nos guard points do sistema
 *
 * Para criar sub-roles (futuro):
 *   - Adicione novos entries abaixo (ex: 'content-manager', 'freelancer')
 *   - Ajuste ROLE_HIERARCHY se a herança for necessária
 *   - Crie a migration SQL correspondente
 */

// Hierarquia: admin herda tudo, editor herda viewer
export const ROLE_HIERARCHY = {
    admin:  ['admin', 'editor', 'viewer'],
    editor: ['editor', 'viewer'],
    viewer: ['viewer'],
};

/**
 * Matriz de permissões por sistema e ação.
 * Cada entrada é um set de roles que podem executar a ação.
 */
export const PERMISSIONS = {
    // ── Admin Panel (landing page) ──────────────────────────────────────────
    'admin-panel': {
        access:         ['admin'],
        editContent:    ['admin'],
        deploy:         ['admin'],
    },

    // ── Blog Generator (CMS) ────────────────────────────────────────────────
    'blog-generator': {
        access:         ['admin', 'editor'],
        createPost:     ['admin', 'editor'],
        editPost:       ['admin', 'editor'],
        publishPost:    ['admin'],          // editor só manda para 'review'
        deletePost:     ['admin'],
        managePresets:  ['admin', 'editor'],
        generateImages: ['admin', 'editor'],
    },

    // ── Projetos App ────────────────────────────────────────────────────────
    'projetos': {
        access:             ['admin', 'editor', 'viewer'],
        createProject:      ['admin', 'editor'],
        editProject:        ['admin', 'editor'],
        deleteProject:      ['admin'],
        manageDailyLog:     ['admin', 'editor'],
        viewFinancials:     ['admin'],
        manageMembers:      ['admin'],
    },

    // ── Futuro: Social Pack / Newsletter ────────────────────────────────────
    'distribution': {
        access:         ['admin', 'editor'],
        publishSocial:  ['admin'],
        draftSocial:    ['admin', 'editor'],
    },

    // ── Futuro: Usuários & Configurações ────────────────────────────────────
    'settings': {
        access:         ['admin'],
        manageUsers:    ['admin'],
        manageRoles:    ['admin'],
        viewAuditLog:   ['admin'],
    },
};

/**
 * Verifica se um role tem permissão para uma ação num sistema.
 * @param {string} role    'admin' | 'editor' | 'viewer'
 * @param {string} system  chave de PERMISSIONS
 * @param {string} action  chave dentro do system
 * @returns {boolean}
 */
export function can(role, system, action) {
    const allowed = PERMISSIONS[system]?.[action];
    if (!allowed) return false;
    // Checar hierarquia: admin pode tudo que editor pode, etc.
    const userRoles = ROLE_HIERARCHY[role] ?? [role];
    return userRoles.some(r => allowed.includes(r));
}

/**
 * Retorna todos os sistemas que o role pode acessar.
 * @param {string} role
 * @returns {string[]}
 */
export function accessibleSystems(role) {
    return Object.entries(PERMISSIONS)
        .filter(([, perms]) => can(role, Object.keys(PERMISSIONS).find(k => PERMISSIONS[k] === perms), 'access'))
        .map(([system]) => system);
}

/**
 * URL padrão de redirect por role após o login.
 */
export const DEFAULT_REDIRECT = {
    admin:  '/admin',
    editor: '/blog-generator',
    viewer: '/projetos',
};
