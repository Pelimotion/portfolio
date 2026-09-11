import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../../core/store';
import { TOKENS } from '../../tokens';

export const ErosionModal: React.FC = () => {
  const selectedArtwork = useAppStore((s) => s.selectedArtwork);
  const selectArtwork = useAppStore((s) => s.selectArtwork);
  const erosionProgress = useAppStore((s) => s.erosionProgress);
  const setErosionProgress = useAppStore((s) => s.setErosionProgress);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Coreografia de Erosão GSAP (Início, Meio e Fim Autorados)
  useEffect(() => {
    if (!selectedArtwork) return;

    // Reseta estado para 1.0 (dissolvido em sedimento)
    setErosionProgress(1.0);

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });
    timelineRef.current = tl;

    // Transição de erosão: o sedimento sedimenta e cristaliza (1.0 -> 0.0)
    tl.to(
      { progress: 1.0 },
      {
        progress: 0.0,
        duration: 1.2,
        onUpdate: function () {
          const val = this.targets()[0].progress;
          setErosionProgress(val);

          // Modulação paramétrica dinâmica dos eixos variáveis da fonte Fraunces
          if (titleRef.current) {
            const opsz = 72 + val * 72; // 72 -> 144
            const soft = 20 + val * 80; // 20 -> 100
            const wonk = val;           // 0.0 -> 1.0
            titleRef.current.style.fontVariationSettings = `'opsz' ${opsz.toFixed(0)}, 'SOFT' ${soft.toFixed(0)}, 'WONK' ${wonk.toFixed(2)}`;
          }
        }
      }
    );

    return () => {
      tl.kill();
    };
  }, [selectedArtwork, setErosionProgress]);

  // Efeito de renderização de grãos e displacement de erosão no canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedArtwork) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    const height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const img = new Image();
    img.src = selectedArtwork.imageSrc;

    const render = () => {
      animId = requestAnimationFrame(render);
      const progress = useAppStore.getState().erosionProgress;

      ctx.clearRect(0, 0, width, height);

      if (img.complete && img.naturalWidth > 0) {
        // Se a erosão estiver concluída (0.0), renderiza nítido
        if (progress <= 0.01) {
          ctx.drawImage(img, 0, 0, width, height);
          return;
        }

        // Renderiza com fatiamento de displacement por ruído direcional (sedimento sendo erodido)
        const slices = 40;
        const sliceH = height / slices;

        for (let i = 0; i < slices; i++) {
          const sliceY = i * sliceH;
          // Deslocamento horizontal baseado em seno e ruído proporcional ao progresso
          const noiseOffset =
            Math.sin(i * 0.4 + progress * 8.0) *
            Math.cos(i * 0.2) *
            progress *
            width *
            0.25;

          const alpha = 1.0 - progress * 0.6;
          ctx.globalAlpha = Math.max(0, alpha);

          ctx.drawImage(
            img,
            0,
            (i / slices) * img.naturalHeight,
            img.naturalWidth,
            img.naturalHeight / slices,
            noiseOffset,
            sliceY,
            width,
            sliceH
          );
        }

        // Adiciona partículas de sedimento erodido dispersas pelo fluxo
        ctx.globalAlpha = progress * 0.8;
        ctx.fillStyle = TOKENS.colors.sedimentClay.hex;
        const grainCount = Math.floor(progress * 250);
        for (let g = 0; g < grainCount; g++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 2.5, 2.5);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedArtwork]);

  const handleClose = () => {
    if (!timelineRef.current) {
      selectArtwork(null);
      return;
    }

    // Animação de fechamento: erodindo para fora (0.0 -> 1.0)
    gsap.to(
      { progress: 0.0 },
      {
        progress: 1.0,
        duration: 0.7,
        ease: 'power2.in',
        onUpdate: function () {
          const val = this.targets()[0].progress;
          setErosionProgress(val);
          if (titleRef.current) {
            const opsz = 72 + val * 72;
            const soft = 20 + val * 80;
            const wonk = val;
            titleRef.current.style.fontVariationSettings = `'opsz' ${opsz.toFixed(0)}, 'SOFT' ${soft.toFixed(0)}, 'WONK' ${wonk.toFixed(2)}`;
          }
        },
        onComplete: () => {
          selectArtwork(null);
        }
      }
    );
  };

  if (!selectedArtwork) return null;

  return (
    <div
      ref={modalRef}
      className="erosion-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(14, 22, 19, 0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-artwork-title"
    >
      <div
        style={{
          maxWidth: '1080px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}
      >
        {/* Canvas de Transição por Erosão */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            backgroundColor: '#0E1613',
            border: '1px solid rgba(221, 227, 220, 0.12)',
            overflow: 'hidden'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Informações da Obra com Fraunces Dinâmica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--light-caustic)',
                fontWeight: 600,
                letterSpacing: '0.04em'
              }}
            >
              {selectedArtwork.series} · {selectedArtwork.depthMeters}m de profundidade
            </span>
            <h2
              ref={titleRef}
              id="modal-artwork-title"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: 'var(--foam-white)',
                marginTop: '0.5rem',
                lineHeight: 1.1
              }}
            >
              {selectedArtwork.title}
            </h2>
          </div>

          <p style={{ color: 'var(--surface-glass)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            {selectedArtwork.description}
          </p>

          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid rgba(221, 227, 220, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'rgba(221, 227, 220, 0.6)'
            }}
          >
            <div><strong>Ano:</strong> {selectedArtwork.year}</div>
            <div><strong>Física/Materiais:</strong> {selectedArtwork.materials}</div>
          </div>

          <button
            onClick={handleClose}
            className="control-pill"
            style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
          >
            Retornar ao Estrato
          </button>
        </div>
      </div>
    </div>
  );
};
