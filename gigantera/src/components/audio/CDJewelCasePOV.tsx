import React, { useEffect, useState } from 'react';
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

  // Mini-tutorial de onboarding do CD (aparece automaticamente, recolhível)
  const [showTutorial, setShowTutorial] = useState(true);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isHoldingCD) return;
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        e.stopPropagation();
        handleStow();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        flipCD();
        soundEngine.playCaseSnapSound();
      } else if (e.key === '[' || e.key === 'o' || e.key === 'O') {
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
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        setShowTutorial((prev) => !prev);
        soundEngine.playTactileHoverTick();
      } else if (
        !cdFlipped &&
        (e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.code === 'Space')
      ) {
        // Auto-flip se o usuário tentar selecionar faixa enquanto estiver na capa
        e.preventDefault();
        flipCD();
        soundEngine.playCaseSnapSound();
      }
    };

    const onWheelOrClick = (e: Event) => {
      if (isHoldingCD && !cdFlipped) {
        if (e.type === 'wheel') e.preventDefault();
        flipCD();
        soundEngine.playCaseSnapSound();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheelOrClick, { passive: false });
    window.addEventListener('click', onWheelOrClick, { capture: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheelOrClick);
      window.removeEventListener('click', onWheelOrClick, { capture: true });
    };
  }, [isHoldingCD, cdFlipped, stowCD, flipCD, graphicsQuality, stepDJFilter, resetDJFilter, setGraphicsQuality]);

  if (!isHoldingCD) return null;

  return (
    <>
      {/* Visualizador de Partículas Áudio-Reativo em Tela Cheia ao Fundo do CD */}
      <CDVisualizerField />

      {/* Aviso Estéreo Binaural de Museu */}
      <div className="cd-headphones-warning font-mono" style={{ zIndex: 10 }}>
        ATENÇÃO: EXPERIÊNCIA ESTÉREO BINAURAL. USE FONES DE OUVIDO PARA IMERSÃO TOTAL.
      </div>

      {/* ─── POPUP DE MINI-TUTORIAL TÁTICO APARANTE (HUD ONBOARDING) ─── */}
      <aside
        className="cd-tutorial-popup font-mono"
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          zIndex: 40,
          background: isDark ? 'rgba(8, 12, 14, 0.88)' : 'rgba(245, 247, 250, 0.92)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.14)',
          borderRadius: 8,
          padding: showTutorial ? '14px 18px' : '6px 12px',
          color: isDark ? '#e2e8f0' : '#1e293b',
          maxWidth: showTutorial ? 320 : 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transition: 'all 0.25s ease-out',
          userSelect: 'none'
        }}
        aria-label="Tutorial do CD e Filtro DJ"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: isDark ? '#e4c379' : '#b88d34', fontWeight: 700, fontSize: 11 }}>
              AUDIO LOUNGE
            </span>
            <span style={{ fontSize: 9, opacity: 0.5 }}>// 17 FAIXAS</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTutorial(!showTutorial)}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: 'inherit',
              padding: 0
            }}
            title={showTutorial ? 'Recolher guia [H]' : 'Expandir guia [H]'}
          >
            {showTutorial ? '✕ RECOLHER' : '[?] DICAS'}
          </button>
        </div>

        {showTutorial && (
          <div style={{ marginTop: 10, fontSize: 10, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ opacity: 0.7 }}>VIRAR CAPA/FAIXAS</span>
              <kbd className="keycap keycap-xs">F</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ opacity: 0.7 }}>ROLANDO FAIXAS</span>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <kbd className="keycap keycap-xs">↑</kbd>
                <kbd className="keycap keycap-xs">↓</kbd>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ opacity: 0.7 }}>TOCAR / SELECIONAR</span>
              <span style={{ opacity: 0.9 }}>CLIQUE / ENTER</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ color: isDark ? '#4deeea' : '#0284c7', fontWeight: 600 }}>FILTRO DJ (LOW/HIGH CUT)</span>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <kbd className="keycap keycap-xs">[</kbd>
                <kbd className="keycap keycap-xs">]</kbd>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ opacity: 0.7 }}>GUARDAR COM MÚSICA</span>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <kbd className="keycap keycap-xs">ESC</kbd>
                <kbd className="keycap keycap-xs">E</kbd>
              </span>
            </div>

            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                fontSize: 9,
                opacity: 0.65
              }}
            >
              DICA: O som continua tocando no pavilhão após guardar o CD!
            </div>
          </div>
        )}
      </aside>

      {/* ─── DOCK INFERIOR DE CONTROLES TÁTEIS & KNOB DJ ─── */}
      <aside
        className="cd-viewmodel-hud-dock"
        role="region"
        aria-label="Controles Táteis do CD"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ zIndex: 30 }}
      >
        {isMobile ? (
          <div className="cd-mobile-hud-row font-mono">
            <button
              onClick={(e) => {
                e.stopPropagation();
                flipCD();
              }}
              className="cd-mobile-action-btn"
              title="Girar o CD em 180° entre capa e contracapa"
            >
              <span className="cd-action-icon">⟲</span>
              <span>{cdFlipped ? 'VER CAPA' : 'VER FAIXAS'}</span>
            </button>

            <div className="cd-mobile-touch-hint">
              <span>{cdFlipped ? 'TOQUE NA FAIXA P/ TOCAR' : 'GIRE P/ VER 17 FAIXAS'}</span>
            </div>

            <button
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
          <div className="cd-minimal-hud-capsule font-mono" style={{ gap: 14, padding: '6px 18px' }}>
            {/* Botão de Virar Capa / Contracapa */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                flipCD();
                soundEngine.playCaseSnapSound();
              }}
              className="cd-hud-pill-btn"
              title="Girar o CD em 180° entre capa e contracapa (F)"
            >
              <kbd className="keycap">F</kbd>
              <span>{cdFlipped ? 'VER CAPA' : 'VER CONTRACAPA'}</span>
            </button>

            <span className="cd-hud-sep">·</span>

            {/* Dica de Teclado / Setas */}
            <span className="cd-hud-hint-item">
              <span className="keycap-cluster">
                <kbd className="keycap">↑</kbd>
                <kbd className="keycap">↓</kbd>
              </span>
              <span className="keycap-label">ESCOLHER FAIXA</span>
            </span>

            <span className="cd-hud-sep">·</span>

            {/* Status da Música Atual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isAudioPlaying ? '#4ade80' : '#f59e0b',
                  boxShadow: isAudioPlaying ? '0 0 6px #4ade80' : 'none'
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 700 }}>
                {currentAudioTrack.title.toUpperCase()}
              </span>
            </div>

            <span className="cd-hud-sep">·</span>

            {/* KNOB DE FILTRO DJ INTEGRADO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DJFilterKnob size="sm" showLabel={true} />
            </div>

            <span className="cd-hud-sep">·</span>

            {/* SELETOR DE QUALIDADE GRÁFICA SEMPRE VISÍVEL */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                padding: '2px 4px',
                borderRadius: 14
              }}
              title="Ajuste de gráficos para PCs fracos (Tecla G)"
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
    </>
  );
};
