import React, { useState } from 'react';
import { useAppStore } from '../../core/store';
import { ARTWORKS_CATALOG, SECTORS_CATALOG, AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { PlayerController } from '../../core/playerController';
import { soundEngine } from '../../core/soundEngine';

export const MobileBottomDock: React.FC = () => {
  const currentArtworkIndex = useAppStore((s) => s.currentArtworkIndex);
  const nextArtwork = useAppStore((s) => s.nextArtwork);
  const prevArtwork = useAppStore((s) => s.prevArtwork);
  const navigateToArtworkIndex = useAppStore((s) => s.navigateToArtworkIndex);
  const openCinema = useAppStore((s) => s.openCinema);
  const isGyroscopeActive = useAppStore((s) => s.isGyroscopeActive);
  const setGyroscopeActive = useAppStore((s) => s.setGyroscopeActive);
  const setCDPOVOpen = useAppStore((s) => s.setCDPOVOpen);
  const takeCD = useAppStore((s) => s.takeCD);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const toggleGuideModal = useAppStore((s) => s.toggleGuideModal);
  const activeSectorId = useAppStore((s) => s.activeSectorId);
  const warpToSector = useAppStore((s) => s.warpToSector);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'artworks' | 'audio'>('artworks');

  const currentArt = ARTWORKS_CATALOG[currentArtworkIndex] || ARTWORKS_CATALOG[0];
  const totalArtworks = ARTWORKS_CATALOG.length;
  const artNumberStr = String(currentArtworkIndex + 1).padStart(2, '0');

  const handleToggleGyro = async () => {
    soundEngine.playTactileHoverTick();
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
    soundEngine.playGlassPassSound();
    if (currentArt) {
      openCinema(currentArt);
    }
  };

  const handleSectorClick = (sectorId: string) => {
    soundEngine.playTactileHoverTick();
    warpToSector(sectorId);
  };

  const handleOpenCD = () => {
    soundEngine.playTactileHoverTick();
    takeCD();
  };

  return (
    <nav className="mobile-tactile-dock" role="navigation" aria-label="Navegação Móvel Gigantera">
      {/* ── GAVETA TÁTIL EXPANSÍVEL (BOTTOM SHEET MODAL) ── */}
      {isDrawerOpen && (
        <div className="mobile-drawer-sheet" role="dialog" aria-label="Acervo Completo">
          <div className="mobile-drawer-drag-pill" />
          
          <div className="mobile-drawer-header">
            <div className="mobile-drawer-tabs font-mono">
              <button
                onClick={() => setDrawerTab('artworks')}
                className={`drawer-tab-btn ${drawerTab === 'artworks' ? 'is-active' : ''}`}
              >
                OBRAS [{totalArtworks}]
              </button>
              <button
                onClick={() => setDrawerTab('audio')}
                className={`drawer-tab-btn ${drawerTab === 'audio' ? 'is-active' : ''}`}
              >
                FAIXAS CD [17]
              </button>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="drawer-close-btn font-mono"
              aria-label="Fechar lista"
            >
              ✕
            </button>
          </div>

          {drawerTab === 'artworks' ? (
            <div className="mobile-drawer-carousel">
              {ARTWORKS_CATALOG.map((art, idx) => (
                <button
                  key={art.id}
                  onClick={() => {
                    soundEngine.playTactileHoverTick();
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
                      <span className="drawer-video-badge font-mono">VÍDEO</span>
                    )}
                    {art.medium === 'interactive' && (
                      <span className="drawer-interactive-badge font-mono">INTERATIVO</span>
                    )}
                  </div>
                  <div className="drawer-art-meta font-mono">
                    <span className="drawer-art-num">#{String(idx + 1).padStart(2, '0')}</span>
                    <span className="drawer-art-title">{art.title}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mobile-drawer-audio-list font-mono">
              {AUTHORIAL_TRACKS_CATALOG.map((track, idx) => {
                const isThisPlaying = isAudioPlaying && currentAudioTrack.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      useAppStore.getState().setCurrentAudioTrack(track);
                      soundEngine.playTrackPreview(track);
                      useAppStore.getState().setIsAudioPlaying(true);
                    }}
                    className={`drawer-audio-row ${isThisPlaying ? 'is-playing' : ''}`}
                  >
                    <span className="audio-row-track-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="audio-row-title">{track.title}</span>
                    <span className="audio-row-bpm">{track.bpm} BPM</span>
                    <span className="audio-row-play-state">{isThisPlaying ? '❚❚' : '▶'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DOCK FLUTUANTE NA ZONA DO POLEGAR (THUMB ZONE) ── */}
      <div className="mobile-dock-surface">
        {/* Nível 1: Seletor Rápido de Setores Arquiteturais (1 SOM · 2 VÍDEOS · 3 STILLS) */}
        <div className="mobile-sectors-strip font-mono" role="tablist" aria-label="Navegação de Setores">
          {SECTORS_CATALOG.map((sec) => {
            const isActive = activeSectorId === sec.id;
            const label =
              sec.id === 'entrance-audio'
                ? '1 · SOM'
                : sec.id === 'video'
                ? '2 · VÍDEOS'
                : '3 · STILLS';

            return (
              <button
                key={sec.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSectorClick(sec.id)}
                className={`mobile-sector-pill ${isActive ? 'is-active' : ''}`}
              >
                <span className="mobile-sector-dot" />
                <span className="mobile-sector-text">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Nível 2: Stepper Principal da Obra com Atalho de Inspeção */}
        <div className="mobile-stepper-row">
          <button
            onClick={() => {
              soundEngine.playTactileHoverTick();
              prevArtwork();
            }}
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
              <span className={`art-medium-pill ${currentArt.medium === 'video' ? 'is-video' : currentArt.medium === 'interactive' ? 'is-interactive' : 'is-still'}`}>
                {currentArt.medium === 'video' ? '▶ VÍDEO' : currentArt.medium === 'interactive' ? '✦ INTERATIVO' : '◼ STILL'}
              </span>
              <span className="art-drawer-cue">▲ LISTA</span>
            </div>
            <div className="art-card-title-text font-display">
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
            onClick={() => {
              soundEngine.playTactileHoverTick();
              nextArtwork();
            }}
            className="mobile-stepper-nav-btn font-mono"
            aria-label="Próxima obra"
            title="Avançar para a próxima obra"
          >
            ►
          </button>
        </div>

        {/* Nível 3: Barra de Ferramentas Essenciais */}
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
            onClick={handleOpenCD}
            className={`mobile-tool-pill ${isAudioPlaying ? 'is-playing' : ''}`}
            title="Abrir estojo de CD em primeira pessoa"
          >
            <span className="tool-icon">{isAudioPlaying ? '❚❚' : '☊'}</span>
            <span className="tool-text">CD ÁLBUM</span>
          </button>

          {/* Alternador de Modo de Visualização (Grade do Acervo) */}
          <button
            onClick={() => {
              soundEngine.playTactileHoverTick();
              setViewMode(viewMode === 'archive' ? 'spatial' : 'archive');
            }}
            className={`mobile-tool-pill ${viewMode === 'archive' ? 'is-active' : ''}`}
            title="Alternar entre caminhada 3D e catálogo em grade"
          >
            <span className="tool-icon">⊞</span>
            <span className="tool-text">ACERVO</span>
          </button>

          {/* Guia de Ajuda Tátil */}
          <button
            onClick={() => {
              soundEngine.playTactileHoverTick();
              toggleGuideModal();
            }}
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

