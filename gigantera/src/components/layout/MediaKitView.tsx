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
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

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

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedFeedback(`${label} copiado com sucesso!`);
    }
  };

  const handleDirectDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCopiedFeedback(`Download de "${filename}" iniciado!`);
  };

  const handleDownloadBlob = (filename: string, content: string, mimeType = 'text/plain;charset=utf-8') => {
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
    <section className="media-kit-section" aria-label="Central de Mídia e Acervo de Obras">
      {/* Toast flutuante de feedback de cópia */}
      {copiedFeedback && (
        <div className="media-kit-toast font-mono" role="status" aria-live="polite">
          <span className="toast-dot" />
          <span>{copiedFeedback}</span>
        </div>
      )}

      <div className="media-kit-inner">
        {/* Cabeçalho Editorial Limpo */}
        <header className="media-kit-header">
          <div className="media-kit-header-top">
            <div className="media-kit-tag font-mono">
              <span className="live-status-dot" />
              <span>GIGANTERA // IMPRENSA & ACERVO</span>
            </div>

            <div className="media-kit-nav-actions font-mono">
              <button
                onClick={() => setViewMode('spatial')}
                className="media-nav-btn is-accent"
                title="Voltar ao espaço 3D do pavilhão"
              >
                ← VOLTAR AO PAVILHÃO 3D
              </button>
            </div>
          </div>

          <div className="media-kit-title-row">
            <div>
              <h1 className="media-kit-heading">Material de Imprensa & Acervo</h1>
              <p className="media-kit-lead">
                Área reservada para <strong>galeristas, curadores, editais e imprensa</strong>. Baixe os arquivos brutos das obras em alta definição e materiais oficiais de divulgação.
              </p>
            </div>

            <div className="media-kit-drive-callout">
              <a
                href={ARTIST_INFO.cloudDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="media-drive-btn font-mono"
                title="Abrir pasta completa no Google Drive"
              >
                <span className="drive-btn-icon">📁</span>
                <span>PASTA COMPLETA NO DRIVE ↗</span>
              </a>
              <span className="drive-hint font-mono">Arquivos brutos e masters descompactados</span>
            </div>
          </div>

          {/* Seletor de Abas Limpo */}
          <nav className="media-kit-tabs font-mono" role="tablist" aria-label="Abas de mídia">
            <button
              role="tab"
              aria-selected={activeMediaTab === 'promo'}
              onClick={() => setActiveMediaTab('promo')}
              className={`media-tab-btn ${activeMediaTab === 'promo' ? 'is-active' : ''}`}
            >
              <span className="tab-number">01</span>
              <span>MATERIAL DE DIVULGAÇÃO</span>
              <span className="tab-count">[{PRESS_KIT_ASSETS.length}]</span>
            </button>

            <button
              role="tab"
              aria-selected={activeMediaTab === 'masters'}
              onClick={() => setActiveMediaTab('masters')}
              className={`media-tab-btn ${activeMediaTab === 'masters' ? 'is-active' : ''}`}
            >
              <span className="tab-number">02</span>
              <span>OBRAS COMPLETAS & MASTERS</span>
              <span className="tab-count">[{allMasterItems.length}]</span>
            </button>
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* ABA 01: MATERIAL DE DIVULGAÇÃO (PRESS KIT)                                */}
        {/* ========================================================================= */}
        {activeMediaTab === 'promo' && (
          <div className="media-tab-content promo-tab-content">
            {/* Bloco 1: Textos Oficiais (Biografia e Statement) */}
            <div className="media-texts-row">
              {/* Card de Biografia */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[TEXTO OFICIAL]</span>
                    <h2 className="text-box-title">Biografia Curatorial</h2>
                  </div>
                  <div className="text-box-lang-switch">
                    <button
                      onClick={() => setStatementLang('pt')}
                      className={`lang-btn ${statementLang === 'pt' ? 'is-active' : ''}`}
                    >
                      PT
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
                    COPIAR TEXTO 📋
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        `gigantera-biografia-${statementLang}.txt`,
                        statementLang === 'pt' ? CURATORIAL_STATEMENTS.bioPt : CURATORIAL_STATEMENTS.bioEn
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    BAIXAR .TXT ↓
                  </button>
                </div>
              </article>

              {/* Card de Declaração do Artista (Statement) */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[TEXTO CONCEITUAL]</span>
                    <h2 className="text-box-title">Artist Statement</h2>
                  </div>
                  <div className="text-box-lang-switch">
                    <button
                      onClick={() => setStatementLang('pt')}
                      className={`lang-btn ${statementLang === 'pt' ? 'is-active' : ''}`}
                    >
                      PT
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
                    COPIAR STATEMENT 📋
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
                    BAIXAR .TXT ↓
                  </button>
                </div>
              </article>
            </div>

            {/* Bloco 2: Arquivos e Pacotes para Download */}
            <div className="media-assets-section">
              <div className="section-title-row font-mono">
                <span className="sec-tag">[DOWNLOADS DE ARQUIVOS OFICIAIS]</span>
                <span className="sec-sub">FOTOS, IDENTIDADE VISUAL E DOCUMENTOS</span>
              </div>

              <div className="media-assets-grid">
                {PRESS_KIT_ASSETS.map((asset) => (
                  <article key={asset.id} className="press-asset-card font-mono">
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
                          COPIAR TEXTO 📋
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
        {/* ABA 02: OBRAS COMPLETAS & MASTERS                                         */}
        {/* ========================================================================= */}
        {activeMediaTab === 'masters' && (
          <div className="media-tab-content masters-tab-content">
            {/* Barra de Filtro Rápido e Busca */}
            <div className="masters-filter-bar font-mono">
              <div className="masters-search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar obra pelo título..."
                  className="masters-search-input"
                  aria-label="Buscar obra no catálogo master"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-btn" title="Limpar busca">
                    ✕
                  </button>
                )}
              </div>

              <div className="masters-filter-buttons" role="group" aria-label="Filtro por tipo de obra">
                {(['all', 'video', 'still', 'sound'] as const).map((filter) => {
                  const count =
                    filter === 'all'
                      ? allMasterItems.length
                      : allMasterItems.filter((m) => m.medium === filter).length;

                  const label =
                    filter === 'all'
                      ? 'TODAS'
                      : filter === 'video'
                      ? 'VÍDEOS'
                      : filter === 'still'
                      ? 'STILLS'
                      : 'SOM';

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

            {/* Grid de Obras: Limpo, Visual e Prático */}
            <div className="masters-grid">
              {filteredMasters.length === 0 ? (
                <div className="masters-empty-state font-mono">
                  <span>[NENHUMA OBRA ENCONTRADA PARA OS CRITÉRIOS DE BUSCA]</span>
                </div>
              ) : (
                filteredMasters.map((master) => {
                  const isExpanded = !!expandedDetails[master.id];
                  const filename = master.downloadUrl.split('/').pop() || `${master.title}.${master.medium === 'video' ? 'mp4' : master.medium === 'sound' ? 'mp3' : 'jpg'}`;

                  return (
                    <article key={master.id} className="master-item-card">
                      <div className="master-card-layout">
                        {/* Preview da Obra */}
                        <div className="master-media-col">
                          <div className="master-thumb-frame">
                            <img
                              src={master.previewSrc}
                              alt={master.title}
                              loading="lazy"
                              className="master-thumb-image"
                            />
                            <div className="master-media-badge font-mono">
                              {master.medium === 'video' ? 'VÍDEO LOOP' : master.medium === 'sound' ? 'ÁUDIO' : 'IMPRESSO GICLÉE'}
                            </div>
                          </div>
                        </div>

                        {/* Informações Principais & Botão de Download */}
                        <div className="master-info-col">
                          <div className="master-header-row font-mono">
                            <div className="master-series-tag">
                              <span>[{master.series.toUpperCase()}]</span>
                              <span>{master.year}</span>
                            </div>
                            <span className="master-size-tag font-mono">
                              {master.fileSizeApprox}
                            </span>
                          </div>

                          <h2 className="master-title">{master.title}</h2>
                          <p className="master-statement">{master.curatorialStatement}</p>

                          {/* Botões de Ação Direta */}
                          <div className="master-actions-row font-mono">
                            <a
                              href={master.downloadUrl}
                              download={filename}
                              onClick={(e) => handleDirectDownload(e, master.downloadUrl, filename)}
                              className="master-download-btn is-primary"
                            >
                              <span>BAIXAR ARQUIVO ↓</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => toggleDetails(master.id)}
                              className="master-download-btn is-secondary"
                            >
                              <span>{isExpanded ? '▲ OCULTAR DETALHES' : '▼ FICHA TÉCNICA & CITAÇÃO'}</span>
                            </button>

                            {master.cloudStorageUrl && (
                              <a
                                href={master.cloudStorageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="master-download-btn is-ghost"
                                title="Abrir pasta completa no Google Drive"
                              >
                                <span>DRIVE ↗</span>
                              </a>
                            )}
                          </div>

                          {/* Gaveta Expansível de Detalhes (Oculta por padrão para manter a página limpa) */}
                          {isExpanded && (
                            <div className="master-expanded-drawer font-mono">
                              <div className="master-specs-grid">
                                <div className="spec-item">
                                  <span className="spec-k">FORMATO MASTER:</span>
                                  <span className="spec-v">{master.masterFormat}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="spec-k">DIMENSÕES / DURAÇÃO:</span>
                                  <span className="spec-v">{master.dimensionsOrDuration}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="spec-k">ESPAÇO DE COR:</span>
                                  <span className="spec-v">{master.colorSpace}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="spec-k">MATERIAIS:</span>
                                  <span className="spec-v">{master.materials}</span>
                                </div>
                              </div>

                              <div className="master-citation-box">
                                <div className="citation-header">
                                  <span className="citation-label">[CRÉDITO P/ EDITAL & CATÁLOGO]</span>
                                  <button
                                    onClick={() => handleCopy(master.citationCredit, `Crédito de "${master.title}"`)}
                                    className="citation-copy-btn"
                                  >
                                    COPIAR CRÉDITO 📋
                                  </button>
                                </div>
                                <p className="citation-text">{master.citationCredit}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
