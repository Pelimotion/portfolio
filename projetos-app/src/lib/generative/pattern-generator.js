import { getSeed } from './seed-engine';
import { sha256 } from './utils';

/**
 * PATTERN GENERATOR — Oriental Motifs P&B
 * Três motifs: seigaiha (escamas), asanoha (folha de cânhamo), shippo (círculos entrelaçados).
 * Sempre P&B: stroke="white" em opacidades variadas.
 */

// --- 1. Seigaiha (青海波) — escamas de peixe / ondas sobrepostas ---
function seigaiha(w, h, r, seed) {
  const stepX = r * 2;
  const stepY = r * 1.25; // sobreposição vertical
  const rows  = Math.ceil(h / stepY) + 3;
  const cols  = Math.ceil(w / stepX) + 3;
  const sw    = (0.5 + seed[4] * 0.7).toFixed(1);
  const so    = (0.55 + seed[5] * 0.35).toFixed(2);
  let g = '';
  // Renderiza de baixo para cima: camadas superiores cobrem inferiores
  for (let row = rows; row >= -1; row--) {
    for (let col = -1; col <= cols; col++) {
      const cx = col * stepX + (row % 2 === 0 ? 0 : r);
      const cy = row * stepY;
      const x1 = (cx - r).toFixed(1), x2 = (cx + r).toFixed(1), cy1 = cy.toFixed(1);
      g += `<path d="M ${x1},${cy1} A ${r},${r} 0 0,1 ${x2},${cy1} Z" fill="white" fill-opacity="0.04" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
    }
  }
  return g;
}

// --- 2. Asanoha (麻の葉) — estrela hexagonal / folha de cânhamo ---
function asanoha(w, h, r, seed) {
  const sqrt3  = 1.732;
  const stepX  = r * sqrt3;
  const stepY  = r * 1.5;
  const rows   = Math.ceil(h / stepY) + 3;
  const cols   = Math.ceil(w / stepX) + 3;
  const so     = (0.5  + seed[4] * 0.4).toFixed(2);
  const sw     = (0.5  + seed[5] * 0.6).toFixed(1);
  const swInner = (parseFloat(sw) * 0.5).toFixed(1);
  const soInner = (parseFloat(so) * 0.6).toFixed(2);
  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * stepX + (row % 2 === 0 ? 0 : stepX * 0.5);
      const cy = row * stepY;
      const cxs = cx.toFixed(1), cys = cy.toFixed(1);
      // 6 linhas irradiantes (estrela)
      for (let i = 0; i < 6; i++) {
        const a  = (i * 60 + 30) * Math.PI / 180;
        const ex = (cx + Math.cos(a) * r).toFixed(1);
        const ey = (cy + Math.sin(a) * r).toFixed(1);
        g += `<line x1="${cxs}" y1="${cys}" x2="${ex}" y2="${ey}" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
      }
      // Hexágono interno (detalhe)
      const ir = r * 0.52;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 + 30) * Math.PI / 180;
        return `${(cx + Math.cos(a) * ir).toFixed(1)},${(cy + Math.sin(a) * ir).toFixed(1)}`;
      }).join(' ');
      g += `<polygon points="${pts}" fill="none" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
    }
  }
  return g;
}

// --- 3. Shippo (七宝) — círculos entrelaçados ---
function shippo(w, h, r, seed) {
  const step = r * 1.55;
  const rows  = Math.ceil(h / step) + 3;
  const cols  = Math.ceil(w / step) + 3;
  const so    = (0.5  + seed[4] * 0.4).toFixed(2);
  const sw    = (0.6  + seed[5] * 0.6).toFixed(1);
  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = (col * step + (row % 2 === 0 ? 0 : step * 0.5)).toFixed(1);
      const cy = (row * step).toFixed(1);
      g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" fill-opacity="0.03" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
    }
  }
  return g;
}

export async function generatePattern(slug, salt = '') {
  const seed   = await getSeed(slug, salt);
  const motifs = [seigaiha, asanoha, shippo];

  // Escala: 16–32px — menor = mais denso = mais interessante
  const r        = 16 + Math.floor(seed[3] * 17);
  const motifIdx = Math.floor(seed[0] * 3);
  const layer1   = motifs[motifIdx](800, 400, r, seed);

  // Segunda camada: motif diferente, escala menor, opacidade reduzida
  const r2        = Math.floor(r * 0.55);
  const seed2     = [...seed.slice(3), ...seed.slice(0, 3)];
  const motifIdx2 = (motifIdx + 1 + Math.floor(seed[1] * 2)) % 3;
  const layer2    = motifs[motifIdx2](800, 400, r2, seed2);

  const svgString = `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <g>${layer1}</g>
    <g opacity="0.35">${layer2}</g>
  </svg>`;

  const hash = await sha256(svgString);
  return { svgString, hash, layers_json: { layer1: { speed: 0.01 }, layer2: { speed: 0.03 } } };
}
