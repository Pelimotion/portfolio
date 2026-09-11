import React, { useEffect } from 'react';
import { injectCssTokens } from './tokens';
import { useAppStore } from './core/store';

import { OceanicScene3D } from './components/canvas/OceanicScene3D';
import { SandPhysicsOverlay } from './components/canvas/SandPhysicsOverlay';
import { FloatingHUD } from './components/ui/FloatingHUD';
import { DepthRuler } from './components/ui/DepthRuler';
import { ViewportReticles } from './components/ui/ViewportReticles';
import { ErosionModal } from './components/canvas/ErosionModal';
import { Header } from './components/layout/Header';
import { SemanticMap } from './components/layout/SemanticMap';
import { STRATA_CATALOG } from './data/artworks';

export const App: React.FC = () => {
  const activeStratum = useAppStore((s) => s.activeStratum);

  useEffect(() => {
    injectCssTokens();
  }, []);

  const activeStratumData = STRATA_CATALOG.find((s) => s.id === activeStratum);
  const stratumIndex = STRATA_CATALOG.findIndex((s) => s.id === activeStratum) + 1;
  const stratumCode = activeStratum === 'epipelagic' ? 'EPIPELÁGICO' : activeStratum === 'mesopelagic' ? 'MESOPELÁGICO' : 'BATIPELÁGICO';

  return (
    <>
      {/* 1. Navegação Acessível para Leitores de Tela e Teclado */}
      <SemanticMap />

      {/* 2. Grafismos de Enquadramento e Retículos Brutalistas nos Cantos */}
      <ViewportReticles />

      {/* 3. Cabeçalho Brutalista com Telemetria Lunar/Maré e Controles de Áudio */}
      <Header />

      {/* 4. Régua Batimétrica Vertical Brutalista na Margem Direita */}
      <DepthRuler />

      {/* 5. Ambiente 3D Oceânico Espacial (Three.js com Pedestais Wireframe e Caustics) */}
      <OceanicScene3D />

      {/* 6. Simulação Física de Areia e Sedimento nos Cantos da Tela */}
      <SandPhysicsOverlay />

      {/* 7. Painel Brutalista de Identificação do Estrato Geológico */}
      <section className="ambient-specimen-hud" aria-label="Identificação Estratigráfica">
        <div className="specimen-tag-row">
          <span className="specimen-bracket-tag">
            [STRATUM // 0{stratumIndex} · {stratumCode} · {activeStratumData?.depthRange}]
          </span>
          <span className="specimen-serial">ARCHIVE.SERIES: {activeStratumData?.title.toUpperCase()}</span>
        </div>

        <h1 className="specimen-monument-title">
          {activeStratumData?.title}
        </h1>

        <div className="specimen-telemetry-strip">
          <div className="telemetry-cell">
            <span className="cell-k">[PRESSÃO ESTIMADA]</span>
            <span className="cell-v">
              {(1 + (activeStratum === 'epipelagic' ? 0 : activeStratum === 'mesopelagic' ? 400 : 3000) / 10).toFixed(1)} BAR
            </span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-k">[INCIDÊNCIA SOLAR]</span>
            <span className="cell-v">
              {activeStratum === 'epipelagic' ? '100% (FÓTICA)' : activeStratum === 'mesopelagic' ? '1% (DISFÓTICA)' : '0% (AFÓTICA)'}
            </span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-k">[ACERVO DEPOSITADO]</span>
            <span className="cell-v">03 MONÓLITOS 3D</span>
          </div>
        </div>

        <p className="specimen-narrative">
          {activeStratumData?.description}
        </p>

        <div className="specimen-interaction-prompt">
          <span className="prompt-arrow">▲▼</span>
          <span>ARRASTE VERTICAL / RODA DO MOUSE P/ NAVEGAR · CLIQUE NOS MONÓLITOS 3D P/ INSPECIONAR</span>
        </div>
      </section>

      {/* 8. HUD Flutuante Subaquático (Console de Telemetria e Salto Táctil) */}
      <FloatingHUD />

      {/* 9. Dossier de Inspeção por Erosão Física e Modulação de Fontes */}
      <ErosionModal />
    </>
  );
};
