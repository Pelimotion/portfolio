/**
 * ARTPATTERN ENGINE™
 * Gera padrões animados inspirados em grandes obras de arte.
 * Determinístico por ID de projeto.
 */

export function getArtStyleFromId(projectId) {
  const styles = [
    'mondrian', 'kandinsky', 'escher', 'rothko', 'klee',
    'pollock', 'vasarely', 'bridget_riley', 'malevich', 'albers'
  ];
  if (!projectId) return 'mondrian';
  const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return styles[hash % styles.length];
}

export function getAccentColorFromId(projectId) {
  const palette = [
    '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
    '#10B981', '#3B82F6', '#EF4444', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#E879F9'
  ];
  if (!projectId) return palette[0];
  const hash = projectId.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
  return palette[Math.abs(hash) % palette.length];
}

export const ART_PATTERNS = {
  mondrian: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .m-block { animation: mondrian-pulse 4s ease-in-out infinite alternate; }
        .m-block:nth-child(2) { animation-delay: -1.3s; }
        .m-block:nth-child(3) { animation-delay: -2.7s; }
        @keyframes mondrian-pulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }
      </style>
      <rect class="m-block" x="0" y="0" width="80" height="80" fill="${accent}" opacity="0.9"/>
      <rect class="m-block" x="85" y="0" width="115" height="30" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
      <rect class="m-block" x="85" y="35" width="50" height="45" fill="white" opacity="0.08"/>
      <rect class="m-block" x="0" y="85" width="200" height="2" fill="currentColor" opacity="0.2"/>
      <rect class="m-block" x="80" y="0" width="2" height="200" fill="currentColor" opacity="0.2"/>
      <rect class="m-block" x="0" y="85" width="45" height="115" fill="${accent}" opacity="0.15"/>
    </svg>`,

  rothko: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="rothko-blur"><feGaussianBlur stdDeviation="8"/></filter></defs>
      <style>
        .r-field { animation: rothko-breathe 6s ease-in-out infinite alternate; }
        .r-field-2 { animation: rothko-breathe 8s ease-in-out infinite alternate-reverse; }
        @keyframes rothko-breathe { 0% { transform: scaleY(1); opacity: 0.6; } 100% { transform: scaleY(1.05); opacity: 0.9; } }
      </style>
      <rect x="0" y="0" width="200" height="200" fill="${accent}" opacity="0.05"/>
      <rect class="r-field" x="10" y="20" width="180" height="70" fill="${accent}" filter="url(#rothko-blur)" opacity="0.4" rx="4"/>
      <rect class="r-field-2" x="10" y="110" width="180" height="70" fill="${accent}" filter="url(#rothko-blur)" opacity="0.25" rx="4"/>
    </svg>`,

  kandinsky: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .k-circle { animation: kandinsky-rotate 12s linear infinite; transform-origin: 100px 100px; }
        .k-arc { animation: kandinsky-rotate 20s linear infinite reverse; transform-origin: 100px 100px; }
        @keyframes kandinsky-rotate { to { transform: rotate(360deg); } }
      </style>
      <circle class="k-circle" cx="100" cy="100" r="80" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.3"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="100" cy="100" r="30" fill="${accent}" opacity="0.12"/>
      <path class="k-arc" d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>
      <circle cx="100" cy="100" r="8" fill="${accent}" opacity="0.7"/>
    </svg>`,

  vasarely: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .v-sq { animation: vasarely-pulse 3s ease-in-out infinite alternate; }
        @keyframes vasarely-pulse { 0% { transform: scale(0.95); } 100% { transform: scale(1.05); } }
      </style>
      ${Array.from({length: 16}, (_, i) => {
        const x = (i % 4) * 50 + 10;
        const y = Math.floor(i / 4) * 50 + 10;
        const size = 15 + (i % 3) * 8;
        const opacity = 0.05 + (i % 4) * 0.05;
        return `<rect class="v-sq" x="${x}" y="${y}" width="${size}" height="${size}" fill="${accent}" opacity="${opacity}" rx="2" style="transform-origin: ${x + size/2}px ${y + size/2}px; animation-delay: ${i * 0.2}s"/>`;
      }).join('')}
    </svg>`,

  bridget_riley: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .br-wave { animation: riley-wave 4s ease-in-out infinite; }
        @keyframes riley-wave { 0%, 100% { d: path("M 0 100 Q 50 80 100 100 Q 150 120 200 100"); } 50% { d: path("M 0 100 Q 50 120 100 100 Q 150 80 200 100"); } }
      </style>
      ${Array.from({length: 10}, (_, i) => {
        const y = i * 22;
        const opacity = 0.06 + (i % 3) * 0.03;
        return `<path class="br-wave" d="M 0 ${y} Q 50 ${y - 12} 100 ${y} Q 150 ${y + 12} 200 ${y}" fill="none" stroke="${accent}" stroke-width="1.5" opacity="${opacity}" style="animation-delay: ${i * 0.15}s"/>`;
      }).join('')}
    </svg>`,

  malevich: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .mal-shape { animation: malevich-float 8s ease-in-out infinite; }
        @keyframes malevich-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(2deg); } 66% { transform: translateY(4px) rotate(-1deg); } }
      </style>
      <rect class="mal-shape" x="30" y="40" width="60" height="60" fill="${accent}" opacity="0.5" style="transform-origin: 60px 70px"/>
      <rect class="mal-shape" x="110" y="60" width="40" height="40" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6" style="transform-origin: 130px 80px"/>
      <circle class="mal-shape" cx="80" cy="150" r="25" fill="${accent}" opacity="0.15" style="transform-origin: 80px 150px"/>
    </svg>`,

  escher: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="escher-tile" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,5 35,35 5,35" fill="${accent}" opacity="0.12"/>
          <polygon points="20,35 35,5 5,5" fill="${accent}" opacity="0.06"/>
        </pattern>
        <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="40 0" dur="8s" repeatCount="indefinite"/>
      </defs>
      <rect width="200" height="200" fill="url(#escher-tile)"/>
    </svg>`,

  pollock: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .pol-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: pollock-draw 6s ease-in-out infinite; }
        @keyframes pollock-draw { 0% { stroke-dashoffset: 1000; opacity: 0; } 30% { opacity: 1; } 70% { stroke-dashoffset: 0; opacity: 0.8; } 100% { stroke-dashoffset: -200; opacity: 0; } }
      </style>
      <path class="pol-line" d="M 10 80 C 40 40 80 120 120 60 C 160 0 190 90 180 140" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
      <path class="pol-line" d="M 0 150 C 50 100 90 180 150 120" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
    </svg>`,

  klee: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .klee-cell { animation: klee-shift 5s ease-in-out infinite alternate; }
        @keyframes klee-shift { 0% { opacity: 0.5; } 100% { opacity: 1; } }
      </style>
      ${Array.from({length: 16}, (_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return `<rect class="klee-cell" x="${col * 50 + 5}" y="${row * 50 + 5}" width="40" height="40" fill="${accent}" opacity="${0.05 + (i%5)*0.03}" rx="1" style="animation-delay: ${i * 0.1}s"/>`;
      }).join('')}
    </svg>`,

  albers: (accent) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .alb-sq { animation: albers-pulse 5s ease-in-out infinite alternate; }
        @keyframes albers-pulse { 0% { opacity: 0.6; } 100% { opacity: 1; } }
      </style>
      <rect class="alb-sq" x="20" y="20" width="160" height="160" fill="${accent}" opacity="0.08" rx="2"/>
      <rect class="alb-sq" x="50" y="50" width="100" height="100" fill="${accent}" opacity="0.12" rx="2"/>
      <rect class="alb-sq" x="80" y="80" width="40" height="40" fill="${accent}" opacity="0.20" rx="2"/>
    </svg>`
};
