import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

interface DJFilterKnobProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const DJFilterKnob: React.FC<DJFilterKnobProps> = ({
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const djFilterValue = useAppStore((s) => s.djFilterValue);
  const setDJFilterValue = useAppStore((s) => s.setDJFilterValue);
  const resetDJFilter = useAppStore((s) => s.resetDJFilter);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartValRef = useRef(0);
  const knobRef = useRef<HTMLDivElement>(null);

  // Dimensões do knob por variante
  const dimensions = {
    sm: { diameter: 44, strokeWidth: 3.5, radius: 17, fontSize: 8 },
    md: { diameter: 58, strokeWidth: 4, radius: 23, fontSize: 9 },
    lg: { diameter: 76, strokeWidth: 5, radius: 31, fontSize: 10 }
  }[size];

  // Ângulo de rotação: de -135° (Low-Pass max) a +135° (High-Pass max), 0° no centro
  const rotationDeg = djFilterValue * 135;

  const triggerHaptic = (pattern: number = 8) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  // Rótulo dinâmico do estado
  const getFilterStatusText = () => {
    if (Math.abs(djFilterValue) <= 0.02) return 'BYPASS // FLAT';
    if (djFilterValue < 0) return `LOW-CUT // SUBMERSO ${Math.round(Math.abs(djFilterValue) * 100)}%`;
    return `HIGH-CUT // RAREFEITO +${Math.round(djFilterValue * 100)}%`;
  };

  // Handlers de arrasto
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setShowTooltip(true);
    dragStartYRef.current = e.clientY;
    dragStartValRef.current = djFilterValue;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    soundEngine.playTactileHoverTick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = dragStartYRef.current - e.clientY; // arrastar pra cima aumenta, pra baixo diminui
    const sensitivity = 0.007;
    const nextVal = Math.max(-1.0, Math.min(1.0, dragStartValRef.current + deltaY * sensitivity));

    // Detent central com clique tátil ao passar perto de zero
    if (Math.abs(nextVal) < 0.04 && Math.abs(djFilterValue) >= 0.04) {
      triggerHaptic(12);
      soundEngine.playTactileHoverTick();
    }

    setDJFilterValue(Math.abs(nextVal) < 0.03 ? 0 : nextVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => setShowTooltip(false), 900);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetDJFilter();
    soundEngine.playTactileHoverTick();
    triggerHaptic(14);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const step = e.deltaY > 0 ? -0.06 : 0.06;
    const next = Math.max(-1.0, Math.min(1.0, djFilterValue + step));
    setDJFilterValue(Math.abs(next) < 0.03 ? 0 : next);
    soundEngine.playTactileHoverTick();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1200);
  };

  // Cores dinâmicas
  const activeColor =
    djFilterValue < -0.03
      ? '#00e5ff' // Ciano Abissal
      : djFilterValue > 0.03
      ? '#ff7b00' // Âmbar Magma / Coral
      : isDark
      ? '#e4c379'
      : '#b88d34';

  const { diameter, strokeWidth, radius } = dimensions;
  const center = diameter / 2;
  const circumference = 2 * Math.PI * radius;
  // O arco ativo cobre 270 graus (75% da circunferência)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = circumference - arcLength;

  return (
    <div
      ref={knobRef}
      className={`dj-filter-knob-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        position: 'relative'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => !isDragging && setShowTooltip(false)}
      onWheel={handleWheel}
      title="Filtro DJ (Low/High Cut). Arraste ou use teclas [ e ] / O e P. Duplo-clique reseta em zero."
    >
      {/* Tooltip Tático Flutuante */}
      {(showTooltip || isDragging) && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: isDark ? 'rgba(8, 12, 14, 0.94)' : 'rgba(245, 247, 250, 0.96)',
            color: activeColor,
            border: `1px solid ${activeColor}`,
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: '"Space Mono", monospace',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.08em',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          {getFilterStatusText()}
        </div>
      )}

      {/* Corpo Circular do Knob */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{
          width: diameter,
          height: diameter,
          position: 'relative',
          cursor: isDragging ? 'ns-resize' : 'grab',
          touchAction: 'none'
        }}
        role="slider"
        aria-label="Filtro DJ Ressonante"
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={parseFloat(djFilterValue.toFixed(2))}
      >
        {/* SVG Dial com trilhas de LED */}
        <svg width={diameter} height={diameter} style={{ transform: 'rotate(135deg)', overflow: 'visible' }}>
          {/* Trilha inativa de fundo */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Trilha Ativa Reativa */}
          {Math.abs(djFilterValue) > 0.02 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={strokeWidth + 0.5}
              strokeDasharray={`${(arcLength / 2) * Math.abs(djFilterValue)} ${circumference}`}
              strokeDashoffset={djFilterValue < 0 ? (arcLength / 2) * (1 - Math.abs(djFilterValue)) : 0}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 3px ${activeColor})`,
                transition: isDragging ? 'none' : 'stroke-dasharray 0.1s ease'
              }}
            />
          )}
        </svg>

        {/* Disco Interno Metálico com Agulha Indicadora */}
        <div
          style={{
            position: 'absolute',
            inset: strokeWidth * 1.5,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle at 35% 35%, #2a343a 0%, #10161a 70%, #080c0e 100%)'
              : 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e8ebec 70%, #ccd3d8 100%)',
            border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.15)',
            boxShadow: isDark
              ? 'inset 0 1px 2px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.5)'
              : 'inset 0 1px 2px rgba(255,255,255,0.9), 0 2px 5px rgba(0,0,0,0.12)',
            transform: `rotate(${rotationDeg}deg)`,
            transition: isDragging ? 'none' : 'transform 0.08s ease-out'
          }}
        >
          {/* Marcador em relevo (Needle Indicator) */}
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: '50%',
              transform: 'translateX(-50%)',
              width: size === 'sm' ? 2 : 3,
              height: size === 'sm' ? 6 : 8,
              borderRadius: 2,
              background: activeColor,
              boxShadow: `0 0 4px ${activeColor}`
            }}
          />
        </div>
      </div>

      {/* Rótulo Tático Inferior com Keycaps */}
      {showLabel && (
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontFamily: '"Space Mono", monospace',
            fontSize: dimensions.fontSize,
            letterSpacing: '0.08em',
            color: isDark ? '#94a3b8' : '#475569'
          }}
        >
          <span style={{ fontWeight: 600 }}>FILTRO</span>
          <span style={{ opacity: 0.5 }}>DJ</span>
          <span style={{ display: 'inline-flex', gap: 2, marginLeft: 2 }}>
            <kbd className="keycap keycap-xs" style={{ padding: '0 3px', fontSize: 8 }}>[</kbd>
            <kbd className="keycap keycap-xs" style={{ padding: '0 3px', fontSize: 8 }}>]</kbd>
          </span>
        </div>
      )}
    </div>
  );
};
