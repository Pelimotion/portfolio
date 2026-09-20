import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

interface CDVisualizerFieldProps {
  className?: string;
}

interface VisualizerTheme {
  primary: string;
  secondary: string;
  glow: string;
  shape: 'rings' | 'matrix' | 'nebula' | 'vortex' | 'strata' | 'fractal' | 'torus';
}

export const CDVisualizerField: React.FC<CDVisualizerFieldProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const djFilterValue = useAppStore((s) => s.djFilterValue);
  const graphicsQuality = useAppStore((s) => s.graphicsQuality);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Perfil cromático e topológico único por faixa (determinado deterministicamente pelo id da música)
  const getThemeForTrack = (trackId: string): VisualizerTheme => {
    let hash = 0;
    for (let i = 0; i < trackId.length; i++) {
      hash = (hash << 5) - hash + trackId.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash);

    const themes: VisualizerTheme[] = [
      { primary: '#00e5ff', secondary: '#006699', glow: '#5eead4', shape: 'rings' },    // Automar
      { primary: '#ff7b00', secondary: '#881100', glow: '#ffd700', shape: 'matrix' },   // Danse
      { primary: '#c084fc', secondary: '#4338ca', glow: '#38bdf8', shape: 'nebula' },   // Apenas
      { primary: '#e4c379', secondary: '#854d0e', glow: '#fef08a', shape: 'vortex' },   // Giant Mullets
      { primary: '#94a3b8', secondary: '#334155', glow: '#f8fafc', shape: 'strata' },   // Notalgia
      { primary: '#f43f5e', secondary: '#881337', glow: '#fbcfe8', shape: 'fractal' },  // Un-disney
      { primary: '#34d399', secondary: '#064e3b', glow: '#a7f3d0', shape: 'torus' }     // Sintetic Olive
    ];

    return themes[idx % themes.length];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Ajuste de DPI e quantidade de partículas conforme o tier gráfico selecionado
    const dpr = graphicsQuality === 'light' ? 1.0 : graphicsQuality === 'med' ? 1.25 : Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width > 0 ? rect.width : window.innerWidth * 0.48;
      height = rect.height > 0 ? rect.height : window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();

    const particleCount = graphicsQuality === 'light' ? 320 : graphicsQuality === 'med' ? 650 : 1200;

    // Inicialização do campo de partículas com coordenadas parametrizadas
    const trackTheme = getThemeForTrack(currentAudioTrack.id);
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radiusDist = Math.pow(Math.random(), 0.6); // distribuição com densidade central
      return {
        baseAngle: angle,
        baseDist: 30 + radiusDist * Math.min(width || 400, height || 600) * 0.44,
        angleOffset: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.5 + 0.5) * (i % 2 === 0 ? 1 : -1),
        size: Math.random() * 2.2 + 1.2,
        z: Math.random(),
        seed: Math.random() * 100
      };
    });

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);

    let t = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      t += 0.016;

      // Limpeza suave com persistência para trilha de luz
      ctx.fillStyle = isDark ? 'rgba(5, 8, 10, 0.28)' : 'rgba(240, 244, 248, 0.32)';
      ctx.fillRect(0, 0, width, height);

      // Obtenção de dados FFT em tempo real
      let bass = 0, mid = 0, treble = 0, overall = 0;
      if (isAudioPlaying) {
        const detail = soundEngine.getFrequenciesDetail();
        bass = detail.bass;
        mid = detail.mid;
        treble = detail.treble;
        overall = detail.overall;
      } else {
        // Respiração suave de repouso
        bass = Math.sin(t * 1.2) * 0.08 + 0.08;
        overall = 0.06;
      }

      // Influência do Filtro DJ:
      // Filtro < 0 (Low-Pass / Submerso): condensa o raio, retarda o movimento, aumenta a densidade
      // Filtro > 0 (High-Pass / Rarefeito): expande o raio, causa vibração estocástica de alta frequência
      const filter = djFilterValue;
      const densityModifier = filter < 0 ? 1.0 - Math.abs(filter) * 0.4 : 1.0 + filter * 0.5;
      const jitterFactor = filter > 0 ? filter * 6.0 : 0.0;
      const globalPulse = 1.0 + bass * 0.35;

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      // Blending aditivo apenas em qualidades média e alta
      if (graphicsQuality !== 'light') {
        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';
      }

      const shape = trackTheme.shape;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let x = 0;
        let y = 0;
        let alpha = 0.35 + p.z * 0.4 + treble * 0.3;

        // Comportamento topológico específico da forma
        if (shape === 'rings') {
          // Anéis concêntricos ondulatórios com médios
          const r = p.baseDist * globalPulse * densityModifier + Math.sin(t * 2 + p.baseAngle * 4) * (mid * 35 + 8);
          const currentAngle = p.baseAngle + t * 0.2 * p.speed;
          x = cx + Math.cos(currentAngle) * r;
          y = cy + Math.sin(currentAngle) * (r * 0.75); // leve perspectiva elíptica
        } else if (shape === 'matrix') {
          // Placa de nós harmônicos angulares
          const r = p.baseDist * globalPulse * densityModifier;
          const nodeAngle = Math.round(p.baseAngle / (Math.PI / 4)) * (Math.PI / 4);
          const currentAngle = nodeAngle + Math.sin(t * 3 + p.seed) * 0.2;
          x = cx + Math.cos(currentAngle) * r;
          y = cy + Math.sin(currentAngle) * r;
        } else if (shape === 'vortex') {
          // Vórtice gravitacional espiral
          const spiralR = (p.baseDist * globalPulse * densityModifier) * (1 + Math.sin(t + p.seed) * 0.1);
          const spiralAngle = p.baseAngle + (t * 0.8 * p.speed) + (spiralR / 120);
          x = cx + Math.cos(spiralAngle) * spiralR;
          y = cy + Math.sin(spiralAngle) * (spiralR * 0.65);
        } else if (shape === 'strata') {
          // Estratos horizontais de sedimentos
          const waveX = ((i / particles.length) - 0.5) * width * 1.1;
          const waveY = Math.sin(waveX * 0.006 + t * 2 + p.seed) * (mid * 70 + 25) + (p.z - 0.5) * (height * 0.45);
          x = cx + waveX;
          y = cy + waveY;
        } else {
          // Padrão Nebulosa / Torus orgânico
          const r = p.baseDist * globalPulse * densityModifier;
          const theta = p.baseAngle + t * 0.3 * p.speed;
          const ripple = Math.sin(t * 4 + p.baseDist * 0.08) * (bass * 28 + 6);
          x = cx + Math.cos(theta) * (r + ripple);
          y = cy + Math.sin(theta) * (r + ripple);
        }

        // Jitter de alta frequência ativado com o filtro High-Pass
        if (jitterFactor > 0) {
          x += (Math.random() - 0.5) * jitterFactor * 3.5;
          y += (Math.random() - 0.5) * jitterFactor * 3.5;
        }

        // Gradiente de cor interpolado pelo eixo Z
        ctx.fillStyle = p.z > 0.6 ? trackTheme.primary : p.z > 0.3 ? trackTheme.secondary : trackTheme.glow;
        ctx.globalAlpha = Math.max(0.08, Math.min(0.9, alpha));

        // Desenho da partícula
        const particleSize = p.size * (1 + treble * 0.8);
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentAudioTrack, isAudioPlaying, djFilterValue, graphicsQuality, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`cd-visualizer-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
};
