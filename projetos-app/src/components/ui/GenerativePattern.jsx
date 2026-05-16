import React, { useEffect, useState, useRef } from 'react';
import { generatePattern } from '../../lib/generative/pattern-generator';

/**
 * GENERATIVE PATTERN
 * Renderiza o padrão parallax determinístico para um ID.
 */
export function GenerativePattern({ slug, className = "", opacity = 1 }) {
  const [pattern, setPattern] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    generatePattern(slug).then(setPattern);
  }, [slug]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (clientX / innerWidth - 0.5) * 2,
        y: (clientY / innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!pattern) return <div className={`animate-pulse bg-secondary/10 ${className}`} />;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ opacity }}>
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)` }}
        dangerouslySetInnerHTML={{ __html: pattern.svgString }}
      />
    </div>
  );
}
