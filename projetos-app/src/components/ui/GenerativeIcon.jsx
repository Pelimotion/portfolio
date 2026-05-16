import React, { useEffect, useState } from 'react';
import { generateIcon } from '../../lib/generative/icon-generator';

/**
 * GENERATIVE ICON
 * Renderiza o Identicon determinístico para um ID.
 */
export function GenerativeIcon({ slug, size = 24, className = "", type = "project" }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    generateIcon(slug, type).then(res => setSvg(res.svgString));
  }, [slug, type]);

  if (!svg) return <div className={`animate-pulse bg-secondary/20 rounded-md ${className}`} style={{ width: size, height: size }} />;

  return (
    <div 
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
