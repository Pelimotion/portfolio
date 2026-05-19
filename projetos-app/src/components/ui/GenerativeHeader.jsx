import React, { useEffect, useState, useRef } from 'react';
import { generativeService } from '../../lib/generative/generativeService';
import { Sparkles, RefreshCw, Palette } from 'lucide-react';

/**
 * GENERATIVE HEADER
 * Exibe o padrão parallax e o ícone identicon de um projeto.
 */
export function GenerativeHeader({ slug, type = 'project', showIcon = true }) {
  const [identity, setIdentity] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generativeService.getProjectIdentity(slug, type).then(setIdentity);
  }, [slug, type]);

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

  const handleRandomize = async () => {
    setIsGenerating(true);
    try {
      const newIdentity = await generativeService.randomize(slug, type);
      setIdentity(newIdentity);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!identity) return <div className="h-full w-full bg-secondary/10 animate-pulse" />;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Pattern Layers with Parallax */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
          opacity: 0.35
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />

      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 28}px, 0)`,
          opacity: 0.15
        }}
        dangerouslySetInnerHTML={{ __html: identity.pattern }}
      />

      {/* Brutalist Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button 
          onClick={handleRandomize}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-lg text-[10px] font-semibold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Randomize Identity
        </button>
      </div>

      {/* Identicon (Integrated) */}
      {showIcon && (
        <div className="absolute bottom-6 left-8 flex items-end gap-6">
          <div className="w-20 h-20 p-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all hover:scale-105 hover:border-white/30 group">
             <div 
               className="w-full h-full"
               dangerouslySetInnerHTML={{ __html: identity.icon }}
             />
          </div>
        </div>
      )}
    </div>
  );
}
