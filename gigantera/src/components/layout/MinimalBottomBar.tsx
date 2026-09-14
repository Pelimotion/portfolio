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
          {/* Esquerda: Navegador de Setores Arquiteturais (SOM · STILLS · VÍDEOS) */}
          <div className="bottom-sectors-navigator font-mono">
            <span className="sector-nav-tag">SETOR:</span>
            <div className="sector-pills-cluster" role="tablist" aria-label="Navegação por setores">
              {SECTORS_CATALOG.map((sec) => {
                const isActive = activeSectorId === sec.id;
                const label =
                  sec.id === 'entrance-audio'
                    ? '00 · SOM'
                    : sec.id === 'video'
                    ? '01 · VÍDEOS'
                    : '02 · STILLS';

                return (
                  <button
                    key={sec.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => warpToSector(sec.id)}
                    className={`sector-nav-pill ${isActive ? 'is-active' : ''}`}
                    title={`Navegar para ${sec.title}`}
                  >
                    <span className="sector-pill-dot" />
                    <span>{label}</span>
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
              <span className="keycap-cluster">
                <kbd className="keycap">W</kbd>
                <kbd className="keycap">A</kbd>
                <kbd className="keycap">S</kbd>
                <kbd className="keycap">D</kbd>
                <span className="keycap-label">ANDAR</span>
              </span>
              <span className="hint-sep">·</span>
              <span className="mouse-badge">
                <span className="mouse-icon mouse-look" />
                <span className="keycap-label">MIRA</span>
              </span>
              <span className="hint-sep">·</span>
              <span className="keycap-combo">
                <kbd className="keycap">E</kbd>
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
