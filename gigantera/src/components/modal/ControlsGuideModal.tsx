import React, { useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const ControlsGuideModal: React.FC = () => {
  const showGuideModal = useAppStore((s) => s.showGuideModal);
  const setShowGuideModal = useAppStore((s) => s.setShowGuideModal);
  const isMobile = useAppStore((s) => s.isMobile);

  const handleClose = () => {
    try {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.style.cursor = 'default';
    } catch {}
    setShowGuideModal(false);
    window.dispatchEvent(new CustomEvent('gigantera:request-lock'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuideModal && (e.key === 'Escape' || e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuideModal]);

  if (!showGuideModal) return null;

  return (
    <div
      className="controls-guide-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Protocolo de Apreciação Espacial — Gigantera"
    >
      <div className="controls-guide-card-graphic" onClick={(e) => e.stopPropagation()}>
        {/* Marcadores arquiteturais suiços nos cantos */}
        <span className="arch-corner arch-corner-tl" aria-hidden="true">+</span>
        <span className="arch-corner arch-corner-tr" aria-hidden="true">+</span>
        <span className="arch-corner arch-corner-bl" aria-hidden="true">+</span>
        <span className="arch-corner arch-corner-br" aria-hidden="true">+</span>

        {/* Cabeçalho Curatorial Senior */}
        <header className="graphic-guide-header">
          <div className="guide-header-text">
            <div className="guide-meta-row font-mono">
              <span className="guide-meta-tag">[PELIMOTION // GIGANTERA]</span>
              <span className="guide-meta-sep">/</span>
              <span className="guide-meta-edition">ED. 2026</span>
              <span className="guide-meta-sep">/</span>
              <span className="guide-meta-spec">{isMobile ? 'INTERFACE MOBILE TÁTIL' : 'EXP-01 PROTOCOLO CURATORIAL'}</span>
            </div>
            <h2 className="guide-title font-display">
              {isMobile ? 'Protocolo de Imersão Tátil' : 'Protocolo de Apreciação Espacial'}
            </h2>
            <p className="guide-subtitle font-mono">
              {isMobile
                ? 'Navegação cinética 3D, janela mágica giroscópica e inspeção óptica de acervo.'
                : 'Dispositivo de navegação arquitetônica, percepção visual e escuta acústica contínua.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="guide-close-btn font-mono"
            aria-label="Fechar protocolo de apreciação"
            title="Fechar protocolo (ESC ou H)"
          >
            <span className="guide-close-text">RETORNAR</span>
            <kbd className="keycap keycap-coral">ESC</kbd>
          </button>
        </header>

        {/* Tríptico Curatorial — 3 Módulos com Animações Vetoriais */}
        <div className="graphic-guide-triptych">
          {/* MÓDULO 01: VETOR DE MIRA & ÓPTICA */}
          <section className="graphic-guide-col">
            <div className="col-header-badge font-mono">
              <span className="col-num">01</span>
              <span className="col-spec-type">{isMobile ? 'PANORAMA' : 'PERSPECTIVA'}</span>
            </div>

            <div className="schematic-canvas-box" aria-hidden="true">
              <svg className="schematic-svg" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Linhas de grade e horizonte */}
                <line x1="15" y1="55" x2="145" y2="55" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
                <line x1="80" y1="12" x2="80" y2="98" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />

                {/* Arco de bússola azimutal */}
                <circle cx="80" cy="55" r="38" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                <circle cx="80" cy="55" r="46" stroke="var(--accent-gold)" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 6" className="schematic-compass-ring" />

                {isMobile ? (
                  /* Gesto de Swipe Panorâmico com feedback sutil */
                  <g className="schematic-swipe-hand">
                    <circle cx="80" cy="55" r="16" stroke="var(--accent-coral)" strokeWidth="1.4" strokeDasharray="2 3" opacity="0.7" />
                    <circle cx="80" cy="55" r="5" fill="var(--accent-coral)" />
                    <path d="M 52 55 Q 80 44 108 55" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 102 50 L 109 55 L 102 60" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                ) : (
                  /* Retículo Óptico de Precisão com varredura suave */
                  <g className="schematic-reticle-group">
                    {/* Cantoneiras de foco do retículo */}
                    <path d="M 68 45 L 68 40 L 73 40" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 92 45 L 92 40 L 87 40" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 68 65 L 68 70 L 73 70" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 92 65 L 92 70 L 87 70" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Ponto focal laser */}
                    <circle cx="80" cy="55" r="2.5" fill="var(--accent-coral)" />
                    
                    {/* Coordenadas e marcação azimutal técnica */}
                    <text x="80" y="24" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="7" fontFamily="monospace">AZ: 042° · EL: -0.04</text>
                    <text x="80" y="92" textAnchor="middle" fill="var(--accent-gold)" opacity="0.8" fontSize="6.5" fontFamily="monospace">CAM: LIVRE 360°</text>
                  </g>
                )}
              </svg>
            </div>

            <h3 className="graphic-col-title font-display">
              {isMobile ? '01 // Deslize Panorâmico' : '01 // Óptica & Vetor de Mira'}
            </h3>
            <p className="graphic-col-desc">
              {isMobile
                ? 'Arraste suavemente na tela para orientar o olhar em 360° pela arquitetura, ou ative o botão Giroscópio para transformar o celular em uma janela mágica física.'
                : 'Mova o cursor livremente para orientar a perspectiva em 360°. A mira reage ao ambiente e identifica automaticamente as vitrines de Still e Vídeo conforme você caminha.'}
            </p>
            <div className="col-footer-tag font-mono">
              <span className="tag-dot" />
              <span>{isMobile ? 'JANELA MÁGICA GIROSCÓPIO' : 'CONTROLE DE MIRA IMEDIATO'}</span>
            </div>
          </section>

          {/* MÓDULO 02: DESLOCAMENTO & ACÚSTICA */}
          <section className="graphic-guide-col">
            <div className="col-header-badge font-mono">
              <span className="col-num">02</span>
              <span className="col-spec-type">{isMobile ? 'CADÊNCIA' : 'CINÉTICA'}</span>
            </div>

            <div className="schematic-canvas-box" aria-hidden="true">
              <svg className="schematic-svg" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Piso em perspectiva isométrica brutalista */}
                <path d="M 80 20 L 140 55 L 80 90 L 20 55 Z" stroke="currentColor" strokeWidth="1" opacity="0.25" />
                <path d="M 80 32 L 126 58 L 80 84 L 34 58 Z" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
                
                {/* Ondas sonoras volumétricas dos falantes JBL 4312 */}
                <ellipse cx="40" cy="45" rx="14" ry="7" stroke="var(--accent-gold)" strokeWidth="1.2" opacity="0.6" className="schematic-sound-pulse" />
                <ellipse cx="40" cy="45" rx="22" ry="11" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.3" className="schematic-sound-pulse-delayed" />
                
                {isMobile ? (
                  /* Stepper tátil ◄ ► */
                  <g className="schematic-stepper-touch">
                    <rect x="52" y="38" width="56" height="32" rx="6" stroke="var(--accent-coral)" strokeWidth="1.5" fill="rgba(217, 71, 38, 0.14)" />
                    <path d="M 64 54 L 70 48 M 64 54 L 70 60" stroke="var(--accent-coral)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 96 54 L 90 48 M 96 54 L 90 60" stroke="var(--accent-coral)" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="80" cy="54" r="3" fill="var(--accent-gold)" />
                    <text x="80" y="86" textAnchor="middle" fill="currentColor" opacity="0.7" fontSize="7" fontFamily="monospace">STEPPER ◄ ►</text>
                  </g>
                ) : (
                  /* Conjunto direcional de teclas com tecla frontal destacada */
                  <g className="schematic-keys-cluster">
                    {/* W (Frente) */}
                    <g className="schematic-key-active">
                      <rect x="71" y="24" width="18" height="18" rx="4" stroke="var(--accent-coral)" strokeWidth="1.5" fill="rgba(217, 71, 38, 0.18)" />
                      <text x="80" y="36.5" textAnchor="middle" fill="var(--accent-coral)" fontSize="9" fontWeight="bold" fontFamily="monospace">W</text>
                    </g>
                    {/* A, S, D */}
                    <rect x="50" y="46" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
                    <text x="59" y="58.5" textAnchor="middle" fill="currentColor" opacity="0.8" fontSize="8" fontFamily="monospace">A</text>

                    <rect x="71" y="46" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
                    <text x="80" y="58.5" textAnchor="middle" fill="currentColor" opacity="0.8" fontSize="8" fontFamily="monospace">S</text>

                    <rect x="92" y="46" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
                    <text x="101" y="58.5" textAnchor="middle" fill="currentColor" opacity="0.8" fontSize="8" fontFamily="monospace">D</text>

                    <text x="80" y="82" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="7" fontFamily="monospace">OU SETAS DO TECLADO</text>
                  </g>
                )}
              </svg>
            </div>

            <h3 className="graphic-col-title font-display">
              {isMobile ? '02 // Passada Guiada ◄ ►' : '02 // Deslocamento & Som'}
            </h3>
            <p className="graphic-col-desc">
              {isMobile
                ? 'Use os controles ◄ e ► no rodapé para deslizar suavemente pelo corredor, parando automaticamente no ponto focal ideal de cada instalação.'
                : 'Pressione as teclas W A S D ou as Setas para percorrer o salão. Os monitores de estúdio JBL 4312 modulam a atenuação, reverberação e pan de som conforme sua proximidade.'}
            </p>
            <div className="col-footer-tag font-mono">
              <span className="tag-dot" />
              <span>{isMobile ? 'GLIDE AUTOMÁTICO SUAVE' : 'ÁUDIO ESPACIAL FÍSICO (CD)'}</span>
            </div>
          </section>

          {/* MÓDULO 03: CONTEMPLAÇÃO & LENTE MACRO */}
          <section className="graphic-guide-col">
            <div className="col-header-badge font-mono">
              <span className="col-num">03</span>
              <span className="col-spec-type">{isMobile ? 'CURADORIA' : 'LENTE MACRO'}</span>
            </div>

            <div className="schematic-canvas-box" aria-hidden="true">
              <svg className="schematic-svg" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Silhueta da Vitrine Arquitetônica */}
                <rect x="42" y="16" width="76" height="74" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
                <line x1="42" y1="78" x2="118" y2="78" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
                <text x="80" y="85" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="5.5" fontFamily="monospace">PLM // VITRINE AUTORAL</text>

                {/* Traços artísticos internos de ilustração */}
                <path d="M 52 38 Q 66 28 80 40 T 108 36" stroke="currentColor" strokeWidth="1" opacity="0.35" />
                <path d="M 54 54 Q 72 46 90 56 T 106 50" stroke="currentColor" strokeWidth="1" opacity="0.25" />

                {/* Lente Macro 2.8x Dinâmica */}
                <g className="schematic-loupe-lens">
                  <circle cx="86" cy="46" r="22" stroke="var(--accent-gold)" strokeWidth="1.8" fill="rgba(217, 169, 74, 0.08)" />
                  <circle cx="86" cy="46" r="26" stroke="var(--accent-coral)" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 4" />
                  {/* Traços ampliados sob a lente com alta nitidez */}
                  <path d="M 72 44 Q 82 34 94 44 T 102 40" stroke="var(--accent-gold)" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M 74 52 Q 86 42 98 50" stroke="var(--accent-coral)" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Haste da lupa */}
                  <line x1="102" y1="62" x2="116" y2="76" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            <h3 className="graphic-col-title font-display">
              {isMobile ? '03 // Toque & Zoom de Crítico' : '03 // Vitrine & Lente Macro'}
            </h3>
            <p className="graphic-col-desc">
              {isMobile
                ? 'Toque em qualquer vitrine ou botão [VER] para abrir a obra. Faça o gesto de pinça para aplicar o Zoom Macro de até 300% e examinar traços e detalhes conceituais.'
                : 'Dê 1 clique ou aperte [E] na vitrine para desacelerar o tempo e inspecionar a peça. Pressione [R] para acionar a Lente Macro 2.8x e examinar a textura, ranhuras e traços autorais.'}
            </p>
            <div className="col-footer-tag font-mono">
              <span className="tag-dot" />
              <span>{isMobile ? 'PINÇA ZOOM 300% · VÍDEO & STILL' : 'MODO LUPA (2.8X) · TECLA [R]'}</span>
            </div>
          </section>
        </div>

        {/* Faixa Inferior de Matriz Tática de Atalhos & Chamada Curatorial */}
        <footer className="graphic-guide-footer font-mono">
          <div className="graphic-matrix-container">
            <span className="matrix-heading font-mono">[MATRIZ RÁPIDA DE COMANDOS ESPACIAIS]</span>
            <div className="graphic-shortcuts-matrix">
              {isMobile ? (
                <>
                  <div className="shortcut-matrix-item">
                    <span className="keycap keycap-accent">1 DEDO</span>
                    <span className="shortcut-spec">Giro 360° Livre</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap keycap-accent">◄ ►</span>
                    <span className="shortcut-spec">Passada de Obra em Obra</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap keycap-accent">PINÇA</span>
                    <span className="shortcut-spec">Lupa Macro (300%)</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap keycap-accent">⟲ GIRO</span>
                    <span className="shortcut-spec">Janela Mágica Física</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap keycap-accent">CD ☊</span>
                    <span className="shortcut-spec">Sound Engine & Faixas</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="shortcut-matrix-item">
                    <span className="keycap-cluster">
                      <kbd className="keycap">W</kbd>
                      <kbd className="keycap">A</kbd>
                      <kbd className="keycap">S</kbd>
                      <kbd className="keycap">D</kbd>
                    </span>
                    <span className="shortcut-spec">Caminhar no Salão</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap-cluster">
                      <kbd className="keycap keycap-accent">CLIQUE</kbd>
                      <span className="keycap-sep">/</span>
                      <kbd className="keycap keycap-accent">E</kbd>
                    </span>
                    <span className="shortcut-spec">Inspecionar Vitrine</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <kbd className="keycap">R</kbd>
                    <span className="shortcut-spec">Lente Macro (2.8x)</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <span className="keycap-cluster">
                      <kbd className="keycap keycap-coral">ESC</kbd>
                      <span className="keycap-sep">/</span>
                      <kbd className="keycap keycap-coral">Q</kbd>
                    </span>
                    <span className="shortcut-spec">Retornar (Mira Imediata)</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <kbd className="keycap">TAB</kbd>
                    <span className="shortcut-spec">Catálogo Geral</span>
                  </div>
                  <div className="shortcut-matrix-item">
                    <kbd className="keycap">T</kbd>
                    <span className="shortcut-spec">Luz Claro / Escuro</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="graphic-action-row">
            <div className="floor-spot-tip">
              <span className="spot-bullet">◈</span>
              <span className="spot-text">
                {isMobile
                  ? 'Incline o celular com o Giroscópio ativo para uma experiência física imersiva em tempo real.'
                  : 'MARCADORES NO PISO: Posicione-se sobre os anéis gravados no concreto para o enquadramento ideal de cada obra.'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="graphic-enter-btn font-mono"
            >
              <span>INICIAR IMERSÃO // ENTRAR NO SALÃO</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
