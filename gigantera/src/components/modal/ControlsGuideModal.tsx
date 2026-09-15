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
      <div className={`guide-card-modern font-mono ${cinemaArtwork ? 'is-contextual' : ''}`} onClick={(e) => e.stopPropagation()}>
        
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="guide-card-body">
          {isMobile ? (
            // ── MOBILE ──
            <>
              {!cinemaArtwork && (
                <section className="guide-section">
                  <h3 className="guide-section-title">EXPLORAR O PAVILHÃO</h3>
                  <div className="guide-rows">
                    <div className="guide-row">
                      <span className="guide-key"><span className="icon-finger">☝️</span> 1 DEDO</span>
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
                    <span className="guide-desc">alternar lupa</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">SWIPE</span>
                    <span className="guide-desc">próxima prancheta</span>
                  </div>
                </div>
              </section>
            </>
          ) : (
            // ── DESKTOP ──
            <>
              {!cinemaArtwork && (
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
                      <span className="guide-key">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"></rect><path d="M12 6v4"></path></svg>
                        MOUSE
                      </span>
                      <span className="guide-desc">olhar em volta livremente</span>
                    </div>
                    <div className="guide-row">
                      <span className="guide-key">
                        <kbd className="keycap keycap-sm">E</kbd> / CLIQUE
                      </span>
                      <span className="guide-desc">abrir obra ou interagir</span>
                    </div>
                  </div>
                </section>
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
                    <span className="guide-desc">zoom in/out suave</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key">
                      <kbd className="keycap keycap-sm">R</kbd>
                    </span>
                    <span className="guide-desc">lupa 300% analítica</span>
                  </div>
                  <div className="guide-row">
                    <span className="guide-key guide-key-close">
                      <kbd className="keycap keycap-sm keycap-coral">ESC</kbd> / <kbd className="keycap keycap-sm keycap-coral">E</kbd>
                    </span>
                    <span className="guide-desc">fechar visualização</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {!cinemaArtwork && (
          <div className="guide-card-footer">
            <button
              className="guide-archive-btn-modern"
              onClick={handleOpenArchive}
              aria-label="Abrir catálogo em grade"
            >
              <span className="btn-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                VER ACERVO COMPLETO
              </span>
              <kbd className="keycap keycap-sm">TAB</kbd>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
