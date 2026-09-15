import React, { useEffect } from 'react';
import { useAppStore } from './core/store';
import { applyThemeTokens } from './tokens';

import { GalleryHeader } from './components/layout/GalleryHeader';
import { GalleryScene3D } from './components/canvas/GalleryScene3D';
import { ArchiveIndex } from './components/layout/ArchiveIndex';
import { MediaKitView } from './components/layout/MediaKitView';
import { MinimalBottomBar } from './components/layout/MinimalBottomBar';
import { CDJewelCasePOV } from './components/audio/CDJewelCasePOV';
import { CinemaView } from './components/modal/CinemaView';
import { ArtistBioModal } from './components/modal/ArtistBioModal';
import { ControlsGuideModal } from './components/modal/ControlsGuideModal';
import { IntroSequence } from './components/ui/IntroSequence';

export const App: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const viewMode = useAppStore((s) => s.viewMode);
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);

  useEffect(() => {
    applyThemeTokens(theme);
  }, [theme]);

  return (
    <main className="gallery-main-app" data-theme={theme} data-mode={viewMode} data-cinema={cinemaArtwork ? 'true' : 'false'}>
      {/* 1. Animação Inicial no Espaço 3D (Materialização das Obras em 4s) */}
      <IntroSequence />

      {/* 2. Top Bar Minimalista com Proteção Feathered */}
      <GalleryHeader />

      {/* 3. Espaço 3D Hiper-Realista (Paredes, Luz Volumétrica, Vitrines de Vidro e Papel Fosco) */}
      <GalleryScene3D />

      {/* 4. Modo Catálogo Tradicional em Grade */}
      {viewMode === 'archive' && <ArchiveIndex />}

      {/* 5. Central de Mídia & Download de Masters Curatorial */}
      {viewMode === 'media' && <MediaKitView />}

      {/* 6. Bottom Bar Unificada com Proteção Feathered e Controles Essenciais */}
      <MinimalBottomBar />

      {/* 7. Experiência de CD Físico em POV na Entrada com Contracapa e 17 Faixas */}
      <CDJewelCasePOV />

      {/* 8. Modo Cinema Atmosférico com Foco Volumétrico e Modo Lupa */}
      <CinemaView />

      {/* 9. Painel Arquitetural do Artista & Contato */}
      <ArtistBioModal />

      {/* 10. Manual / Guia Tátil de Controles On-Demand (H) */}
      <ControlsGuideModal />
    </main>
  );
};
