import React from 'react';
import { useAppStore } from '../../core/store';

export const GalleryHeader: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setBioOpen = useAppStore((s) => s.setBioOpen);
  const warpToSector = useAppStore((s) => s.warpToSector);

  const graphicsQuality = useAppStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useAppStore((s) => s.setGraphicsQuality);

  const cycleQuality = () => {
    if (graphicsQuality === 'light') setGraphicsQuality('med');
    else if (graphicsQuality === 'med') setGraphicsQuality('high');
    else setGraphicsQuality('light');
  };

  return (
    <header className="minimal-feathered-header" role="banner">
      {/* Esquerda: Marca Gigantera & Retorno */}
      <div className="header-brand-group">
        <a
          href="/"
          className="header-home-subtle font-mono"
          title="Retornar ao site principal Pelimotion"
        >
          ↖ PELIMOTION
        </a>
        <span className="header-slash font-mono">/</span>
        <button
          onClick={() => warpToSector('entrance-audio')}
          className="header-brand-name"
          title="Reiniciar posição na entrada da galeria"
        >
          GIGANTERA
        </button>
      </div>

      {/* Direita: Qualidade Gráfica, Tema & Informações do Artista */}
      <div className="header-actions-group font-mono">
        <button
          onClick={cycleQuality}
          className="header-minimal-btn header-quality-btn"
          title="Alternar fidelidade gráfica (LIGHT / MED / RTX RAYTRACING)"
        >
          <span className="quality-pill">
            <span className={`quality-dot quality-${graphicsQuality}`} />
            <span>
              {graphicsQuality === 'light' && 'GRÁFICOS: LIGHT'}
              {graphicsQuality === 'med' && 'GRÁFICOS: MED'}
              {graphicsQuality === 'high' && 'GRÁFICOS: RTX FULL'}
            </span>
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="header-minimal-btn"
          title={theme === 'dark' ? 'Alternar para Galeria Clara (Alabastro)' : 'Alternar para Galeria Escura (Obsidiana)'}
        >
          <span>{theme === 'dark' ? '☼ CLARO' : '☾ ESCURO'}</span>
        </button>

        <button
          onClick={() => setBioOpen(true)}
          className="header-minimal-btn"
          title="Declaração conceitual e contato direto"
        >
          <span>[ARTISTA & CONTATO]</span>
        </button>
      </div>
    </header>
  );
};
