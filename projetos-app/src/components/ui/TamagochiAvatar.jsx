import React, { useRef, useEffect, useState, useCallback } from 'react';
import { renderAvatar, hashString } from '../../lib/avatarEngine';

// ============================================
// TAMAGOCHI AVATAR — Tiny avatar that follows 
// the mouse cursor like a virtual pet
// ============================================

export function TamagochiAvatar({ seed = 0, accentColor = '#3b82f6', size = 32, className = '' }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Global mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      if (rafRef.current) return; // throttle
      rafRef.current = requestAnimationFrame(() => {
        // Normalize mouse position relative to window center
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePos({ x, y });
        rafRef.current = null;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Render avatar
  useEffect(() => {
    if (!canvasRef.current) return;
    renderAvatar(canvasRef.current, seed, {
      width: size * 2, // 2x for retina
      height: size * 2,
      accentColor,
      mouseX: mousePos.x,
      mouseY: mousePos.y,
    });
  }, [seed, accentColor, size, mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-full cursor-pointer transition-transform hover:scale-110 ${className}`}
      style={{ width: size, height: size, imageRendering: 'auto' }}
      title="Seu Avatar"
    />
  );
}
