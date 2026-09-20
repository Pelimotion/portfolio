import React from 'react';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';
import { DJFilterKnob } from './DJFilterKnob';

interface FloatingMiniPlayerProps {
  className?: string;
  onOpenCD?: () => void;
}

export const FloatingMiniPlayer: React.FC<FloatingMiniPlayerProps> = ({
  className = '',
  onOpenCD
}) => {
  const currentAudioTrack = useAppStore((s) => s.currentAudioTrack);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);
  const isGlobalMuted = useAppStore((s) => s.isGlobalMuted);
  const toggleGlobalMute = useAppStore((s) => s.toggleGlobalMute);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      soundEngine.pause();
      setIsAudioPlaying(false);
    } else {
      soundEngine.playTrackPreview(currentAudioTrack);
      setIsAudioPlaying(true);
    }
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.toggleGlobalMute();
    toggleGlobalMute();
  };

  return (
    <div
      className={`floating-audio-miniplayer font-mono ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: isDark ? 'rgba(8, 12, 14, 0.78)' : 'rgba(245, 247, 250, 0.82)',
        backdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 24,
        padding: '5px 12px 5px 8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        color: isDark ? '#f1f5f9' : '#1e293b',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      {/* Botão Principal Play/Pause */}
      <button
        type="button"
        onClick={handleTogglePlay}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: 'none',
          background: isAudioPlaying
            ? isDark
              ? '#e4c379'
              : '#b88d34'
            : isDark
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(0,0,0,0.1)',
          color: isAudioPlaying ? '#080c0e' : isDark ? '#ffffff' : '#000000',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          paddingLeft: isAudioPlaying ? 0 : 2
        }}
        title={isAudioPlaying ? 'Pausar reprodução' : 'Dar play na trilha Sonora autoral'}
      >
        {isAudioPlaying ? '❚❚' : '▶'}
      </button>

      {/* Info da Faixa & Equalizador ou Dica para Iniciar */}
      <div
        onClick={onOpenCD}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          cursor: onOpenCD ? 'pointer' : 'default',
          minWidth: 110,
          maxWidth: 160
        }}
        title={onOpenCD ? 'Clique para inspecionar o estojo de CD' : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAudioPlaying && !isGlobalMuted ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                height: 10,
                marginBottom: 1
              }}
            >
              <span className="eq-bar eq-bar-1" style={{ width: 2, background: isDark ? '#e4c379' : '#b88d34' }} />
              <span className="eq-bar eq-bar-2" style={{ width: 2, background: isDark ? '#e4c379' : '#b88d34' }} />
              <span className="eq-bar eq-bar-3" style={{ width: 2, background: isDark ? '#e4c379' : '#b88d34' }} />
            </div>
          ) : (
            <span style={{ fontSize: 9, opacity: 0.5 }}>TRILHA:</span>
          )}

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {currentAudioTrack.title.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, opacity: 0.65 }}>
          <span>[{currentAudioTrack.bpm} BPM]</span>
          {onOpenCD && <span style={{ textDecoration: 'underline' }}>VER CD</span>}
        </div>
      </div>

      {/* Separador vertical */}
      <div
        style={{
          width: 1,
          height: 22,
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      />

      {/* Mini Knob de Filtro DJ integrado */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DJFilterKnob size="sm" showLabel={false} />
      </div>

      {/* Botão Mudo Rápido */}
      <button
        type="button"
        onClick={handleMute}
        style={{
          background: 'none',
          border: 'none',
          color: isGlobalMuted ? '#ef4444' : isDark ? '#94a3b8' : '#64748b',
          fontSize: 12,
          cursor: 'pointer',
          padding: '2px 4px'
        }}
        title={isGlobalMuted ? 'Desmutar som (M)' : 'Mutar som (M)'}
      >
        {isGlobalMuted ? '🔇' : '🔈'}
      </button>
    </div>
  );
};
