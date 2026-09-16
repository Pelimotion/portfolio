import React from 'react';
import { useAppStore } from '../../core/store';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { AudioTrackInfo } from '../../types/art';
import { soundEngine } from '../../core/soundEngine';

export const ArchiveIndex: React.FC = () => {
  const activeFilter = useAppStore((s) => s.activeFilter);
  const setActiveFilter = useAppStore((s) => s.setActiveFilter);
  const archiveGridPage = useAppStore((s) => s.archiveGridPage);
  const setArchiveGridPage = useAppStore((s) => s.setArchiveGridPage);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setBioOpen = useAppStore((s) => s.setBioOpen);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const setCurrentAudioTrack = useAppStore((s) => s.setCurrentAudioTrack);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);
  const isMobile = useAppStore((s) => s.isMobile);

  const stillCount = ARTWORKS_CATALOG.filter((a) => a.medium === 'still').length;
  const videoCount = ARTWORKS_CATALOG.filter((a) => a.medium === 'video').length;
  const soundCount = AUTHORIAL_TRACKS_CATALOG.length;
  const totalCount = ARTWORKS_CATALOG.length + soundCount;

  const handleTrackToggle = async (track: AudioTrackInfo) => {
    if (currentAudioTrack.id === track.id && isAudioPlaying) {
      soundEngine.pause();
      setIsAudioPlaying(false);
    } else {
      setCurrentAudioTrack(track);
      await soundEngine.playTrackPreview(track);
      setIsAudioPlaying(true);
    }
  };

  const handleReturnToSpatial = () => {
    soundEngine.playTactileHoverTick();
    setViewMode('spatial');
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleReturnToSpatial();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  return (
    <div className="archive-portfolio-overlay" aria-label="Portfólio & Acervo Gigantera">
      {/* 1. Header do Portfólio Artístico com Proteção Feather e Navegação Direta */}
      <header className="archive-portfolio-header">
        {/* Identificação Curatorial à Esquerda */}
        <div className="archive-brand-block">
          <span className="brand-symbol font-mono">■</span>
          <div className="brand-meta">
            <span className="brand-title font-display">GIGANTERA // ACERVO</span>
            <span className="brand-sub font-mono">PORTFÓLIO ARTÍSTICO & CURADORIA</span>
          </div>
        </div>

        {/* 2. Barra Brutalista de Filtros (Centro) — Idêntica à Simulação de Referência */}
        <nav className="archive-simulation-filter-tabs" aria-label="Filtros de Obras">
          <button
            onClick={() => setActiveFilter('all')}
            className={`sim-filter-tab ${activeFilter === 'all' ? 'is-active' : ''}`}
            aria-pressed={activeFilter === 'all'}
          >
            <span className="tab-square">{activeFilter === 'all' ? '■' : '□'}</span>
            <span className="tab-label">TODAS AS OBRAS</span>
            <span className="tab-count font-mono">[{totalCount}]</span>
          </button>

          <button
            onClick={() => setActiveFilter('still')}
            className={`sim-filter-tab ${activeFilter === 'still' ? 'is-active' : ''}`}
            aria-pressed={activeFilter === 'still'}
          >
            <span className="tab-square">{activeFilter === 'still' ? '■' : '□'}</span>
            <span className="tab-label">STILL (IMAGEM)</span>
            <span className="tab-count font-mono">[{stillCount}]</span>
          </button>

          <button
            onClick={() => setActiveFilter('video')}
            className={`sim-filter-tab ${activeFilter === 'video' ? 'is-active' : ''}`}
            aria-pressed={activeFilter === 'video'}
          >
            <span className="tab-square">{activeFilter === 'video' ? '■' : '□'}</span>
            <span className="tab-label">VÍDEO (MOTION)</span>
            <span className="tab-count font-mono">[{videoCount}]</span>
          </button>

          <button
            onClick={() => setActiveFilter('sound')}
            className={`sim-filter-tab ${activeFilter === 'sound' ? 'is-active' : ''}`}
            aria-pressed={activeFilter === 'sound'}
          >
            <span className="tab-square">{activeFilter === 'sound' ? '■' : '□'}</span>
            <span className="tab-label">SOM (17 FAIXAS)</span>
            <span className="tab-count font-mono">[{soundCount}]</span>
          </button>
        </nav>

        {/* 3. Links do Portfólio & Retorno à Sala 3D (Direita) */}
        <div className="archive-actions-block">
          <button
            onClick={() => setBioOpen(true)}
            className="portfolio-nav-btn font-mono"
            aria-label="Abrir biografia, currículo e declaração curatorial"
          >
            {isMobile ? '[BIO]' : '[BIO / ARTISTA]'}
          </button>

          <button
            onClick={() => setViewMode('media')}
            className="portfolio-nav-btn font-mono"
            aria-label="Abrir central de imprensa e download de masters"
          >
            {isMobile ? '[MÍDIA]' : '[MEDIA KIT]'}
          </button>

          <button
            onClick={handleReturnToSpatial}
            className="portfolio-return-btn font-mono"
            aria-label="Voltar para a caminhada livre em primeira pessoa na sala 3D"
          >
            <span className="return-icon">↵</span>
            <span>{isMobile ? 'SALA 3D' : 'SALA 3D [TAB]'}</span>
          </button>
        </div>
      </header>

      {/* 4. Paginação da Grade Geral (Aparece apenas quando 'all' tem mais de 8 obras) */}
      {activeFilter === 'all' && ARTWORKS_CATALOG.length > 8 && (
        <div className="archive-pagination-dock">
          <button
            disabled={archiveGridPage === 0}
            onClick={() => setArchiveGridPage(0)}
            className={`pagination-btn font-mono ${archiveGridPage === 0 ? 'is-active' : ''}`}
          >
            [◀ PÁGINA 01 // 8 OBRAS]
          </button>
          <span className="pagination-divider font-mono">·</span>
          <button
            disabled={archiveGridPage === 1}
            onClick={() => setArchiveGridPage(1)}
            className={`pagination-btn font-mono ${archiveGridPage === 1 ? 'is-active' : ''}`}
          >
            [PÁGINA 02 // ACERVO COMPLEMENTAR ▶]
          </button>
        </div>
      )}

      {/* 5. Console Sonoro das 17 Faixas Autorais (Exibido quando o filtro SOM está ativo) */}
      {activeFilter === 'sound' && (
        <aside className="archive-sound-showcase-drawer" aria-label="Catálogo das 17 Faixas Autorais">
          <div className="sound-drawer-header">
            <div className="sound-drawer-title-row font-mono">
              <span className="sound-pulse-dot" />
              <span className="sound-tag">[DISCOGRAFIA AUTORAL // 17 FAIXAS]</span>
              <span className="sound-track-playing font-mono">
                {isAudioPlaying ? `REPRODUZINDO: ${currentAudioTrack.trackNumber}. ${currentAudioTrack.title}` : 'CLIQUE EM UMA FAIXA PARA OUVIR'}
              </span>
            </div>
            <span className="sound-drawer-hint font-mono">ÁUDIO ESPACIAL COM PROCESSAMENTO MASTER ANALÓGICO</span>
          </div>

          <div className="sound-tracks-scrollable-list">
            {AUTHORIAL_TRACKS_CATALOG.map((track) => {
              const isSelected = currentAudioTrack.id === track.id;
              const isPlaying = isSelected && isAudioPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackToggle(track)}
                  className={`sound-track-row font-mono ${isSelected ? 'is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                >
                  <span className="track-num">{track.trackNumber}</span>
                  <div className="track-info">
                    <span className="track-name">{track.title}</span>
                    <span className="track-genre">{track.genre} · {track.bpm} BPM</span>
                  </div>
                  <span className="track-duration">{track.duration}</span>
                  <button
                    className={`track-play-toggle ${isPlaying ? 'is-playing' : ''}`}
                    aria-label={`Reproduzir faixa ${track.title}`}
                  >
                    {isPlaying ? '⏸ PAUSAR' : '▶ OUVIR'}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* 6. Rodapé Minimalista com Hint de Interação com Vitrines 3D */}
      <footer className="archive-portfolio-footer font-mono">
        <span className="footer-tip">
          <span className="tip-bracket">[</span>
          <span className="tip-cursor">☝</span>
          <span>{isMobile ? 'TOQUE EM QUALQUER VITRINE 3D PARA INSPECIONAR' : 'CLIQUE EM QUALQUER VITRINE 3D PARA INSPECIONAR NO MODO CINEMA'}</span>
          <span className="tip-bracket">]</span>
        </span>
      </footer>
    </div>
  );
};
