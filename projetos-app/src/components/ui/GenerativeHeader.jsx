import React, { useEffect, useState, useRef } from 'react';
import { generativeService } from '../../lib/generative/generativeService';

/**
 * GENERATIVE HEADER
 * Exibe o padrão parallax e o ícone identicon de um projeto.
 */
export function GenerativeHeader({ slug }) {
  const [identity, setIdentity] = useState(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    generativeService.getProjectIdentity(slug).then(setIdentity);
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

  if (!identity) return <div className="h-full w-full bg-secondary/10 animate-pulse" />;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black"
    >
      {/* Pattern Layers with Parallax */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
          opacity: 0.4
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />

      <div 
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 25}px, 0)`,
          opacity: 0.2
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />

      {/* Identicon */}
      <div className="absolute bottom-8 left-8 w-24 h-24 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-transform hover:scale-110 duration-500">
         <div 
           className="w-full h-full"
           dangerouslySetInnerHTML={{ __html: identity.icon }}
         />
      </div>
    </div>
  );
}
