import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

const EspinhacoInteractive = React.lazy(() =>
  import('../works/EspinhacoInteractive').then((m) => ({ default: m.EspinhacoInteractive }))
);

export const CinemaView: React.FC = () => {
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);
  const closeCinema = useAppStore((s) => s.closeCinema);
  const inspectionZoom = useAppStore((s) => s.inspectionZoom);
  const setInspectionZoom = useAppStore((s) => s.setInspectionZoom);
  const isLoupeMode = useAppStore((s) => s.isLoupeMode);
  const toggleLoupeMode = useAppStore((s) => s.toggleLoupeMode);
  const isMobile = useAppStore((s) => s.isMobile);

  // Still sheets
  const currentStillSheetIndex = useAppStore((s) => s.currentStillSheetIndex);
  const nextStillSheet = useAppStore((s) => s.nextStillSheet);
  const prevStillSheet = useAppStore((s) => s.prevStillSheet);
  const setStillSheetIndex = useAppStore((s) => s.setStillSheetIndex);

  // Detecção de gestos no mobile
  const lastTapRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1.0);

  // Video audio crossfade & playback state
  const wasAudioPlayingBeforeVideo = useAppStore((s) => s.wasAudioPlayingBeforeVideo);
  const soundVolume = useAppStore((s) => s.soundVolume);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Ficha Curatorial (Store Central) + Dimerização Inteligente
  const isCinemaInfoOpen = useAppStore((s) => s.isCinemaInfoOpen);
  const toggleCinemaInfo = useAppStore((s) => s.toggleCinemaInfo);
  const setCinemaInfoOpen = useAppStore((s) => s.setCinemaInfoOpen);

  const [isDockDimmed, setIsDockDimmed] = useState(false);
  const isHoveringUIRef = useRef(false);
  const dossierTimerRef = useRef<number | null>(null);
  const dockIdleTimerRef = useRef<number | null>(null);

  // Cursor inteligente: grab na zona da obra, default nos botões de UI
  const [cursorStyle, setCursorStyle] = useState<'grab' | 'grabbing' | 'default'>('grab');

  // Inicia o timer para recolhimento suave da ficha curatorial (8.5 segundos iniciais generosos de leitura)
  const scheduleDossierAutoCollapse = useCallback((delay = 8500) => {
    if (dossierTimerRef.current) clearTimeout(dossierTimerRef.current);
    dossierTimerRef.current = window.setTimeout(() => {
      if (!isHoveringUIRef.current) {
        setCinemaInfoOpen(false);
      }
    }, delay);
  }, [setCinemaInfoOpen]);

  // Timer para dimerização suave do dock em inatividade longa (apenas quando dossier já recolhido)
  const resetDockActivity = useCallback(() => {
    setIsDockDimmed(false);
    if (dockIdleTimerRef.current) clearTimeout(dockIdleTimerRef.current);
    dockIdleTimerRef.current = window.setTimeout(() => {
      if (!isHoveringUIRef.current && !useAppStore.getState().isCinemaInfoOpen) {
        setIsDockDimmed(true);
      }
    }, 6000);
  }, []);

  // Alterna abertura/recolhimento da ficha curatorial técnica
  const toggleDossier = useCallback(() => {
    const next = !useAppStore.getState().isCinemaInfoOpen;
    setCinemaInfoOpen(next);
    soundEngine.playTactileHoverTick();
    if (next) {
      scheduleDossierAutoCollapse(8500);
    }
    setIsDockDimmed(false);
  }, [setCinemaInfoOpen, scheduleDossierAutoCollapse]);

  // Função unificada para encerramento gracioso
  const handleCloseCinema = useCallback(() => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    closeCinema();
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
  }, [closeCinema]);

  // Controles de vídeo
  const toggleVideoPlay = useCallback(() => {
    if (!cinemaArtwork) return;
    const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
    if (vid) {
      if (vid.paused) {
        vid.play().catch(() => {});
        setIsVideoPlaying(true);
      } else {
        vid.pause();
        setIsVideoPlaying(false);
      }
      soundEngine.playTactileHoverTick();
    }
  }, [cinemaArtwork]);

  const toggleVideoMute = useCallback(() => {
    if (!cinemaArtwork) return;
    const vid = document.querySelector(`video[data-art-id="${cinemaArtwork.id}"]`) as HTMLVideoElement;
    if (vid) {
      vid.muted = !vid.muted;
      setIsVideoMuted(vid.muted);
      soundEngine.playTactileHoverTick();
    }
  }, [cinemaArtwork]);

  // Handlers de cursor inteligente e atividade
  const handleViewportMouseMove = useCallback((e: React.MouseEvent) => {
    resetDockActivity();
    const target = e.target as HTMLElement;
    const isUI = !!target?.closest?.('button, kbd, [role="dialog"] > div:not(.cinema-volumetric-aura), .cinema-top-actions, .cinema-modular-hud-root');
    if (isUI) {
      setCursorStyle('default');
    } else {
      setCursorStyle((prev) => (prev === 'grabbing' ? 'grabbing' : 'grab'));
    }
  }, [resetDockActivity]);

  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isUI = !!target?.closest?.('button, kbd, .cinema-top-actions, .cinema-modular-hud-root');
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
        setIsVideoPlaying(true);
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

    // Abre a ficha curatorial ao entrar e agenda recolhimento suave
    setCinemaInfoOpen(true);
    scheduleDossierAutoCollapse(8500);
    resetDockActivity();

    return () => {
      if (fadeInterval) cancelAnimationFrame(fadeInterval);
      if (dossierTimerRef.current) clearTimeout(dossierTimerRef.current);
      if (dockIdleTimerRef.current) clearTimeout(dockIdleTimerRef.current);

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
  }, [cinemaArtwork, wasAudioPlayingBeforeVideo, soundVolume, scheduleDossierAutoCollapse, resetDockActivity]);

  // Atalhos de teclado prioritários (E, Q, ESC, I, Espaço, M, R, A, D)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!cinemaArtwork) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseCinema();
      } else if (e.key.toLowerCase() === 'i' || e.code === 'KeyI') {
        e.preventDefault();
        e.stopPropagation();
        toggleDossier();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive) {
          toggleLoupeMode();
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive && cinemaArtwork.medium === 'video') {
          toggleVideoMute();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive && cinemaArtwork.medium === 'video') {
          toggleVideoPlay();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'still') {
          nextStillSheet();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        if (cinemaArtwork.medium === 'still') {
          prevStillSheet();
        }
      }

      resetDockActivity();
    };

    window.addEventListener('keydown', handleGlobalKey, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleGlobalKey, { capture: true });
      try {
        document.body.style.cursor = 'default';
      } catch {}
    };
  }, [cinemaArtwork, handleCloseCinema, toggleDossier, toggleLoupeMode, toggleVideoMute, toggleVideoPlay, nextStillSheet, prevStillSheet, resetDockActivity]);

  if (!cinemaArtwork) return null;

  const isInteractive = cinemaArtwork.interactiveExperience === 'espinhaco';
  const isStill = cinemaArtwork.medium === 'still';
  const zoomPercent = Math.round(inspectionZoom * 100);
  const galleryImages = cinemaArtwork.galleryImages || [cinemaArtwork.imageSrc];
  const hasMultipleStills = isStill && galleryImages.length > 1;

  // Handlers de toque e gestos no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    resetDockActivity();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistRef.current = Math.hypot(dx, dy);
      initialPinchZoomRef.current = inspectionZoom;
    } else if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    resetDockActivity();
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const scaleFactor = currentDist / initialPinchDistRef.current;
      const newZoom = Math.max(0.85, Math.min(3.5, initialPinchZoomRef.current * scaleFactor));
      setInspectionZoom(newZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistRef.current = null;
    }

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
    resetDockActivity();
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isInteractive ? 'none' : cursorStyle }}
    >
      {/* Camada imersiva da obra interativa Espinhaço */}
      {isInteractive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'all'
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '11px',
                  color: 'var(--accent, #e4c379)',
                  letterSpacing: '0.15em',
                  background: 'rgba(5, 8, 10, 0.95)'
                }}
              >
                CARREGANDO ESCULTURA INTERATIVA // WEBGL...
              </div>
            }
          >
            <EspinhacoInteractive />
          </Suspense>
        </div>
      )}

      {/* Vinheta atmosférica pura (apenas para obras não-interativas) */}
      {!isInteractive && <div className="cinema-volumetric-aura" />}

      {/* Botão Fechar Interativo Topo Direito (sempre clicável e com atalho E visível) */}
      <div className="cinema-top-actions font-mono">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseCinema();
          }}
          className="cinema-top-close-btn"
          title="Fechar inspeção e voltar à galeria (Tecla E ou ESC)"
          aria-label="Fechar inspeção da obra"
        >
          <span className="top-close-icon">✕</span>
          <span className="top-close-text">FECHAR</span>
          <kbd className="keycap keycap-xs">E</kbd>
        </button>
      </div>

      {/* ─── NÍVEL 2: FICHA CURATORIAL LATERAL (Suspensa ao topo para não conflitar) ─── */}
      {!isInteractive && (
        <aside
          className={`cinema-lateral-dossier font-mono ${isCinemaInfoOpen ? 'is-open' : 'is-closed'}`}
          aria-hidden={!isCinemaInfoOpen}
          aria-label="Ficha Técnica Curatorial"
          style={{ top: '6rem', bottom: 'auto', maxHeight: '70vh', overflowY: 'auto' }}
          onMouseEnter={() => {
            isHoveringUIRef.current = true;
            if (dossierTimerRef.current) clearTimeout(dossierTimerRef.current);
            setIsDockDimmed(false);
          }}
          onMouseLeave={() => {
            isHoveringUIRef.current = false;
            if (isCinemaInfoOpen) {
              scheduleDossierAutoCollapse(4500);
            }
            resetDockActivity();
          }}
        >
          <div className="cinema-dossier-inner">
            {/* Header da Ficha Técnica */}
            <div className="cinema-dossier-header">
              <div className="cinema-dossier-meta-badges">
                <span className="cinema-dossier-series">
                  [{cinemaArtwork.series.toUpperCase()}] · {cinemaArtwork.year}
                </span>
                <span className="cinema-dossier-category">{cinemaArtwork.categoryLabel}</span>
              </div>
              <button
                type="button"
                onClick={toggleDossier}
                className="cinema-dossier-collapse-btn"
                title="Recolher ficha técnica (Tecla I)"
                aria-label="Recolher ficha técnica"
              >
                <span>RECOLHER</span>
                <kbd className="keycap keycap-xs">I</kbd>
                <span className="collapse-chevron">✕</span>
              </button>
            </div>

            {/* Título & Narrativa Curatorial com espaçamento nobre */}
            <h2 className="cinema-dossier-title">{cinemaArtwork.title}</h2>
            <p className="cinema-dossier-narrative">{cinemaArtwork.description}</p>

            {/* Grid de Especificações Técnicas e Formato */}
            <div className="cinema-dossier-specs-grid">
              <div className="cinema-dossier-spec-item">
                <span className="spec-label">MATERIAIS:</span>
                <span className="spec-val">{cinemaArtwork.materials}</span>
              </div>
              {cinemaArtwork.dimensionsOrDuration && (
                <div className="cinema-dossier-spec-item">
                  <span className="spec-label">DIMENSÕES / DURAÇÃO:</span>
                  <span className="spec-val">{cinemaArtwork.dimensionsOrDuration}</span>
                </div>
              )}
              {cinemaArtwork.masterFormat && (
                <div className="cinema-dossier-spec-item">
                  <span className="spec-label">MASTER:</span>
                  <span className="spec-val">{cinemaArtwork.masterFormat}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ─── NÍVEL 1: MINI-HUD TÁTICO PERMANENTE (Barra Dock Ultra-fina Central) ─── */}
      {!isInteractive && (
        <nav
          className={`cinema-tactical-mini-dock font-mono ${isDockDimmed ? 'is-dimmed' : ''}`}
          aria-label="Controles de Inspeção"
          onMouseEnter={() => {
            isHoveringUIRef.current = true;
            if (dossierTimerRef.current) clearTimeout(dossierTimerRef.current);
            setIsDockDimmed(false);
          }}
          onMouseLeave={() => {
            isHoveringUIRef.current = false;
            if (isCinemaInfoOpen) {
              scheduleDossierAutoCollapse(4500);
            }
            resetDockActivity();
          }}
        >
        {/* Módulo A: Identificação da Obra + Botão da Ficha Técnica */}
        <div className="cinema-mini-identity">
          <span className="cinema-mini-series">[{cinemaArtwork.series.toUpperCase()}]</span>
          <span className="cinema-mini-title">{cinemaArtwork.title}</span>
          <button
            type="button"
            onClick={toggleDossier}
            className={`cinema-mini-info-btn ${isCinemaInfoOpen ? 'is-active' : ''}`}
            title="Abrir/Recolher ficha curatorial completa (Tecla I)"
            aria-expanded={isCinemaInfoOpen}
          >
            <span className="info-icon">{isCinemaInfoOpen ? '▾' : 'ⓘ'}</span>
            <span className="info-label">{isCinemaInfoOpen ? 'OCULTAR FICHA' : 'FICHA TÉCNICA'}</span>
            <kbd className="keycap keycap-xs">I</kbd>
          </button>
        </div>

          <div className="cinema-mini-divider" aria-hidden="true" />

          {/* Módulo B: Cluster de Ferramentas de Mídia & Inspeção */}
          <div className="cinema-mini-controls-cluster">
            {/* Status de Instalação Interativa */}
            {isInteractive && (
              <div className="cinema-mini-interactive-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent, #e4c379)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                  SIMULAÇÃO EM TEMPO REAL // WEBGL
                </span>
              </div>
            )}

            {/* Controles de Vídeo (Play/Pause e Áudio) */}
            {!isStill && !isInteractive && (
              <div className="cinema-mini-media-group">
                <button
                  type="button"
                  onClick={toggleVideoPlay}
                  className="cinema-mini-action-btn"
                  title="Pausar / Reproduzir (Espaço)"
                >
                  <span className="btn-icon">{isVideoPlaying ? '❚❚' : '▶'}</span>
                  <span className="btn-label">{isVideoPlaying ? 'PAUSAR' : 'REPRODUZIR'}</span>
                  <kbd className="keycap keycap-xs">ESPAÇO</kbd>
                </button>

                <button
                  type="button"
                  onClick={toggleVideoMute}
                  className={`cinema-mini-action-btn ${isVideoMuted ? 'is-muted' : ''}`}
                  title="Alternar áudio (M)"
                >
                  <span className="btn-icon">{isVideoMuted ? '🔇' : '🔈'}</span>
                  <span className="btn-label">{isVideoMuted ? 'MUDO' : 'ÁUDIO'}</span>
                  <kbd className="keycap keycap-xs">M</kbd>
                </button>
              </div>
            )}

            {/* Navegação de Pranchetas para Obras Estáticas */}
            {hasMultipleStills && (
              <div className="cinema-mini-sheets-group">
                <button
                  type="button"
                  onClick={() => prevStillSheet()}
                  className="cinema-mini-arrow-btn"
                  title="Prancheta anterior (← / A)"
                  aria-label="Prancheta anterior"
                >
                  ← <kbd className="keycap keycap-xs">A</kbd>
                </button>
                <div className="cinema-mini-dots-list">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStillSheetIndex(idx)}
                      className={`cinema-mini-dot ${idx === currentStillSheetIndex ? 'is-active' : ''}`}
                      title={`Imagem ${idx + 1}`}
                      aria-label={`Ir para prancheta ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => nextStillSheet()}
                  className="cinema-mini-arrow-btn"
                  title="Próxima prancheta (→ / D)"
                  aria-label="Próxima prancheta"
                >
                  <kbd className="keycap keycap-xs">D</kbd> →
                </button>
                <span className="cinema-mini-badge">
                  {currentStillSheetIndex + 1}/{galleryImages.length}
                </span>
              </div>
            )}

            {/* Cluster Óptico: Modo Lupa e Medidor de Zoom (apenas obras estáticas e vídeo) */}
            {!isInteractive && (
              <div className="cinema-mini-optical-group">
                <button
                  type="button"
                  onClick={() => toggleLoupeMode()}
                className={`cinema-mini-action-btn cinema-mini-loupe-btn ${isLoupeMode ? 'is-active' : ''}`}
                title="Modo Lupa: zoom tátil 300% com arraste (Tecla R)"
              >
                <span className="btn-icon">⌕</span>
                <span className="btn-label">{isLoupeMode ? 'LUPA ATIVA' : 'LUPA (300%)'}</span>
                <kbd className="keycap keycap-xs">R</kbd>
              </button>

              <div
                className="cinema-mini-zoom-meter"
                title="Nível de ampliação atual (Scroll para aproximar / Duplo-clique reseta)"
                onClick={() => {
                  const nextZoom = inspectionZoom > 1.4 ? 1.0 : 2.0;
                  setInspectionZoom(nextZoom);
                  if (nextZoom > 1.8) toggleLoupeMode();
                }}
              >
                <span className="meter-label">ZOOM</span>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((inspectionZoom - 0.85) / (3.5 - 0.85)) * 100))}%`
                    }}
                  />
                </div>
                <span className="meter-value">{zoomPercent}%</span>
              </div>
            </div>
            )}
          </div>

        </nav>
      )}
      </div>
  );
};
