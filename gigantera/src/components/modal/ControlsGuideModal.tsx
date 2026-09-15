import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const ControlsGuideModal: React.FC = () => {
  const showGuideModal = useAppStore((s) => s.showGuideModal);
  const setShowGuideModal = useAppStore((s) => s.setShowGuideModal);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const isMobile = useAppStore((s) => s.isMobile);
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);

  const handleClose = () => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    setShowGuideModal(false);
    // Só reativa pointer lock se não estiver no cinema
    if (!cinemaArtwork) {
      window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
    }
  };

  const handleOpenArchive = () => {
    handleClose();
    setViewMode('archive');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuideModal && (e.key === 'Escape' || e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuideModal, cinemaArtwork]);

  if (!showGuideModal) return null;

  return (
    <div
      className={`guide-backdrop ${cinemaArtwork ? 'is-contextual' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Guia de controles — Gigantera"
    >
      <div className={`guide-card font-mono ${cinemaArtwork ? 'is-contextual' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* Cabeçalho */}
        <div className="guide-card-header">
          <div className="guide-card-brand">
            <span className="guide-brand-name">GIGANTERA</span>
            <span className="guide-brand-slash">/</span>
            <span className="guide-brand-sub">GUIA RÁPIDO</span>
          </div>
          <button
            onClick={handleClose}
            className="guide-card-close"
            aria-label="Fechar guia"
            title="Fechar (H ou ESC)"
          >
            <span>✕</span>
            <kbd className="keycap keycap-sm">H</kbd>
          </button>
        </div>

        <div className="guide-card-body">
          {isMobile ? (
            // ── MOBILE ──
            <>
              {!cinemaArtwork && (
                <>
                  <section className="guide-section">
                    <h3 className="guide-section-title">EXPLORAR O PAVILHÃO</h3>
                    <div className="guide-rows">
                      <div className="guide-row">
                        <span className="guide-key">1 DEDO</span>
                        <span className="guide-desc">arrastar para olhar em volta</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key">◄ ►</span>
                        <span className="guide-desc">mover de obra em obra</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key">TOCAR</span>
                        <span className="guide-desc">abrir uma obra</span>
                      </div>
                    </div>
                  </section>
                  <div className="guide-divider" />
                </>
              )}

              <section className="guide-section">
                <h3 className="guide-section-title">DENTRO DA OBRA</h3>
                <div className="guide-rows">
                  <div className="guide-row">
                    <span className="guide-key">ARRASTAR</span>
                    <span className="guide-desc">girar em 3D</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">PINÇA</span>
                    <span className="guide-desc">zoom até 300%</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">2× TOQUE</span>
                    <span className="guide-desc">alternar lupa 300%</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">SWIPE</span>
                    <span className="guide-desc">próxima prancheta</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key guide-key-close">✕ FECHAR</span>
                    <span className="guide-desc">devolver à vitrine</span>
                  </div>
                </div>
              </section>
            </>
          ) : (
            // ── DESKTOP ──
            <>
              {!cinemaArtwork && (
                <>
                  <section className="guide-section">
                    <h3 className="guide-section-title">EXPLORAR O PAVILHÃO</h3>
                    <div className="guide-rows">
                      <div className="guide-row">
                        <span className="guide-key">
                          <kbd className="keycap keycap-sm">W</kbd>
                          <kbd className="keycap keycap-sm">A</kbd>
                          <kbd className="keycap keycap-sm">S</kbd>
                          <kbd className="keycap keycap-sm">D</kbd>
                        </span>
                        <span className="guide-desc">caminhar pelo salão</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key">MOUSE</span>
                        <span className="guide-desc">olhar em volta</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key">
                          <kbd className="keycap keycap-sm">E</kbd>
                          <span className="guide-or">ou</span>
                          <span className="guide-key-soft">clique</span>
                        </span>
                        <span className="guide-desc">abrir obra / pegar álbum</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key">
                          <kbd className="keycap keycap-sm">TAB</kbd>
                        </span>
                        <span className="guide-desc">ver acervo em catálogo</span>
                      </div>
                    </div>
                  </section>
                  <div className="guide-divider" />
                </>
              )}

              <section className="guide-section">
                <h3 className="guide-section-title">DENTRO DA OBRA</h3>
                <div className="guide-rows">
                  <div className="guide-row">
                    <span className="guide-key">ARRASTAR</span>
                    <span className="guide-desc">girar a obra em 3D</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">SCROLL</span>
                    <span className="guide-desc">zoom (mín. 95%)</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">2× CLIQUE</span>
                    <span className="guide-desc">voltar ao zoom 100%</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">
                      <kbd className="keycap keycap-sm">R</kbd>
                    </span>
                    <span className="guide-desc">lupa 300% + arrastar para explorar</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key guide-key-close">
                      <kbd className="keycap keycap-sm keycap-coral">E</kbd>
                      <span className="guide-or">ou</span>
                      <kbd className="keycap keycap-sm keycap-coral">Q</kbd>
                      <span className="guide-or">ou</span>
                      <kbd className="keycap keycap-sm keycap-coral">ESC</kbd>
                    </span>
                    <span className="guide-desc">fechar e devolver à vitrine</span>
                  </div>
                </div>
              </section>

              {!cinemaArtwork && (
                <>
                  <div className="guide-divider" />
                  <section className="guide-section guide-section-compact">
                    <div className="guide-rows guide-rows-inline">
                      <div className="guide-row">
                        <span className="guide-key"><kbd className="keycap keycap-sm">T</kbd></span>
                        <span className="guide-desc">tema claro / escuro</span>
                      </div>
                      <div className="guide-row">
                        <span className="guide-key"><kbd className="keycap keycap-sm">H</kbd></span>
                        <span className="guide-desc">este guia</span>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>

        {/* Rodapé — acesso ao catálogo */}
        {/* Rodapé — acesso ao catálogo (oculto no modo contexto) */}
        {!cinemaArtwork && (
          <div className="guide-card-footer">
            <button
              className="guide-archive-btn"
              onClick={handleOpenArchive}
              aria-label="Abrir catálogo em grade"
            >
              <span>≡</span>
              <span>VER ACERVO COMPLETO</span>
              <kbd className="keycap keycap-sm">TAB</kbd>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
