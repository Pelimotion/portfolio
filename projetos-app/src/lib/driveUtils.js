import { toast } from 'sonner';

const DRIVE_FOLDER_RE = /\/folders\/([a-zA-Z0-9_-]+)/;
const DRIVE_FILE_RE   = /\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_RE   = /[?&]id=([a-zA-Z0-9_-]+)/;

export function parseDriveFolderId(url) {
  if (!url) return null;
  const m = url.match(DRIVE_FOLDER_RE);
  return m ? m[1] : null;
}

export function buildSceneDriveUrl(projectFolderUrl, sceneTitle) {
  if (!projectFolderUrl || !sceneTitle) return projectFolderUrl || null;
  const folderId = parseDriveFolderId(projectFolderUrl);
  if (!folderId) return projectFolderUrl;
  const q = encodeURIComponent(`'${folderId}' in parents and name contains '${sceneTitle.slice(0, 40)}'`);
  return `https://drive.google.com/drive/search?q=${q}`;
}

export function validateDriveUrl(url) {
  if (!url) return { valid: false, type: 'unknown' };
  try {
    const u = new URL(url);
    if (!u.hostname.includes('google.com')) return { valid: false, type: 'unknown' };
    if (DRIVE_FOLDER_RE.test(url)) return { valid: true, type: 'folder' };
    if (DRIVE_FILE_RE.test(url) || DRIVE_OPEN_RE.test(url)) return { valid: true, type: 'file' };
    return { valid: true, type: 'unknown' };
  } catch {
    return { valid: false, type: 'unknown' };
  }
}

export function openDriveAsset(url) {
  const { valid } = validateDriveUrl(url);
  if (!valid) {
    toast.error('URL do Drive inválida ou não reconhecida');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
