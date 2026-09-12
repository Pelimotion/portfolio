import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';
import { AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { soundEngine } from '../../core/soundEngine';
import { AudioTrackInfo } from '../../types/art';
import { AudioVisualizer } from '../canvas/AudioVisualizer';

export const CDJewelCasePOV: React.FC = () => {
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const stowCD = useAppStore((s) => s.stowCD);
  const cdFlipped = useAppStore((s) => s.cdFlipped);
  const flipCD = useAppStore((s) => s.flipCD);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const setCurrentAudioTrack = useAppStore((s) => s.setCurrentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);
  const soundVolume = useAppStore((s) => s.soundVolume);
  const setSoundVolume = useAppStore((s) => s.setSoundVolume);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'e' || e.key === 'E') && isHoldingCD) {
        stowCD();
      } else if ((e.key === 'f' || e.key === 'F') && isHoldingCD) {
        flipCD();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHoldingCD, stowCD, flipCD]);

  const handleSelectTrack = async (track: AudioTrackInfo) => {
    setCurrentAudioTrack(track);
    await soundEngine.playTrackPreview(track);
    setIsAudioPlaying(true);
  };

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      soundEngine.pause();
      setIsAudioPlaying(false);
    } else {
      await soundEngine.playTrackPreview(currentAudioTrack);
      setIsAudioPlaying(true);
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = AUTHORIAL_TRACKS_CATALOG.findIndex((t) => t.id === currentAudioTrack.id);
    const nextIdx = (idx + 1) % AUTHORIAL_TRACKS_CATALOG.length;
    handleSelectTrack(AUTHORIAL_TRACKS_CATALOG[nextIdx]);
  };

  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = AUTHORIAL_TRACKS_CATALOG.findIndex((t) => t.id === currentAudioTrack.id);
    const prevIdx = (idx - 1 + AUTHORIAL_TRACKS_CATALOG.length) % AUTHORIAL_TRACKS_CATALOG.length;
    handleSelectTrack(AUTHORIAL_TRACKS_CATALOG[prevIdx]);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    soundEngine.setVolume(val);
  };

  if (!isHoldingCD) return null;

  return (
    <div
      className="cd-viewmodel-hud-dock"
      role="region"
      aria-label="Controles Táteis do Álbum em Primeira Pessoa"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="cd-hud-container">
        {/* Header do HUD com Dica e Status */}
        <div className="cd-hud-topline font-mono">
          <div className="cd-hud-state">
            <span className={`live-pulse-lamp ${isAudioPlaying ? 'is-live' : ''}`} />
            <span className="track-title-glow">
              {currentAudioTrack.trackNumber}. &ldquo;{currentAudioTrack.title.toUpperCase()}&rdquo; ({currentAudioTrack.bpm} BPM)
            </span>
            <span className="track-engine-pill">
              {isAudioPlaying ? (soundEngine.isFullActive() ? 'FULL 48KHZ' : 'PREVIEW 10S') : 'STANDBY'}
            </span>
          </div>

          <div className="cd-hud-keycaps">
            <span className="keycap-combo">
              <kbd className="keycap">F</kbd>
              <span className="keycap-label">GIRAR</span>
            </span>
            <span className="cue-sep">·</span>
            <span className="mouse-badge">
              <span className="mouse-icon mouse-wheel" />
              <span className="keycap-label">ROLAR</span>
            </span>
            <span className="cue-sep">·</span>
            <span className="mouse-badge">
              <span className="mouse-icon mouse-left-click" />
              <span className="keycap-label">FAIXA</span>
            </span>
            <span className="cue-sep">·</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                stowCD();
                window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
              }}
              className="cd-quick-stow-btn"
              title="Guardar CD e retornar à galeria (ESC / E)"
            >
              <kbd className="keycap keycap-coral">ESC</kbd>
              <span className="keycap-label">GUARDAR</span>
            </button>
          </div>
        </div>

        {/* Seletor Rápido de Faixas Interativo com o Mouse (17 Faixas) */}
        <div className="cd-hud-tracklist-strip font-mono" onClick={(e) => e.stopPropagation()}>
          <div className="tracklist-pills-row">
            {AUTHORIAL_TRACKS_CATALOG.map((track) => {
              const isActive = track.id === currentAudioTrack.id;
              return (
                <button
                  key={track.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTrack(track);
                  }}
                  className={`tracklist-pill-btn ${isActive ? 'is-active' : ''}`}
                  title={`${track.trackNumber}. ${track.title} (${track.bpm} BPM)`}
                >
                  <span className="pill-num">{track.trackNumber}</span>
                  <span className="pill-title">{track.title}</span>
                  {isActive && isAudioPlaying && <span className="pill-live-dot">▶</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra Central com Visualizador & Controles Táteis */}
        <div className="cd-hud-controls-row">
          <div className="cd-hud-buttons font-mono">
            <button
              onClick={handlePrevTrack}
              className="cd-hud-btn"
              title="Faixa anterior"
            >
              ◄ ANT
            </button>

            <button
              onClick={handlePlayToggle}
              className={`cd-hud-btn cd-hud-play-btn ${isAudioPlaying ? 'is-playing' : ''}`}
            >
              {isAudioPlaying ? '❚❚ PAUSAR' : '▶ REPRODUZIR'}
            </button>

            <button
              onClick={handleNextTrack}
              className="cd-hud-btn"
              title="Próxima faixa"
            >
              PRÓX ►
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                flipCD();
              }}
              className="cd-hud-btn cd-hud-flip-btn"
              title="Girar o CD em 180° entre capa e contracapa (F)"
            >
              <kbd className="keycap">F</kbd>
              <span>{cdFlipped ? 'CAPA' : 'CONTRACAPA'}</span>
            </button>
          </div>

          {/* Espectrograma em tempo real */}
          <div className="cd-hud-visualizer-wrap">
            <AudioVisualizer width={260} height={32} />
          </div>

          {/* Fader de Volume & Ação de Guardar */}
          <div className="cd-hud-actions font-mono">
            <div className="cd-volume-wrap">
              <span className="vol-tag">VOL:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={soundVolume}
                onChange={handleVolumeChange}
                className="cd-volume-slider"
                aria-label="Controle de volume do CD"
              />
              <span className="vol-val">{(soundVolume * 100).toFixed(0)}%</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                stowCD();
                window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
              }}
              className="cd-hud-stow-btn"
              title="Devolver o estojo de CD ao pedestal e voltar a andar livremente (E / ESC)"
            >
              <kbd className="keycap keycap-coral">ESC</kbd>
              <span>GUARDAR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
