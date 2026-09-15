import React from 'react';
import { useAppStore } from '../../core/store';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { MediumType, Artwork } from '../../types/art';
import { soundEngine } from '../../core/soundEngine';

export const ArchiveIndex: React.FC = () => {
  const activeFilter = useAppStore((s) => s.activeFilter);
  const setActiveFilter = useAppStore((s) => s.setActiveFilter);
  const openCinema = useAppStore((s) => s.openCinema);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setCDPOVOpen = useAppStore((s) => s.setCDPOVOpen);
  const setCurrentAudioTrack = useAppStore((s) => s.setCurrentAudioTrack);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);

  const filteredArtworks = ARTWORKS_CATALOG.filter((art) => {
    if (activeFilter === 'all') return true;
    return art.medium === activeFilter;
  });

  const handleCardClick = (art: Artwork) => {
    setViewMode('spatial');
    openCinema(art);
  };

  const handleTrackClick = async (track: any) => {
    setCurrentAudioTrack(track);
    await soundEngine.playTrackPreview(track);
    setIsAudioPlaying(true);
    setCDPOVOpen(true);
  };

  return (
    <section className="archive-index-section" aria-label="Catálogo Geral e Portfólio em Grade">
      <div className="archive-inner">
        {/* Cabeçalho do Catálogo */}
        <div className="archive-header">
          <div className="archive-header-title">
            <span className="archive-label font-mono">[CATALOG & ARCHIVE // GIGANTERA]</span>
            <h2 className="archive-heading">Acervo Curatorial</h2>
            <p className="archive-subtext">
              Navegação simplificada em grade editorial de alta velocidade. Obras organizadas por matéria, cinemática e as 17 faixas autorais.
            </p>
          </div>

          {/* Filtros por Categoria */}
          <nav className="archive-filter-tabs" aria-label="Filtros de mídia">
            {(['all', 'still', 'video', 'sound'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              const count =
                filter === 'all'
                  ? ARTWORKS_CATALOG.length + AUTHORIAL_TRACKS_CATALOG.length
                  : filter === 'sound'
                  ? AUTHORIAL_TRACKS_CATALOG.length
                  : ARTWORKS_CATALOG.filter((a) => a.medium === filter).length;

              const label =
                filter === 'all'
                  ? 'TODAS AS OBRAS'
                  : filter === 'still'
                  ? 'STILL (IMAGEM)'
                  : filter === 'video'
                  ? 'VÍDEO (MOTION)'
                  : 'SOM (17 FAIXAS)';

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as 'all' | MediumType)}
                  className={`archive-filter-btn ${isActive ? 'is-active' : ''}`}
                >
                  <span className="filter-mark">{isActive ? '■' : '□'}</span>
                  <span>{label}</span>
                  <span className="filter-count font-mono">[{count}]</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Grade de Obras Visuais (Still & Video) */}
        {(activeFilter === 'all' || activeFilter === 'still' || activeFilter === 'video') && (
          <div className="archive-grid">
            {filteredArtworks.map((art, idx) => (
              <article
                key={art.id}
                onClick={() => handleCardClick(art)}
                className="archive-card"
                tabIndex={0}
                role="button"
                aria-label={`Inspecionar obra ${art.title}`}
              >
                <div className="card-media-wrapper">
                  <span className="card-bracket cb-tl">+</span>
                  <span className="card-bracket cb-tr">+</span>
                  <span className="card-bracket cb-bl">+</span>
                  <span className="card-bracket cb-br">+</span>

                  {art.medium === 'video' && art.videoSrc ? (
                    <video
                      src={art.videoSrc}
                      poster={art.imageSrc}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="card-video"
                    />
                  ) : (
                    <img
                      src={art.imageSrc}
                      alt={art.title}
                      loading="lazy"
                      className="card-thumb"
                    />
                  )}

                  <div className="card-media-badge font-mono">
                    {art.medium.toUpperCase()} // 0{idx + 1}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-tag-row font-mono">
                    <span>[{art.series.toUpperCase()}]</span>
                    <span>{art.year}</span>
                  </div>

                  <h3 className="card-title">{art.title}</h3>
                  <p className="card-description">{art.description}</p>

                  <div className="card-footer-meta font-mono">
                    <span className="meta-category">{art.categoryLabel}</span>
                    <span className="meta-action">[MODO CINEMA →]</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Grade das 17 Faixas Autorais (Quando selecionado Som ou Todas) */}
        {(activeFilter === 'all' || activeFilter === 'sound') && (
          <div className="archive-audio-tracks-block">
            <div className="audio-section-header font-mono">
              <span className="audio-sec-tag">[DISCOGRAFIA AUTORAL // 17 FAIXAS NO CD JEWEL CASE]</span>
              <span className="audio-sec-sub">CLIQUE P/ ABRIR NO CD EM POV COM PREVIEW INSTANTÂNEO</span>
            </div>

            <div className="archive-tracks-grid">
              {AUTHORIAL_TRACKS_CATALOG.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className="archive-track-card font-mono"
                  role="button"
                  tabIndex={0}
                >
                  <span className="track-card-num">{track.trackNumber}</span>
                  <div className="track-card-content">
                    <h4 className="track-card-title">{track.title}</h4>
                    <span className="track-card-genre">{track.genre} · {track.bpm} BPM</span>
                  </div>
                  <span className="track-card-dur">{track.duration}</span>
                  <span className="track-card-play-btn">[OUVIR PREVIEW]</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
