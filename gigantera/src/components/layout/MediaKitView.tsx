import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../core/store';
import {
  ARTIST_INFO as DEFAULT_ARTIST_INFO,
  CURATORIAL_STATEMENTS as DEFAULT_STATEMENTS,
  PRESS_KIT_ASSETS as DEFAULT_PRESS_ASSETS,
  MASTER_AUDIO_CATALOG,
  GIGANTERA_TEXTOS_CANONICOS,
  getWorkRealSize
} from '../../data/mediaKitData';
import {
  getMergedArtworks,
  getMergedPressKitAssets,
  getMergedArtistInfo,
  getMergedCuratorialStatements
} from '../../data/configBridge';
import { MasterWorkAsset, Artwork } from '../../types/art';

export const MediaKitView: React.FC = () => {
  const setViewMode = useAppStore((s) => s.setViewMode);
  const activeMediaTab = useAppStore((s) => s.activeMediaTab);
  const setActiveMediaTab = useAppStore((s) => s.setActiveMediaTab);
  const copiedFeedback = useAppStore((s) => s.copiedFeedback);
  const setCopiedFeedback = useAppStore((s) => s.setCopiedFeedback);

  // Gatilho reativo para atualizações do Admin
  const [configVersion, setConfigVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setConfigVersion((v) => v + 1);
    window.addEventListener('gigantera:config-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gigantera:config-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Dados mesclados reativos
  const artistInfo = useMemo(() => getMergedArtistInfo(), [configVersion]);
  const curatorialStatements = useMemo(() => getMergedCuratorialStatements(), [configVersion]);
  const pressAssets = useMemo(() => {
    const assets = getMergedPressKitAssets();
    return assets.filter((a) => a.status !== 'hidden');
  }, [configVersion]);

  const rawArtworks = useMemo(() => getMergedArtworks(), [configVersion]);

  // Estados locais da view
  const [statementLang, setStatementLang] = useState<'pt' | 'en'>('pt');
  const [bioLength, setBioLength] = useState<'mini' | 'short' | 'institutional'>('short');
  const [masterFilter, setMasterFilter] = useState<'all' | 'video' | 'still' | 'sound'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});

  // Monta o catálogo de masters filtrando apenas as obras autorizadas
  const masterVisuals: MasterWorkAsset[] = useMemo(() => {
    return rawArtworks
      .filter((art: Artwork) => art.availableInMediaKit !== false && art.status !== 'hidden')
      .map((art: Artwork) => {
        const isVideo = art.medium === 'video';
        const masterFormat = art.masterFormat || (isVideo
          ? 'Apple ProRes 422 HQ (4K UHD 60fps) + Master Áudio PCM'
          : 'TIFF 16-bit Não-Comprimido (300 DPI)');
        const dimensions = art.dimensionsOrDuration || (isVideo ? '3840x2160 UHD (16:9)' : '4000x5000 px (4:5) / 300 DPI');
        const colorSpace = isVideo ? 'Rec.709 / BT.1886' : 'Adobe RGB (1998) / sRGB';
        
        const sizeInfo = getWorkRealSize(art.id, isVideo);
        const citationCredit = `CONCEIÇÃO, Felipe. ${art.title}, ${art.year}. ${art.materials}. ${dimensions}. Coleção Gigantera. Disponível em: https://pelimotion.art/gigantera.`;

        return {
          id: `master-${art.id}`,
          artworkId: art.id,
          title: art.title,
          series: art.series,
          medium: art.medium,
          year: art.year,
          materials: art.materials,
          masterFormat,
          dimensionsOrDuration: dimensions,
          colorSpace,
          fileSizeApprox: sizeInfo.displaySize,
          webFileSize: sizeInfo.webSize,
          masterFileSize: sizeInfo.masterSize,
          previewSrc: art.imageSrc,
          downloadUrl: art.videoSrc || art.imageSrc,
          cloudStorageUrl: art.cloudStorageUrl || artistInfo.cloudDriveUrl,
          citationCredit,
          curatorialStatement: art.description,
          availableInMediaKit: true
        };
      });
  }, [rawArtworks, artistInfo]);

  const allMasterItems: MasterWorkAsset[] = useMemo(() => {
    return [...masterVisuals, ...MASTER_AUDIO_CATALOG];
  }, [masterVisuals]);

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

  /**
   * Download Direto Robusto via Blob CORS
   * Garante nome do arquivo e formato sem erros no navegador
   */
  const handleDirectDownload = async (e: React.MouseEvent, rawUrl: string, filename: string, itemId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (itemId) {
      setDownloadingIds((prev) => ({ ...prev, [itemId]: true }));
    }
    setCopiedFeedback(`Preparando download de "${filename}"...`);

    try {
      let fullUrl = rawUrl;
      if (!/^https?:\/\//i.test(rawUrl)) {
        fullUrl = new URL(rawUrl, window.location.origin).href;
      }

      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setCopiedFeedback(`Download de "${filename}" concluído!`);
    } catch (err) {
      console.warn('[Direct Download Fallback]', err);
      const a = document.createElement('a');
      a.href = rawUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setCopiedFeedback(`Download de "${filename}" iniciado!`);
    } finally {
      if (itemId) {
        setDownloadingIds((prev) => ({ ...prev, [itemId]: false }));
      }
    }
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

  // Obter o texto de biografia de acordo com o tamanho selecionado
  const activeBioText = useMemo(() => {
    if (statementLang === 'en') {
      return curatorialStatements.bioEn;
    }
    if (bioLength === 'mini') {
      return curatorialStatements.miniBio || GIGANTERA_TEXTOS_CANONICOS.miniBio;
    }
    if (bioLength === 'institutional') {
      return curatorialStatements.bioInstitutional || GIGANTERA_TEXTOS_CANONICOS.bioInstitutional;
    }
    return curatorialStatements.bioShort || curatorialStatements.bioPt || GIGANTERA_TEXTOS_CANONICOS.bioShort;
  }, [curatorialStatements, bioLength, statementLang]);

  return (
    <section className="media-kit-section" aria-label="Central de Mídia e Acervo de Obras">
      {/* Toast flutuante de feedback */}
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
                Área reservada para <strong>galeristas, curadores, editais e imprensa</strong>. Textos canônicos sobre o projeto <strong>GIGANTERA</strong> e arquivos brutos das obras para download.
              </p>
            </div>

            {artistInfo.cloudDriveUrl && (
              <div className="media-kit-drive-callout">
                <a
                  href={artistInfo.cloudDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="media-drive-btn font-mono"
                  title="Abrir pasta completa no Google Drive"
                >
                  <span className="drive-btn-icon">📁</span>
                  <span>PASTA COMPLETA NO DRIVE ↗</span>
                </a>
                <span className="drive-hint font-mono">Masters 4K ProRes e TIFFs 300 DPI</span>
              </div>
            )}
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
              <span>TEXTOS CANÔNICOS & PRESS KIT</span>
              <span className="tab-count">[{pressAssets.length}]</span>
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
        {/* ABA 01: MATERIAL DE DIVULGAÇÃO & TEXTOS CANÔNICOS DO GIGANTERA             */}
        {/* ========================================================================= */}
        {activeMediaTab === 'promo' && (
          <div className="media-tab-content promo-tab-content">
            {/* Banner de Destaque: Tagline Oficial */}
            <div className="tagline-banner">
              <div className="tagline-banner-left font-mono">
                <span className="tagline-tag">[TAGLINE INSTITUCIONAL // 1 LINHA]</span>
                <p className="tagline-text">"{curatorialStatements.tagline || GIGANTERA_TEXTOS_CANONICOS.tagline}"</p>
                <span className="tagline-hint">Uso: bio de Instagram, assinatura de e-mail e abertura de dossiês</span>
              </div>
              <button
                onClick={() => handleCopy(curatorialStatements.tagline || GIGANTERA_TEXTOS_CANONICOS.tagline, 'Tagline Oficial')}
                className="box-action-btn font-mono"
              >
                COPIAR TAGLINE 📋
              </button>
            </div>

            {/* Bloco 1: Textos Oficiais (Biografia e Statement) */}
            <div className="media-texts-row">
              {/* Card de Biografia com seletor de extensão */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[BIOGRAFIA EM 3ª PESSOA]</span>
                    <h2 className="text-box-title">Biografia do Artista</h2>
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

                {/* Seletor de Extensão (apenas em PT) */}
                {statementLang === 'pt' && (
                  <div className="bio-ext-selector font-mono">
                    <span className="bio-ext-label">EXTENSÃO:</span>
                    <button
                      onClick={() => setBioLength('mini')}
                      className={`bio-ext-btn ${bioLength === 'mini' ? 'is-active' : ''}`}
                    >
                      MINI BIO (~50p)
                    </button>
                    <button
                      onClick={() => setBioLength('short')}
                      className={`bio-ext-btn ${bioLength === 'short' ? 'is-active' : ''}`}
                    >
                      CURTA (~150p)
                    </button>
                    <button
                      onClick={() => setBioLength('institutional')}
                      className={`bio-ext-btn ${bioLength === 'institutional' ? 'is-active' : ''}`}
                    >
                      LONGA (~280p)
                    </button>
                  </div>
                )}

                <div className="text-box-body">
                  <p className="curatorial-paragraph" style={{ whiteSpace: 'pre-line' }}>
                    {activeBioText}
                  </p>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        activeBioText,
                        `Biografia (${statementLang.toUpperCase()} - ${bioLength.toUpperCase()})`
                      )
                    }
                    className="box-action-btn"
                  >
                    COPIAR BIOGRAFIA 📋
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        `gigantera-biografia-${statementLang}-${bioLength}.txt`,
                        activeBioText
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    BAIXAR .TXT ↓
                  </button>
                </div>
              </article>

              {/* Card de Declaração do Artista (Artist Statement em 1ª Pessoa) */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[CONCEITO EM 1ª PESSOA]</span>
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
                  <p className="curatorial-paragraph" style={{ whiteSpace: 'pre-line' }}>
                    {statementLang === 'pt'
                      ? (curatorialStatements.statementPt || GIGANTERA_TEXTOS_CANONICOS.artistStatement)
                      : curatorialStatements.statementEn}
                  </p>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        statementLang === 'pt'
                          ? (curatorialStatements.statementPt || GIGANTERA_TEXTOS_CANONICOS.artistStatement)
                          : curatorialStatements.statementEn,
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
                        statementLang === 'pt'
                          ? (curatorialStatements.statementPt || GIGANTERA_TEXTOS_CANONICOS.artistStatement)
                          : curatorialStatements.statementEn
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    BAIXAR .TXT ↓
                  </button>
                </div>
              </article>
            </div>

            {/* Bloco Adicional: Nota de Processo & CV Esqueleto */}
            <div className="media-texts-row">
              {/* Card Nota de Processo & Materiais */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[RIDER TÉCNICO & MATERIAIS]</span>
                    <h2 className="text-box-title">Nota de Processo</h2>
                  </div>
                </div>

                <div className="text-box-body">
                  <p className="curatorial-paragraph" style={{ whiteSpace: 'pre-line' }}>
                    {curatorialStatements.processNotes || GIGANTERA_TEXTOS_CANONICOS.processNotes}
                  </p>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        curatorialStatements.processNotes || GIGANTERA_TEXTOS_CANONICOS.processNotes,
                        'Nota de Processo'
                      )
                    }
                    className="box-action-btn"
                  >
                    COPIAR NOTA 📋
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        'gigantera-nota-de-processo.txt',
                        curatorialStatements.processNotes || GIGANTERA_TEXTOS_CANONICOS.processNotes
                      )
                    }
                    className="box-action-btn is-secondary"
                  >
                    BAIXAR .TXT ↓
                  </button>
                </div>
              </article>

              {/* Card CV / Trajetória Artística */}
              <article className="media-text-box">
                <div className="text-box-header font-mono">
                  <div className="text-box-title-group">
                    <span className="text-box-tag">[CRONOLOGIA & TRAJETÓRIA]</span>
                    <h2 className="text-box-title">Currículo do Artista</h2>
                  </div>
                </div>

                <div className="text-box-body">
                  <pre className="cv-pre-block font-mono">
                    {curatorialStatements.cvSkeleton || GIGANTERA_TEXTOS_CANONICOS.cvSkeleton}
                  </pre>
                </div>

                <div className="text-box-footer font-mono">
                  <button
                    onClick={() =>
                      handleCopy(
                        curatorialStatements.cvSkeleton || GIGANTERA_TEXTOS_CANONICOS.cvSkeleton,
                        'Currículo do Artista'
                      )
                    }
                    className="box-action-btn"
                  >
                    COPIAR CV 📋
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadBlob(
                        'gigantera-curriculo-trajetoria.txt',
                        curatorialStatements.cvSkeleton || GIGANTERA_TEXTOS_CANONICOS.cvSkeleton
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
                {pressAssets.map((asset) => {
                  const isPending = asset.status === 'pending';
                  const hasFile = !!asset.fileUrl && !isPending;
                  const hasCopyText = !!asset.copyableContent;

                  return (
                    <article key={asset.id} className="press-asset-card font-mono">
                      <div className="press-card-top">
                        <div className="press-format-pill">
                          <span className="format-name">{asset.format}</span>
                          {asset.resolutionOrSize && (
                            <span className="format-size">· {asset.resolutionOrSize}</span>
                          )}
                        </div>
                        {isPending ? (
                          <span className="press-cat-label" style={{ color: 'var(--accent-gold)' }}>
                            [EM PREPARAÇÃO]
                          </span>
                        ) : (
                          <span className="press-cat-label">[{asset.category.toUpperCase()}]</span>
                        )}
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
                        {hasFile && (
                          <button
                            type="button"
                            disabled={downloadingIds[asset.id]}
                            onClick={(e) => handleDirectDownload(e, asset.fileUrl!, asset.fileUrl!.split('/').pop() || `${asset.id}.file`, asset.id)}
                            className="press-action-btn is-primary"
                          >
                            {downloadingIds[asset.id] ? 'BAIXANDO...' : 'BAIXAR ARQUIVO ↓'}
                          </button>
                        )}

                        {hasCopyText && (
                          <>
                            <button
                              onClick={() => handleCopy(asset.copyableContent!, asset.title)}
                              className="press-action-btn is-secondary"
                            >
                              COPIAR TEXTO 📋
                            </button>
                            <button
                              onClick={() => handleDownloadBlob(`${asset.id}.txt`, asset.copyableContent!)}
                              className="press-action-btn is-secondary"
                            >
                              BAIXAR .TXT ↓
                            </button>
                          </>
                        )}

                        {isPending && !hasFile && !hasCopyText && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0' }}>
                            Arquivo em produção pelo ateliê
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
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
                  <span>[NENHUMA OBRA DISPONÍVEL NO MEDIA KIT PARA ESTA SELEÇÃO]</span>
                </div>
              ) : (
                filteredMasters.map((master) => {
                  const isExpanded = !!expandedDetails[master.id];
                  const filename = master.downloadUrl.split('/').pop() || `${master.title}.${master.medium === 'video' ? 'mp4' : master.medium === 'sound' ? 'mp3' : 'jpg'}`;
                  const isDownloading = !!downloadingIds[master.id];

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
                            <div className="master-size-tags font-mono">
                              <span className="master-size-tag is-web" title="Tamanho do arquivo otimizado para download direto web">
                                {master.webFileSize || master.fileSizeApprox.split(' · ')[0]}
                              </span>
                              {master.masterFileSize && (
                                <span className="master-size-tag is-master" title="Master bruto não-comprimido disponível no Google Drive">
                                  {master.masterFileSize} Drive
                                </span>
                              )}
                            </div>
                          </div>

                          <h2 className="master-title">{master.title}</h2>
                          <p className="master-statement">{master.curatorialStatement}</p>

                          {/* Botões de Ação Direta */}
                          <div className="master-actions-row font-mono">
                            <button
                              type="button"
                              disabled={isDownloading}
                              onClick={(e) => handleDirectDownload(e, master.downloadUrl, filename, master.id)}
                              className="master-download-btn is-primary"
                              title={`Baixar ${master.title} (${master.webFileSize || 'Otimizado'})`}
                            >
                              <span>{isDownloading ? 'BAIXANDO... ⏳' : 'BAIXAR ARQUIVO WEB ↓'}</span>
                            </button>

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
                                title="Abrir pasta completa no Google Drive (Masters ProRes / TIFFs 300 DPI)"
                              >
                                <span>DRIVE MASTER ↗</span>
                              </a>
                            )}
                          </div>

                          {/* Gaveta Expansível de Detalhes */}
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
                                <div className="spec-item">
                                  <span className="spec-k">TAMANHO ARQUIVO WEB:</span>
                                  <span className="spec-v">{master.webFileSize || 'Otimizado'}</span>
                                </div>
                                <div className="spec-item">
                                  <span className="spec-k">TAMANHO MASTER BRUTO:</span>
                                  <span className="spec-v">{master.masterFileSize || 'Sob Demanda'}</span>
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
