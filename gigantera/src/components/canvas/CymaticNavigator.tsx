import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../core/store';
import { audioEngine } from '../../core/audioEngine';
import { STRATA_CATALOG } from '../../data/artworks';
import { StratumId } from '../../types/art';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const CymaticNavigator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    cymaticFrequency,
    activeStratum,
    isTuned,
    isAudioEnabled,
    isStillWaterMode,
    setCymaticFrequency,
    setActiveStratum
  } = useAppStore();

  const [isInteracting, setIsInteracting] = useState(false);
  const dragStartRef = useRef<{ x: number; freq: number } | null>(null);

  // Mapeia frequência contínua para modos nodais interpolados
  const getModes = (freq: number) => {
    // 150Hz -> (2, 2), 400Hz -> (4, 3), 600Hz -> (5, 5)
    const t = Math.max(0, Math.min(1, (freq - 120) / 500));
    const n = 2 + t * 3.5;
    const m = 2 + t * 3.0;
    return { n, m };
  };

  // Simulação física de partículas Chladni no Canvas 2D
  useEffect(() => {
    if (!canvasRef.current || isStillWaterMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numParticles = 1600;
    const particles: Particle[] = [];

    // Inicialização aleatória dos grãos na placa
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        vx: 0,
        vy: 0
      });
    }

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);

    const chladni = (x: number, y: number, n: number, m: number) => {
      // Equação fundamental de Chladni para placas quadradas
      const pi = Math.PI;
      const term1 = Math.sin(n * pi * x * 0.5) * Math.sin(m * pi * y * 0.5);
      const term2 = Math.cos(m * pi * x * 0.5) * Math.cos(n * pi * y * 0.5);
      return term1 - term2;
    };

    const render = () => {
      animationId = requestAnimationFrame(render);

      const currentFreq = useAppStore.getState().cymaticFrequency;
      const { n, m } = getModes(currentFreq);

      // Limpeza com rastro suave (fade out)
      ctx.fillStyle = 'rgba(14, 22, 19, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const scale = Math.min(width, height) * 0.44;
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      ctx.fillStyle = isTuned ? '#E8C77E' : '#DDE3DC';

      const dt = 0.04;
      const h = 0.02;

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // Gradiente do campo de vibração |w|^2
        const w0 = chladni(p.x, p.y, n, m);
        const wx = chladni(p.x + h, p.y, n, m);
        const wy = chladni(p.x, p.y + h, n, m);

        const gradX = (Math.abs(wx) - Math.abs(w0)) / h;
        const gradY = (Math.abs(wy) - Math.abs(w0)) / h;

        // Partículas fogem dos ventres de vibração para as linhas nodais (gradiente descendente)
        const forceMagnitude = isTuned ? 0.35 : 0.6;
        p.vx -= gradX * forceMagnitude;
        p.vy -= gradY * forceMagnitude;

        // Amortecimento / atrito do grão na placa
        p.vx *= 0.88;
        p.vy *= 0.88;

        // Perturbação térmica/acústica
        p.vx += (Math.random() - 0.5) * (isTuned ? 0.008 : 0.035);
        p.vy += (Math.random() - 0.5) * (isTuned ? 0.008 : 0.035);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Rebote nas bordas da placa
        if (p.x < -1) { p.x = -1; p.vx *= -0.5; }
        if (p.x > 1) { p.x = 1; p.vx *= -0.5; }
        if (p.y < -1) { p.y = -1; p.vy *= -0.5; }
        if (p.y > 1) { p.y = 1; p.vy *= -0.5; }

        // Renderização dos grânulos
        const scrX = centerX + p.x * scale;
        const scrY = centerY + p.y * scale;

        ctx.fillRect(scrX, scrY, 1.8, 1.8);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTuned, isStillWaterMode]);

  // Gestos de Arraste / Sintonia Manual
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true);
    dragStartRef.current = { x: e.clientX, freq: cymaticFrequency };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (isAudioEnabled) {
      audioEngine.init().then(() => {
        audioEngine.triggerTone(cymaticFrequency);
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    // 1px = ~0.8Hz de deslocamento
    const newFreq = Math.round(
      Math.max(120, Math.min(600, dragStartRef.current.freq + deltaX * 0.85))
    );
    setCymaticFrequency(newFreq);

    if (isAudioEnabled) {
      audioEngine.setFrequency(newFreq);
    }
  };

  const handlePointerUp = () => {
    setIsInteracting(false);
    dragStartRef.current = null;
    if (isAudioEnabled) {
      audioEngine.releaseTone();
    }
  };

  // Suporte a Giroscópio / Tilt no Mobile
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && !isInteracting) {
        // gamma: inclinação esquerda/direita [-90, 90]
        const normalized = (e.gamma + 45) / 90;
        const targetFreq = Math.round(120 + Math.max(0, Math.min(1, normalized)) * 480);
        setCymaticFrequency(targetFreq);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isInteracting, setCymaticFrequency]);

  const activeStratumData = STRATA_CATALOG.find((s) => s.id === activeStratum);

  const scrollToStratum = (id: StratumId) => {
    const element = document.getElementById(`stratum-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cymatic-stage" aria-label="Navegação Cimática por Frequência">
      <div
        className="cymatic-canvas-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none', cursor: isInteracting ? 'ew-resize' : 'grab' }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', borderRadius: '2px' }}
        />
      </div>

      <div className="cymatic-dial-info">
        <div className="cymatic-freq-readout">
          {cymaticFrequency} Hz
          {isTuned && activeStratumData && (
            <span style={{ color: 'var(--foam-white)', marginLeft: '0.75rem' }}>
              · {activeStratumData.title}
            </span>
          )}
        </div>

        <p className="cymatic-instruction">
          {isInteracting
            ? 'Sintonizando nós de ressonância...'
            : 'Arraste horizontalmente sobre a placa para sintonizar frequências geológicas'}
        </p>

        {isTuned && activeStratumData && (
          <button
            className="control-pill active"
            style={{ marginTop: '0.5rem' }}
            onClick={() => scrollToStratum(activeStratumData.id)}
          >
            Mergulhar em {activeStratumData.depthRange.split(' ')[0]}
          </button>
        )}
      </div>
    </section>
  );
};
