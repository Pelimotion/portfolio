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
      role="dialog"
      aria-modal="true"
      aria-labelledby="bio-artist-name"
      onClick={(e) => {
        if (e.target === e.currentTarget) setBioOpen(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 6, 6, 0.96)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        color: '#f4f3ef',
        padding: '5vh 5vw',
        overflowY: 'auto'
      }}
    >
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', gap: '6vh', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2vh' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-gold)' }}>
            [MANIFESTO & CONTACT]
          </span>
          <button
            onClick={() => setBioOpen(false)}
            aria-label="Fechar biografia e contato"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#fff',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              opacity: 0.6,
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            [✕ CLOSE / ESC]
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', gap: '8vw', flexWrap: 'wrap' }}>
          
          {/* Manifesto Column */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
            <h2 id="bio-artist-name" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              Felipe<br/>Conceição
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
              Gigantera · Digital Artist, Computational Sculpture & Sound
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: '600px' }}>
              <strong style={{ color: '#fff', fontWeight: 500 }}>Gigantera</strong> is the digital pavilion of Felipe Conceição. A three-dimensional brutalist space where still artworks, kinetic video, and original sound float between glass vitrines. You do not browse. You traverse.
            </p>

            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: '600px' }}>
              Felipe Conceição acts as <strong style={{ color: '#fff', fontWeight: 500 }}>Gigantera</strong>, articulating code, generative media, and projection with the physicality of silver, steel, sand, and fishing nets. His research creates friction between the polished finish of the image industry and the erasure of his Caiçara territorial heritage, investigating the loss of organic time in the acceleration of our economic model.
            </p>

            {/* Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh', marginTop: '2vh' }}>
              {[
                { n: '01', l: 'STILL', d: 'Digital sculpture and mineral photogrammetry' },
                { n: '02', l: 'VIDEO', d: 'Cinematic and stochastic particle simulation' },
                { n: '03', l: 'SOUND', d: 'Electronic music synthesis and acoustic dispersion' }
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '2vw', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1vh' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', minWidth: '40px' }}>{p.n} // {p.l}</span>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{p.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '4vh', justifyContent: 'center' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-coral)', letterSpacing: '0.1em' }}>[DIRECT TRANSMISSION]</span>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
                Available for curatorial commissions, art direction, immersive installations, and musical collaborations.
              </p>
              
              <div 
                onClick={handleCopyEmail}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1.5vh 1.5vw', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.05em' }}>pelimotion@gmail.com</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)' }}>
                  {copiedEmail ? '✓ COPIED!' : '[COPY]'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
              {[
                { l: 'WHATSAPP', url: 'https://wa.me/5547999999999' },
                { l: 'INSTAGRAM', url: 'https://instagram.com/pelimotion' },
                { l: 'PELIMOTION STUDIO', url: 'https://www.pelimotion.art' },
                { l: 'VIMEO ARCHIVE', url: 'https://vimeo.com' }
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1vh 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none', color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                >
                  <span>{link.l}</span>
                  <span style={{ opacity: 0.5 }}>↗</span>
                </a>
              ))}
            </div>

            <div style={{ marginTop: '2vh', padding: '2vh 1.5vw', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1vh' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>[ATELIER & PIPELINE]</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                OPERATIONS BASED AT <a href="https://share.google/WR6ZovOEDJxrJ4SCp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>TOCA.HUB</a>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginTop: '1vh' }}>
                RENDERED WITH THREE.JS & WEB AUDIO API
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
