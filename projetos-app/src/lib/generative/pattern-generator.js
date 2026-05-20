import { getSeed } from './seed-engine';
import { sha256 } from './utils';

/**
 * PATTERN GENERATOR — Oriental Motifs P&B
 * v3: 7 motifs (seigaiha, asanoha, shippo, kumiko, yagasuri, hexTessellation, tessen)
 * Sempre P&B: stroke="white" em opacidades variadas.
 */

export const PATTERN_VERSION = 3;

// --- 1. Seigaiha (青海波) — escamas de peixe / ondas sobrepostas ---
function seigaiha(w, h, r, seed) {
  const stepX = r * 2;
  const stepY = r * 1.25;
  const rows  = Math.ceil(h / stepY) + 3;
  const cols  = Math.ceil(w / stepX) + 3;
  const sw    = (0.5 + seed[4] * 0.7).toFixed(1);
  const so    = (0.55 + seed[5] * 0.35).toFixed(2);
  let g = '';
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
  const sqrt3   = 1.732;
  const stepX   = r * sqrt3;
  const stepY   = r * 1.5;
  const rows    = Math.ceil(h / stepY) + 3;
  const cols    = Math.ceil(w / stepX) + 3;
  const so      = (0.5  + seed[4] * 0.4).toFixed(2);
  const sw      = (0.5  + seed[5] * 0.6).toFixed(1);
  const swInner = (parseFloat(sw) * 0.5).toFixed(1);
  const soInner = (parseFloat(so) * 0.6).toFixed(2);
  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * stepX + (row % 2 === 0 ? 0 : stepX * 0.5);
      const cy = row * stepY;
      const cxs = cx.toFixed(1), cys = cy.toFixed(1);
      for (let i = 0; i < 6; i++) {
        const a  = (i * 60 + 30) * Math.PI / 180;
        const ex = (cx + Math.cos(a) * r).toFixed(1);
        const ey = (cy + Math.sin(a) * r).toFixed(1);
        g += `<line x1="${cxs}" y1="${cys}" x2="${ex}" y2="${ey}" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
      }
      const ir  = r * 0.52;
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

// --- 4. Kumiko (組子) — grade de diamantes/octógonos entrelaçados ---
function kumiko(w, h, r, seed) {
  const step  = r * 1.8;
  const rows  = Math.ceil(h / step) + 3;
  const cols  = Math.ceil(w / step) + 3;
  const so    = (0.45 + seed[4] * 0.45).toFixed(2);
  const sw    = (0.5  + seed[5] * 0.7).toFixed(1);
  const swInner = (parseFloat(sw) * 0.45).toFixed(1);
  const soInner = (parseFloat(so) * 0.55).toFixed(2);
  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * step;
      const cy = row * step;
      // Quadrado externo rotacionado 45° (diamante)
      const d = r * 0.85;
      const pts = `${cx.toFixed(1)},${(cy - d).toFixed(1)} ${(cx + d).toFixed(1)},${cy.toFixed(1)} ${cx.toFixed(1)},${(cy + d).toFixed(1)} ${(cx - d).toFixed(1)},${cy.toFixed(1)}`;
      g += `<polygon points="${pts}" fill="white" fill-opacity="0.03" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
      // Quadrado interno alinhado ao eixo
      const id = r * 0.42;
      const ix1 = (cx - id).toFixed(1), iy1 = (cy - id).toFixed(1);
      const iw  = (id * 2).toFixed(1);
      g += `<rect x="${ix1}" y="${iy1}" width="${iw}" height="${iw}" fill="none" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      // Linhas de conexão (cruzamento — cria o efeito de treliça)
      g += `<line x1="${cx.toFixed(1)}" y1="${(cy - d).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy - id).toFixed(1)}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      g += `<line x1="${cx.toFixed(1)}" y1="${(cy + id).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + d).toFixed(1)}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      g += `<line x1="${(cx - d).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx - id).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      g += `<line x1="${(cx + id).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + d).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
    }
  }
  return g;
}

// --- 5. Yagasuri (矢絣) — penas de flecha / chevrons diagonais ---
function yagasuri(w, h, r, seed) {
  const cellW = r * 1.6;
  const cellH = r * 2.2;
  const cols  = Math.ceil(w / cellW) + 3;
  const rows  = Math.ceil(h / cellH) + 3;
  const so    = (0.5  + seed[4] * 0.4).toFixed(2);
  const sw    = (0.6  + seed[5] * 0.6).toFixed(1);
  const soFill = (0.04 + seed[2] * 0.04).toFixed(3);
  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const ox = col * cellW + (row % 2 === 0 ? 0 : cellW * 0.5);
      const oy = row * cellH;
      // Pena superior (V apontando para cima)
      const ax = ox, ay = oy + cellH * 0.5;
      const bx = ox + cellW * 0.5, by = oy;
      const cx = ox + cellW, cy = oy + cellH * 0.5;
      g += `<path d="M ${ax.toFixed(1)},${ay.toFixed(1)} L ${bx.toFixed(1)},${by.toFixed(1)} L ${cx.toFixed(1)},${cy.toFixed(1)}" fill="none" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" stroke-linejoin="round" />`;
      // Pena inferior (V apontando para baixo, espelhado)
      const dx = ox, dy = oy + cellH * 0.5;
      const ex = ox + cellW * 0.5, ey = oy + cellH;
      const fx = ox + cellW, fy = oy + cellH * 0.5;
      g += `<path d="M ${dx.toFixed(1)},${dy.toFixed(1)} L ${ex.toFixed(1)},${ey.toFixed(1)} L ${fx.toFixed(1)},${fy.toFixed(1)}" fill="white" fill-opacity="${soFill}" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" stroke-linejoin="round" />`;
    }
  }
  return g;
}

// --- 6. HexTessellation — grade hexagonal com detalhe interno ---
function hexTessellation(w, h, r, seed) {
  const sqrt3 = 1.732;
  const hexW  = r * sqrt3;
  const hexH  = r * 2;
  const stepX = hexW;
  const stepY = hexH * 0.75;
  const cols  = Math.ceil(w / stepX) + 3;
  const rows  = Math.ceil(h / stepY) + 3;
  const so    = (0.45 + seed[4] * 0.45).toFixed(2);
  const sw    = (0.5  + seed[5] * 0.65).toFixed(1);
  const swInner = (parseFloat(sw) * 0.4).toFixed(1);
  const soInner = (parseFloat(so) * 0.5).toFixed(2);

  // Vértices de hexágono flat-top centrado em (cx, cy)
  function hexPts(cx, cy, rr) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60) * Math.PI / 180;
      return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }).join(' ');
  }

  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * stepX + (row % 2 === 0 ? 0 : stepX * 0.5);
      const cy = row * stepY;
      // Hexágono externo
      g += `<polygon points="${hexPts(cx, cy, r)}" fill="white" fill-opacity="0.03" stroke="white" stroke-width="${sw}" stroke-opacity="${so}" />`;
      // Hexágono interno (detalhe)
      const ir = r * 0.5;
      g += `<polygon points="${hexPts(cx, cy, ir)}" fill="none" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      // 3 linhas radiais alternadas (cria estrela de 3 pontas discreta)
      for (let i = 0; i < 3; i++) {
        const a  = (i * 120) * Math.PI / 180;
        const x1 = (cx + Math.cos(a) * ir).toFixed(1);
        const y1 = (cy + Math.sin(a) * ir).toFixed(1);
        const x2 = (cx + Math.cos(a) * r).toFixed(1);
        const y2 = (cy + Math.sin(a) * r).toFixed(1);
        g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      }
    }
  }
  return g;
}

// --- 7. Tessen (鉄扇) — leque dobrável / arcos concêntricos em grade ---
function tessen(w, h, r, seed) {
  const cellSize = r * 2.4;
  const cols     = Math.ceil(w / cellSize) + 3;
  const rows     = Math.ceil(h / cellSize) + 3;
  const so       = (0.5  + seed[4] * 0.4).toFixed(2);
  const sw       = (0.5  + seed[5] * 0.65).toFixed(1);
  const swInner  = (parseFloat(sw) * 0.45).toFixed(1);
  const soInner  = (parseFloat(so) * 0.55).toFixed(2);
  // Ângulo de abertura do leque: 140–180°
  const fanAngle  = 140 + seed[2] * 40;
  const startDeg  = 180 + (180 - fanAngle) / 2;
  const endDeg    = startDeg + fanAngle;
  const startRad  = startDeg * Math.PI / 180;
  const endRad    = endDeg   * Math.PI / 180;
  const numRibs   = 4 + Math.floor(seed[1] * 3); // 4–6 ripas
  const numArcs   = 3;

  function arcPath(cx, cy, rr, a1, a2) {
    const laf = (a2 - a1) > Math.PI ? 1 : 0;
    const x1  = (cx + Math.cos(a1) * rr).toFixed(1);
    const y1  = (cy + Math.sin(a1) * rr).toFixed(1);
    const x2  = (cx + Math.cos(a2) * rr).toFixed(1);
    const y2  = (cy + Math.sin(a2) * rr).toFixed(1);
    return `M ${x1},${y1} A ${rr.toFixed(1)},${rr.toFixed(1)} 0 ${laf},1 ${x2},${y2}`;
  }

  let g = '';
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      // Alternar orientação do leque por célula (cria padrão xadrez de leques)
      const flip  = (row + col) % 2 === 0;
      const cx    = col * cellSize + cellSize * 0.5;
      const cy    = row * cellSize + cellSize * 0.5;
      const a1    = flip ? startRad : startRad + Math.PI;
      const a2    = flip ? endRad   : endRad   + Math.PI;

      // Arcos concêntricos
      for (let arc = 0; arc < numArcs; arc++) {
        const rr  = r * (0.35 + arc * 0.32);
        const op  = arc === 0 ? so : soInner;
        const swa = arc === 0 ? sw : swInner;
        g += `<path d="${arcPath(cx, cy, rr, a1, a2)}" fill="none" stroke="white" stroke-width="${swa}" stroke-opacity="${op}" />`;
      }

      // Ripas do leque (linhas radiais)
      for (let rib = 0; rib <= numRibs; rib++) {
        const t   = rib / numRibs;
        const ang = a1 + (a2 - a1) * t;
        const x1  = (cx + Math.cos(ang) * r * 0.35).toFixed(1);
        const y1  = (cy + Math.sin(ang) * r * 0.35).toFixed(1);
        const x2  = (cx + Math.cos(ang) * r * 0.99).toFixed(1);
        const y2  = (cy + Math.sin(ang) * r * 0.99).toFixed(1);
        g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="${swInner}" stroke-opacity="${soInner}" />`;
      }
    }
  }
  return g;
}

export async function generatePattern(slug, salt = '') {
  const seed   = await getSeed(slug, salt);
  const motifs = [seigaiha, asanoha, shippo, kumiko, yagasuri, hexTessellation, tessen];

  // Escala: seed[7] aplica variação 0.7–1.5x ao raio base
  const baseR     = 16 + Math.floor(seed[3] * 17);
  const scaleVar  = 0.7 + (seed[7] !== undefined ? seed[7] : seed[3]) * 0.8;
  const r         = Math.max(10, Math.round(baseR * scaleVar));

  // Rotação: 0–90° usando seed[6]
  const rotation  = Math.round((seed[6] !== undefined ? seed[6] : seed[2]) * 90);

  const motifIdx  = Math.floor(seed[0] * motifs.length);
  const layer1    = motifs[motifIdx](800, 400, r, seed);

  // Segunda camada: motif diferente, escala menor, opacidade reduzida
  const r2        = Math.floor(r * 0.55);
  const seed2     = [...seed.slice(3), ...seed.slice(0, 3)];
  const motifIdx2 = (motifIdx + 1 + Math.floor(seed[1] * (motifs.length - 1))) % motifs.length;
  const layer2    = motifs[motifIdx2](800, 400, r2, seed2);

  const svgString = `<!-- v${PATTERN_VERSION} --><svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <g transform="rotate(${rotation}, 400, 200)">${layer1}</g>
    <g transform="rotate(${rotation}, 400, 200)" opacity="0.35">${layer2}</g>
  </svg>`;

  const hash = await sha256(svgString);
  return { svgString, hash, layers_json: { layer1: { speed: 0.01 }, layer2: { speed: 0.03 } } };
}
