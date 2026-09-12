import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../../core/soundEngine';
import { useAppStore } from '../../core/store';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = 320,
  height = 70,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useAppStore((s) => s.theme);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      animId = requestAnimationFrame(render);

      ctx.clearRect(0, 0, width, height);

      const freqData = soundEngine.getFrequencyData();
      const isDark = theme === 'dark';

      // Cor de fundo do display
      ctx.fillStyle = isDark ? 'rgba(10, 12, 11, 0.75)' : 'rgba(230, 228, 222, 0.75)';
      ctx.fillRect(0, 0, width, height);

      // Grid de medição brutalista de fundo
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;

      // Linhas horizontais
      for (let y = 10; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Linhas verticais
      for (let x = 20; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (!freqData || !isAudioPlaying) {
        // Linha de repouso / batimento estático
        ctx.strokeStyle = isDark ? '#E4C379' : '#111314';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        ctx.moveTo(0, midY);
        for (let x = 0; x < width; x += 4) {
          const wave = Math.sin(x * 0.05 + performance.now() * 0.002) * 1.5;
          ctx.lineTo(x, midY + wave);
        }
        ctx.stroke();

        ctx.fillStyle = isDark ? '#6E7471' : '#888C89';
        ctx.font = '9px "Space Mono", monospace';
        ctx.fillText('STANDBY // 00.0 HZ', 10, height - 10);
        return;
      }

      // Renderização de Barras de Espectro
      const barCount = 32;
      const barWidth = (width - 20) / barCount;
      const step = Math.floor(freqData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = freqData[i * step] / 255;
        const barHeight = Math.max(3, value * (height - 22));
        const x = 10 + i * barWidth;
        const y = height - 10 - barHeight;

        // Gradiente tátil para as colunas
        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (isDark) {
          grad.addColorStop(0, '#FF6B4A');
          grad.addColorStop(0.5, '#E4C379');
          grad.addColorStop(1, '#63E2B7');
        } else {
          grad.addColorStop(0, '#D94726');
          grad.addColorStop(0.5, '#B88D34');
          grad.addColorStop(1, '#1A8B67');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Ponto de pico
        ctx.fillStyle = isDark ? '#FFFFFF' : '#111314';
        ctx.fillRect(x, y - 2, barWidth - 2, 1.5);
      }

      // Marcador de Telemetria
      ctx.fillStyle = isDark ? '#E4C379' : '#111314';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText(`LIVE SPECTRUM // 64 BINS · ${(soundEngine.getEnergy() * 100).toFixed(0)}% ENERGY`, 10, 14);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [theme, isAudioPlaying, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
      className={`audio-spectrum-canvas ${className}`}
    />
  );
};
