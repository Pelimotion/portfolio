import React, { useEffect, useState } from 'react';
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
  const controlsTimerRef = React.useRef<number | null>(null);

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2800);
  };

  // Função unificada para encerramento gracioso
  const handleCloseCinema = () => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    closeCinema();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
  };

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
        if (cinemaArtwork.medium === 'video') {
          e.preventDefault();
          const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
          if (vid) {
            vid.muted = !vid.muted;
            setIsVideoMuted(vid.muted);
          }
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        if (cinemaArtwork.medium === 'video') {
          e.preventDefault();
          const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
          if (vid) {
            if (vid.paused) { vid.play(); setIsVideoPlaying(true); }
            else { vid.pause(); setIsVideoPlaying(false); }
          }
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (cinemaArtwork.medium === 'still') { e.preventDefault(); nextStillSheet(); }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (cinemaArtwork.medium === 'still') { e.preventDefault(); prevStillSheet(); }
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
      onMouseMove={showControls}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Vinheta atmosférica — fundo escuro que isola a obra */}
      <div className="cinema-volumetric-aura" />

      {/* ─── ZONA B — Painel Curatorial Inferior Esquerdo ─── */}
      <div className={`cinema-info-panel-left ${controlsVisible ? 'is-visible' : ''}`}>
        <span className="cinema-series-tag font-mono">
          [{cinemaArtwork.series.toUpperCase()}] · {cinemaArtwork.year}
        </span>
        <h2 className="cinema-title">{cinemaArtwork.title}</h2>
        <p className="cinema-desc font-mono">{cinemaArtwork.description}</p>
        <div className="cinema-meta-row font-mono">
          <span className="meta-disc">{cinemaArtwork.categoryLabel}</span>
          <span className="meta-sep">/</span>
          <span className="meta-mat">{cinemaArtwork.materials}</span>
        </div>
      </div>

      {/* ─── ZONA C — Controles Mínimos Inferior Direito ─── */}
      <div className={`cinema-controls-panel-right font-mono ${controlsVisible ? 'is-visible' : ''}`}>

        {/* Navegação de Pranchetas — só para stills */}
        {isStill && stillArtworksList.length > 1 && (
          <div className="cinema-sheet-nav">
            <button
              onClick={() => prevStillSheet()}
              className="cinema-ctrl-btn"
              title="Prancheta anterior (← / A)"
              aria-label="Prancheta anterior"
            >←</button>
            <div className="cinema-sheet-dots">
              {stillArtworksList.map((art, idx) => (
                <button
                  key={art.id}
                  onClick={() => setStillSheetIndex(idx)}
                  className={`cinema-dot-btn ${idx === currentStillSheetIndex ? 'is-active' : ''}`}
                  title={art.title}
                  aria-label={art.title}
                />
              ))}
            </div>
            <button
              onClick={() => nextStillSheet()}
              className="cinema-ctrl-btn"
              title="Próxima prancheta (→ / D)"
              aria-label="Próxima prancheta"
            >→</button>
            <span className="cinema-sheet-counter">
              {currentStillSheetIndex + 1}/{stillArtworksList.length}
            </span>
          </div>
        )}

        {/* Controles de vídeo */}
        {!isStill && (
          <div className="cinema-video-controls">
            <button
              onClick={() => {
                const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                if (vid) {
                  if (vid.paused) { vid.play(); setIsVideoPlaying(true); }
                  else { vid.pause(); setIsVideoPlaying(false); }
                }
              }}
              className="cinema-ctrl-btn"
              title="Pausar / Reproduzir (Espaço)"
            >
              {isVideoPlaying ? '❚❚' : '▶'}
            </button>
            <button
              onClick={() => {
                const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                if (vid) { vid.muted = !vid.muted; setIsVideoMuted(vid.muted); }
              }}
              className="cinema-ctrl-btn"
              title="Alternar áudio (M)"
            >
              {isVideoMuted ? '🔇' : '🔈'}
            </button>
          </div>
        )}

        {/* Barra de Zoom visual */}
        <div className="cinema-zoom-row">
          <span className="cinema-zoom-label">ZOOM</span>
          <div className="cinema-zoom-track">
            <div
              className="cinema-zoom-fill"
              style={{ width: `${Math.max(0, Math.min(100, ((inspectionZoom - 0.85) / (3.5 - 0.85)) * 100))}%` }}
            />
          </div>
          <span className="cinema-zoom-pct">{zoomPercent}%</span>
        </div>

        {/* Botões de ação: Lupa e Fechar */}
        <div className="cinema-action-btns">
          <button
            onClick={() => toggleLoupeMode()}
            className={`cinema-ctrl-btn cinema-lupa-btn ${isLoupeMode ? 'is-active' : ''}`}
            title="Modo Lupa: zoom 300% + pan (R)"
          >
            <span>⌕</span>
            <span className="cinema-btn-label">{isLoupeMode ? '100%' : 'LUPA'}</span>
          </button>

          <button
            onClick={handleCloseCinema}
            className="cinema-ctrl-btn cinema-close-btn"
            title="Devolver à vitrine (E / Q / ESC)"
            aria-label="Fechar inspeção"
          >
            <span>✕</span>
            <span className="cinema-btn-label">FECHAR</span>
          </button>
        </div>

        {/* Hint de teclado discreto */}
        {!isMobile && (
          <div className="cinema-key-hints">
            <kbd className="keycap keycap-sm">E</kbd>
            <span> fechar · </span>
            <kbd className="keycap keycap-sm">R</kbd>
            <span> lupa · </span>
            <span>scroll zoom · duplo-clique 100%</span>
          </div>
        )}
      </div>

      {/* Hint de lupa ativa — pan com mouse */}
      {isLoupeMode && (
        <div className="cinema-loupe-active-badge font-mono" aria-live="polite">
          <span className="loupe-icon">⌕</span>
          <span>LUPA ATIVA — ARRASTE PARA EXPLORAR</span>
        </div>
      )}
    </div>
  );
};
