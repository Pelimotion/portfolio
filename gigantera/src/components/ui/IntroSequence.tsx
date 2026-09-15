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
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Garante que o tutorial fica na tela pelo menos 7 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (delay = 400) => {
    setIsGlidingDown(true);
    setTutorialDocked(true);
    setTimeout(() => {
      setIsDone(true);
      setIntroPhase('ready');
    }, delay);
  };

  useEffect(() => {
    // O tutorial permanece na tela até o usuário clicar para começar ou apertar TAB para ver o acervo
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        setViewMode('archive');
        dismiss(2000);
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
      dismiss(2000);
    }
  }, [hasPlayerMoved, isHoldingCD, isDone]);

  const siteConfig = useMemo(() => getMergedSiteConfig(), []);

  if (isDone || introPhase === 'ready') return null;

  const handleEnter3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
    dismiss(2000);
  };

  const handleEnterArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode('archive');
    dismiss(2000);
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

        {/* Bloco de Controles Inline */}
        <div className="intro-controls-block font-mono">
          <div className="intro-controls-title">CONTROLES</div>

          {/* WASD + Mouse Look */}
          <div className="intro-controls-row">
            <div className="intro-wasd-grid">
              {/* Linha 1: espaço vazio, W, espaço vazio */}
              <span className="intro-wasd-spacer" />
              <kbd className="keycap">W</kbd>
              <span className="intro-wasd-spacer" />
              {/* Linha 2: A, S, D */}
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
            <span>Clique + mova o mouse para girar a câmera</span>
          </div>

          <div className="intro-controls-separator" />

          {/* E — Interagir */}
          <div className="intro-controls-row">
            <kbd className="keycap">E</kbd>
            <span>Inspecionar obras de arte</span>
          </div>

          {/* TAB — Acérvo */}
          <div className="intro-controls-row">
            <kbd className="keycap keycap-sm">TAB</kbd>
            <span>Ver o acérvo completo em grade</span>
          </div>
        </div>

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

        {/* Opção Secundária: Acérvo */}
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
            <span>Ou aperte <kbd className="keycap keycap-sm">TAB</kbd> para ver o acérvo em grade diretamente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
