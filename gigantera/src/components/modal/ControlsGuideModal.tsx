import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const ControlsGuideModal: React.FC = () => {
  const showGuideModal = useAppStore((s) => s.showGuideModal);
  const setShowGuideModal = useAppStore((s) => s.setShowGuideModal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuideModal && (e.key === 'Escape' || e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowGuideModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuideModal, setShowGuideModal]);

  if (!showGuideModal) return null;

  return (
    <div
      className="controls-guide-backdrop"
      onClick={() => setShowGuideModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Guia Completo de Controles e Navegação"
    >
      <div className="controls-guide-card" onClick={(e) => e.stopPropagation()}>
        <header className="guide-card-header">
          <div className="guide-header-title">
            <span className="guide-eyebrow font-mono">[GIGANTERA // MANUAL DE NAVEGAÇÃO]</span>
            <h2 className="guide-title">Controles & Interação</h2>
          </div>
          <button
            onClick={() => setShowGuideModal(false)}
            className="guide-close-btn font-mono"
            aria-label="Fechar guia de controles"
          >
            <kbd className="keycap">H</kbd>
            <span>FECHAR</span>
          </button>
        </header>

        <div className="guide-grid">
          {/* Grupo 1: Caminhada & Câmera */}
          <div className="guide-group">
            <h3 className="guide-group-title font-mono">01. CAMINHADA & MIRA LIVRE</h3>
            <div className="guide-items-list">
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">W</kbd>
                  <kbd className="keycap">A</kbd>
                  <kbd className="keycap">S</kbd>
                  <kbd className="keycap">D</kbd>
                </div>
                <span className="guide-desc">Deslocamento tridimensional pela galeria</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <span className="mouse-badge">
                    <span className="mouse-icon mouse-look" />
                    <span>MOUSE</span>
                  </span>
                </div>
                <span className="guide-desc">Visão panorâmica 360° em primeira pessoa</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">SHIFT</kbd>
                </div>
                <span className="guide-desc">Caminhada acelerada (passo rápido)</span>
              </div>
            </div>
          </div>

          {/* Grupo 2: Interação com Obras */}
          <div className="guide-group">
            <h3 className="guide-group-title font-mono">02. INTERAÇÃO & APRECIAÇÃO</h3>
            <div className="guide-items-list">
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">E</kbd>
                  <span className="guide-or">ou</span>
                  <span className="mouse-badge">CLIQUE</span>
                </div>
                <span className="guide-desc">Aproximar obra da vitrine e abrir inspeção</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">R</kbd>
                </div>
                <span className="guide-desc">
                  <strong>Modo Lupa (300%)</strong> / Alternar enquadramento 100%
                </span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <span className="mouse-badge">
                    <span className="mouse-icon mouse-wheel" />
                    <span>RODA</span>
                  </span>
                </div>
                <span className="guide-desc">Ajuste contínuo de zoom (50% a 350%)</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">←</kbd>
                  <kbd className="keycap">→</kbd>
                </div>
                <span className="guide-desc">Folhear pranchetas da série</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">E</kbd>
                  <span className="guide-or">ou</span>
                  <kbd className="keycap">Q</kbd>
                </div>
                <span className="guide-desc">Devolver a obra à vitrine e continuar caminhando</span>
              </div>
            </div>
          </div>

          {/* Grupo 3: Áudio, CD & Menus */}
          <div className="guide-group">
            <h3 className="guide-group-title font-mono">03. ÁUDIO ESPACIAL & ACERVO</h3>
            <div className="guide-items-list">
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">TAB</kbd>
                </div>
                <span className="guide-desc">Abrir Catálogo Geral / Alternar modo grade</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">CD</kbd>
                  <span className="guide-or">no piso</span>
                </div>
                <span className="guide-desc">Pegar estojo acrílico e folhear as 17 faixas</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">ESPAÇO</kbd>
                  <span className="guide-or">/</span>
                  <kbd className="keycap">M</kbd>
                </div>
                <span className="guide-desc">Pausar / Mutar som de instalações em vídeo</span>
              </div>
              <div className="guide-row">
                <div className="guide-keys">
                  <kbd className="keycap">H</kbd>
                </div>
                <span className="guide-desc">Abrir / Fechar este manual de navegação</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="guide-card-footer font-mono">
          <div className="guide-tip">
            <span className="tip-marker">◈ PONTO IDEAL:</span> Posicione-se sobre os anéis sutis gravados no piso em frente a cada vitrine para contemplação perfeita.
          </div>
          <button
            onClick={() => setShowGuideModal(false)}
            className="guide-ack-btn"
          >
            ENTENDIDO
          </button>
        </footer>
      </div>
    </div>
  );
};
