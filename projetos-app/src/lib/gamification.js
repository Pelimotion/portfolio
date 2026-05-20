// ============================================================
// GAMIFICATION — Pure logic. No side-effects, no imports.
// ============================================================

// XP Sources
export const XP_SOURCES = {
  daily_login: 10,
  streak_7: 100,
  streak_30: 500,
  feito_check: 25,
  create_project: 50,
  column_cleared: 75,
};

// Level formula: XP needed for level N = 100 * N * 1.5
export function xpForLevel(n) {
  return Math.floor(100 * n * 1.5);
}

// Compute level from total XP
export function computeLevel(totalXP) {
  let level = 1;
  let accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level);
    level++;
  }
  return Math.max(1, level);
}

// XP progress within current level (0 to xpForLevel(level))
export function levelProgress(totalXP) {
  let level = 1;
  let accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level);
    level++;
  }
  const currentLevelXP = totalXP - accumulated;
  const neededXP = xpForLevel(level);
  return {
    level,
    currentLevelXP,
    neededXP,
    percent: Math.min(100, Math.floor((currentLevelXP / neededXP) * 100)),
    totalXP,
  };
}

// Level title names
const LEVEL_TITLES = [
  [1,  'Estagiário'],
  [3,  'Junior Motion'],
  [5,  'Motion Designer'],
  [8,  'Senior Motion'],
  [10, 'Art Director'],
  [15, 'Creative Director'],
  [20, 'Motion Legend'],
  [30, 'TOCA HUB Master'],
];

export function levelTitle(level) {
  let title = LEVEL_TITLES[0][1];
  for (const [min, name] of LEVEL_TITLES) {
    if (level >= min) title = name;
  }
  return title;
}

// Badge definitions
export const BADGE_DEFS = [
  {
    id: 'first_login',
    label: 'Bem-vindo!',
    desc: 'Fez seu primeiro login no TOCA HUB',
    icon: '🌟',
    condition: (p) => (p.days_logged || 0) >= 1,
  },
  {
    id: 'week_streak',
    label: '7 dias seguidos',
    desc: 'Logou por 7 dias consecutivos',
    icon: '🔥',
    condition: (p) => (p.days_logged || 0) >= 7,
  },
  {
    id: 'month_streak',
    label: 'Mês de Fogo',
    desc: 'Logou por 30 dias consecutivos',
    icon: '🚀',
    condition: (p) => (p.days_logged || 0) >= 30,
  },
  {
    id: 'first_feito',
    label: 'Entregador',
    desc: 'Completou o primeiro card',
    icon: '✅',
    condition: (p) => (p.cards_completed || 0) >= 1,
  },
  {
    id: 'ten_cards',
    label: 'Em Ritmo',
    desc: 'Completou 10 cards',
    icon: '💡',
    condition: (p) => (p.cards_completed || 0) >= 10,
  },
  {
    id: 'power_worker',
    label: 'Máquina',
    desc: 'Completou 50 cards',
    icon: '💪',
    condition: (p) => (p.cards_completed || 0) >= 50,
  },
  {
    id: 'centurion',
    label: 'Centurião',
    desc: 'Completou 100 cards',
    icon: '🏆',
    condition: (p) => (p.cards_completed || 0) >= 100,
  },
];

// Compute which badges a user has earned (returns array of badge IDs)
export function computeBadges(profileData) {
  const existing = new Set(profileData?.badges || []);
  const earned = [...existing];
  for (const badge of BADGE_DEFS) {
    if (!existing.has(badge.id) && badge.condition(profileData)) {
      earned.push(badge.id);
    }
  }
  return earned;
}
