import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../core/store';
import { getMarineConditions, MarineConditions } from '../../core/tideService';
import { audioEngine } from '../../core/audioEngine';

export const Header: React.FC = () => {
  const { isAudioEnabled, toggleAudio, isStillWaterMode, toggleStillWaterMode } = useAppStore();
  const [conditions, setConditions] = useState<MarineConditions | null>(null);

  useEffect(() => {
    getMarineConditions().then(setConditions);
  }, []);

  const handleAudioToggle = () => {
    if (!isAudioEnabled) {
      audioEngine.init();
    }
    toggleAudio();
  };

  return (
    <header className="header-bar" role="banner">
      <a href="#app-shell" className="header-brand brutalist-brand" aria-label="gigantera — início">
        <span className="brand-title">GIGANTERA</span>
        <span className="brand-badge">[EXP. ARCHIVE // V8]</span>
      </a>

      <div className="header-controls">
        {conditions && (
          <div
            className="brutalist-pill"
            style={{ cursor: 'default' }}
            title="Condição astronômica e física do dia"
          >
            <span className="pill-dot">●</span>
            <span>LUA: {conditions.lunarPhase.toUpperCase()}</span>
            <span className="pill-divider">//</span>
            <span>MARÉ: {conditions.tideState.toUpperCase()}</span>
          </div>
        )}

        <button
          onClick={handleAudioToggle}
          className={`brutalist-pill brutalist-btn ${isAudioEnabled ? 'active' : ''}`}
          aria-pressed={isAudioEnabled}
          title={isAudioEnabled ? 'Desativar áudio ressonante' : 'Ativar áudio ressonante Tone.js'}
        >
          <span>ÁUDIO: {isAudioEnabled ? 'ON · 432HZ' : 'OFF'}</span>
        </button>

        <button
          onClick={toggleStillWaterMode}
          className={`brutalist-pill brutalist-btn ${isStillWaterMode ? 'active' : ''}`}
          aria-pressed={isStillWaterMode}
          title="Alternar modo estático de baixa intensidade gráfica"
        >
          <span>ENGINE: {isStillWaterMode ? 'STATIC' : '3D FLUID'}</span>
        </button>
      </div>
    </header>
  );
};
