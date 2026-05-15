import React, { useMemo } from 'react';
import { getArtStyleFromId, getAccentColorFromId, ART_PATTERNS } from '../../lib/artPatternEngine';

export function ProjectArtPattern({
  projectId,
  style,
  accentColor,
  size = 'card',
  animated = true,
  opacity = 0.18,
  className = ""
}) {
  const artStyle = useMemo(() => style || getArtStyleFromId(projectId), [style, projectId]);
  const color = useMemo(() => accentColor || getAccentColorFromId(projectId), [accentColor, projectId]);
  
  const patternHtml = useMemo(() => {
    const patternFn = ART_PATTERNS[artStyle] || ART_PATTERNS.mondrian;
    return patternFn(color);
  }, [artStyle, color]);

  const sizeClasses = {
    card: 'w-[120px] h-[120px] top-0 right-0',
    header: 'w-full h-full inset-0',
    thumbnail: 'w-full h-full inset-0'
  };

  return (
    <div 
      className={`absolute overflow-hidden pointer-events-none transition-opacity duration-300 ${sizeClasses[size]} ${className}`}
      style={{ 
        opacity: opacity,
        maskImage: size === 'card' 
          ? 'radial-gradient(ellipse at top right, black 40%, transparent 80%)' 
          : 'none',
        WebkitMaskImage: size === 'card' 
          ? 'radial-gradient(ellipse at top right, black 40%, transparent 80%)' 
          : 'none'
      }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: patternHtml }}
    />
  );
}
