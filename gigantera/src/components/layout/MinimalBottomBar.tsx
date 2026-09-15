import React from 'react';
import { useAppStore } from '../../core/store';
import { SECTORS_CATALOG } from '../../data/artworks';
import { MobileBottomDock } from './MobileBottomDock';

export const MinimalBottomBar: React.FC = () => {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const activeSectorId = useAppStore((s) => s.activeSectorId);
  const warpToSector = useAppStore((s) => s.warpToSector);
  const hasPlayerMoved = useAppStore((s) => s.hasPlayerMoved);
  const toggleGuideModal = useAppStore((s) => s.toggleGuideModal);

  // Navegação de setores via teclas 1, 2 e 3
  React.useEffect(() => {
    const handleSectorKeys = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const state = useAppStore.getState();
      if (state.cinemaArtwork || state.viewMode !== 'spatial') return;

      if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') {
        e.preventDefault();
        warpToSector('entrance-audio');
      } else if (e.code === 'Digit2' || e.code === 'Numpad2' || e.key === '2') {
        e.preventDefault();
        warpToSector('video');
      } else if (e.code === 'Digit3' || e.code === 'Numpad3' || e.key === '3') {
        e.preventDefault();
        warpToSector('still');
      }
    };

    window.addEventListener('keydown', handleSectorKeys);
    return () => window.removeEventListener('keydown', handleSectorKeys);
  }, [warpToSector]);

  return (
    <>
      {/* Dock Especializado para Smartphone / Mobile na Zona do Polegar */}
      <div className="mobile-dock-container-wrapper">
        <MobileBottomDock />
      </div>

      {/* Dock Minimalista Desktop com Proteção Feather Escura e Alta Sofisticação */}
      <footer
        className="minimal-feathered-dock desktop-dock-wrapper"
        role="toolbar"
        aria-label="Controles da Galeria"
      >
        <div className="bottom-bar-scrim">
          {/* Esquerda: Navegador de Setores Arquiteturais (1 · SOM · 2 · VÍDEOS · 3 · STILLS) */}
          <div className="bottom-sectors-navigator font-mono">
            <span className="sector-nav-tag">SETOR:</span>
            <div className="sector-pills-cluster" role="tablist" aria-label="Navegação por setores (Teclas 1, 2, 3)">
              {SECTORS_CATALOG.map((sec) => {
                const isActive = activeSectorId === sec.id;
                const info =
                  sec.id === 'entrance-audio'
                    ? { num: '1', name: 'SOM' }
                    : sec.id === 'video'
                    ? { num: '2', name: 'VÍDEOS' }
                    : { num: '3', name: 'STILLS' };

                return (
                  <button
                    key={sec.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => warpToSector(sec.id)}
                    className={`sector-nav-pill ${isActive ? 'is-active' : ''}`}
                    title={`Navegar para ${sec.title} (Atalho: Tecla ${info.num})`}
                  >
                    <span className="sector-pill-dot" />
                    <span className="sector-pill-title">{info.num} · {info.name}</span>
                    <kbd className="sector-keycap-badge">{info.num}</kbd>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Centro: Dica de Navegação Inicial — Desvanece suavemente assim que o jogador dá o 1º passo */}
          <div
            className={`bottom-dynamic-controls font-mono ${hasPlayerMoved ? 'is-faded-away' : 'is-visible'}`}
            aria-hidden={hasPlayerMoved}
          >
            <div className="controls-hint-capsule">
              {/* Cluster WASD em grid físico 2×3 */}
              <span className="keycap-cluster">
                <span className="wasd-key-grid">
                  {/* Linha 1: espaço, W, espaço */}
                  <span className="wasd-spacer" />
                  <kbd className="keycap keycap-xs">W</kbd>
                  <span className="wasd-spacer" />
                  {/* Linha 2: A, S, D */}
                  <kbd className="keycap keycap-xs">A</kbd>
                  <kbd className="keycap keycap-xs">S</kbd>
                  <kbd className="keycap keycap-xs">D</kbd>
                </span>
                {/* Setas direcionais como alternativa */}
                <span className="arrow-key-cluster">
                  <span className="arrow-key-row">
                    <span className="arrow-spacer" />
                    <kbd className="keycap keycap-xs">↑</kbd>
                    <span className="arrow-spacer" />
                  </span>
                  <span className="arrow-key-row">
                    <kbd className="keycap keycap-xs">←</kbd>
                    <kbd className="keycap keycap-xs">↓</kbd>
                    <kbd className="keycap keycap-xs">→</kbd>
                  </span>
                </span>
                <span className="keycap-label">ANDAR</span>
              </span>
              <span className="hint-sep">·</span>
              <span className="mouse-badge">
                <span className="mouse-icon mouse-look" />
                <span className="keycap-label">MIRA</span>
              </span>
              <span className="hint-sep">·</span>
              <span className="keycap-combo">
                <kbd className="keycap keycap-xs">E</kbd>
                <span className="keycap-label">INTERAGIR</span>
              </span>
            </div>
          </div>

          {/* Direita: Acessos Rápidos — Guia de Comandos On-Demand e Alternador 3D / Grade */}
          <div className="bottom-right-tools font-mono">
            {/* Guia de Atalhos Completo (H) */}
            <button
              onClick={() => toggleGuideModal()}
              className="tool-guide-modal-btn"
              title="Abrir guia completo de controles táteis e atalhos (H)"
            >
              <kbd className="keycap keycap-sm">H</kbd>
              <span>GUIA [?]</span>
            </button>


            {/* Alternador de Modo de Visualização (TAB) */}
            <button
              onClick={() => setViewMode(viewMode === 'spatial' ? 'archive' : 'spatial')}
              className={`tool-view-switch-btn ${viewMode === 'archive' ? 'is-active' : ''}`}
              title="Alternar entre galeria espacial 3D e catálogo tradicional (TAB)"
            >
              <kbd className="keycap keycap-sm">TAB</kbd>
              <span>{viewMode === 'archive' ? 'SALA 3D' : 'ACERVO'}</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
