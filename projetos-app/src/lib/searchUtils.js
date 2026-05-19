import Fuse from 'fuse.js';

export function buildSearchIndex(items) {
  return new Fuse(items, {
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.3,
    keys: ['title', 'description', 'note', 'projectTitle'],
  });
}

export function searchAll(query, fuse) {
  if (!query || query.length < 2) return [];
  return fuse.search(query, { limit: 20 });
}

export function extractSnippet(text, term, windowSize = 100) {
  if (!text || !term) return '';
  const lower = text.toLowerCase();
  const termLower = term.toLowerCase();
  const idx = lower.indexOf(termLower);
  if (idx === -1) return text.slice(0, windowSize);
  const start = Math.max(0, idx - Math.floor(windowSize / 2));
  const end = Math.min(text.length, idx + term.length + Math.ceil(windowSize / 2));
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  return `${prefix}${text.slice(start, idx)}[[MARK]]${text.slice(idx, idx + term.length)}[[/MARK]]${text.slice(idx + term.length, end)}${suffix}`;
}
