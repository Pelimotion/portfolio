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

  // Atalhos de teclado intuitivos para não obrigar o usuário a apertar ESC para clicar com o mouse
  useEffect(() => {
    const handleHeaderKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'KeyG' && !e.metaKey && !e.ctrlKey) {
        if (graphicsQuality === 'light') setGraphicsQuality('med');
        else if (graphicsQuality === 'med') setGraphicsQuality('high');
        else setGraphicsQuality('light');
      } else if (e.code === 'KeyT' && !e.metaKey && !e.ctrlKey) {
        toggleTheme();
      } else if (e.code === 'KeyB' && !e.metaKey && !e.ctrlKey) {
        setBioOpen(true);
      } else if (e.code === 'KeyM' && !e.metaKey && !e.ctrlKey) {
        setViewMode(viewMode === 'media' ? 'spatial' : 'media');
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
    <header className="minimal-feathered-header" role="banner">
      {/* Esquerda: Marca GIGANTERA // Pavilhão Digital */}
      <div className="header-brand-group">
        <button
          onClick={() => warpToSector('entrance-audio')}
          className="header-brand-name"
          title="Reiniciar posição no início do pavilhão"
        >
          GIGANTERA
        </button>
        <span className="header-slash font-mono">/</span>
        <span className="header-pavilion-tag font-mono">PAVILHÃO DIGITAL</span>
      </div>

      {/* Centro: Cápsula Dinâmica "Now Playing" — APARECE SOMENTE QUANDO HÁ ÁUDIO TOCANDO */}
      {isAudioPlaying && (
        <div
          className="header-now-playing-capsule font-mono"
          onClick={handleOpenCD}
          title="Faixa em reprodução · Clique para abrir o álbum Jewel Case em primeira pessoa"
        >
          {/* Barrinhas animadas do equalizador */}
          <div className="header-sound-equalizer" aria-hidden="true">
            <span className="eq-bar eq-bar-1" />
            <span className="eq-bar eq-bar-2" />
            <span className="eq-bar eq-bar-3" />
            <span className="eq-bar eq-bar-4" />
          </div>

          <div className="header-track-info">
            <span className="header-track-label">TOCANDO:</span>
            <span className="header-track-title">
              {currentAudioTrack.trackNumber}. {currentAudioTrack.title.toUpperCase()}
            </span>
            <span className="header-track-bpm">[{currentAudioTrack.bpm} BPM]</span>
          </div>

          <button
            onClick={handleAudioToggle}
            className="header-pause-btn"
            title="Pausar / Retomar áudio"
            aria-label="Pausar áudio"
          >
            ❚❚
          </button>
        </div>
      )}

      {/* Direita: Qualidade Gráfica com FPS integrado, Tema & Bio do Artista */}
      <div className="header-actions-group font-mono">
        {/* Pílula de Fidelidade Gráfica: BAIXO / MÉDIO / ALTO com contador de FPS integrado */}
        <div className="header-quality-control">
          <div
            className="header-fps-badge"
            title={`Taxa atual: ${currentFps} FPS ${currentFps < 35 ? '(Clique para otimizar gráficos ou aperte G)' : ''}`}
            onClick={() => {
              if (currentFps < 35 && graphicsQuality !== 'light') {
                setGraphicsQuality(graphicsQuality === 'high' ? 'med' : 'light');
              }
            }}
          >
            <span className={`fps-indicator-dot ${currentFps < 35 ? 'fps-warning' : 'fps-good'}`} />
            <span className="fps-number">{currentFps} FPS</span>
          </div>

          <div className="quality-segmented-toggle" role="group" aria-label="Ajuste de fidelidade gráfica">
            <button
              onClick={() => setGraphicsQuality('light')}
              className={`quality-seg-btn ${graphicsQuality === 'light' ? 'is-active' : ''} ${currentFps < 25 && graphicsQuality !== 'light' ? 'is-recommended' : ''}`}
              title="Modo Baixo: Maior fluidez para notebooks e telas de alta resolução"
            >
              <span>BAIXO</span>
              {currentFps < 25 && graphicsQuality !== 'light' && <span className="rec-micro-dot" title="Sugerido para seu hardware" />}
            </button>
            <button
              onClick={() => setGraphicsQuality('med')}
              className={`quality-seg-btn ${graphicsQuality === 'med' ? 'is-active' : ''} ${currentFps >= 25 && currentFps < 38 && graphicsQuality === 'high' ? 'is-recommended' : ''}`}
              title="Modo Médio: Equilíbrio ótimo entre fidelidade e fluidez"
            >
              <span>MÉDIO</span>
              {currentFps >= 25 && currentFps < 38 && graphicsQuality === 'high' && <span className="rec-micro-dot" title="Sugerido para seu hardware" />}
            </button>
            <button
              onClick={() => setGraphicsQuality('high')}
              className={`quality-seg-btn ${graphicsQuality === 'high' ? 'is-active' : ''}`}
              title="Modo Alto: Fidelidade máxima, sombras e reflexões aveludadas"
            >
              <span>ALTO</span>
            </button>
            <kbd className="header-keycap-hint" title="Pressione G para alternar gráficos">G</kbd>
          </div>
        </div>

        {/* Alternador de Tema Claro / Escuro com atalho [T] */}
        <button
          onClick={toggleTheme}
          className="header-minimal-btn header-theme-btn"
          title={theme === 'dark' ? 'Alternar para Galeria Clara (T)' : 'Alternar para Galeria Escura (T)'}
        >
          <span>{theme === 'dark' ? '☼ CLARO' : '☾ ESCURO'}</span>
          <kbd className="header-keycap-hint">T</kbd>
        </button>

        {/* Botão de saída visível apenas quando o usuário está dentro da Área de Mídia */}
        {viewMode === 'media' && (
          <button
            onClick={() => setViewMode('spatial')}
            className="header-minimal-btn header-media-btn is-active"
            title="Sair da Área de Mídia e voltar para a Sala 3D"
          >
            <span>[✕ SAIR DA MÍDIA]</span>
          </button>
        )}

        {/* Bio do Artista e Contato com atalho [B] */}
        <button
          onClick={() => setBioOpen(true)}
          className="header-minimal-btn"
          title="Declaração conceitual e contato direto (B)"
        >
          <span>[CONTATO]</span>
          <kbd className="header-keycap-hint">B</kbd>
        </button>
      </div>
    </header>
  );
};
