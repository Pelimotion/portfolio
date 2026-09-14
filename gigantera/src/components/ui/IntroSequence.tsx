import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../core/store';

export const IntroSequence: React.FC = () => {
  const introPhase = useAppStore((s) => s.introPhase);
  const setIntroPhase = useAppStore((s) => s.setIntroPhase);
  const setTutorialDocked = useAppStore((s) => s.setTutorialDocked);
  const hasPlayerMoved = useAppStore((s) => s.hasPlayerMoved);
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);

  const [isGlidingDown, setIsGlidingDown] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Transição suave inicial após 4.2s ou ao primeiro comando
    const tGlide = setTimeout(() => {
      setIsGlidingDown(true);
      setTutorialDocked(true);
    }, 4500);

    const tFinish = setTimeout(() => {
      setIsDone(true);
      setIntroPhase('ready');
    }, 5500);

    const handleEarlyDismiss = () => {
      setIsGlidingDown(true);
      setTutorialDocked(true);
      setTimeout(() => {
        setIsDone(true);
        setIntroPhase('ready');
      }, 500);
    };

    window.addEventListener('wheel', handleEarlyDismiss, { once: true });
    window.addEventListener('touchstart', handleEarlyDismiss, { once: true });
    window.addEventListener('keydown', handleEarlyDismiss, { once: true });

    return () => {
      clearTimeout(tGlide);
      clearTimeout(tFinish);
      window.removeEventListener('wheel', handleEarlyDismiss);
      window.removeEventListener('touchstart', handleEarlyDismiss);
      window.removeEventListener('keydown', handleEarlyDismiss);
    };
  }, [setIntroPhase, setTutorialDocked]);

  // Se o jogador começou a andar ou pegou o CD, encerra a introdução imediatamente
  useEffect(() => {
    if ((hasPlayerMoved || isHoldingCD) && !isDone) {
      setIsGlidingDown(true);
      setTutorialDocked(true);
      const t = setTimeout(() => {
        setIsDone(true);
        setIntroPhase('ready');
      }, 350);
      return () => clearTimeout(t);
    }
  }, [hasPlayerMoved, isHoldingCD, isDone, setIntroPhase, setTutorialDocked]);

  if (isDone || introPhase === 'ready') return null;

  return (
    <div
      className={`intro-spatial-overlay ${isGlidingDown ? 'is-gliding-down' : ''}`}
      onClick={() => {
        setIsGlidingDown(true);
        setTutorialDocked(true);
        setTimeout(() => setIsDone(true), 400);
      }}
      aria-label="Introdução Imersiva de Gigantera"
    >
      <div className="intro-floating-cue font-mono">
        <div className="intro-badge-row">
          <span className="cue-badge">[GIGANTERA]</span>
          <span className="intro-session-dot" />
          <span className="intro-session-text">PAVILHÃO DIGITAL</span>
        </div>

        <h1 className="cue-hero-title">GIGANTERA</h1>
        <h2 className="cue-statement">
          Um pavilhão. Não um portfólio.
        </h2>

        <p className="cue-narrative-text">
          Concreto, luz e som suspensos no espaço — entre e ande.
        </p>

        <div className="cue-quick-tips-cluster">
          <span className="cue-tip-chip">
            <kbd className="keycap keycap-xs">WASD</kbd>
            <span>CAMINHAR</span>
          </span>
          <span className="chip-sep">·</span>
          <span className="cue-tip-chip">
            <kbd className="keycap keycap-xs">E</kbd>
            <span>PEGAR ÁLBUM / INSPECIONAR</span>
          </span>
          <span className="chip-sep">·</span>
          <span className="cue-tip-chip">
            <kbd className="keycap keycap-xs">H</kbd>
            <span>GUIA TÁTIL</span>
          </span>
        </div>

        <button
          className="intro-dismiss-cta-btn font-mono"
          onClick={(e) => {
            e.stopPropagation();
            setIsGlidingDown(true);
            setTutorialDocked(true);
            setTimeout(() => setIsDone(true), 350);
          }}
        >
          [ENTRAR NO PAVILHÃO ↵]
        </button>
      </div>
    </div>
  );
};
