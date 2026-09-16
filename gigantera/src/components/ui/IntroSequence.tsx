import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import { getMergedSiteConfig } from '../../data/configBridge';

export const IntroSequence: React.FC = () => {
  const introPhase = useAppStore((s) => s.introPhase);
  const setIntroPhase = useAppStore((s) => s.setIntroPhase);
  const setTutorialDocked = useAppStore((s) => s.setTutorialDocked);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const hasPlayerMoved = useAppStore((s) => s.hasPlayerMoved);
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const isMobile = useAppStore((s) => s.isMobile);

  const [isGlidingDown, setIsGlidingDown] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const dismiss = (delay = 450) => {
    setIsGlidingDown(true);
    setTutorialDocked(true);
    setTimeout(() => {
      setIsDone(true);
      setIntroPhase('ready');
    }, delay);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        setViewMode('archive');
        dismiss(450);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [setViewMode]);

  // Se o jogador interagiu diretamente e o avatar se moveu (WASD/setas) ou pegou o CD
  useEffect(() => {
    if ((hasPlayerMoved || isHoldingCD) && !isDone) {
      dismiss(450);
    }
  }, [hasPlayerMoved, isHoldingCD, isDone]);

  const siteConfig = useMemo(() => getMergedSiteConfig(), []);

  if (isDone || introPhase === 'ready') return null;

  const handleEnter3D = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
    dismiss(450);
  };

  const handleEnterArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode('archive');
    dismiss(450);
  };

  return (
    <div
      className={`intro-spatial-overlay ${isGlidingDown ? 'is-gliding-down' : ''}`}
      onClick={() => handleEnter3D()}
      aria-label="Introdução ao Gigantera"
    >
      <div 
        className="intro-floating-cue" 
        onClick={() => handleEnter3D()}
      >
        {/* Headline Nobre e Direta — Sem repetições de tags ou taglines dispensáveis */}
        <h1 className="cue-hero-title">GIGANTERA</h1>
        <h2 className="cue-statement">
          {siteConfig.heroHeadline.replace(/^GIGANTERA\s*[\n\r—–-]*\s*/i, '') || 'Um pavilhão. Não um portfólio.'}
        </h2>

        {/* Bloco de Controles Inline (Contextual Mobile vs Desktop) */}
        {isMobile ? (
          <div className="intro-controls-block font-mono is-mobile-controls">
            <div className="intro-controls-title">CONTROLES MÓVEIS</div>

            {/* 1 Dedo: Olhar em volta */}
            <div className="intro-controls-row">
              <span className="intro-touch-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
                </svg>
              </span>
              <span>Arraste com o dedo para explorar em 360°</span>
            </div>

            <div className="intro-controls-separator" />

            {/* Janela Mágica: Giroscópio */}
            <div className="intro-controls-row">
              <span className="intro-touch-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m4.93 4.93 4.24 4.24"></path>
                  <path d="m14.83 9.17 4.24-4.24"></path>
                  <path d="m14.83 14.83 4.24 4.24"></path>
                  <path d="m9.17 14.83-4.24 4.24"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </span>
              <span>Janela Mágica: incline o celular para olhar</span>
            </div>

            <div className="intro-controls-separator" />

            {/* Toque nas obras */}
            <div className="intro-controls-row">
              <span className="intro-touch-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
              </span>
              <span>Toque nas obras para aproximar e inspecionar</span>
            </div>

            <div className="intro-controls-separator" />

            {/* Álbum CD */}
            <div className="intro-controls-row">
              <span className="intro-touch-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
              <span>Toque no CD na entrada para ouvir as 17 faixas</span>
            </div>
          </div>
        ) : (
          <div className="intro-controls-block font-mono">
            <div className="intro-controls-title">CONTROLES</div>

            {/* WASD + Direcionais */}
            <div className="intro-controls-row">
              <div className="intro-wasd-grid">
                <span className="intro-wasd-spacer" />
                <kbd className="keycap">W</kbd>
                <span className="intro-wasd-spacer" />
                <kbd className="keycap">A</kbd>
                <kbd className="keycap">S</kbd>
                <kbd className="keycap">D</kbd>
              </div>
              <span>Caminhar pelo pavilhão</span>
            </div>

            <div className="intro-controls-separator" />

            {/* Mouse Look */}
            <div className="intro-controls-row">
              <span className="intro-mouse-icon">
                <svg width="18" height="24" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="28" rx="10"/>
                  <path d="M12 9V14"/>
                  <line x1="2" y1="14" x2="22" y2="14"/>
                </svg>
              </span>
              <span>Clique + arraste para girar a câmera</span>
            </div>

            <div className="intro-controls-separator" />

            {/* E — Interagir */}
            <div className="intro-controls-row">
              <kbd className="keycap">E</kbd>
              <span>Inspecionar obras de arte</span>
            </div>

            <div className="intro-controls-separator" />

            {/* TAB — Acervo */}
            <div className="intro-controls-row">
              <kbd className="keycap keycap-sm">TAB</kbd>
              <span>Ver acervo completo em grade</span>
            </div>
          </div>
        )}

        {/* Ações de Entrada: Primária e Secundária integradas */}
        <div className="intro-actions-cluster font-mono">
          <button
            type="button"
            className="intro-cta-primary-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleEnter3D();
            }}
            aria-label="Entrar no Pavilhão e navegar"
          >
            <span className="intro-cta-icon" aria-hidden="true">
              {isMobile ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
                </svg>
              )}
            </span>
            <span className="intro-cta-text">
              {isMobile ? 'TOCAR PARA ENTRAR' : 'ENTRAR NO PAVILHÃO'}
            </span>
          </button>

          <button
            type="button"
            className="intro-cta-secondary-btn"
            onClick={handleEnterArchive}
            title="Alternar para catálogo em grade (TAB)"
          >
            <kbd className="keycap keycap-xs">TAB</kbd>
            <span>Ver acervo em grade</span>
          </button>
        </div>

        {/* Micro-dica de assimilação intuitiva */}
        <div className="intro-click-to-start-hint font-mono">
          <span>ou clique em qualquer ponto para iniciar</span>
        </div>
      </div>
    </div>
  );
};
