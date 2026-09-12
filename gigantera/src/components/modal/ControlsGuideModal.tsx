import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const ControlsGuideModal: React.FC = () => {
  const showGuideModal = useAppStore((s) => s.showGuideModal);
  const setShowGuideModal = useAppStore((s) => s.setShowGuideModal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuideModal && (e.key === 'Escape' || e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowGuideModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuideModal, setShowGuideModal]);

  if (!showGuideModal) return null;

  return (
    <div
      className="controls-guide-backdrop"
      onClick={() => setShowGuideModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Guia Rápido de Navegação e Contemplação"
    >
      <div className="controls-guide-card-graphic" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho Minimalista */}
        <header className="graphic-guide-header">
          <div className="guide-header-text">
            <span className="guide-eyebrow font-mono">[GIGANTERA // GUIA DE NAVEGAÇÃO]</span>
            <h2 className="guide-title">Como Explorar o Espaço</h2>
          </div>
          <button
            onClick={() => setShowGuideModal(false)}
            className="guide-close-btn font-mono"
            aria-label="Fechar guia de navegação"
          >
            <span>FECHAR</span>
            <kbd className="keycap">✕</kbd>
          </button>
        </header>

        {/* 3 Esquemas Gráficos Visuais com Micro-Animações */}
        <div className="graphic-guide-triptych">
          {/* 01. Olhar em Volta */}
          <div className="graphic-guide-col">
            <div className="schematic-canvas-box">
              <svg className="schematic-svg" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Arco de visão panorâmica */}
                <path d="M 20 65 A 42 42 0 0 1 100 65" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                {/* Setas animadas de arrasto lateral */}
                <path className="schematic-arrow-left" d="M 25 61 L 18 65 L 25 69" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path className="schematic-arrow-right" d="M 95 61 L 102 65 L 95 69" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Silhueta do Mouse com balanço */}
                <g className="schematic-mouse-icon">
                  <rect x="51" y="32" width="18" height="28" rx="9" stroke="currentColor" strokeWidth="1.6" />
                  <line x1="60" y1="36" x2="60" y2="42" stroke="var(--accent-gold)" strokeWidth="1.6" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <h3 className="graphic-col-title">1. Olhar em Volta</h3>
            <p className="graphic-col-desc">
              Mova ou arraste o mouse livremente para direcionar o olhar em 360° pela galeria.
            </p>
          </div>

          {/* 02. Caminhar */}
          <div className="graphic-guide-col">
            <div className="schematic-canvas-box">
              <svg className="schematic-svg" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cruz direcional de teclas */}
                {/* Tecla Cima (W / ↑) com pulso */}
                <g className="schematic-key-forward">
                  <rect x="49" y="16" width="22" height="22" rx="4" stroke="var(--accent-coral)" strokeWidth="1.4" fill="rgba(217, 71, 38, 0.12)" />
                  <path d="M 60 23 L 56 28 M 60 23 L 64 28 M 60 23 L 60 32" stroke="var(--accent-coral)" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                {/* Tecla Esquerda (A / ←) */}
                <rect x="23" y="42" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <path d="M 30 53 L 35 49 M 30 53 L 35 57" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                {/* Tecla Baixo (S / ↓) */}
                <rect x="49" y="42" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <path d="M 60 57 L 56 53 M 60 57 L 64 53" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                {/* Tecla Direita (D / →) */}
                <rect x="75" y="42" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <path d="M 90 53 L 85 49 M 90 53 L 85 57" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>
            <h3 className="graphic-col-title">2. Caminhar</h3>
            <p className="graphic-col-desc">
              Pressione as <strong>Setas</strong> ou as teclas <strong>W A S D</strong> para avançar, recuar e percorrer o corredor.
            </p>
          </div>

          {/* 03. Aproximar & Inspecionar */}
          <div className="graphic-guide-col">
            <div className="schematic-canvas-box">
              <svg className="schematic-svg" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Moldura da Obra */}
                <rect x="40" y="16" width="40" height="52" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
                <line x1="45" y1="28" x2="75" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                <line x1="45" y1="36" x2="68" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                {/* Retículo de Foco Animado */}
                <g className="schematic-focus-reticle">
                  <path d="M 34 26 L 34 20 L 40 20" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 86 26 L 86 20 L 80 20" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 34 58 L 34 64 L 40 64" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 86 58 L 86 64 L 80 64" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="60" cy="42" r="3" fill="var(--accent-gold)" />
                </g>
              </svg>
            </div>
            <h3 className="graphic-col-title">3. Aproximar</h3>
            <p className="graphic-col-desc">
              Mire e dê <strong>1 clique</strong> (ou tecla <strong>E</strong>) em qualquer vitrine para destacar e ler a obra.
            </p>
          </div>
        </div>

        {/* Faixa Inferior de Atalhos Rápidos & Ponto Contemplativo */}
        <footer className="graphic-guide-footer font-mono">
          <div className="graphic-shortcuts-strip">
            <div className="shortcut-pill">
              <kbd className="keycap">R</kbd>
              <span>MODO LUPA (ZOOM 300%)</span>
            </div>
            <span className="strip-sep">·</span>
            <div className="shortcut-pill">
              <kbd className="keycap keycap-coral">E</kbd>
              <span>/</span>
              <kbd className="keycap keycap-coral">Q</kbd>
              <span>DEVOLVER À VITRINE</span>
            </div>
            <span className="strip-sep">·</span>
            <div className="shortcut-pill">
              <kbd className="keycap">TAB</kbd>
              <span>CATÁLOGO GERAL</span>
            </div>
          </div>

          <div className="graphic-action-row">
            <div className="floor-spot-tip">
              <span className="spot-bullet">◈</span>
              <span>Posicione-se sobre os anéis gravados no piso para o ângulo ideal de cada peça.</span>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="graphic-enter-btn"
            >
              ENTENDIDO · CONTINUAR
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
