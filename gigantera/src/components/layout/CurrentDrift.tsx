import React, { useRef, useState } from 'react';
import { Artwork } from '../../types/art';
import { useAppStore } from '../../core/store';

interface CurrentDriftProps {
  artworks: Artwork[];
  stratumId: string;
}

export const CurrentDrift: React.FC<CurrentDriftProps> = ({ artworks }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const selectArtwork = useAppStore((s) => s.selectArtwork);

  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({
    startX: 0,
    scrollLeft: 0,
    moved: false
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    dragInfo.current = {
      startX: e.clientX,
      scrollLeft: trackRef.current.scrollLeft,
      moved: false
    };
    trackRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return;
    const dx = e.clientX - dragInfo.current.startX;
    if (Math.abs(dx) > 5) {
      dragInfo.current.moved = true;
    }
    trackRef.current.scrollLeft = dragInfo.current.scrollLeft - dx;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleArtworkClick = (art: Artwork) => {
    // Se o usuário apenas arrastou para navegar, não abre a obra
    if (dragInfo.current.moved) return;
    selectArtwork(art);
  };

  return (
    <div
      ref={trackRef}
      className="current-drift-track"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label="Correnteza de obras deste estrato (arraste horizontal)"
    >
      {artworks.map((art) => (
        <article
          key={art.id}
          className="artwork-specimen"
          onClick={() => handleArtworkClick(art)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectArtwork(art);
            }
          }}
          aria-label={`Obra: ${art.title}, ${art.year}. Materiais: ${art.materials}`}
        >
          <div className="artwork-frame">
            <img
              src={art.imageSrc}
              alt={art.imageAlt}
              loading="lazy"
              draggable={false}
            />
          </div>

          <div className="artwork-meta">
            <div className="artwork-year">{art.year} · {art.depthMeters}m de profundidade</div>
            <h3 className="artwork-title">{art.title}</h3>
            <p className="artwork-materials">{art.materials}</p>
          </div>
        </article>
      ))}
    </div>
  );
};
