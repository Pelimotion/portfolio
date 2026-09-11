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
      <a href="#app-shell" className="header-brand" aria-label="gigantera — início">
        gigantera
      </a>

      <div className="header-controls">
        {conditions && (
          <div
            className="control-pill"
            style={{ cursor: 'default', opacity: 0.85 }}
            title="Condição astronômica e física do dia"
          >
            <span>{conditions.lunarPhase}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>maré {conditions.tideState}</span>
          </div>
        )}

        <button
          onClick={handleAudioToggle}
          className={`control-pill ${isAudioEnabled ? 'active' : ''}`}
          aria-pressed={isAudioEnabled}
          title={isAudioEnabled ? 'Desativar áudio ressonante' : 'Ativar áudio ressonante Tone.js'}
        >
          {isAudioEnabled ? 'Ressonância ativa' : 'Ressonância sonora'}
        </button>

        <button
          onClick={toggleStillWaterMode}
          className={`control-pill ${isStillWaterMode ? 'active' : ''}`}
          aria-pressed={isStillWaterMode}
          title="Alternar modo estático de baixa intensidade gráfica"
        >
          {isStillWaterMode ? 'Água parada (ativa)' : 'Água parada'}
        </button>
      </div>
    </header>
  );
};
