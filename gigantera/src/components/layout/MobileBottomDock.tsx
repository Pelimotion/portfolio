import React, { useState } from 'react';
import { useAppStore } from '../../core/store';
import { ARTWORKS_CATALOG, SECTORS_CATALOG } from '../../data/artworks';
import { PlayerController } from '../../core/playerController';

export const MobileBottomDock: React.FC = () => {
  const currentArtworkIndex = useAppStore((s) => s.currentArtworkIndex);
  const nextArtwork = useAppStore((s) => s.nextArtwork);
  const prevArtwork = useAppStore((s) => s.prevArtwork);
  const navigateToArtworkIndex = useAppStore((s) => s.navigateToArtworkIndex);
  const openCinema = useAppStore((s) => s.openCinema);
  const isGyroscopeActive = useAppStore((s) => s.isGyroscopeActive);
  const toggleGyroscope = useAppStore((s) => s.toggleGyroscope);
  const setGyroscopeActive = useAppStore((s) => s.setGyroscopeActive);
  const setCDPOVOpen = useAppStore((s) => s.setCDPOVOpen);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const toggleGuideModal = useAppStore((s) => s.toggleGuideModal);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentArt = ARTWORKS_CATALOG[currentArtworkIndex] || ARTWORKS_CATALOG[0];
  const totalArtworks = ARTWORKS_CATALOG.length;
  const artNumberStr = String(currentArtworkIndex + 1).padStart(2, '0');

  const handleToggleGyro = async () => {
    if (!isGyroscopeActive) {
      const granted = await PlayerController.requestOrientationPermission();
      if (granted) {
        setGyroscopeActive(true);
      } else {
        alert('Permissão de orientação de movimento foi negada pelo navegador.');
      }
    } else {
      setGyroscopeActive(false);
    }
  };

  const handleInspect = () => {
    if (currentArt) {
      openCinema(currentArt);
    }
  };

  return (
    <nav className="mobile-tactile-dock" role="navigation" aria-label="Navegação Móvel Gigantera">
      {/* Gaveta Tátil de Obras (Abre ao tocar no centro ou no botão Acervo) */}
      {isDrawerOpen && (
        <div className="mobile-drawer-sheet" role="dialog" aria-label="Seletor de Obras">
          <div className="mobile-drawer-header">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              Acervo de Obras ({totalArtworks})
            </span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="drawer-close-btn font-mono"
              aria-label="Fechar lista"
            >
              ✕
            </button>
          </div>
          <div className="mobile-drawer-carousel">
            {ARTWORKS_CATALOG.map((art, idx) => (
              <button
                key={art.id}
                onClick={() => {
                  navigateToArtworkIndex(idx);
                  setIsDrawerOpen(false);
                }}
                className={`drawer-art-item ${idx === currentArtworkIndex ? 'is-selected' : ''}`}
              >
                <div className="drawer-art-thumb-wrap">
                  <img
                    src={art.imageSrc}
                    alt={art.title}
                    className="drawer-art-thumb"
                    loading="lazy"
                  />
                  {art.medium === 'video' && (
                    <span className="drawer-video-badge font-mono">LOOP</span>
                  )}
                </div>
                <div className="drawer-art-meta font-mono">
                  <span className="drawer-art-num">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="drawer-art-title">{art.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dock Flutuante Central na Zona do Polegar */}
      <div className="mobile-dock-surface">
        {/* Linha Superior: Stepper Principal de Obras 3D */}
        <div className="mobile-stepper-row">
          <button
            onClick={() => prevArtwork()}
            className="mobile-stepper-nav-btn font-mono"
            aria-label="Obra anterior"
            title="Voltar para a obra anterior"
          >
            ◄
          </button>

          <div
            className="mobile-current-art-card"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            role="button"
            tabIndex={0}
            title="Toque para abrir a lista completa de obras"
          >
            <div className="art-card-top-info font-mono">
              <span className="art-counter-badge">
                {artNumberStr} / {String(totalArtworks).padStart(2, '0')}
              </span>
              <span className={`art-medium-pill ${currentArt.medium === 'video' ? 'is-video' : 'is-still'}`}>
                {currentArt.medium === 'video' ? '▶ VÍDEO' : '◼ STILL'}
              </span>
            </div>
            <div className="art-card-title-text">
              {currentArt.title.toUpperCase()}
            </div>
          </div>

          <button
            onClick={handleInspect}
            className="mobile-inspect-action-btn font-mono"
            aria-label={`Inspecionar ${currentArt.title}`}
          >
            <span className="inspect-icon">⌕</span>
            <span className="inspect-label">VER</span>
          </button>

          <button
            onClick={() => nextArtwork()}
            className="mobile-stepper-nav-btn font-mono"
            aria-label="Próxima obra"
            title="Avançar para a próxima obra"
          >
            ►
          </button>
        </div>

        {/* Linha Inferior: Barra de Ferramentas Essenciais */}
        <div className="mobile-tools-row font-mono">
          {/* Alternador Giroscópio (Janela Mágica) */}
          <button
            onClick={handleToggleGyro}
            className={`mobile-tool-pill ${isGyroscopeActive ? 'is-active' : ''}`}
            title="Ativar sensor de giroscópio para olhar ao redor inclinando o celular"
          >
            <span className="tool-icon">⟲</span>
            <span className="tool-text">GIRO {isGyroscopeActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reprodutor de CD / Áudio POV */}
          <button
            onClick={() => setCDPOVOpen(true)}
            className={`mobile-tool-pill ${isAudioPlaying ? 'is-playing' : ''}`}
            title="Abrir estojo de CD em primeira pessoa"
          >
            <span className="tool-icon">{isAudioPlaying ? '❚❚' : '☊'}</span>
            <span className="tool-text">ÁLBUM CD</span>
          </button>

          {/* Alternador de Modo de Visualização (Grade do Acervo) */}
          <button
            onClick={() => setViewMode(viewMode === 'archive' ? 'spatial' : 'archive')}
            className={`mobile-tool-pill ${viewMode === 'archive' ? 'is-active' : ''}`}
            title="Alternar para catálogo em grade"
          >
            <span className="tool-icon">⊞</span>
            <span className="tool-text">ACERVO</span>
          </button>

          {/* Central de Mídia / Download para Galeristas */}
          <button
            onClick={() => setViewMode(viewMode === 'media' ? 'spatial' : 'media')}
            className={`mobile-tool-pill ${viewMode === 'media' ? 'is-active' : ''}`}
            title="Central de Mídia e Downloads"
          >
            <span className="tool-icon">↓</span>
            <span className="tool-text">MÍDIA</span>
          </button>

          {/* Guia de Ajuda Tátil */}
          <button
            onClick={() => toggleGuideModal()}
            className="mobile-tool-pill"
            title="Abrir guia de controles móveis"
          >
            <span className="tool-icon">?</span>
            <span className="tool-text">GUIA</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
