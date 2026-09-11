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
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-artwork-title"
    >
      <div className="specimen-dossier-card">
        {/* Cantoneiras Gráficas Brutalistas */}
        <span className="dossier-bracket db-tl">┌</span>
        <span className="dossier-bracket db-tr">┐</span>
        <span className="dossier-bracket db-bl">└</span>
        <span className="dossier-bracket db-br">┘</span>

        {/* Barra Superior do Dossier */}
        <div className="dossier-header-bar">
          <span className="dossier-id">[SPECIMEN ARCHIVE // ID: GGN-ART-{selectedArtwork.id.toUpperCase()}]</span>
          <span className="dossier-status">DISPLACEMENT_STATUS: {erosionProgress > 0.01 ? 'ERODING' : 'CRYSTALLIZED'}</span>
        </div>

        <div className="dossier-grid-body">
          {/* Canvas de Transição por Erosão */}
          <div className="dossier-canvas-frame">
            <span className="canvas-corner cc-tl">+</span>
            <span className="canvas-corner cc-tr">+</span>
            <span className="canvas-corner cc-bl">+</span>
            <span className="canvas-corner cc-br">+</span>
            <canvas ref={canvasRef} className="dossier-canvas" />
          </div>

          {/* Informações Brutalistas da Obra */}
          <div className="dossier-info-col">
            <div className="dossier-heading-group">
              <span className="dossier-series-tag">
                [SERIES // {selectedArtwork.series.toUpperCase()}] · {selectedArtwork.depthMeters}M DEPTH
              </span>
              <h2 ref={titleRef} id="modal-artwork-title" className="dossier-title">
                {selectedArtwork.title}
              </h2>
            </div>

            <p className="dossier-description">
              {selectedArtwork.description}
            </p>

            {/* Tabela de Telemetria e Físicas */}
            <div className="dossier-table">
              <div className="dossier-table-row">
                <span className="table-key">[CRONOLOGIA]</span>
                <span className="table-val">{selectedArtwork.year}</span>
              </div>
              <div className="dossier-table-row">
                <span className="table-key">[SUPORTE & MATERIAIS]</span>
                <span className="table-val">{selectedArtwork.materials.toUpperCase()}</span>
              </div>
              <div className="dossier-table-row">
                <span className="table-key">[ESTRATO DEPOSICIONAL]</span>
                <span className="table-val">BATIMETRIA -{selectedArtwork.depthMeters}M</span>
              </div>
              <div className="dossier-table-row">
                <span className="table-key">[FATOR DE EROSÃO]</span>
                <span className="table-val font-mono">{erosionProgress.toFixed(3)} PH</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="dossier-close-btn"
            >
              [✕ RETORNAR À COLUNA ESTRATIGRÁFICA]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
