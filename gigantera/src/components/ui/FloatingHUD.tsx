import React from 'react';
import { useAppStore } from '../../core/store';
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
    <aside className="floating-hud-dock" aria-label="Painel de Telemetria e Navegação Subaquática">
      {/* 1. Viewfinder Reticle / Status da Obra Sob a Mira do Cursor */}
      {hoveredArtwork && (
        <div
          className="hud-artwork-reticle"
          onClick={() => selectArtwork(hoveredArtwork)}
          role="button"
          tabIndex={0}
        >
          <div className="reticle-target-indicator">
            <span className="reticle-glyph">⌖</span>
            <span className="reticle-tag">[ALVO DETECTADO]</span>
          </div>
          <span className="reticle-title">&ldquo;{hoveredArtwork.title.toUpperCase()}&rdquo;</span>
          <span className="reticle-action">[CLIQUE P/ INSPEÇÃO DE EROSÃO]</span>
        </div>
      )}

      {/* 2. Barra Modular de Telemetria Brutalista */}
      <div className="hud-brutalist-console">
        {/* Cantoneiras gráficas da moldura */}
        <span className="hud-corner-mark hud-cm-tl">+</span>
        <span className="hud-corner-mark hud-cm-tr">+</span>
        <span className="hud-corner-mark hud-cm-bl">+</span>
        <span className="hud-corner-mark hud-cm-br">+</span>

        {/* Bloco 1: Medidor Barométrico & Profundidade */}
        <div className="hud-gauge-block">
          <div className="hud-depth-row">
            <span className="hud-mono-num">{depthMeters.toString().padStart(4, '0')}</span>
            <span className="hud-unit-mono">M</span>
          </div>
          <div className="hud-pressure-row">
            <span className="hud-mono-label">P: {pressureBar} BAR</span>
            <span className="hud-dot-sep">/</span>
            <span className="hud-stratum-code">{activeStratum.substring(0, 4).toUpperCase()}</span>
          </div>
        </div>

        <div className="hud-v-divider" />

        {/* Bloco 2: Seletor Segmentado de Estratos */}
        <nav className="hud-strata-segment" aria-label="Navegação por Estratos">
          {STRATA_CATALOG.map((stratum, idx) => {
            const isActive = activeStratum === stratum.id;
            const codes = ['01 // SUPERFÍCIE', '02 // PENUMBRA', '03 // ABISMO'];
            return (
              <button
                key={stratum.id}
                onClick={() => warpToStratum(stratum.id as StratumId)}
                className={`hud-segment-btn ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
                title={`Mergulhar para ${stratum.title} (${stratum.depthRange})`}
              >
                <span className="segment-indicator">{isActive ? '■' : '□'}</span>
                <span className="segment-text">{codes[idx]}</span>
              </button>
            );
          })}
        </nav>

        <div className="hud-v-divider" />

        {/* Bloco 3: Controles Sensoriais Brutalistas */}
        <div className="hud-sensor-actions">
          <button
            onClick={handleAudio}
            className={`hud-action-toggle ${isAudioEnabled ? 'is-active' : ''}`}
            aria-pressed={isAudioEnabled}
            title={isAudioEnabled ? 'Desativar áudio cimático' : 'Ativar áudio cimático'}
          >
            <span className="toggle-indicator">{isAudioEnabled ? '●' : '○'}</span>
            <span className="toggle-label">{isAudioEnabled ? `${cymaticFrequency}HZ` : 'AUDIO OFF'}</span>
          </button>

          <button
            onClick={toggleStillWaterMode}
            className={`hud-action-toggle ${isStillWaterMode ? 'is-active' : ''}`}
            aria-pressed={isStillWaterMode}
            title="Alternar modo estático (baixa intensidade de GPU)"
          >
            <span className="toggle-indicator">{isStillWaterMode ? '■' : '▲'}</span>
            <span className="toggle-label">{isStillWaterMode ? 'STATIC' : '3D FLUID'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
