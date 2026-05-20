import React, { useEffect, useState, useRef } from 'react';
import { generativeService } from '../../lib/generative/generativeService';

/**
 * GENERATIVE HEADER
 * Exibe o padrão parallax e o ícone identicon de um projeto.
 */
export function GenerativeHeader({ slug, type = 'project', showIcon = true, refreshKey = 0 }) {
  const [identity, setIdentity] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    generativeService.getProjectIdentity(slug, type).then(setIdentity);
  }, [slug, type, refreshKey]);

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

  if (!identity) return <div className="h-full w-full bg-secondary/10 animate-pulse" />;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Pattern Layers with Parallax */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
          opacity: 0.45
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 28}px, 0)`,
          opacity: 0.2
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

      {/* Identicon */}
      {showIcon && (
        <div className="absolute bottom-6 left-8">
          <div className="w-20 h-20 p-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: identity.icon }} />
          </div>
        </div>
      )}
    </div>
  );
}
