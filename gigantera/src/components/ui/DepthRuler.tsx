import React from 'react';
import { useAppStore } from '../../core/store';
import { StratumId } from '../../types/art';

/**
 * DepthRuler — Régua Batimétrica Vertical Brutalista
 * Eixo graduado milimétrico na margem direita com cursor de profundidade em tempo real
 * e pontos de ancoragem táctil para saltos instantâneos.
 */
export const DepthRuler: React.FC = () => {
  const cameraCurrentY = useAppStore((s) => s.cameraCurrentY);
  const activeStratum = useAppStore((s) => s.activeStratum);
  const warpToStratum = useAppStore((s) => s.warpToStratum);

  const normalizedDepth = Math.max(0, Math.min(1, (14 - cameraCurrentY) / 38));
  const depthMeters = Math.round(normalizedDepth * 4000);
  const cursorTopPercent = normalizedDepth * 100;

  const rulerTicks = [
    { meters: 0, label: '0000M', stratum: 'epipelagic' as StratumId, tag: 'EPI' },
    { meters: 400, label: '0400M', stratum: 'mesopelagic' as StratumId, tag: 'MESO' },
    { meters: 1000, label: '1000M' },
    { meters: 2000, label: '2000M' },
    { meters: 3000, label: '3000M', stratum: 'bathypelagic' as StratumId, tag: 'BATHY' },
    { meters: 4000, label: '4000M' }
  ];

  return (
    <aside className="bathymetric-ruler-container" aria-label="Régua Batimétrica de Profundidade">
      {/* Título do Eixo */}
      <div className="ruler-header">
        <span className="ruler-axis-label">AXIS // DEPTH</span>
      </div>

      {/* Linha Central do Eixo Graduado */}
      <div className="ruler-axis-track">
        {/* Ticks e Rótulos Numéricos */}
        {rulerTicks.map((tick) => {
          const tickPercent = (tick.meters / 4000) * 100;
          const isCurrentStratum = tick.stratum && activeStratum === tick.stratum;

          return (
            <div
              key={tick.meters}
              className={`ruler-node ${tick.stratum ? 'is-stratum-node' : ''} ${isCurrentStratum ? 'is-active-stratum' : ''}`}
              style={{ top: `${tickPercent}%` }}
              onClick={() => tick.stratum && warpToStratum(tick.stratum)}
              role={tick.stratum ? 'button' : undefined}
              tabIndex={tick.stratum ? 0 : undefined}
              title={tick.stratum ? `Mergulhar para estrato ${tick.tag} (${tick.label})` : undefined}
            >
              <div className="ruler-tick-notch" />
              <span className="ruler-tick-num">{tick.label}</span>
              {tick.tag && <span className="ruler-tick-tag">[{tick.tag}]</span>}
            </div>
          );
        })}

        {/* Cursor Dinâmico da Mira Subaquática */}
        <div
          className="ruler-depth-cursor"
          style={{ top: `${cursorTopPercent}%` }}
          aria-live="polite"
        >
          <div className="cursor-reticle-line" />
          <div className="cursor-readout-pill">
            <span className="cursor-marker">⌖</span>
            <span className="cursor-value">{depthMeters.toString().padStart(4, '0')}M</span>
          </div>
        </div>
      </div>

      {/* Rodapé da Régua */}
      <div className="ruler-footer">
        <span className="ruler-axis-sub">BATHYMETRIC</span>
      </div>
    </aside>
  );
};
