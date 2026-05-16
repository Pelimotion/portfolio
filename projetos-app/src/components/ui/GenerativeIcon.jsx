import React, { useEffect, useState } from 'react';
import { generateIcon } from '../../lib/generative/icon-generator';

/**
 * GENERATIVE ICON
 * Renderiza o Identicon determinístico para um ID.
 */
export function GenerativeIcon({ slug, size = 24, className = "" }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    generateIcon(slug).then(res => setSvg(res.svgString));
  }, [slug]);

  if (!svg) return <div className={`animate-pulse bg-secondary/20 rounded-md ${className}`} style={{ width: size, height: size }} />;

  return (
    <div 
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
