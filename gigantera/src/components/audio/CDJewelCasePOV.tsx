import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';
import { CDVisualizerField } from './CDVisualizerField';
import { DJFilterKnob } from '../ui/DJFilterKnob';

export const CDJewelCasePOV: React.FC = () => {
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const stowCD = useAppStore((s) => s.stowCD);
  const cdFlipped = useAppStore((s) => s.cdFlipped);
  const flipCD = useAppStore((s) => s.flipCD);
  const isMobile = useAppStore((s) => s.isMobile);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const graphicsQuality = useAppStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useAppStore((s) => s.setGraphicsQuality);
  const stepDJFilter = useAppStore((s) => s.stepDJFilter);
  const resetDJFilter = useAppStore((s) => s.resetDJFilter);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);

  const handleStow = () => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    stowCD();
    if (!useAppStore.getState().isMobile) {
      window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
    }
  };

  const handleFlip = () => {
    flipCD();
    window.dispatchEvent(new CustomEvent('gigantera:flip-cd'));
    soundEngine.playCaseSnapSound();
  };

  useEffect(() => {
    // Atalhos específicos do HUD de áudio (Filtro DJ e Qualidade Gráfica)
    // Nota: Navegação de faixas, Flip [F] e Saída [ESC/E/Q] são geridos de forma
    // centralizada pelo PlayerController para evitar concorrência e double-toggling.
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isHoldingCD) return;
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '[' || e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        stepDJFilter(-1);
        soundEngine.playTactileHoverTick();
      } else if (e.key === ']' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        stepDJFilter(1);
        soundEngine.playTactileHoverTick();
      } else if (e.key === '0') {
        e.preventDefault();
        resetDJFilter();
        soundEngine.playTactileHoverTick();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        const next = graphicsQuality === 'high' ? 'med' : graphicsQuality === 'med' ? 'light' : 'high';
        setGraphicsQuality(next);
        soundEngine.playTactileHoverTick();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isHoldingCD, graphicsQuality, stepDJFilter, resetDJFilter, setGraphicsQuality]);

  if (!isHoldingCD) return null;

  return (
    <div className="cd-split-stage" aria-label="Sala de Escuta e Interação do CD">
      {/* ─── PAINEL ESQUERDO: VISUALIZADOR INTERATIVO & METADADOS MUSICAIS ─── */}
      <section className="cd-visualizer-pane" aria-label="Visualizador de Áudio Reativo">
        <header className="cd-visualizer-header font-mono">
          <div className="cd-visualizer-meta-pill">
            <span
              className="cd-live-dot"
              style={{
                background: isAudioPlaying ? '#4ade80' : '#f59e0b',
                boxShadow: isAudioPlaying ? '0 0 8px #4ade80' : 'none'
              }}
            />
            <span className="cd-meta-tag">AUDIO CHAMBER // SALA DE ESCUTA</span>
          </div>

          <h2 className="cd-current-title">{currentAudioTrack.title}</h2>
          <p className="cd-current-sub">PELIMOTION // GIGANTERA (2024)</p>

          {/* Mini VU / FFT Áudio-Reativo Dinâmico */}
          <div className="cd-fft-meter" aria-hidden="true">
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '0ms' }} />
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '140ms' }} />
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '70ms' }} />
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '210ms' }} />
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '100ms' }} />
            <span className={`cd-fft-bar ${isAudioPlaying ? 'is-active' : ''}`} style={{ animationDelay: '175ms' }} />
          </div>
        </header>

        {/* Campo Visualizador 2D Bounded no Lado Esquerdo */}
        <div className="cd-visualizer-canvas-wrap">
          <CDVisualizerField />
        </div>

        <footer className="cd-visualizer-footer font-mono">
          <span className="cd-visualizer-hint">
            INTERATIVO: MOVA O CURSOR SOBRE O CAMPO P/ DISTORCER ONDAS
          </span>
        </footer>
      </section>

      {/* ─── PAINEL DIREITO: ÁREA DO CD JEWEL CASE 3D + MÃO HOLOGRÁFICA ─── */}
      <section className="cd-jewel-pane" aria-label="Estojo de CD e Sistema de Faixas">
        <div className="cd-jewel-top-info font-mono">
          <div className="cd-jewel-status-capsule">
            <span className="cd-view-badge">
              {cdFlipped ? 'CONTRACAPA · 17 FAIXAS' : 'CAPA FRONTAL DO ÁLBUM'}
            </span>
            <span className="cd-action-subhint">
              {cdFlipped
                ? 'CLIQUE NA FAIXA P/ TOCAR · CLIQUE NO CD OU [F] P/ VER CAPA'
                : 'CLIQUE NO CD OU [F] P/ VER CONTRACAPA E FAIXAS'}
            </span>
          </div>
        </div>
      </section>

      {/* ─── DOCK INFERIOR UNIFICADO DE CONTROLES TÁTEIS & DJ KNOB ─── */}
      <aside
        className="cd-viewmodel-hud-dock"
        role="region"
        aria-label="Controles Táteis do CD"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {isMobile ? (
          <div className="cd-mobile-hud-row font-mono">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              className="cd-mobile-action-btn"
              title="Girar o CD entre capa frontal e contracapa com faixas"
            >
              <span className="cd-action-icon">⟲</span>
              <span>{cdFlipped ? 'VER CAPA' : 'VER FAIXAS'}</span>
            </button>

            <div className="cd-mobile-touch-hint">
              <span>{cdFlipped ? 'TOQUE NA FAIXA P/ TOCAR' : 'TOQUE NO CD P/ FAIXAS'}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStow();
              }}
              className="cd-mobile-action-btn cd-mobile-btn-stow"
              title="Guardar o CD e retornar ao salão 3D"
            >
              <span className="cd-action-icon">✕</span>
              <span>GUARDAR</span>
            </button>
          </div>
        ) : (
          <div className="cd-minimal-hud-capsule font-mono">
            {/* Botão de Virar Capa / Contracapa */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              className="cd-hud-pill-btn"
              title="Girar o CD em 180° entre capa e contracapa (Tecla F)"
            >
              <kbd className="keycap">F</kbd>
              <span>{cdFlipped ? 'VER CAPA' : 'VER CONTRACAPA'}</span>
            </button>

            <span className="cd-hud-sep">·</span>

            {/* Dica de Navegação de Faixas */}
            <span className="cd-hud-hint-item" title="Navegar pelas faixas via teclado">
              <span className="keycap-cluster">
                <kbd className="keycap">↑</kbd>
                <kbd className="keycap">↓</kbd>
              </span>
              <span className="keycap-label">NAVEGAR</span>
            </span>

            <span className="cd-hud-sep">·</span>

            {/* KNOB DE FILTRO DJ INTEGRADO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DJFilterKnob size="sm" showLabel={true} />
            </div>

            <span className="cd-hud-sep">·</span>

            {/* SELETOR DE QUALIDADE GRÁFICA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                padding: '2px 4px',
                borderRadius: 14
              }}
              title="Ajuste de performance gráfica (Tecla G)"
            >
              {(['light', 'med', 'high'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setGraphicsQuality(q)}
                  style={{
                    background: graphicsQuality === q ? (isDark ? '#e4c379' : '#b88d34') : 'transparent',
                    color: graphicsQuality === q ? '#000000' : isDark ? '#94a3b8' : '#64748b',
                    border: 'none',
                    borderRadius: 10,
                    padding: '2px 6px',
                    fontSize: 8,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {q === 'light' ? 'LEVE' : q === 'med' ? 'MÉD' : 'ALTO'}
                </button>
              ))}
              <kbd className="keycap keycap-xs" style={{ fontSize: 8, padding: '0 3px' }}>G</kbd>
            </div>

            <span className="cd-hud-sep">·</span>

            {/* Ação de Guardar CD */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStow();
              }}
              className="cd-hud-pill-btn cd-hud-btn-stow"
              title="Guardar o CD e retornar ao salão 3D com a música tocando (ESC, E ou Q)"
            >
              <kbd className="keycap keycap-coral">ESC</kbd>
              <span className="keycap-label">/</span>
              <kbd className="keycap keycap-coral">E</kbd>
              <span>GUARDAR</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

