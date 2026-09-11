import React from 'react';
import { useAppStore, STRATA_Y_MAP } from '../../core/store';
import { STRATA_CATALOG } from '../../data/artworks';
import { StratumId } from '../../types/art';
import { audioEngine } from '../../core/audioEngine';

export const FloatingHUD: React.FC = () => {
  const {
    cameraCurrentY,
    activeStratum,
    warpToStratum,
    hoveredArtwork,
    isAudioEnabled,
    toggleAudio,
    cymaticFrequency,
    isStillWaterMode,
    toggleStillWaterMode,
    selectArtwork
  } = useAppStore();

  // Converte camera Y (14 a -24) para metros reais aproximados (0m a 4000m)
  const normalizedDepth = Math.max(0, Math.min(1, (14 - cameraCurrentY) / 38));
  const depthMeters = Math.round(normalizedDepth * 4000);
  const pressureBar = (1 + depthMeters / 10).toFixed(1);

  const handleAudio = () => {
    if (!isAudioEnabled) {
      audioEngine.init();
    }
    toggleAudio();
  };

  return (
    <aside className="floating-hud-dock" aria-label="Painel de Controle Subaquático">
      {/* 1. Tooltip / Status da Obra Sob a Mira do Cursor */}
      {hoveredArtwork && (
        <div
          className="hud-artwork-preview"
          onClick={() => selectArtwork(hoveredArtwork)}
          role="button"
          tabIndex={0}
        >
          <span className="hud-preview-accent">Obra detectada:</span>
          <span className="hud-preview-title">{hoveredArtwork.title}</span>
          <span className="hud-preview-action">(Clique para inspecionar)</span>
        </div>
      )}

      {/* 2. Barra Flutuante de Vidro (Dock Principal) */}
      <div className="hud-glass-bar">
        {/* Medidor Barométrico e Profundidade */}
        <div className="hud-gauge-cluster">
          <div className="hud-depth-value">
            <span className="hud-num">{depthMeters}</span>
            <span className="hud-unit">m</span>
          </div>
          <div className="hud-pressure-label">
            {pressureBar} bar · {activeStratum.toUpperCase()}
          </div>
        </div>

        <div className="hud-divider" />

        {/* Seletores de Salto Rápido de Estrato */}
        <nav className="hud-strata-nav" aria-label="Navegação por Estratos">
          {STRATA_CATALOG.map((stratum) => {
            const isActive = activeStratum === stratum.id;
            return (
              <button
                key={stratum.id}
                onClick={() => warpToStratum(stratum.id as StratumId)}
                className={`hud-stratum-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
                title={`Mergulhar para ${stratum.title} (${stratum.depthRange})`}
              >
                <span className="hud-btn-dot" />
                <span className="hud-btn-text">
                  {stratum.id === 'epipelagic' && 'Superfície (0m)'}
                  {stratum.id === 'mesopelagic' && 'Penumbra (400m)'}
                  {stratum.id === 'bathypelagic' && 'Abismo (3000m)'}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="hud-divider" />

        {/* Controles Sensoriais e de Acessibilidade */}
        <div className="hud-actions-cluster">
          <button
            onClick={handleAudio}
            className={`hud-action-btn ${isAudioEnabled ? 'active' : ''}`}
            aria-pressed={isAudioEnabled}
            title={isAudioEnabled ? 'Desativar áudio cimático' : 'Ativar áudio cimático'}
          >
            {isAudioEnabled ? `${cymaticFrequency}Hz` : 'Áudio Off'}
          </button>

          <button
            onClick={toggleStillWaterMode}
            className={`hud-action-btn ${isStillWaterMode ? 'active' : ''}`}
            aria-pressed={isStillWaterMode}
            title="Alternar modo estático (baixa GPU)"
          >
            {isStillWaterMode ? 'Água Parada' : 'Fluido 3D'}
          </button>
        </div>
      </div>
    </aside>
  );
};
