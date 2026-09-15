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

  const [isGlidingDown, setIsGlidingDown] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const dismiss = (delay = 400) => {
    setIsGlidingDown(true);
    setTutorialDocked(true);
    setTimeout(() => {
      setIsDone(true);
      setIntroPhase('ready');
    }, delay);
  };

  useEffect(() => {
    // Auto-dismiss após 4.5s se o visitante não fizer nada
    const tGlide = setTimeout(() => dismiss(500), 4500);

    // Qualquer input fecha imediatamente (visitante já sabe o que faz)
    const handleEarlyDismiss = () => dismiss(350);
    window.addEventListener('wheel', handleEarlyDismiss, { once: true });
    window.addEventListener('touchstart', handleEarlyDismiss, { once: true });

    // Só fecha com keydown se for uma tecla de movimento (não H que abre o guia)
    const handleKeyDismiss = (e: KeyboardEvent) => {
      const nav = ['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'];
      if (nav.includes(e.key)) handleEarlyDismiss();
    };
    window.addEventListener('keydown', handleKeyDismiss);

    return () => {
      clearTimeout(tGlide);
      window.removeEventListener('wheel', handleEarlyDismiss);
      window.removeEventListener('touchstart', handleEarlyDismiss);
      window.removeEventListener('keydown', handleKeyDismiss);
    };
  }, [setIntroPhase, setTutorialDocked]);

  // Se o jogador começou a andar ou pegou o CD, encerra imediatamente
  useEffect(() => {
    if ((hasPlayerMoved || isHoldingCD) && !isDone) {
      dismiss(300);
    }
  }, [hasPlayerMoved, isHoldingCD, isDone]);

  const siteConfig = useMemo(() => getMergedSiteConfig(), []);

  if (isDone || introPhase === 'ready') return null;

  const handleEnter3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
    dismiss(400);
  };

  const handleEnterArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode('archive');
    dismiss(300);
  };

  return (
    <div
      className={`intro-spatial-overlay ${isGlidingDown ? 'is-gliding-down' : ''}`}
      onClick={handleEnter3D}
      aria-label="Introdução ao Gigantera"
    >
      <div className="intro-floating-cue" onClick={(e) => e.stopPropagation()}>
        {/* Marca */}
        <div className="intro-badge-row font-mono">
          <span className="cue-badge">[GIGANTERA]</span>
          <span className="intro-session-dot" />
          <span className="intro-session-text">PAVILHÃO DIGITAL</span>
        </div>

        {/* Headline */}
        <h1 className="cue-hero-title">GIGANTERA</h1>
        <h2 className="cue-statement">
          {siteConfig.heroHeadline.replace(/^GIGANTERA\s*[\n\r—–-]*\s*/i, '') || 'Um pavilhão. Não um portfólio.'}
        </h2>

        <p className="cue-narrative-text">{siteConfig.subhead}</p>

        {/* Escolha Primária */}
        <div className="intro-entry-primary-area">
          <button
            className="intro-entry-main-btn font-mono"
            onClick={handleEnter3D}
            aria-label="Entrar no Pavilhão 3D"
          >
            <span className="entry-icon-mouse">
              <svg width="18" height="26" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="32" rx="10"/>
                <path d="M12 10V14"/>
              </svg>
            </span>
            <span className="entry-main-label">CLIQUE PARA ENTRAR NO PAVILHÃO E NAVEGAR</span>
          </button>
        </div>

        {/* Opções Secundárias / Dicas */}
        <div className="intro-secondary-hints font-mono">
          <div className="intro-hint-item" onClick={handleEnterArchive} style={{ cursor: 'pointer' }}>
            <span className="hint-icon-tab">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="9" y1="21" x2="21" y2="3"></line>
                <line x1="21" y1="21" x2="3" y2="21"></line>
                <line x1="3" y1="21" x2="3" y2="3"></line>
              </svg>
            </span>
            <span>Aperte <kbd className="keycap keycap-xs">TAB</kbd> a qualquer momento para ver o acervo em grade (versão estática)</span>
          </div>
          <div className="intro-hint-item">
            <span className="hint-icon-keyboard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </span>
            <span>Pressione <kbd className="keycap keycap-xs">H</kbd> a qualquer momento para ver os controles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
