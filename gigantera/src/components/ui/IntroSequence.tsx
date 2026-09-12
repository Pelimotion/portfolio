import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../core/store';

export const IntroSequence: React.FC = () => {
  const introPhase = useAppStore((s) => s.introPhase);
  const setIntroPhase = useAppStore((s) => s.setIntroPhase);
  const setTutorialDocked = useAppStore((s) => s.setTutorialDocked);

  const [isGlidingDown, setIsGlidingDown] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 0s a 3.2s: Obras materializando-se no 3D, tutorial flutuando no centro
    const tGlide = setTimeout(() => {
      setIsGlidingDown(true);
      setTutorialDocked(true);
    }, 3400);

    // 4.0s: Conclusão da descida para a bottom bar
    const tFinish = setTimeout(() => {
      setIsDone(true);
      setIntroPhase('ready');
    }, 4200);

    const handleEarlyDismiss = () => {
      setIsGlidingDown(true);
      setTutorialDocked(true);
      setTimeout(() => {
        setIsDone(true);
        setIntroPhase('ready');
      }, 400);
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

  if (isDone || introPhase === 'ready') return null;

  return (
    <div
      className={`intro-spatial-overlay ${isGlidingDown ? 'is-gliding-down' : ''}`}
      onClick={() => {
        setIsGlidingDown(true);
        setTutorialDocked(true);
        setTimeout(() => setIsDone(true), 400);
      }}
      aria-label="Tutorial de Navegação Espacial"
    >
      <div className="intro-floating-cue font-mono">
        <span className="cue-badge">[ESPACIAL // NAVEGAÇÃO LIVRE]</span>
        <h2 className="cue-statement">
          RODE O SCROLL OU ARRASTE PARA FLUTUAR ENTRE AS OBRAS
        </h2>
        <span className="cue-cinema-tip">CLIQUE EM QUALQUER VITRINE DE VIDRO P/ ENTRAR NO MODO CINEMA</span>
      </div>
    </div>
  );
};
