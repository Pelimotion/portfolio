import { getSeed } from './seed-engine';
import { PATTERN_PALETTE, pickColor, pickFromList } from './palette';
import { sha256 } from './utils';

/**
 * PATTERN GENERATOR
 * Combina Tapete Persa fractal e Curva de Gosper.
 */

// --- 1. Tapete Persa Fractal ---
function renderPersianFractal(x, y, w, h, depth, seed, palette) {
  if (depth <= 0) return '';
  
  const color = pickColor(seed[depth % 8], palette);
  const border = w * 0.1;
  
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="${0.2 + (depth/10)}" rx="${w/20}" />`;
  
  // Recursão nos cantos
  const nextW = (w - border * 2) / 2;
  const nextH = (h - border * 2) / 2;
  
  if (nextW > 5) {
    svg += renderPersianFractal(x + border, y + border, nextW, nextH, depth - 1, seed, palette);
    svg += renderPersianFractal(x + w - border - nextW, y + border, nextW, nextH, depth - 1, seed, palette);
    svg += renderPersianFractal(x + border, y + h - border - nextH, nextW, nextH, depth - 1, seed, palette);
    svg += renderPersianFractal(x + w - border - nextW, y + h - border - nextH, nextW, nextH, depth - 1, seed, palette);
  }
  
  return svg;
}

// --- 2. L-System: Gosper Curve ---
function generateGosperPoints(iterations, size, seed) {
  let axiom = "A";
  const rules = {
    "A": "A-B--B+A++AA+B-",
    "B": "+A-BB--B-A++A+B"
  };
  
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (let char of current) next += rules[char] || char;
    current = next;
  }
  
  let x = 0, y = 0, angle = 0;
  const points = [[0, 0]];
  const step = size / Math.pow(2.5, iterations);
  
  for (let char of current) {
    if (char === "A" || char === "B") {
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      points.push([x, y]);
    } else if (char === "+") angle += Math.PI / 3;
    else if (char === "-") angle -= Math.PI / 3;
  }
  
  return points;
}

export async function generatePattern(slug, salt = '') {
  const seed = await getSeed(slug, salt);
  const palette = pickFromList(seed[2], PATTERN_PALETTE);
  
  // Camada 1: Tapete Persa (Fundo)
  const background = renderPersianFractal(0, 0, 800, 400, 4, seed, palette);
  
  // Camada 2: Gosper Curve (Médio)
  const iterations = 3 + Math.floor(seed[3] * 2);
  const points = generateGosperPoints(iterations, 600, seed);
  const polyline = points.map(p => `${p[0] + 100},${p[1] + 200}`).join(' ');
  const gosperColor = pickColor(seed[4], palette);
  
  const gosperLayer = `
    <polyline points="${polyline}" fill="none" stroke="${gosperColor}" stroke-width="2" opacity="0.4" stroke-linecap="round" />
  `;

  const svgString = `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <rect width="800" height="400" fill="${palette[0]}" opacity="0.1" />
    <g class="pattern-layer-1">${background}</g>
    <g class="pattern-layer-2" transform="translate(400, 200) rotate(${seed[5]*360}) translate(-400, -200)">
      ${gosperLayer}
    </g>
  </svg>`;

  const hash = await sha256(svgString);
  const layers_json = {
    background: { speed: 0.01 },
    gosper: { speed: 0.03 }
  };

  return { svgString, hash, layers_json };
}
