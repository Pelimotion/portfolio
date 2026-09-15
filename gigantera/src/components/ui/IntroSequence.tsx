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

        {/* Dois modos de entrada */}
        <div className="intro-entry-choices">
          <button
            className="intro-entry-btn intro-entry-primary font-mono"
            onClick={handleEnter3D}
            aria-label="Entrar no Pavilhão 3D e caminhar livremente"
          >
            <span className="entry-icon" aria-hidden="true">▶</span>
            <span className="entry-content">
              <span className="entry-label">INICIAR EXPERIÊNCIA 3D</span>
              <span className="entry-hint">WASD + mouse</span>
            </span>
          </button>

          <button
            className="intro-entry-btn intro-entry-secondary font-mono"
            onClick={handleEnterArchive}
            aria-label="Ver o acervo completo em catálogo"
          >
            <span className="entry-icon" aria-hidden="true">≡</span>
            <span className="entry-content">
              <span className="entry-label">VERSÃO ESTÁTICA / CATÁLOGO</span>
              <span className="entry-hint">catálogo em grade</span>
            </span>
          </button>
        </div>

        {/* Hint do guia */}
        <p className="intro-guide-hint font-mono">
          Pressione <kbd className="keycap keycap-xs">H</kbd> a qualquer momento para ver os controles
        </p>
      </div>
    </div>
  );
};
