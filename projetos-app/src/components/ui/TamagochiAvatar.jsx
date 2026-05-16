import React, { useEffect, useRef, useCallback } from 'react';
import { renderAvatar } from '../../lib/avatarEngine';
import { renderAccessories } from '../../lib/accessoryEngine';

// ── TamagochiAvatar — Canvas wrapper with eye-tracking ────────────────────────────
export function TamagochiAvatar({ seed = 0, accentColor = '#3b82f6', accessories, size = 36, trackMouse = true }) {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Continuous animation loop for idle + lerp
  useEffect(() => {
    let animationFrameId;
    const animate = (time) => {
      if (canvasRef.current) {
        renderAvatar(canvasRef.current, seed, {
          width: size * 2,
          height: size * 2,
          accentColor,
          mouseX: mousePos.current.x,
          mouseY: mousePos.current.y,
          accessories,
          time
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [seed, accentColor, accessories, size]);

  // Mouse tracking on the document
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
    const y = ((e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2));
    mousePos.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };
  }, []);

  useEffect(() => {
    if (!trackMouse) return;
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, trackMouse]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'block',
        imageRendering: 'crisp-edges',
      }}
    />
  );
}
