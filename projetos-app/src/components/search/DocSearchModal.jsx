import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { FileSearch, Search, List, LayoutGrid, Columns2, Download, X } from 'lucide-react';
import { useDocSearch } from '../../lib/useDocSearch';
import { searchDocuments, hasIndexedChunks } from '../../services/searchService';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '@/lib/utils';

// ============================================
// DOC SEARCH MODAL — BM25 full-text (⌘⇧D)
// K.4: 3 view modes (list / grid / compare)
// K.6: file type badges + optimized Drive URLs
// K.8: file filter chips + export markdown
// ============================================

const VIEW_STORAGE_KEY = 'docSearchView';

// ── Helpers ───────────────────────────────────────────────────

function renderHighlight(snippet) {
  if (!snippet) return null;
  const parts = snippet.split(/(\[\[MARK\]\].*?\[\[\/MARK\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[MARK\]\](.*)\[\[\/MARK\]\]$/);
    if (m) {
      return (
        <mark key={i} className="bg-violet-200/40 dark:bg-violet-900/40 rounded px-0.5 not-italic">
          {m[1]}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// K.6: detect file type and return best Drive URL
function getDriveUrl(driveFileId, fileName) {
  if (!driveFileId) return null;
  const ext = (fileName ?? '').split('.').pop().toLowerCase();
  // No extension = Google Doc → use Docs editor URL (more direct)
  if (!['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
    return `https://docs.google.com/document/d/${driveFileId}/edit`;
  }
  return `https://drive.google.com/file/d/${driveFileId}/view`;
}

// K.6: file type badge (label + color class)
function getFileTypeBadge(fileName, mimeType) {
  // mime_type tem precedência quando disponível (evita falsos positivos por extensão)
  if (mimeType === 'application/vnd.google-apps.spreadsheet')
    return { label: 'GSheet', cls: 'bg-green-500/10 text-green-400/70' };
  if (mimeType === 'application/vnd.google-apps.presentation')
    return { label: 'GSlide', cls: 'bg-yellow-500/10 text-yellow-400/70' };
  const ext = (fileName ?? '').split('.').pop().toLowerCase();
  if (ext === 'pdf') return { label: 'PDF', cls: 'bg-red-500/10 text-red-400/70' };
  if (['doc', 'docx'].includes(ext)) return { label: 'DOC', cls: 'bg-blue-500/10 text-blue-400/70' };
  if (['txt', 'md'].includes(ext)) return { label: 'TXT', cls: 'bg-gray-500/10 text-gray-400/70' };
  return { label: 'GDoc', cls: 'bg-violet-500/10 text-violet-400/70' };
}

// K.8: export filtered results as a markdown file
function exportMarkdown(results, query) {
  const lines = [
    `# Busca: "${query}"`,
    `_${results.length} trecho${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}_`,
    '',
  ];
  let lastFile = null;
  results.forEach(r => {
    if (r.file_name !== lastFile) {
      lines.push(`## ${r.file_name}`, '');
      lastFile = r.file_name;
    }
    const snippet = (r.snippet ?? '').replace(/\[\[MARK\]\](.*?)\[\[\/MARK\]\]/g, '**$1**');
    lines.push(`### Trecho ${r.chunk_index + 1}`, snippet || '_sem snippet_', '');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `busca-${query.slice(0, 24).replace(/\s+/g, '-').replace(/[^\w-]/g, '')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── DocResultItem ─────────────────────────────────────────────

function DocResultItem({ result, compact = false }) {
  const url = getDriveUrl(result.drive_file_id, result.file_name);
  const { label: typeLabel, cls: typeCls } = getFileTypeBadge(result.file_name, result.mime_type);

  const handleOpen = useCallback(() => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  if (compact) {
    return (
      <Command.Item
        value={`${result.drive_file_id}-${result.chunk_index}`}
        onSelect={handleOpen}
        className={cn(
          "flex flex-col gap-1 p-2.5 text-left cursor-pointer transition-colors rounded-lg border border-transparent",
          "aria-selected:bg-primary/10 aria-selected:border-primary/20",
          "hover:bg-surface-2 hover:border-subtle"
        )}
      >
        <div className="flex items-center gap-1.5">
          <FileSearch className="w-3 h-3 text-violet-400/70 shrink-0" />
          <span className="text-[10px] text-foreground truncate flex-1 font-medium leading-tight">
            {result.file_name}
          </span>
          <span className={cn("text-[8px] font-medium px-1 rounded shrink-0", typeCls)}>{typeLabel}</span>
        </div>
        {result.snippet && (
          <p className="text-[10px] leading-relaxed text-muted-foreground/60 line-clamp-3 pl-[18px]">
            {renderHighlight(result.snippet)}
          </p>
        )}
        <span className="text-[8px] text-muted-foreground/25 pl-[18px]">trecho {result.chunk_index + 1}</span>
      </Command.Item>
    );
  }

  return (
    <Command.Item
      value={`${result.drive_file_id}-${result.chunk_index}`}
      onSelect={handleOpen}
      className={cn(
        "flex flex-col gap-1 px-4 py-3 text-left cursor-pointer transition-colors",
        "aria-selected:bg-primary/10 aria-selected:text-foreground",
        "hover:bg-surface-2 hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        <FileSearch className="w-3.5 h-3.5 text-violet-400/70 shrink-0" />
        <span className="text-small text-foreground truncate flex-1">{result.file_name}</span>
        <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0", typeCls)}>{typeLabel}</span>
        <span className="text-caption text-muted-foreground/30 shrink-0">
          trecho {result.chunk_index + 1}
        </span>
      </div>
      {result.snippet && (
        <p className="text-caption text-muted-foreground/60 line-clamp-2 pl-5">
          {renderHighlight(result.snippet)}
        </p>
      )}
    </Command.Item>
  );
}

// ── K.4: Compare View — 2 panels side-by-side with scroll sync ──

function CompareView({ results }) {
  const fileGroups = useMemo(() => {
    const map = new Map();
    results.forEach(r => {
      if (!map.has(r.file_name)) {
        map.set(r.file_name, { file_name: r.file_name, drive_file_id: r.drive_file_id, chunks: [] });
      }
      map.get(r.file_name).chunks.push(r);
    });
    return Array.from(map.values());
  }, [results]);

  const [leftFile, setLeftFile] = useState(() => fileGroups[0]?.file_name ?? '');
  const [rightFile, setRightFile] = useState(
    () => fileGroups[1]?.file_name ?? fileGroups[0]?.file_name ?? ''
  );

  // Reset selections when the result set changes
  useEffect(() => {
    setLeftFile(fileGroups[0]?.file_name ?? '');
    setRightFile(fileGroups[1]?.file_name ?? fileGroups[0]?.file_name ?? '');
  }, [fileGroups[0]?.file_name, fileGroups[1]?.file_name]); // eslint-disable-line react-hooks/exhaustive-deps

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const syncingRef = useRef(false);

  const syncScroll = useCallback((source, target) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    const ratio = source.scrollTop / Math.max(1, source.scrollHeight - source.clientHeight);
    target.scrollTop = ratio * Math.max(0, target.scrollHeight - target.clientHeight);
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;
    const onLeft = () => syncScroll(left, right);
    const onRight = () => syncScroll(right, left);
    left.addEventListener('scroll', onLeft, { passive: true });
    right.addEventListener('scroll', onRight, { passive: true });
    return () => {
      left.removeEventListener('scroll', onLeft);
      right.removeEventListener('scroll', onRight);
    };
  }, [syncScroll]);

  if (fileGroups.length === 0) return null;

  const panels = [
    { id: 'left', file: leftFile, setFile: setLeftFile, scrollRef: leftRef },
    { id: 'right', file: rightFile, setFile: setRightFile, scrollRef: rightRef },
  ];

  return (
    <div className="flex divide-x divide-subtle h-[400px] overflow-hidden">
      {panels.map(panel => {
        const group = fileGroups.find(g => g.file_name === panel.file);
        const chunks = group?.chunks ?? [];
        const driveUrl = getDriveUrl(group?.drive_file_id, panel.file);

        return (
          <div key={panel.id} className="flex flex-col flex-1 min-w-0">
            {/* Panel header */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-subtle bg-surface-2 shrink-0">
              <FileSearch className="w-3 h-3 text-violet-400/60 shrink-0" />
              <select
                value={panel.file}
                onChange={e => panel.setFile(e.target.value)}
                className="flex-1 min-w-0 text-[10px] text-foreground bg-transparent border-none outline-none cursor-pointer truncate"
              >
                {fileGroups.map(g => (
                  <option key={g.file_name} value={g.file_name}>{g.file_name}</option>
                ))}
              </select>
              {driveUrl && (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-violet-400/50 hover:text-violet-400 transition-colors shrink-0 ml-1"
                  onClick={e => e.stopPropagation()}
                >
                  ↗
                </a>
              )}
            </div>

            {/* Chunks */}
            <div
              ref={panel.scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2 space-y-1.5"
            >
              {chunks.map((chunk, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  className="rounded-md border border-subtle bg-surface-1 p-2.5 hover:bg-surface-2 transition-colors cursor-pointer"
                  onClick={() => driveUrl && window.open(driveUrl, '_blank', 'noopener,noreferrer')}
                  onKeyDown={e => e.key === 'Enter' && driveUrl && window.open(driveUrl, '_blank', 'noopener,noreferrer')}
                >
                  <span className="inline-block text-[8px] font-mono text-violet-400/60 bg-violet-500/10 px-1 py-0.5 rounded mb-1.5">
                    #{chunk.chunk_index + 1}
                  </span>
                  <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                    {renderHighlight(chunk.snippet)}
                  </p>
                </div>
              ))}
              {chunks.length === 0 && (
                <p className="text-caption text-muted-foreground/30 text-center py-8">
                  Sem trechos para este arquivo
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── K.4: View Toggle ──────────────────────────────────────────

const VIEW_OPTIONS = [
  { key: 'list', Icon: List, label: 'Lista' },
  { key: 'grid', Icon: LayoutGrid, label: 'Grade' },
  { key: 'compare', Icon: Columns2, label: 'Comparar' },
];

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {VIEW_OPTIONS.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => onChange(key)}
          className={cn(
            "p-1.5 rounded transition-colors",
            value === key
              ? "bg-violet-500/15 text-violet-400"
              : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-surface-3"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────

export function DocSearchModal() {
  const { docSearchOpen, closeDocSearch } = useDocSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasChunks, setHasChunks] = useState(null);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_STORAGE_KEY) || 'list'
  );
  // K.8: active file filter (empty set = show all)
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const debounceRef = useRef(null);

  const handleViewMode = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  // ⌘⇧D hotkey global
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        docSearchOpen
          ? closeDocSearch()
          : useDocSearch.getState().openDocSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [docSearchOpen, closeDocSearch]);

  // Reset on close; check chunks on open
  useEffect(() => {
    if (!docSearchOpen) {
      setQuery('');
      setResults([]);
      setSelectedFiles(new Set());
      setHasChunks(null); // reset so next open re-checks the DB
      return;
    }
    if (hasChunks === null) {
      hasIndexedChunks().then(setHasChunks).catch(() => setHasChunks(false));
    }
  }, [docSearchOpen, hasChunks]);

  // Reset file filter when raw results change
  useEffect(() => { setSelectedFiles(new Set()); }, [results]);

  // Search with 300ms debounce
  const runSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchDocuments(q);
      setResults(data);
    } catch (e) {
      console.error('[DocSearchModal] search error:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  // K.8: unique file names + filtered results
  const fileNames = useMemo(() => [...new Set(results.map(r => r.file_name))], [results]);
  const filteredResults = useMemo(() => {
    if (selectedFiles.size === 0) return results;
    return results.filter(r => selectedFiles.has(r.file_name));
  }, [results, selectedFiles]);

  const toggleFile = useCallback((name) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const isEmpty = !loading && query.length >= 2 && filteredResults.length === 0;
  const hasResults = !loading && filteredResults.length > 0;

  return (
    <Dialog.Root open={docSearchOpen} onOpenChange={(open) => !open && closeDocSearch()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[10vh] z-[101] w-full max-w-2xl -translate-x-1/2",
            "bg-surface-1 border border-strong rounded-xl shadow-2xl overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150"
          )}
        >
          <Dialog.Title className="sr-only">Buscar em documentos</Dialog.Title>
          <Dialog.Description className="sr-only">Busca full-text em documentos indexados do Google Drive</Dialog.Description>
          <Command shouldFilter={false} loop>
            {/* ── Input + view toggle ───────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
              <FileSearch className="w-4 h-4 text-violet-400/70 shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar em documentos indexados..."
                className="flex-1 bg-transparent text-small text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
              <ViewToggle value={viewMode} onChange={handleViewMode} />
              <kbd className="text-[9px] text-muted-foreground/30 bg-surface-3 border border-subtle px-1.5 py-0.5 rounded font-mono shrink-0">
                ESC
              </kbd>
            </div>

            {/* ── K.8: File filter chips ────────────────────── */}
            {!loading && fileNames.length > 1 && (
              <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-subtle overflow-x-auto flex-nowrap">
                <span className="text-[9px] text-muted-foreground/30 shrink-0 mr-0.5">Filtrar:</span>
                {fileNames.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleFile(name)}
                    className={cn(
                      "flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border transition-colors shrink-0 whitespace-nowrap",
                      selectedFiles.has(name)
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                        : "bg-surface-2 border-subtle text-muted-foreground/50 hover:text-muted-foreground/80"
                    )}
                  >
                    {name.length > 26 ? name.slice(0, 24) + '…' : name}
                    {selectedFiles.has(name) && <X className="w-2.5 h-2.5" />}
                  </button>
                ))}
              </div>
            )}

            {/* ── K.4: Compare view (outside Command.List) ─── */}
            {viewMode === 'compare' && hasResults && (
              <CompareView results={filteredResults} />
            )}

            {/* ── List + Grid via Command.List ──────────────── */}
            <Command.List className="max-h-[440px] overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="px-4 py-4 space-y-2.5">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-5/6" />
                  <Skeleton className="h-10 w-4/5" />
                </div>
              )}

              {!loading && !query && (
                <div className="px-4 py-10 text-center text-small text-muted-foreground/30">
                  Digite para buscar nos documentos indexados
                </div>
              )}

              {isEmpty && hasChunks === false && (
                <Command.Empty className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/60">
                  <FileSearch className="w-5 h-5 opacity-40" />
                  <span className="text-small">Nenhum documento indexado</span>
                  <span className="text-caption text-muted-foreground/40 text-center px-8">
                    Use o painel de Assets para indexar documentos do Drive
                  </span>
                </Command.Empty>
              )}

              {isEmpty && hasChunks !== false && (
                <Command.Empty className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/60">
                  <Search className="w-5 h-5 opacity-40" />
                  <span className="text-small">Nenhum resultado para &ldquo;{query}&rdquo;</span>
                </Command.Empty>
              )}

              {/* List mode */}
              {hasResults && viewMode === 'list' && (
                <Command.Group
                  heading="Documentos"
                  className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/40 [&_[cmdk-group-heading]]:bg-surface-2 [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0"
                >
                  {filteredResults.map((r, idx) => (
                    <DocResultItem
                      key={`${r.drive_file_id}-${r.chunk_index}-${idx}`}
                      result={r}
                    />
                  ))}
                </Command.Group>
              )}

              {/* Grid mode */}
              {hasResults && viewMode === 'grid' && (
                <>
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/40 bg-surface-2 sticky top-0 z-10">
                    Documentos
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-2">
                    {filteredResults.map((r, idx) => (
                      <DocResultItem
                        key={`${r.drive_file_id}-${r.chunk_index}-${idx}`}
                        result={r}
                        compact
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Compare mode: Command.List shows nothing (CompareView rendered above) */}
            </Command.List>

            {/* ── Footer ────────────────────────────────────── */}
            {(hasResults || (viewMode === 'compare' && !loading && results.length > 0)) && (
              <div className="px-4 py-2 border-t border-subtle flex items-center justify-between">
                <span className="text-caption text-muted-foreground/30">
                  {filteredResults.length} trecho{filteredResults.length !== 1 ? 's' : ''}{' '}
                  encontrado{filteredResults.length !== 1 ? 's' : ''}
                  {selectedFiles.size > 0 && ' (filtrado)'}
                </span>
                <div className="flex items-center gap-3">
                  {/* K.8: export markdown */}
                  <button
                    type="button"
                    onClick={() => exportMarkdown(filteredResults, query)}
                    title="Exportar como Markdown"
                    className="text-[9px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    .md
                  </button>
                  <span className="text-caption text-muted-foreground/20">⌘⇧D para fechar</span>
                </div>
              </div>
            )}
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
