import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import {
  ARTIST_INFO,
  CURATORIAL_STATEMENTS,
  PRESS_KIT_ASSETS,
  MASTER_WORKS_CATALOG,
  MASTER_AUDIO_CATALOG
} from '../../data/mediaKitData';
import { MasterWorkAsset } from '../../types/art';

export const MediaKitView: React.FC = () => {
  const setViewMode = useAppStore((s) => s.setViewMode);
  const activeMediaTab = useAppStore((s) => s.activeMediaTab);
  const setActiveMediaTab = useAppStore((s) => s.setActiveMediaTab);
  const copiedFeedback = useAppStore((s) => s.copiedFeedback);
  const setCopiedFeedback = useAppStore((s) => s.setCopiedFeedback);

  // Estados locais da view
  const [statementLang, setStatementLang] = useState<'pt' | 'en'>('pt');
  const [masterFilter, setMasterFilter] = useState<'all' | 'video' | 'still' | 'sound'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Unifica o catálogo de obras visuais e de áudio para a aba de masters
  const allMasterItems: MasterWorkAsset[] = useMemo(() => {
    return [...MASTER_WORKS_CATALOG, ...MASTER_AUDIO_CATALOG];
  }, []);

  // Filtro e busca em tempo real
  const filteredMasters = useMemo(() => {
    return allMasterItems.filter((item) => {
      const matchesMedium = masterFilter === 'all' || item.medium === masterFilter;
      if (!matchesMedium) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.series.toLowerCase().includes(q) ||
        item.materials.toLowerCase().includes(q) ||
        item.masterFormat.toLowerCase().includes(q)
      );
    });
  }, [allMasterItems, masterFilter, searchQuery]);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedFeedback(`${label} copiado com sucesso!`);
    }
  };

  const handleDownloadBlob = (filename: string, content: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopiedFeedback(`Download de ${filename} iniciado!`);
  };

  return (
    <section className="media-kit-section" aria-label="Central de Mídia e Download de Masters">
      {/* Toast flutuante de feedback de cópia */}
      {copiedFeedback && (
        <div className="media-kit-toast font-mono" role="status" aria-live="polite">
          <span className="toast-dot" />
          <span>{copiedFeedback}</span>
        </div>
      )}

      <div className="media-kit-inner">
        {/* Cabeçalho Editorial da Central de Mídia */}
        <header className="media-kit-header">
          <div className="media-kit-header-top">
            <div className="media-kit-tag font-mono">
              <span className="live-status-dot" />
              <span>[CURATORIAL PRESS KIT & MASTER ARCHIVES // GIGANTERA]</span>
            </div>

            <div className="media-kit-nav-actions font-mono">
              <button
                onClick={() => setViewMode('spatial')}
                className="media-nav-btn is-accent"
                title="Voltar ao espaço 3D da galeria"
              >
                ← SALA 3D
              </button>
              <button
                onClick={() => setViewMode('archive')}
                className="media-nav-btn"
                title="Ir para a grade de acervo tradicional"
              >
                ACERVO
              </button>
            </div>
          </div>

          <div className="media-kit-title-row">
            <div>
              <h1 className="media-kit-heading">Central de Mídia & Downloads</h1>
              <p className="media-kit-lead">
                Área reservada para <strong>galeristas, curadores, editais, agentes e imprensa</strong>. Obtenha arquivos brutos em alta resolução (4K ProRes, TIFF 300 DPI, WAV 24-bit), pacotes promocionais, fichas técnicas e citações prontas para catálogos.
              </p>
            </div>

            <div className="media-kit-drive-callout">
              <a
                href={ARTIST_INFO.cloudDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="media-drive-btn font-mono"
                title="Abrir pasta completa no Google Drive com todos os arquivos compactados"
              >
                <span className="drive-btn-icon">📁</span>
                <span>BAIXAR PACOTE COMPLETO (DRIVE) ↗</span>
              </a>
              <span className="drive-hint font-mono">Estrutura completa organizada em pastas · Acesso liberado</span>
            </div>
          </div>

          {/* Abas Principais: 01. DIVULGAÇÃO | 02. OBRAS COMPLETAS */}
          <nav className="media-kit-tabs font-mono" role="tablist" aria-label="Abas de mídia">
            <button
              role="tab"
              aria-selected={activeMediaTab === 'promo'}
              onClick={() => setActiveMediaTab('promo')}
              className={`media-tab-btn ${activeMediaTab === 'promo' ? 'is-active' : ''}`}
            >
              <span className="tab-number">01</span>
              <span>MATERIAL DE DIVULGAÇÃO (PRESS KIT)</span>
              <span className="tab-count">[{PRESS_KIT_ASSETS.length}]</span>
            </button>

            <button
              role="tab"
              aria-selected={activeMediaTab === 'masters'}
              onClick={() => setActiveMediaTab('masters')}
              className={`media-tab-btn ${activeMediaTab === 'masters' ? 'is-active' : ''}`}
            >
              <span className="tab-number">02</span>
              <span>OBRAS COMPLETAS & MASTERS BRUTOS</span>
              <span className="tab-count">[{allMasterItems.length}]</span>
            </button>
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* ABA 01: MATERIAL DE DIVULGAÇÃO (PRESS KIT & CURATORIAL)                   */}
        {/* ========================================================================= */}
        {activeMediaTab === 'promo' && (
          <div className="media-tab-content promo-tab-content">
            {/* Bloco 1: Identificação & Ficha Rápida do Artista */}
            <div className="media-curator-card font-mono">
              <div className="curator-card-header">
                <span className="curator-tag">[IDENTIFICAÇÃO CURATORIAL DO ARTISTA]</span>
                <span className="curator-badge">PELIMOTION STUDIO</span>
              </div>
              <div className="curator-grid">
                <div className="curator-item">
                  <span className="curator-label">ARTISTA:</span>
                  <strong className="curator-val">{ARTIST_INFO.name} ({ARTIST_INFO.alias})</strong>
                </div>
                <div className="curator-item">
                  <span className="curator-label">ATUAÇÃO:</span>
                  <span className="curator-val">{ARTIST_INFO.role}</span>
                </div>
                <div className="curator-item">
                  <span className="curator-label">E-MAIL DIRETO:</span>
                  <a href={`mailto:${ARTIST_INFO.contactEmail}`} className="curator-val is-link">
                    {ARTIST_INFO.contactEmail}
                  </a>
                </div>
                <div className="curator-item">
                  <span className="curator-label">PORTFÓLIO:</span>
                  <a href={ARTIST_INFO.portfolioUrl} target="_blank" rel="noreferrer" className="curator-val is-link">
                    {ARTIST_INFO.portfolioUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* Bloco 2: Biografia Curatorial e Declaração Conceitual (Artist Statement) */}
            <div className="media-texts-row">
              {/* Card de Biografia */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[TEXTO 01]</span>
                    <h2 className="text-box-title">Biografia Curatorial</h2>
                  </div>
                  <div className="text-box-lang-switch">
                    <button
                      onClick={() => setStatementLang('pt')}
                      className={`lang-btn ${statementLang === 'pt' ? 'is-active' : ''}`}
                    >
                      PT-BR
                    </button>
                    <button
                      onClick={() => setStatementLang('en')}
                      className={`lang-btn ${statementLang === 'en' ? 'is-active' : ''}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="text-box-body">
                  <p className="curatorial-paragraph">
                    {statementLang === 'pt' ? CURATORIAL_STATEMENTS.bioPt : CURATORIAL_STATEMENTS.bioEn}
                  </p>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        statementLang === 'pt' ? CURATORIAL_STATEMENTS.bioPt : CURATORIAL_STATEMENTS.bioEn,
                        `Biografia (${statementLang.toUpperCase()})`
                      )
                    }
                    className="box-action-btn"
                  >
                    [COPIAR TEXTO]
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        `felipe-conceicao-biografia-${statementLang}.txt`,
                        statementLang === 'pt' ? CURATORIAL_STATEMENTS.bioPt : CURATORIAL_STATEMENTS.bioEn
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    [BAIXAR .TXT]
                  </button>
                </div>
              </article>

              {/* Card de Declaração do Artista (Statement) */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[TEXTO 02]</span>
                    <h2 className="text-box-title">Artist Statement (GIGANTERA)</h2>
                  </div>
                  <div className="text-box-lang-switch">
                    <button
                      onClick={() => setStatementLang('pt')}
                      className={`lang-btn ${statementLang === 'pt' ? 'is-active' : ''}`}
                    >
                      PT-BR
                    </button>
                    <button
                      onClick={() => setStatementLang('en')}
                      className={`lang-btn ${statementLang === 'en' ? 'is-active' : ''}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="text-box-body">
                  <p className="curatorial-paragraph">
                    {statementLang === 'pt' ? CURATORIAL_STATEMENTS.statementPt : CURATORIAL_STATEMENTS.statementEn}
                  </p>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        statementLang === 'pt' ? CURATORIAL_STATEMENTS.statementPt : CURATORIAL_STATEMENTS.statementEn,
                        `Artist Statement (${statementLang.toUpperCase()})`
                      )
                    }
                    className="box-action-btn"
                  >
                    [COPIAR STATEMENT]
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        `gigantera-artist-statement-${statementLang}.txt`,
                        statementLang === 'pt' ? CURATORIAL_STATEMENTS.statementPt : CURATORIAL_STATEMENTS.statementEn
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    [BAIXAR .TXT]
                  </button>
                </div>
              </article>
            </div>

            {/* Bloco 3: Grid de Assets Gráficos, Logos, Fotos e Releases */}
            <div className="media-assets-section">
              <div className="section-title-row font-mono">
                <span className="sec-tag">[PACOTES GRÁFICOS & ARQUIVOS PARA IMPRENSA]</span>
                <span className="sec-sub">DOWNLOADS DIRETOS EM ALTA DEFINIÇÃO</span>
              </div>

              <div className="media-assets-grid">
                {PRESS_KIT_ASSETS.map((asset) => (
                  <article key={asset.id} className="press-asset-card font-mono">
                    <span className="card-bracket cb-tl">+</span>
                    <span className="card-bracket cb-tr">+</span>
                    <span className="card-bracket cb-bl">+</span>
                    <span className="card-bracket cb-br">+</span>

                    <div className="press-card-top">
                      <div className="press-format-pill">
                        <span className="format-name">{asset.format}</span>
                        {asset.resolutionOrSize && (
                          <span className="format-size">· {asset.resolutionOrSize}</span>
                        )}
                      </div>
                      <span className="press-cat-label">[{asset.category.toUpperCase()}]</span>
                    </div>

                    <div className="press-card-body">
                      {asset.previewUrl && (
                        <div className="press-thumb-wrap">
                          <img src={asset.previewUrl} alt={asset.title} className="press-thumb-img" />
                        </div>
                      )}
                      <h3 className="press-asset-title">{asset.title}</h3>
                      <p className="press-asset-desc">{asset.description}</p>
                    </div>

                    <div className="press-card-actions">
                      {asset.fileUrl && (
                        <a
                          href={asset.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="press-action-btn is-primary"
                        >
                          BAIXAR ARQUIVO ↓
                        </a>
                      )}
                      {asset.copyableContent && (
                        <button
                          onClick={() => handleCopy(asset.copyableContent!, asset.title)}
                          className="press-action-btn is-secondary"
                        >
                          COPIAR CONTEÚDO
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 02: OBRAS COMPLETAS & MASTERS BRUTOS                                  */}
        {/* ========================================================================= */}
        {activeMediaTab === 'masters' && (
          <div className="media-tab-content masters-tab-content">
            {/* Controles de Filtro e Barra de Busca */}
            <div className="masters-filter-bar font-mono">
              <div className="masters-search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR OBRA, SÉRIE OU ESPECIFICAÇÃO TÉCNICA..."
                  className="masters-search-input"
                  aria-label="Buscar obra no catálogo master"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-btn" title="Limpar busca">
                    ✕
                  </button>
                )}
              </div>

              <div className="masters-filter-buttons" role="group" aria-label="Filtro por tipo de master">
                {(['all', 'video', 'still', 'sound'] as const).map((filter) => {
                  const count =
                    filter === 'all'
                      ? allMasterItems.length
                      : allMasterItems.filter((m) => m.medium === filter).length;

                  const label =
                    filter === 'all'
                      ? 'TODOS'
                      : filter === 'video'
                      ? 'VÍDEO (4K PRORES)'
                      : filter === 'still'
                      ? 'STILL (300 DPI)'
                      : 'SOM (24-BIT WAV)';

                  const isActive = masterFilter === filter;

                  return (
                    <button
                      key={filter}
                      onClick={() => setMasterFilter(filter)}
                      className={`master-filter-btn ${isActive ? 'is-active' : ''}`}
                    >
                      <span>{label}</span>
                      <span className="master-count">[{count}]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de Master Assets com Fichas Técnicas & Citação Curatorial */}
            <div className="masters-grid">
              {filteredMasters.length === 0 ? (
                <div className="masters-empty-state font-mono">
                  <span>[NENHUMA OBRA ENCONTRADA PARA OS CRITÉRIOS DE BUSCA]</span>
                </div>
              ) : (
                filteredMasters.map((master, idx) => (
                  <article key={master.id} className="master-item-card">
                    <span className="card-bracket cb-tl">+</span>
                    <span className="card-bracket cb-tr">+</span>
                    <span className="card-bracket cb-bl">+</span>
                    <span className="card-bracket cb-br">+</span>

                    <div className="master-card-layout">
                      {/* Lado Esquerdo: Preview da Obra */}
                      <div className="master-media-col">
                        <div className="master-thumb-frame">
                          <img
                            src={master.previewSrc}
                            alt={master.title}
                            loading="lazy"
                            className="master-thumb-image"
                          />
                          <div className="master-media-badge font-mono">
                            {master.medium.toUpperCase()} // 0{idx + 1}
                          </div>
                        </div>
                      </div>

                      {/* Lado Direito: Especificações Técnicas e Citação Curatorial */}
                      <div className="master-info-col">
                        <div className="master-header-row font-mono">
                          <div className="master-series-tag">
                            <span>[{master.series.toUpperCase()}]</span>
                            <span>{master.year}</span>
                          </div>
                          <div className="master-format-pill">
                            <span>{master.masterFormat}</span>
                          </div>
                        </div>

                        <h2 className="master-title">{master.title}</h2>
                        <p className="master-materials font-mono">{master.materials}</p>
                        <p className="master-statement">{master.curatorialStatement}</p>

                        {/* Tabela de Metadados Técnicos */}
                        <div className="master-specs-grid font-mono">
                          <div className="spec-item">
                            <span className="spec-k">DIMENSÕES / DURAÇÃO:</span>
                            <span className="spec-v">{master.dimensionsOrDuration}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-k">ESPAÇO DE COR:</span>
                            <span className="spec-v">{master.colorSpace}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-k">PESO ESTIMADO:</span>
                            <span className="spec-v">{master.fileSizeApprox}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-k">STATUS DE ACERVO:</span>
                            <span className="spec-v is-ready">✓ DISPONÍVEL P/ DOWNLOAD</span>
                          </div>
                        </div>

                        {/* Caixa de Citação para Catálogo com Botão 1-Clique */}
                        <div className="master-citation-box font-mono">
                          <div className="citation-header">
                            <span className="citation-label">[CRÉDITO PADRONIZADO P/ CATÁLOGO E EDITAL]</span>
                            <button
                              onClick={() => handleCopy(master.citationCredit, `Crédito de "${master.title}"`)}
                              className="citation-copy-btn"
                              title="Copiar citação formatada para a área de transferência"
                            >
                              [COPIAR CRÉDITO 📋]
                            </button>
                          </div>
                          <p className="citation-text">{master.citationCredit}</p>
                        </div>

                        {/* Ações de Download Direto e Nuvem */}
                        <div className="master-actions-row font-mono">
                          <a
                            href={master.downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="master-download-btn is-primary"
                          >
                            <span>BAIXAR MASTER ({master.medium === 'video' ? 'VÍDEO' : master.medium === 'sound' ? 'ÁUDIO' : 'IMAGEM'}) ↓</span>
                          </a>

                          {master.cloudStorageUrl && (
                            <a
                              href={master.cloudStorageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="master-download-btn is-secondary"
                              title="Abrir no Google Drive da Coleção"
                            >
                              <span>VER NO DRIVE ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
