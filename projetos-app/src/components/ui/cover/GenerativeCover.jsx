import React, { useMemo } from 'react';

// Função hash simples para gerar números determinísticos a partir de uma string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Paletas premium (dark cinematic)
const PALETTES = [
  ['#1a365d', '#4c1d95', '#0f172a', '#3b82f6'], // Deep Ocean/Tech
  ['#064e3b', '#0f766e', '#022c22', '#10b981'], // Amazonia/Nature
  ['#7f1d1d', '#9a3412', '#2a0a0a', '#f59e0b'], // Desert/Mars
  ['#4a044e', '#86198f', '#1a0b2e', '#d946ef'], // Neon Synth
  ['#3f3f46', '#18181b', '#09090b', '#71717a'], // Monolith/Minimal
  ['#1e3a8a', '#06b6d4', '#082f49', '#2dd4bf'], // Cyber
];

export function GenerativeCover({ seed = 'default', className = '' }) {
  const { bg, radial1, radial2, radial3, noiseOpacity } = useMemo(() => {
    const hash = hashString(seed);
    const paletteIndex = hash % PALETTES.length;
    const colors = PALETTES[paletteIndex];
    
    // Posições aleatórias baseadas no hash
    const p1x = 10 + (hash % 80);
    const p1y = 10 + ((hash >> 2) % 80);
    const p2x = 10 + ((hash >> 4) % 80);
    const p2y = 10 + ((hash >> 6) % 80);
    const p3x = 10 + ((hash >> 8) % 80);
    const p3y = 10 + ((hash >> 10) % 80);
    
    return {
      bg: colors[2],
      radial1: `radial-gradient(circle at ${p1x}% ${p1y}%, ${colors[0]} 0%, transparent 60%)`,
      radial2: `radial-gradient(circle at ${p2x}% ${p2y}%, ${colors[1]} 0%, transparent 60%)`,
      radial3: `radial-gradient(circle at ${p3x}% ${p3y}%, ${colors[3]} 0%, transparent 50%)`,
      noiseOpacity: 0.15 + ((hash % 10) / 100), // 0.15 a 0.25
    };
  }, [seed]);

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      {/* Mesh Gradients */}
      <div 
        className="absolute inset-0 mix-blend-screen opacity-80"
        style={{ backgroundImage: `${radial1}, ${radial2}, ${radial3}` }}
      />
      
      {/* Procedural Noise Overlay (SVG data URI) */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ 
          opacity: noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px'
        }}
      />
      
      {/* Gradient fade to bottom for seamless integration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
    </div>
  );
}
