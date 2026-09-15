import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

export const CinemaView: React.FC = () => {
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);
  const closeCinema = useAppStore((s) => s.closeCinema);
  const inspectionZoom = useAppStore((s) => s.inspectionZoom);
  const isLoupeMode = useAppStore((s) => s.isLoupeMode);
  const toggleLoupeMode = useAppStore((s) => s.toggleLoupeMode);
  const isMobile = useAppStore((s) => s.isMobile);

  // Still sheets
  const stillArtworksList = useAppStore((s) => s.stillArtworksList);
  const currentStillSheetIndex = useAppStore((s) => s.currentStillSheetIndex);
  const nextStillSheet = useAppStore((s) => s.nextStillSheet);
  const prevStillSheet = useAppStore((s) => s.prevStillSheet);
  const setStillSheetIndex = useAppStore((s) => s.setStillSheetIndex);

  // Detecção de gestos no mobile
  const lastTapRef = React.useRef(0);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  // Video audio crossfade
  const wasAudioPlayingBeforeVideo = useAppStore((s) => s.wasAudioPlayingBeforeVideo);
  const soundVolume = useAppStore((s) => s.soundVolume);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Controles visíveis apenas ao hover na zona inferior
  const [controlsVisible, setControlsVisible] = useState(false);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const controlsTimerRef = React.useRef<number | null>(null);
  const idleHintTimerRef = React.useRef<number | null>(null);

  // Cursor inteligente: grab na zona da obra, pointer nos botões de UI
  const [cursorStyle, setCursorStyle] = useState<'grab' | 'grabbing' | 'default'>('grab');

  const showControls = () => {
    setControlsVisible(true);
    setShowIdleHint(false);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (idleHintTimerRef.current) clearTimeout(idleHintTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      // Após controles ocultarem, se permanecer ocioso por 2s, mostra dica sutil
      idleHintTimerRef.current = window.setTimeout(() => {
        setShowIdleHint(true);
      }, 2000);
    }, 2800);
  };

  // Função unificada para encerramento gracioso
  const handleCloseCinema = useCallback(() => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    closeCinema();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
  }, [closeCinema]);

  // Handlers de cursor inteligente
  const handleViewportMouseMove = useCallback((e: React.MouseEvent) => {
    showControls();
    const target = e.target as HTMLElement;
    const isUI = !!target?.closest?.('button, kbd, [role="dialog"] > div:not(.cinema-volumetric-aura), .cinema-top-actions, .cinema-unified-dock-container, .cinema-idle-hint');
    if (isUI) {
      setCursorStyle('default');
    } else {
      setCursorStyle(prev => prev === 'grabbing' ? 'grabbing' : 'grab');
    }
  }, []);

  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isUI = !!target?.closest?.('button, kbd, .cinema-top-actions, .cinema-unified-dock-container');
    if (!isUI) {
      setCursorStyle('grabbing');
    }
  }, []);

  const handleViewportMouseUp = useCallback(() => {
    setCursorStyle('grab');
  }, []);

  // Crossfade de áudio cinematográfico ao inspecionar obra de vídeo
  useEffect(() => {
    if (!cinemaArtwork) return;

    let fadeInterval: number | null = null;
    let vidElement: HTMLVideoElement | null = null;

    if (cinemaArtwork.medium === 'video') {
      soundEngine.fadeOut(1400);

      const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
      if (vid) {
        vidElement = vid;
        vid.muted = false;
        vid.volume = 0.0;
        setIsVideoMuted(false);
        vid.play().catch(() => {});

        const startTime = performance.now();
        const duration = 1200;
        const targetVol = 0.85;

        const rampIn = (now: number) => {
          const progress = Math.min(1.0, (now - startTime) / duration);
          vid.volume = progress * progress * targetVol;
          if (progress < 1.0) {
            fadeInterval = requestAnimationFrame(rampIn);
          }
        };
        fadeInterval = requestAnimationFrame(rampIn);
      }
    }

    // Mostra controles brevemente na entrada
    showControls();

    return () => {
      if (fadeInterval) cancelAnimationFrame(fadeInterval);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      if (idleHintTimerRef.current) clearTimeout(idleHintTimerRef.current);

      if (cinemaArtwork.medium === 'video') {
        if (vidElement) {
          const v = vidElement;
          const startVol = v.volume;
          const startTime = performance.now();
          const duration = 700;

          const rampOut = (now: number) => {
            const progress = Math.min(1.0, (now - startTime) / duration);
            v.volume = Math.max(0, startVol * (1.0 - progress));
            if (progress < 1.0) {
              requestAnimationFrame(rampOut);
            } else {
              v.muted = true;
            }
          };
          requestAnimationFrame(rampOut);
        }

        if (wasAudioPlayingBeforeVideo) {
          soundEngine.fadeIn(soundVolume, 1400);
        }
      }
    };
  }, [cinemaArtwork, wasAudioPlayingBeforeVideo, soundVolume]);

  // Atalhos de teclado — capture: true garante prioridade máxima
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!cinemaArtwork) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseCinema();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        e.stopPropagation();
        toggleLoupeMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'video') {
          const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
          if (vid) {
            vid.muted = !vid.muted;
            setIsVideoMuted(vid.muted);
          }
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'video') {
          const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
          if (vid) {
            if (vid.paused) { vid.play(); setIsVideoPlaying(true); }
            else { vid.pause(); setIsVideoPlaying(false); }
          }
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'still') { nextStillSheet(); }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'still') { prevStillSheet(); }
      }

      // Qualquer tecla revela os controles
      showControls();
    };

    window.addEventListener('keydown', handleGlobalKey, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleGlobalKey, { capture: true });
      try { document.body.style.cursor = 'default'; } catch {}
    };
  }, [cinemaArtwork, closeCinema, toggleLoupeMode, nextStillSheet, prevStillSheet]);

  if (!cinemaArtwork) return null;

  const isStill = cinemaArtwork.medium === 'still';
  const zoomPercent = Math.round(inspectionZoom * 100);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = performance.now();
    if (now - lastTapRef.current < 300) {
      toggleLoupeMode();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (touchStartRef.current && e.changedTouches.length > 0 && isStill) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) nextStillSheet();
        else prevStillSheet();
      }
    }
    touchStartRef.current = null;
    showControls();
  };

  return (
    <div
      className="cinema-feathered-viewport"
      role="dialog"
      aria-modal="true"
      aria-label={`Inspeção 3D da obra ${cinemaArtwork.title}`}
      onMouseMove={handleViewportMouseMove}
      onMouseDown={handleViewportMouseDown}
      onMouseUp={handleViewportMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: cursorStyle }}
    >
      {/* Vinheta atmosférica pura sem cortes lineares */}
      <div className="cinema-volumetric-aura" />

      {/* Botão Fechar Interativo Topo Direito (sempre clicável, substitui badge passiva) */}
      <div className="cinema-top-actions font-mono">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseCinema();
          }}
          className="cinema-top-close-btn"
          title="Fechar inspeção e voltar ao salão 3D (Tecla E ou ESC)"
          aria-label="Fechar inspeção da obra"
        >
          <span className="top-close-icon">✕</span>
          <span className="top-close-text">FECHAR</span>
          <kbd className="keycap keycap-xs">E</kbd>
        </button>
      </div>

      {/* ─── DOCK UNIFICADO DE INSPEÇÃO (Mesmo padrão estético do MinimalBottomBar) ─── */}
      <div className={`cinema-unified-dock-container ${controlsVisible ? 'is-visible' : ''}`}>
        <div className="cinema-unified-dock-card font-mono">
          {/* Lado Esquerdo: Identificação Curatorial */}
          <div className="cinema-dock-info">
            <div className="cinema-dock-badge-row">
              <span className="cinema-dock-series">
                [{cinemaArtwork.series.toUpperCase()}] · {cinemaArtwork.year}
              </span>
              <span className="cinema-dock-category">{cinemaArtwork.categoryLabel}</span>
            </div>
            <h2 className="cinema-dock-title">{cinemaArtwork.title}</h2>
            <p className="cinema-dock-desc">{cinemaArtwork.description}</p>
            <div className="cinema-dock-materials">
              <span className="materials-label">MATERIAIS:</span>
              <span>{cinemaArtwork.materials}</span>
            </div>
          </div>

          {/* Centro: Controles de Mídia & Zoom */}
          <div className="cinema-dock-controls">
            {/* Controles de Vídeo */}
            {!isStill && (
              <div className="cinema-dock-media-group">
                <button
                  type="button"
                  onClick={() => {
                    const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                    if (vid) {
                      if (vid.paused) { vid.play(); setIsVideoPlaying(true); }
                      else { vid.pause(); setIsVideoPlaying(false); }
                    }
                  }}
                  className="cinema-action-btn"
                  title="Pausar / Reproduzir (Espaço)"
                >
                  <span>{isVideoPlaying ? '❚❚' : '▶'}</span>
                  <span className="btn-label">{isVideoPlaying ? 'PAUSAR' : 'REPRODUZIR'}</span>
                  <kbd className="keycap keycap-xs">ESPAÇO</kbd>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                    if (vid) { vid.muted = !vid.muted; setIsVideoMuted(vid.muted); }
                  }}
                  className={`cinema-action-btn ${isVideoMuted ? 'is-muted' : ''}`}
                  title="Alternar áudio (M)"
                >
                  <span>{isVideoMuted ? '🔇' : '🔈'}</span>
                  <span className="btn-label">{isVideoMuted ? 'MUDO' : 'ÁUDIO'}</span>
                  <kbd className="keycap keycap-xs">M</kbd>
                </button>
              </div>
            )}

            {/* Navegação de Pranchetas (Stills com múltiplas imagens) */}
            {isStill && (cinemaArtwork.galleryImages || [cinemaArtwork.imageSrc]).length > 1 && (
              <div className="cinema-dock-sheets-group">
                <button
                  type="button"
                  onClick={() => prevStillSheet()}
                  className="cinema-sheet-arrow-btn"
                  title="Prancheta anterior (← / A)"
                  aria-label="Prancheta anterior"
                >
                  ← <kbd className="keycap keycap-xs">A</kbd>
                </button>
                <div className="cinema-sheet-dots-list">
                  {(cinemaArtwork.galleryImages || [cinemaArtwork.imageSrc]).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStillSheetIndex(idx)}
                      className={`cinema-sheet-dot ${idx === currentStillSheetIndex ? 'is-active' : ''}`}
                      title={`Imagem ${idx + 1}`}
                      aria-label={`Ir para imagem ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => nextStillSheet()}
                  className="cinema-sheet-arrow-btn"
                  title="Próxima prancheta (→ / D)"
                  aria-label="Próxima prancheta"
                >
                  <kbd className="keycap keycap-xs">D</kbd> →
                </button>
                <span className="cinema-sheet-badge">
                  {currentStillSheetIndex + 1}/{(cinemaArtwork.galleryImages || [cinemaArtwork.imageSrc]).length}
                </span>
              </div>
            )}

            {/* Controles de Lupa & Zoom */}
            <div className="cinema-dock-zoom-group">
              <button
                type="button"
                onClick={() => toggleLoupeMode()}
                className={`cinema-action-btn cinema-loupe-btn ${isLoupeMode ? 'is-active' : ''}`}
                title="Modo Lupa: zoom 300% com arraste livre (R)"
              >
                <span>⌕</span>
                <span className="btn-label">{isLoupeMode ? 'LUPA ATIVA' : 'LUPA (300%)'}</span>
                <kbd className="keycap keycap-xs">R</kbd>
              </button>

              <div className="cinema-zoom-meter" title="Nível de ampliação atual (Scroll para ajustar)">
                <span className="meter-label">ZOOM</span>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${Math.max(0, Math.min(100, ((inspectionZoom - 0.85) / (3.5 - 0.85)) * 100))}%` }}
                  />
                </div>
                <span className="meter-val">{zoomPercent}%</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Botão Principal de Saída */}
          <div className="cinema-dock-actions">
            <button
              type="button"
              onClick={handleCloseCinema}
              className="cinema-dock-close-btn"
              title="Fechar inspeção e devolver à vitrine (E / Q / ESC)"
            >
              <span className="close-x">✕</span>
              <span>FECHAR</span>
              <kbd className="keycap keycap-sm">E</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Dica discreta quando o usuário está ocioso e os controles sumiram */}
      {showIdleHint && !controlsVisible && !isMobile && (
        <div className="cinema-idle-hint font-mono" aria-hidden="true">
          <span>mova o mouse para revelar os controles</span>
        </div>
      )}
    </div>
  );
};
