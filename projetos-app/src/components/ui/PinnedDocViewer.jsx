import React, { useState } from 'react';
import { ExternalLink, FileText, Layout, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function getDocTypeInfo(url) {
  if (!url) return null;
  if (url.includes('docs.google.com/document')) return { type: 'gdoc', icon: FileText, label: 'Google Docs', color: 'text-blue-500' };
  if (url.includes('docs.google.com/spreadsheets')) return { type: 'gsheet', icon: Layout, label: 'Google Sheets', color: 'text-emerald-500' };
  if (url.includes('figma.com')) return { type: 'figma', icon: Layout, label: 'Figma', color: 'text-pink-500' };
  if (url.includes('miro.com')) return { type: 'miro', icon: Layout, label: 'Miro', color: 'text-yellow-500' };
  return { type: 'other', icon: ExternalLink, label: 'Link Externo', color: 'text-muted-foreground' };
}

export function formatEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('docs.google.com') && !url.includes('/preview')) {
    return url.replace(/\/edit.*$/, '/preview');
  }
  return url;
}

export function PinnedDocViewer({ url, title, trigger }) {
  const [open, setOpen] = useState(false);
  const info = getDocTypeInfo(url);
  const embedUrl = formatEmbedUrl(url);

  if (!url) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--surface-2)] transition-colors text-xs font-medium shrink-0 shadow-sm hover:shadow-md">
            {info && <info.icon className={`w-3.5 h-3.5 ${info.color}`} />}
            <span className="truncate max-w-[150px]">{title || 'Doc Pinado'}</span>
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed inset-4 md:inset-10 z-[1000] bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <div className="flex items-center gap-2">
              {info && <info.icon className={`w-4 h-4 ${info.color}`} />}
              <span className="font-semibold text-sm">{title || info?.label || 'Documento Mestre'}</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="ml-4 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Abrir Externo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-[var(--surface-2)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 bg-white">
            {info?.type === 'other' ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 bg-[var(--surface-0)]">
                <ExternalLink className="w-12 h-12 mb-4" />
                <p>A visualização embutida pode não estar disponível.</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 text-primary font-medium hover:underline">
                  Abrir link em nova aba
                </a>
              </div>
            ) : (
              <iframe src={embedUrl} className="w-full h-full border-0" title="Pinned Doc Viewer" allowFullScreen />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
