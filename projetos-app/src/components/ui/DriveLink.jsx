import React from 'react';
import { ExternalLink, FolderOpen } from 'lucide-react';
import { buildSceneDriveUrl, validateDriveUrl, openDriveAsset } from '../../lib/driveUtils';
import { cn } from '@/lib/utils';

// ============================================
// DRIVE LINK — Badge inteligente para links do Google Drive
// Estados: linked (azul) | inherited (cinza) | unlinked (muted)
// ============================================

export function DriveLink({ projectDriveUrl, sceneTitle, overrideUrl, label }) {
  const effectiveUrl = overrideUrl
    || (projectDriveUrl && sceneTitle ? buildSceneDriveUrl(projectDriveUrl, sceneTitle) : projectDriveUrl);

  const { valid } = validateDriveUrl(effectiveUrl);
  const isInherited = !overrideUrl && !!projectDriveUrl && !!sceneTitle;

  if (!effectiveUrl) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full",
        "bg-surface-2 text-muted-foreground/40 border border-subtle opacity-50 cursor-default select-none"
      )}>
        <FolderOpen className="w-3 h-3" />
        {label || 'Sem Drive'}
      </span>
    );
  }

  if (isInherited) {
    return (
      <button
        onClick={() => openDriveAsset(effectiveUrl)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full transition-colors",
          "bg-surface-2 text-muted-foreground border border-subtle",
          "hover:bg-surface-3 hover:text-foreground"
        )}
        title={`Herdado do projeto: ${effectiveUrl}`}
      >
        <FolderOpen className="w-3 h-3" />
        {label || '↰ Herdado'}
        <ExternalLink className="w-3 h-3 opacity-50" />
      </button>
    );
  }

  return (
    <button
      onClick={() => openDriveAsset(effectiveUrl)}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full transition-colors",
        valid
          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20"
          : "bg-surface-2 text-muted-foreground/50 border border-subtle cursor-not-allowed"
      )}
      title={effectiveUrl}
      disabled={!valid}
    >
      <FolderOpen className="w-3 h-3" />
      {label || 'Drive'}
      {valid && <ExternalLink className="w-3 h-3 opacity-50" />}
    </button>
  );
}
