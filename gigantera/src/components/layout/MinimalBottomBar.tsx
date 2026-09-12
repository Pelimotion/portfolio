import React from 'react';
import { useAppStore } from '../../core/store';
import { SECTORS_CATALOG } from '../../data/artworks';

export const MinimalBottomBar: React.FC = () => {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const cameraCurrentZ = useAppStore((s) => s.cameraCurrentZ);
  const activeSectorId = useAppStore((s) => s.activeSectorId);
  const warpToSector = useAppStore((s) => s.warpToSector);
  const setCDPOVOpen = useAppStore((s) => s.setCDPOVOpen);
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const tutorialDocked = useAppStore((s) => s.tutorialDocked);
  const hasPlayerMoved = useAppStore((s) => s.hasPlayerMoved);
  const toggleGuideModal = useAppStore((s) => s.toggleGuideModal);

  const activeSector = SECTORS_CATALOG.find((s) => s.id === activeSectorId) || SECTORS_CATALOG[1];

  return (
    <footer className="minimal-feathered-dock" role="toolbar" aria-label="Controles da Galeria">
      {/* Barra Inferior com Proteção Gradiente Feather */}
      <div className="bottom-bar-scrim">
        {/* Bloco Esquerda: Telemetria Z & Setor */}
        <div className="bottom-left-telemetry font-mono">
          <span className="telemetry-sector">{activeSector.title.split('//')[0].trim()}</span>
          <span className="telemetry-divider">/</span>
          <span className="telemetry-z">
            Z: {cameraCurrentZ >= 0 ? `+${cameraCurrentZ.toFixed(1)}` : cameraCurrentZ.toFixed(1)}M
          </span>

          <div className="quick-sectors-row">
            {SECTORS_CATALOG.map((sec) => (
              <button
                key={sec.id}
                onClick={() => warpToSector(sec.id)}
                className={`sector-mini-dot ${activeSectorId === sec.id ? 'is-active' : ''}`}
                title={`Ir para ${sec.title}`}
              >
                {sec.sectorCode}
              </button>
            ))}
          </div>
        </div>

        {/* Bloco Central: Guia Táctil Acoplado de Game — some suavemente quando o jogador começa a andar */}
        <div
          className={`bottom-center-guide font-mono ${tutorialDocked ? 'is-docked' : ''} ${hasPlayerMoved ? 'is-faded-away' : ''}`}
          aria-hidden={hasPlayerMoved}
        >
          <span className="keycap-cluster">
            <kbd className="keycap">W</kbd>
            <kbd className="keycap">A</kbd>
            <kbd className="keycap">S</kbd>
            <kbd className="keycap">D</kbd>
            <span className="keycap-label">ANDAR</span>
          </span>
          <span className="guide-dot">·</span>
          <span className="mouse-badge">
            <span className="mouse-icon mouse-look" />
            <span className="keycap-label">MIRA</span>
          </span>
          <span className="guide-dot">·</span>
          <span className="keycap-combo">
            <kbd className="keycap">E</kbd>
            <span className="keycap-label">INTERAGIR</span>
          </span>
        </div>

        {/* Bloco Direita: Botão de Ajuda de Controles, CD Player & Alternador 3D / Índice com TAB */}
        <div className="bottom-right-tools font-mono">
          {/* Botão de Guia de Controles On-Demand */}
          <button
            onClick={() => toggleGuideModal()}
            className="tool-guide-modal-btn"
            title="Abrir painel completo de controles e atalhos táteis (H)"
          >
            <kbd className="keycap" style={{ fontSize: '10px', height: '18px', padding: '0 5px' }}>H</kbd>
            <span>GUIA [?]</span>
          </button>

          {/* Botão de Estojo de CD em POV */}
          <button
            onClick={() => setCDPOVOpen(true)}
            className={`tool-cd-player-pill ${isAudioPlaying ? 'is-playing' : ''}`}
            title="Pegar o álbum de CD em primeira pessoa e folhear a contracapa"
          >
            <span className="cd-icon">{isAudioPlaying ? '❚❚' : '☊'}</span>
            <span className="cd-title">
              {currentAudioTrack.trackNumber}. {currentAudioTrack.title.toUpperCase()}
            </span>
            <kbd className="keycap" style={{ fontSize: '9px', height: '18px', padding: '0 4px' }}>CD</kbd>
          </button>

          {/* Alternador 3D / Arquivo em Grade com indicação de tecla TAB */}
          <button
            onClick={() => setViewMode(viewMode === 'spatial' ? 'archive' : 'spatial')}
            className="tool-view-switch-btn"
            title="Alternar entre visualização espacial 3D e catálogo tradicional (TAB)"
          >
            <kbd className="keycap" style={{ fontSize: '9px', height: '18px', padding: '0 4px', marginRight: '5px' }}>TAB</kbd>
            <span>{viewMode === 'spatial' ? 'ACERVO' : 'SALA 3D'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

