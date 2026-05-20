/**
 * VIEW PREFERENCES
 * Persiste preferências de visualização por database no localStorage.
 * Chave: toca-prefs-{databaseId}-{key}
 */

const _key = (databaseId, key) => `toca-prefs-${databaseId}-${key}`;

export function savePreference(databaseId, key, value) {
  try { localStorage.setItem(_key(databaseId, key), JSON.stringify(value)); }
  catch (e) { console.warn('[viewPreferences] save error:', e); }
}

export function loadPreference(databaseId, key, fallback = null) {
  try {
    const raw = localStorage.getItem(_key(databaseId, key));
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
