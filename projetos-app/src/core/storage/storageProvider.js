// ============================================
// STORAGE PROVIDER — Abstract Interface
// Permite múltiplos providers: Google Drive,
// Dropbox, OneDrive, LucidLink, S3, NAS, etc.
// ============================================

/**
 * Base interface that all providers must implement.
 * Each provider is a plain object conforming to this shape.
 *
 * @typedef {Object} StorageFile
 * @property {string}  id          - Provider-native file ID
 * @property {string}  name        - Display name
 * @property {string}  mimeType    - MIME type
 * @property {string}  [url]       - Web view URL
 * @property {string}  [thumbUrl]  - Thumbnail URL (if available)
 * @property {number}  [size]      - Bytes
 * @property {string}  [modifiedAt]- ISO date string
 * @property {boolean} isFolder    - Is this a folder?
 * @property {string}  [parentId]  - Parent folder ID
 */

/**
 * @typedef {Object} StorageProvider
 * @property {string}   id          - Provider key: 'google_drive' | 'dropbox' | 'onedrive' | 's3'
 * @property {string}   label       - Human readable: 'Google Drive'
 * @property {string}   icon        - Emoji or SVG path ref
 * @property {Function} connect     - () => Promise<{ accessToken, metadata }>
 * @property {Function} listFolder  - (folderId, token) => Promise<StorageFile[]>
 * @property {Function} getFile     - (fileId, token) => Promise<StorageFile>
 * @property {Function} searchFiles - (query, token) => Promise<StorageFile[]>
 * @property {Function} getThumbnail- (fileId, token) => Promise<string | null>  (returns URL)
 */

// ── Provider Registry ──────────────────────
const PROVIDERS = new Map();

export function registerProvider(provider) {
  PROVIDERS.set(provider.id, provider);
}

export function getProvider(id) {
  return PROVIDERS.get(id) || null;
}

export function listProviders() {
  return [...PROVIDERS.values()];
}

// ── Utility: normalise path for fuzzy matching ──
export function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')   // non-alphanum → underscore
    .replace(/_+/g, '_')           // collapse multiple underscores
    .replace(/^_|_$/g, '');        // trim edges
}

// ── Fuzzy match scene title → folder name ──
// Returns true if folderName is a plausible match for sceneName
export function fuzzyMatchFolder(sceneName, folderName) {
  const scene  = normalizeName(sceneName);
  const folder = normalizeName(folderName);

  // Exact match
  if (scene === folder) return true;

  // Common patterns: CENA_08, SC08, Scene_08, 08, C08, CENA08
  const sceneNum = scene.match(/(\d+)/)?.[1];
  if (!sceneNum) return false;

  const patterns = [
    `cena_${sceneNum}`,
    `cena${sceneNum}`,
    `sc${sceneNum}`,
    `sc_${sceneNum}`,
    `scene_${sceneNum}`,
    `scene${sceneNum}`,
    `c${sceneNum}`,
    sceneNum.padStart(2, '0'),
    sceneNum,
  ];
  return patterns.some(p => folder === p || folder.startsWith(p) || folder.endsWith(p));
}
