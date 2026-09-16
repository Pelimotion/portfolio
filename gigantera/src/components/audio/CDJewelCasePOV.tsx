import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const CDJewelCasePOV: React.FC = () => {
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const stowCD = useAppStore((s) => s.stowCD);
  const cdFlipped = useAppStore((s) => s.cdFlipped);
  const flipCD = useAppStore((s) => s.flipCD);
  const isMobile = useAppStore((s) => s.isMobile);

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
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        e.stopPropagation();
        handleStow();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        flipCD();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHoldingCD, stowCD, flipCD]);

  if (!isHoldingCD) return null;

  return (
    <aside
      className="cd-viewmodel-hud-dock"
      role="region"
      aria-label="Controles Táteis do CD"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {isMobile ? (
        <div className="cd-mobile-hud-row font-mono">
          {/* Botão de Virar Capa / Contracapa */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              flipCD();
            }}
            className="cd-mobile-action-btn"
            title="Girar o CD em 180° entre capa e contracapa"
          >
            <span className="cd-action-icon">⟲</span>
            <span>{cdFlipped ? 'VER CAPA' : 'VER CONTRACAPA'}</span>
          </button>

          {/* Dica de Toque Central */}
          <div className="cd-mobile-touch-hint">
            <span>{cdFlipped ? 'TOQUE NA FAIXA P/ TOCAR' : 'GIRE P/ VER 17 FAIXAS'}</span>
          </div>

          {/* Ação de Guardar CD */}
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
        <div className="cd-minimal-hud-capsule font-mono">
          {/* Botão de Virar Capa / Contracapa */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              flipCD();
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

          {/* Dica de Clique / Toque */}
          <span className="cd-hud-hint-item">
            <span className="mouse-badge">
              <span className="mouse-icon mouse-left-click" />
              <span className="keycap-label">CLIQUE P/ TOCAR</span>
            </span>
          </span>

          <span className="cd-hud-sep">·</span>

          {/* Ação de Guardar CD */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStow();
            }}
            className="cd-hud-pill-btn cd-hud-btn-stow"
            title="Guardar o CD e retornar ao salão 3D (ESC, E ou Q)"
          >
            <kbd className="keycap keycap-coral">ESC</kbd>
            <span className="keycap-label">/</span>
            <kbd className="keycap keycap-coral">E</kbd>
            <span>GUARDAR</span>
          </button>
        </div>
      )}
    </aside>
  );
};
