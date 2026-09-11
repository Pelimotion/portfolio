import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { injectCssTokens } from './tokens';
import { useAppStore } from './core/store';
import { STRATA_CATALOG } from './data/artworks';

import { CausticAtmosphere } from './components/canvas/CausticAtmosphere';
import { CymaticNavigator } from './components/canvas/CymaticNavigator';
import { StratumSection } from './components/layout/StratumSection';
import { ErosionModal } from './components/canvas/ErosionModal';
import { Header } from './components/layout/Header';
import { SemanticMap } from './components/layout/SemanticMap';

export const App: React.FC = () => {
  const setDepthProgress = useAppStore((s) => s.setDepthProgress);
  const isStillWaterMode = useAppStore((s) => s.isStillWaterMode);

  // Injeção de tokens e Inicialização do Lenis (Física de resistência da água)
  useEffect(() => {
    injectCssTokens();

    if (isStillWaterMode) return;

    // Configuração do Lenis para mimetizar viscosidade fluida
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85
    });

    lenis.on('scroll', (e: { progress: number }) => {
      setDepthProgress(e.progress);
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isStillWaterMode, setDepthProgress]);

  return (
    <>
      <SemanticMap />
      <CausticAtmosphere />
      <Header />

      <div id="app-shell">
        <main className="stratigraphy-container">
          {/* Abertura e Declaração Conceitual */}
          <section
            style={{
              paddingTop: '6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              maxWidth: '850px'
            }}
            aria-label="Abertura do Portfólio"
          >
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5.2rem)',
                lineHeight: 1.02,
                color: 'var(--foam-white)',
                letterSpacing: '-0.025em'
              }}
            >
              A matéria obedece à pressão, não à forma.
            </h1>

            <p style={{ fontSize: '1.2rem', color: 'rgba(221, 227, 220, 0.85)', lineHeight: 1.8 }}>
              Obras construídas sob as leis da óptica de refração, ressonância mecânica e sedimentação geológica.
              Nenhum clichê marinho; apenas a física que governa o peso do tempo sobre a matéria.
            </p>
          </section>

          {/* Pilar 2: Navegação Cimática */}
          <CymaticNavigator />

          {/* Pilar 3: Coluna Estratigráfica */}
          {STRATA_CATALOG.map((stratum) => (
            <StratumSection key={stratum.id} stratum={stratum} />
          ))}

          {/* Encerramento da Coluna no Fundo Abissal */}
          <footer
            style={{
              borderTop: '1px solid rgba(221, 227, 220, 0.1)',
              paddingTop: '4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              color: 'rgba(221, 227, 220, 0.45)',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ color: 'var(--light-caustic)', fontWeight: 600 }}>
              Base Estratigráfica — 4000m abaixo da superfície
            </div>
            <div>gigantera · arte digital e física da luz · pelimotion.art</div>
          </footer>
        </main>
      </div>

      {/* Pilar 4: Transição por Erosão */}
      <ErosionModal />
    </>
  );
};
