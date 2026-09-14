import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../core/store';

export const ArtistBioModal: React.FC = () => {
  const isBioOpen = useAppStore((s) => s.isBioOpen);
  const setBioOpen = useAppStore((s) => s.setBioOpen);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBioOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setBioOpen]);

  if (!isBioOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('pelimotion@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  return (
    <div
      className="bio-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bio-artist-name"
      onClick={(e) => {
        if (e.target === e.currentTarget) setBioOpen(false);
      }}
    >
      <div className="bio-dossier-card">
        {/* Cantoneiras brutas */}
        <span className="bio-bracket bb-tl">┌</span>
        <span className="bio-bracket bb-tr">┐</span>
        <span className="bio-bracket bb-bl">└</span>
        <span className="bio-bracket bb-br">┘</span>

        {/* Topo do Painel */}
        <div className="bio-header-bar">
          <span className="bio-tag font-mono">[ARTIST DOSSIER // CURATORIAL STATEMENT]</span>
          <button
            onClick={() => setBioOpen(false)}
            className="bio-close-btn"
            aria-label="Fechar biografia e contato"
          >
            [✕ FECHAR · ESC]
          </button>
        </div>

        {/* Corpo Editorial do Dossier */}
        <div className="bio-content-grid">
          {/* Coluna 1: Declaração Conceitual */}
          <div className="bio-statement-col">
            <span className="bio-sub font-mono">[DIREÇÃO & CRIAÇÃO]</span>
            <h2 id="bio-artist-name" className="bio-artist-title">
              Felipe Conceição
            </h2>
            <div className="bio-role-badge font-mono">
              GIGANTERA · ARTISTA DIGITAL, ESCULTURA COMPUTACIONAL & SOM
            </div>

            <p className="bio-paragraph">
              <strong>Gigantera</strong> é o pavilhão digital de Felipe Conceição. Um espaço brutalista tridimensional onde obra still, vídeo cinético e som autoral flutuam entre vitrines de vidro. Você não navega. Você atravessa.
            </p>

            <p className="bio-paragraph">
              Felipe Conceição atua como <strong>Gigantera</strong>, articulando código, mídias generativas e projeção com a fisicalidade da prata, aço, areia e redes de pesca. Sua pesquisa fricciona o acabamento polido da indústria de imagens com o apagamento de sua herança territorial caiçara, investigando a perda do tempo orgânico na aceleração do nosso modelo econômico.
            </p>

            <div className="bio-pillars-strip">
              <div className="pillar-item">
                <span className="pillar-num font-mono">01 // STILL</span>
                <span className="pillar-label">Escultura digital e fotogrametria mineral</span>
              </div>
              <div className="pillar-item">
                <span className="pillar-num font-mono">02 // VIDEO</span>
                <span className="pillar-label">Simulação cinemática e estocástica de partículas</span>
              </div>
              <div className="pillar-item">
                <span className="pillar-num font-mono">03 // SOUND</span>
                <span className="pillar-label">Síntese de música eletrônica e dispersão acústica</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Transmissão Direta & Contatos */}
          <div className="bio-contact-col">
            <div className="contact-box">
              <span className="box-title font-mono">[TRANSMISSÃO DIRETA & CONTATO]</span>
              <p className="contact-desc">
                Disponível para encomendas curatoriais, direções de arte, instalações imersivas e colaborações musicais.
              </p>

              <div className="email-copy-action">
                <span className="email-display font-mono">pelimotion@gmail.com</span>
                <button
                  onClick={handleCopyEmail}
                  className="copy-btn font-mono"
                  aria-label="Copiar endereço de e-mail"
                >
                  {copiedEmail ? '✓ COPIADO!' : '[COPIAR E-MAIL]'}
                </button>
              </div>

              <div className="contact-links-list font-mono">
                <a
                  href="https://instagram.com/pelimotion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span>INSTAGRAM</span>
                  <span className="link-arrow">↗</span>
                </a>
                <a
                  href="https://www.pelimotion.art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span>PELIMOTION STUDIO</span>
                  <span className="link-arrow">↗</span>
                </a>
                <a
                  href="https://vimeo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span>VIMEO ARCHIVE</span>
                  <span className="link-arrow">↗</span>
                </a>
              </div>
            </div>

            <div className="studio-location-box font-mono">
              <span className="loc-label">[ATELIÊ & PIPELINE]</span>
              <span className="loc-val">BLUMENAU / BRASIL · FUSO UTC-3</span>
              <span className="loc-engine">RENDERIZADO COM THREE.JS & WEB AUDIO API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
