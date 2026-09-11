import React, { useEffect, useRef } from 'react';
import { SandPhysicsEngine } from '../../core/physics/sandEngine';
import { useAppStore } from '../../core/store';

export const SandPhysicsOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SandPhysicsEngine | null>(null);
  const isStillWaterMode = useAppStore((s) => s.isStillWaterMode);
  const cameraVelocity = useAppStore((s) => s.cameraVelocity);

  // Inicialização da Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const engine = new SandPhysicsEngine(2000);
    engineRef.current = engine;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      engine.resize(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Movimento do mouse injeta inércia nas partículas de areia
    let lastX = 0;
    let lastY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      engine.addInertia(dx * 0.05, dy * 0.05);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Suporte a giroscópio mobile (inclinação do aparelho altera gravidade da areia)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: inclinação lateral [-90, 90]
        const tiltX = (e.gamma / 45) * 15;
        engine.gx = tiltX;
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    // Loop de simulação a 60fps
    let rafId: number;
    const ctx = canvas.getContext('2d');

    const render = () => {
      rafId = requestAnimationFrame(render);
      if (ctx && !useAppStore.getState().isStillWaterMode) {
        engine.update(0.016);
        engine.render(ctx);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Reage à velocidade inercial da câmera 3D
  useEffect(() => {
    if (engineRef.current && Math.abs(cameraVelocity) > 0.001) {
      engineRef.current.addInertia(0, cameraVelocity * 80);
    }
  }, [cameraVelocity]);

  if (isStillWaterMode) return null;

  return (
    <canvas
      ref={canvasRef}
      id="sand-physics-layer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 15,
        display: 'block'
      }}
      aria-hidden="true"
    />
  );
};
