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

  // Detecção de gestos no mobile (toque duplo para lupa e swipe para pranchetas)
  const lastTapRef = React.useRef(0);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  // Video audio crossfade
  const wasAudioPlayingBeforeVideo = useAppStore((s) => s.wasAudioPlayingBeforeVideo);
  const soundVolume = useAppStore((s) => s.soundVolume);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Crossfade de áudio aveludado e cinematográfico ao inspecionar obra de vídeo
  useEffect(() => {
    if (!cinemaArtwork) return;

    let fadeInterval: number | null = null;
    let vidElement: HTMLVideoElement | null = null;

    if (cinemaArtwork.medium === 'video') {
      // Fade-out suave de 1.4s da música de fundo (CD / galeria)
      soundEngine.fadeOut(1400);

      // Inicia áudio do vídeo com rampa de volume suave de 0.0 a 0.85
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
          // Easing suave (quad)
          vid.volume = progress * progress * targetVol;
          if (progress < 1.0) {
            fadeInterval = requestAnimationFrame(rampIn);
          }
        };
        fadeInterval = requestAnimationFrame(rampIn);
      }
    }

    return () => {
      if (fadeInterval) cancelAnimationFrame(fadeInterval);

      // Ao sair do vídeo, fade-out gradual do áudio do vídeo antes de pausar
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

        // Retorno suave da trilha sonora da galeria
        if (wasAudioPlayingBeforeVideo) {
          soundEngine.fadeIn(soundVolume, 1400);
        }
      }
    };
  }, [cinemaArtwork, wasAudioPlayingBeforeVideo, soundVolume]);

  // Escuta global prioritária (capture: true) para garantir que atalhos nunca falhem
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!cinemaArtwork) return;

      // Desativar ações se estiver focado em campo de texto
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      // Atalhos táteis dedicados: E ou Q para devolver a obra sem sair do POV
      if (e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        e.stopPropagation();
        try {
          document.body.style.cursor = 'default';
        } catch {}
        closeCinema();
      } else if (e.key === 'Escape') {
        // Fallback gracioso para ESC mantendo segurança
        e.preventDefault();
        closeCinema();
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
            if (vid.paused) {
              vid.play();
              setIsVideoPlaying(true);
            } else {
              vid.pause();
              setIsVideoPlaying(false);
            }
          }
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (cinemaArtwork.medium === 'still') {
          e.preventDefault();
          nextStillSheet();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (cinemaArtwork.medium === 'still') {
          e.preventDefault();
          prevStillSheet();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleGlobalKey, { capture: true });
      try {
        document.body.style.cursor = 'default';
      } catch {}
    };
  }, [cinemaArtwork, closeCinema, toggleLoupeMode, nextStillSheet, prevStillSheet]);

  if (!cinemaArtwork) return null;

  const isStill = cinemaArtwork.medium === 'still';

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

    const handleTouchEnd = (e: React.TouchEvent) => {
      const now = performance.now();
      // Toque duplo (< 300ms) para alternar zoom lupa
      if (now - lastTapRef.current < 300) {
        toggleLoupeMode();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // Swipe horizontal para folhear pranchetas de Still
      if (touchStartRef.current && e.changedTouches.length > 0 && isStill) {
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) {
            nextStillSheet();
          } else {
            prevStillSheet();
          }
        }
      }
      touchStartRef.current = null;
    };

    return (
      <div
        className="cinema-feathered-viewport"
        role="dialog"
        aria-modal="true"
        aria-label={`Inspeção 3D da obra ${cinemaArtwork.title}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Vinheta Atmosférica Suave em Feather */}
        <div className="cinema-volumetric-aura" />

        {/* Dica Superior Minimalista com Keycaps Físicas e Ícones Táteis */}
        <header className="cinema-top-inspection-hud font-mono">
          <div className="inspection-cue-pill">
            {isMobile ? (
              <div className="mobile-cinema-cue-row font-mono">
                <button
                  onClick={() => toggleLoupeMode()}
                  className={`cue-action-btn ${isLoupeMode ? 'is-loupe-active' : ''}`}
                  title="Modo Lupa"
                >
                  <span className="keycap font-bold">⌕</span>
                  <span className="keycap-label">{isLoupeMode ? '100%' : 'LUPA'}</span>
                </button>

                {!isStill && (
                  <button
                    onClick={() => {
                      const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                      if (vid) {
                        vid.muted = !vid.muted;
                        setIsVideoMuted(vid.muted);
                      }
                    }}
                    className="cue-action-btn"
                    title="Alternar áudio"
                  >
                    <span className="keycap font-bold">{isVideoMuted ? '🔇' : '🔈'}</span>
                    <span className="keycap-label">{isVideoMuted ? 'MUTADO' : 'SOM'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    try { document.body.style.cursor = 'default'; } catch {}
                    closeCinema();
                  }}
                  className="cue-esc-btn"
                  title="Fechar"
                >
                  <span className="keycap keycap-coral font-bold">✕</span>
                  <span className="keycap-label">FECHAR</span>
                </button>
              </div>
            ) : isStill ? (
            <>
              <span className="keycap-group">
                <kbd className="keycap">←</kbd>
                <kbd className="keycap">→</kbd>
                <span className="keycap-label">FOLHEAR</span>
              </span>
              <span className="cue-sep">·</span>
              <span className="mouse-badge">
                <span className="mouse-icon mouse-wheel" />
                <span>ZOOM {(inspectionZoom * 100).toFixed(0)}%</span>
              </span>
              <span className="cue-sep">·</span>
              <button
                onClick={() => toggleLoupeMode()}
                className={`cue-action-btn ${isLoupeMode ? 'is-loupe-active' : ''}`}
                title="Alternar entre Visão Total e Modo Lupa de Crítico de Arte (R)"
              >
                <kbd className="keycap">R</kbd>
                <span className="keycap-label">{isLoupeMode ? 'ENQUADRAR (100%)' : 'MODO LUPA (300%)'}</span>
              </button>
              {isLoupeMode && (
                <>
                  <span className="cue-sep">·</span>
                  <span className="loupe-hud-badge">
                    <span className="loupe-icon">⌕</span>
                    <span>LUPA ATIVA: ARRASTE O MOUSE P/ EXPLORAR</span>
                  </span>
                </>
              )}
              <span className="cue-sep">·</span>
              <button
                onClick={() => {
                  try {
                    document.body.style.cursor = 'default';
                  } catch {}
                  closeCinema();
                }}
                className="cue-esc-btn"
                title="Sair da inspeção e devolver a prancheta à vitrine (E ou Q)"
              >
                <kbd className="keycap keycap-coral">E</kbd>
                <span className="keycap-label">/</span>
                <kbd className="keycap keycap-coral">Q</kbd>
                <span className="keycap-label">DEVOLVER</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                  if (vid) {
                    if (vid.paused) {
                      vid.play();
                      setIsVideoPlaying(true);
                    } else {
                      vid.pause();
                      setIsVideoPlaying(false);
                    }
                  }
                }}
                className="cue-action-btn"
                title="Pausar / Reproduzir simulação cinética (Espaço)"
              >
                <kbd className="keycap">ESPAÇO</kbd>
                <span className="keycap-label">{isVideoPlaying ? 'PAUSAR' : 'REPRODUZIR'}</span>
              </button>
              <span className="cue-sep">·</span>
              <button
                onClick={() => {
                  const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
                  if (vid) {
                    vid.muted = !vid.muted;
                    setIsVideoMuted(vid.muted);
                  }
                }}
                className="cue-action-btn"
                title="Alternar áudio da obra (M)"
              >
                <kbd className="keycap">M</kbd>
                <span className="keycap-label">{isVideoMuted ? 'MUTADO' : 'ÁUDIO'}</span>
              </button>
              <span className="cue-sep">·</span>
              <span className="mouse-badge">
                <span className="mouse-icon mouse-wheel" />
                <span>ZOOM {(inspectionZoom * 100).toFixed(0)}%</span>
              </span>
              <span className="cue-sep">·</span>
              <button
                onClick={() => toggleLoupeMode()}
                className={`cue-action-btn ${isLoupeMode ? 'is-loupe-active' : ''}`}
                title="Alternar entre Visão Total e Modo Lupa (R)"
              >
                <kbd className="keycap">R</kbd>
                <span className="keycap-label">{isLoupeMode ? 'ENQUADRAR (100%)' : 'MODO LUPA (300%)'}</span>
              </button>
              <span className="cue-sep">·</span>
              <button
                onClick={() => {
                  try {
                    document.body.style.cursor = 'default';
                  } catch {}
                  closeCinema();
                }}
                className="cue-esc-btn"
                title="Sair da tela cinema (E ou Q)"
              >
                <kbd className="keycap keycap-coral">E</kbd>
                <span className="keycap-label">/</span>
                <kbd className="keycap keycap-coral">Q</kbd>
                <span className="keycap-label">SAIR</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Barra de Folheação Inferior / Pranchetas de Still */}
      {isStill && stillArtworksList.length > 0 && (
        <div className="still-prancheta-dock font-mono">
          <button
            onClick={() => prevStillSheet()}
            className="sheet-nav-btn"
            title="Prancheta anterior (Seta Esquerda / A)"
          >
            <kbd className="keycap">←</kbd>
          </button>

          <div className="sheet-selector-pills">
            <span className="sheet-counter-tag">
              PRANCHETA {currentStillSheetIndex + 1} / {stillArtworksList.length}
            </span>
            <div className="sheet-dots-row">
              {stillArtworksList.map((art, idx) => (
                <button
                  key={art.id}
                  onClick={() => setStillSheetIndex(idx)}
                  className={`sheet-dot-btn ${idx === currentStillSheetIndex ? 'is-active' : ''}`}
                  title={art.title}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => nextStillSheet()}
            className="sheet-nav-btn"
            title="Próxima prancheta (Seta Direita / D)"
          >
            <kbd className="keycap">→</kbd>
          </button>
        </div>
      )}

      {/* Painel Curatorial no Rodapé com Proteção Ultra-Soft em Feather/Blur */}
      <footer className="cinema-bottom-feather-bar">
        <div className="cinema-info-left">
          <span className="cinema-series-tag font-mono">
            [{cinemaArtwork.series.toUpperCase()}] · {cinemaArtwork.year}
          </span>
          <h2 className="cinema-title">{cinemaArtwork.title}</h2>
          <p className="cinema-desc font-mono">{cinemaArtwork.description}</p>
        </div>

        <div className="cinema-info-center font-mono">
          <span className="meta-disc">{cinemaArtwork.categoryLabel}</span>
          <span className="meta-sep">/</span>
          <span className="meta-mat">{cinemaArtwork.materials}</span>
        </div>

        <div className="cinema-info-right font-mono">
          <button
            onClick={() => {
              try {
                document.body.style.cursor = 'default';
              } catch {}
              closeCinema();
            }}
            className="cinema-return-btn font-mono"
            aria-label="Sair do modo de inspeção e retornar à galeria livre (E ou Q)"
          >
            <kbd className="keycap keycap-coral">E</kbd>
            <span className="keycap-label">/</span>
            <kbd className="keycap keycap-coral">Q</kbd>
            <span>DEVOLVER À VITRINE</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
