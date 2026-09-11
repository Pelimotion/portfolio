import React, { useEffect } from 'react';
import { injectCssTokens } from './tokens';
import { useAppStore } from './core/store';

import { OceanicScene3D } from './components/canvas/OceanicScene3D';
import { SandPhysicsOverlay } from './components/canvas/SandPhysicsOverlay';
import { FloatingHUD } from './components/ui/FloatingHUD';
import { ErosionModal } from './components/canvas/ErosionModal';
import { Header } from './components/layout/Header';
import { SemanticMap } from './components/layout/SemanticMap';
import { STRATA_CATALOG } from './data/artworks';

export const App: React.FC = () => {
  const isStillWaterMode = useAppStore((s) => s.isStillWaterMode);
  const activeStratum = useAppStore((s) => s.activeStratum);

  useEffect(() => {
    injectCssTokens();
  }, []);

  const activeStratumData = STRATA_CATALOG.find((s) => s.id === activeStratum);

  return (
    <>
      {/* 1. Navegação Acessível para Leitores de Tela e Teclado */}
      <SemanticMap />

      {/* 2. Cabeçalho Minimalista com Maré e Fase Lunar */}
      <Header />

      {/* 3. Ambiente 3D Oceânico Espacial (Three.js) */}
      <OceanicScene3D />

      {/* 4. Simulação Física de Areia e Sedimento nos Cantos da Tela */}
      <SandPhysicsOverlay />

      {/* 5. Overlay Textual Suave de Contexto Geológico (Não intrusivo) */}
      <div
        className="ocean-ambient-overlay"
        style={{
          position: 'fixed',
          top: '6.5rem',
          left: '2.5rem',
          zIndex: 20,
          pointerEvents: 'none',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--light-caustic)',
            letterSpacing: '0.08em',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          {activeStratumData?.depthRange}
        </span>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2.4rem)',
            color: 'var(--foam-white)',
            lineHeight: 1.1,
            margin: 0
          }}
        >
          {activeStratumData?.title}
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(221, 227, 220, 0.7)',
            lineHeight: 1.5,
            marginTop: '0.25rem'
          }}
        >
          {activeStratumData?.description}
        </p>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'rgba(232, 199, 126, 0.65)',
            marginTop: '0.4rem',
            fontStyle: 'italic'
          }}
        >
          Arraste ou role a tela para descer pelo oceano em 3D · Clique nos pedestais para inspecionar
        </div>
      </div>

      {/* 6. HUD Flutuante Subaquático (Controle Tátil do Usuário) */}
      <FloatingHUD />

      {/* 7. Modal de Transição por Erosão Física e Fraunces Dinâmica */}
      <ErosionModal />
    </>
  );
};
