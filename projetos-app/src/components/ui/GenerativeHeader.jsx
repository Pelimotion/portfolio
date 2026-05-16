import React, { useRef, useEffect, useMemo } from 'react';
import { useUIStore } from '../../stores/useUIStore';

// ============================================
// GENERATIVE HEADER — 3D Parallax Patterns
// African & Oriental Matizes
// ============================================

export function GenerativeHeader({ accentColor = '#3b82f6', opacity = 0.4 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const parent = containerRef.current;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Pattern Generators
    const drawAfricanPattern = (ctx, w, h, t, mx, my) => {
      ctx.save();
      ctx.translate(mx * 50, my * 50);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      const size = 60;
      for (let x = -size; x < w + size; x += size) {
        for (let y = -size; y < h + size; y += size) {
          // Kente-style geometric blocks
          const seed = (x * 0.01 + y * 0.02);
          const type = Math.floor(Math.abs(Math.sin(seed)) * 3);
          ctx.beginPath();
          if (type === 0) {
             for(let i=0; i<4; i++) {
               ctx.moveTo(x + i*15, y);
               ctx.lineTo(x + i*15, y + size);
             }
          } else if (type === 1) {
            ctx.rect(x + 10, y + 10, size - 20, size - 20);
          } else {
            ctx.moveTo(x, y); ctx.lineTo(x + size, y + size);
            ctx.moveTo(x + size, y); ctx.lineTo(x, y + size);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawOrientalPattern = (ctx, w, h, t, mx, my) => {
      ctx.save();
      ctx.translate(mx * 120, my * 120);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.5;
      const size = 120;
      for (let x = -size; x < w + size; x += size) {
        for (let y = -size; y < h + size; y += size) {
          // Islamic/Oriental lattice
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.lineTo(x + size, y + size/2);
          ctx.lineTo(x + size/2, y + size);
          ctx.lineTo(x, y + size/2);
          ctx.closePath();
          ctx.stroke();
          
          // Inner detail
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawAdinkraSymbols = (ctx, w, h, t, mx, my) => {
      ctx.save();
      ctx.translate(mx * 200, my * 200);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      const size = 200;
      for (let x = -size; x < w + size; x += size * 1.5) {
        for (let y = -size; y < h + size; y += size * 1.5) {
           const rotate = t * 0.0002 + (x+y)*0.01;
           ctx.save();
           ctx.translate(x, y);
           ctx.rotate(rotate);
           // Gye Nyame style spiral
           ctx.beginPath();
           for(let i=0; i<10; i++) {
             ctx.arc(0, 0, i * 5, 0, Math.PI * 1.5);
           }
           ctx.stroke();
           ctx.restore();
        }
      }
      ctx.restore();
    };

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Layer 1: Oriental Lattice (Deep background)
      drawOrientalPattern(ctx, canvas.width, canvas.height, time, mx * 0.2, my * 0.2);
      
      // Layer 2: African Geometric (Middle)
      drawAfricanPattern(ctx, canvas.width, canvas.height, time, mx * 0.5, my * 0.5);
      
      // Layer 3: Adinkra Symbols (Floating top)
      drawAdinkraSymbols(ctx, canvas.width, canvas.height, time, mx * 1.2, my * 1.2);

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay"
      style={{ opacity }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      {/* Dynamic gradient overlay based on accent color */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-background"
        style={{ background: `linear-gradient(to bottom, transparent, var(--background))` }}
      />
    </div>
  );
}
