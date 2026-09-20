import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

export const GalleryHeader: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setBioOpen = useAppStore((s) => s.setBioOpen);
  const warpToSector = useAppStore((s) => s.warpToSector);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const openMediaKit = useAppStore((s) => s.openMediaKit);

  const graphicsQuality = useAppStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useAppStore((s) => s.setGraphicsQuality);
  const currentFps = useAppStore((s) => s.currentFps);
  const performanceSuggestion = useAppStore((s) => s.performanceSuggestion);

  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);
  const takeCD = useAppStore((s) => s.takeCD);
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);
  const isMobile = useAppStore((s) => s.isMobile);
  const isGlobalMuted = useAppStore((s) => s.isGlobalMuted);
  const toggleGlobalMute = useAppStore((s) => s.toggleGlobalMute);
  const hasInspectedCDBefore = useAppStore((s) => s.hasInspectedCDBefore);

  // Atalhos de teclado intuitivos para não obrigar o usuário a apertar ESC para clicar com o mouse
  useEffect(() => {
    const handleHeaderKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'KeyG' && !e.metaKey && !e.ctrlKey) {
        setGraphicsQuality(graphicsQuality === 'high' ? 'med' : 'high');
      } else if (e.code === 'KeyT' && !e.metaKey && !e.ctrlKey) {
        toggleTheme();
      } else if (e.code === 'KeyC' && !e.metaKey && !e.ctrlKey) {
        setBioOpen(true);
      } else if (e.code === 'KeyM' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        soundEngine.toggleGlobalMute();
        toggleGlobalMute();
      }
    };

    window.addEventListener('keydown', handleHeaderKey);
    return () => window.removeEventListener('keydown', handleHeaderKey);
  }, [graphicsQuality, setGraphicsQuality, toggleTheme, setBioOpen, viewMode, setViewMode]);

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      soundEngine.pause();
      setIsAudioPlaying(false);
    } else {
      soundEngine.playTrackPreview(currentAudioTrack);
      setIsAudioPlaying(true);
    }
  };

  const handleOpenCD = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHoldingCD) {
      takeCD();
    }
  };

  return (
    <header className={`minimal-feathered-header ${cinemaArtwork ? 'is-hidden-in-cinema' : ''}`} role="banner">
      {/* Esquerda: Marca GIGANTERA // Pavilhão Digital */}
      <div className="header-brand-group">
        <button
          onClick={() => warpToSector('entrance-audio')}
          className="header-brand-name"
          title="Reiniciar posição no início do pavilhão"
        >
          GIGANTERA
        </button>
        {!isMobile && (
          <>
            <span className="header-slash font-mono">/</span>
            <span className="header-pavilion-tag font-mono">PAVILHÃO DIGITAL</span>
          </>
        )}
      </div>

      {/* Centro: Cápsula Dinâmica "Now Playing" */}
      {(isAudioPlaying || hasInspectedCDBefore) && (
        <div
          className={`header-now-playing-capsule font-mono ${!isAudioPlaying ? 'is-paused' : ''} ${isGlobalMuted ? 'is-muted' : ''}`}
          onClick={handleOpenCD}
          title={isAudioPlaying ? "Faixa em reprodução · Toque para abrir o CD" : "Música pausada · Toque para abrir o CD"}
        >
          {/* Barrinhas animadas do equalizador ou estáticas quando pausado */}
          <div className="header-sound-equalizer" aria-hidden="true">
            <span className="eq-bar eq-bar-1" style={{ animationPlayState: isAudioPlaying && !isGlobalMuted ? 'running' : 'paused' }} />
            <span className="eq-bar eq-bar-2" style={{ animationPlayState: isAudioPlaying && !isGlobalMuted ? 'running' : 'paused' }} />
            <span className="eq-bar eq-bar-3" style={{ animationPlayState: isAudioPlaying && !isGlobalMuted ? 'running' : 'paused' }} />
            <span className="eq-bar eq-bar-4" style={{ animationPlayState: isAudioPlaying && !isGlobalMuted ? 'running' : 'paused' }} />
          </div>

          <div className="header-track-info" style={{ opacity: isAudioPlaying && !isGlobalMuted ? 1 : 0.6 }}>
            {!isMobile && <span className="header-track-label">{isAudioPlaying && !isGlobalMuted ? 'TOCANDO:' : 'PAUSADO:'}</span>}
            <span className="header-track-title">
              {currentAudioTrack.title.toUpperCase()}
            </span>
            {!isMobile && <span className="header-track-bpm">[{currentAudioTrack.bpm} BPM]</span>}
          </div>

          <button
            onClick={handleAudioToggle}
            className="header-pause-btn"
            title="Pausar / Retomar áudio"
            aria-label="Pausar áudio"
          >
            {isAudioPlaying ? '❚❚' : '▶'}
          </button>
        </div>
      )}

      {/* Direita: Qualidade Gráfica com FPS integrado, Tema & Bio do Artista */}
      <div className="header-actions-group font-mono">
        {/* Pílula de Fidelidade Gráfica: MÉDIO / ALTO */}
        <div className="header-quality-control header-minimal-btn" style={{ padding: '0 4px', gap: '4px' }}>
          <div
            className="header-fps-badge"
            title={`Opções gráficas (Taxa atual: ${currentFps} FPS)`}
            style={{ border: 'none', background: 'transparent', padding: '0 4px', opacity: 0.7 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
          </div>

          <div className="quality-segmented-toggle" role="group" aria-label="Ajuste de fidelidade gráfica" style={{ border: 'none', background: 'transparent' }}>
            <button
              onClick={() => setGraphicsQuality('med')}
              className={`quality-seg-btn ${graphicsQuality === 'med' ? 'is-active' : ''}`}
              title="Modo Médio: Equilíbrio ótimo entre fidelidade e fluidez"
            >
              <span>{isMobile ? 'MED' : 'MÉDIO'}</span>
            </button>
            <button
              onClick={() => setGraphicsQuality('high')}
              className={`quality-seg-btn ${graphicsQuality === 'high' ? 'is-active' : ''}`}
              title="Modo Alto: Fidelidade máxima, sombras e reflexões aveludadas"
            >
              <span>{isMobile ? 'ALT' : 'ALTO'}</span>
            </button>
            {!isMobile && <kbd className="header-keycap-hint" title="Pressione G para alternar gráficos">G</kbd>}
          </div>
        </div>

        {/* Alternador de Tema Claro / Escuro */}
        <button
          onClick={toggleTheme}
          className="header-minimal-btn header-theme-btn"
          title={theme === 'dark' ? 'Alternar para Galeria Clara' : 'Alternar para Galeria Escura'}
        >
          <span>{theme === 'dark' ? '☼' : '☾'}</span>
          {!isMobile && <kbd className="header-keycap-hint">T</kbd>}
        </button>

        {/* Botão de saída visível apenas quando o usuário está dentro da Área de Mídia */}
        {viewMode === 'media' && (
          <button
            onClick={() => setViewMode('spatial')}
            className="header-minimal-btn header-media-btn is-active"
            title="Sair da Área de Mídia e voltar para a Sala 3D"
          >
            <span>[✕ SAIR]</span>
          </button>
        )}

        {/* Bio do Artista e Contato */}
        <button
          onClick={() => setBioOpen(true)}
          className="header-minimal-btn header-bio-btn"
          title="Ver biografia e contato do artista"
        >
          <span>{isMobile ? 'SOBRE' : 'SOBRE / CONTATO'}</span>
          {!isMobile && <kbd className="header-keycap-hint">C</kbd>}
        </button>
      </div>
    </header>
  );
};
