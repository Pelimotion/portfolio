import { getSeed } from './seed-engine';
import { ICON_PALETTE, pickColor, pickFromList } from './palette';
import { SHAPES } from './shapes';
import { sha256 } from './utils';

/**
 * ICON GENERATOR
 * Gera um identicon simétrico baseado em slug.
 * complexity: 'project' | 'scene'
 */
export async function generateIcon(slug, type = 'project', salt = '') {
  const seed = await getSeed(slug, salt);
  
  // Complexidade baseada no tipo
  // Scenes: 4x4 ou 6x6 (muito simples)
  // Projects: 6x6 a 8x8 (médio)
  let gridSize = 6;
  let threshold = 0.5; // Probabilidade de célula ativa

  if (type === 'scene') {
    gridSize = seed[0] > 0.5 ? 4 : 6;
    threshold = 0.65; // Menos células ativas
  } else {
    gridSize = 6 + Math.floor(seed[0] * 3); // 6 a 8
    threshold = 0.45; // Mais células ativas que scene
  }
  
  const halfGrid = Math.ceil(gridSize / 2);
  const cells = [];
  
  // Preencher quadrante (meia grade)
  for (let y = 0; y < halfGrid; y++) {
    for (let x = 0; x < halfGrid; x++) {
      const idx = (y * halfGrid + x) % 8;
      const isActive = seed[idx] > threshold;
      if (isActive) {
        const shapeKey = pickFromList(seed[(idx + 1) % 8], Object.keys(SHAPES));
        const color = pickColor(seed[(idx + 2) % 8], palette_for_type(type, seed));
        cells.push({ x, y, shapeKey, color });
      }
    }
  }
  
  // Aplicar simetria 4x
  const finalCells = [];
  cells.forEach(cell => {
    finalCells.push(cell);
    finalCells.push({ ...cell, x: gridSize - 1 - cell.x });
    finalCells.push({ ...cell, y: gridSize - 1 - cell.y });
    finalCells.push({ ...cell, x: gridSize - 1 - cell.x, y: gridSize - 1 - cell.y });
  });

  const cellSize = 512 / gridSize;
  const svgContent = finalCells.map(cell => {
    const renderFn = SHAPES[cell.shapeKey];
    const px = cell.x * cellSize + cellSize / 2;
    const py = cell.y * cellSize + cellSize / 2;
    return renderFn(px, py, cellSize * 0.85, cell.color); // Reduzi levemente o tamanho da forma
  }).join('\n');

  const svgString = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" data-seed="${slug}">
    <rect width="512" height="512" fill="transparent" />
    ${svgContent}
  </svg>`;

  const hash = await sha256(svgString);
  
  return {
    svgString,
    hash,
    metadata: { gridSize, type }
  };
}

function palette_for_type(type, seed) {
  const fullPalette = pickFromList(seed[1], ICON_PALETTE);
  if (type === 'scene') {
    // Para cenas, usamos tons mais sóbrios ou apenas 2 cores da paleta
    return [fullPalette[0], fullPalette[1] || fullPalette[0]];
  }
  return fullPalette;
}
