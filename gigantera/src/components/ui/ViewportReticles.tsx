import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../core/store';

/**
 * ViewportReticles — Grafismos Brutalistas de Enquadramento
 * Adiciona retículos de mira, coordenadas cartográficas e índices técnicos nos 4 cantos do viewport.
 */
export const ViewportReticles: React.FC = () => {
  const cameraCurrentY = useAppStore((s) => s.cameraCurrentY);
  const activeStratum = useAppStore((s) => s.activeStratum);
  const [fps, setFps] = useState(60);

  // Monitor leve de taxa de quadros para a telemetria brutalista
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const normalizedDepth = Math.max(0, Math.min(1, (14 - cameraCurrentY) / 38));
  const depthMeters = Math.round(normalizedDepth * 4000);

  return (
    <div className="viewport-reticles-container" aria-hidden="true">
      {/* Canto Superior Esquerdo */}
      <div className="reticle-corner reticle-top-left">
        <span className="reticle-bracket">┌</span>
        <div className="reticle-data">
          <span className="reticle-mono-bold">SPECIMEN RESEARCH ARCHIVE</span>
          <span className="reticle-mono-dim">ID: PLM-GGN-2026 // VOL.08</span>
        </div>
      </div>

      {/* Canto Superior Direito */}
      <div className="reticle-corner reticle-top-right">
        <div className="reticle-data text-right">
          <span className="reticle-mono-bold">LAT: 23°54&apos;08&quot;S · LON: 045°20&apos;44&quot;W</span>
          <span className="reticle-mono-dim">TELEMETRY: {fps} FPS · GL_ACTIVE</span>
        </div>
        <span className="reticle-bracket">┐</span>
      </div>

      {/* Canto Inferior Esquerdo */}
      <div className="reticle-corner reticle-bottom-left">
        <span className="reticle-bracket">└</span>
        <div className="reticle-data">
          <span className="reticle-mono-bold">COLUMN: 0000M → 4000M // 03 STRATA</span>
          <span className="reticle-mono-dim">STATUS: SEDIMENT_PHYSICS_ACTIVE</span>
        </div>
      </div>

      {/* Canto Inferior Direito */}
      <div className="reticle-corner reticle-bottom-right">
        <div className="reticle-data text-right">
          <span className="reticle-mono-bold">ELEV: -{depthMeters.toString().padStart(4, '0')}M</span>
          <span className="reticle-mono-dim">STRATUM: {activeStratum.toUpperCase()}</span>
        </div>
        <span className="reticle-bracket">┘</span>
      </div>
    </div>
  );
};
