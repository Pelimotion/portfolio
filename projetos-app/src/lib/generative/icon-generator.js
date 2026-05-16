import { getSeed } from './seed-engine';
import { ICON_PALETTE, pickColor, pickFromList } from './palette';
import { SHAPES } from './shapes';
import { sha256 } from './utils';

/**
 * ICON GENERATOR
 * Gera um identicon simétrico baseado em slug.
 */
export async function generateIcon(slug) {
  const seed = await getSeed(slug);
  const gridSize = 6 + Math.floor(seed[0] * 7); // 6 a 12
  const palette = pickFromList(seed[1], ICON_PALETTE);
  
  const halfGrid = Math.ceil(gridSize / 2);
  const cells = [];
  
  // Preencher quadrante (meia grade)
  for (let y = 0; y < halfGrid; y++) {
    for (let x = 0; x < halfGrid; x++) {
      const idx = (y * halfGrid + x) % 8;
      const isActive = seed[idx] > 0.42;
      if (isActive) {
        const shapeKey = pickFromList(seed[(idx + 1) % 8], Object.keys(SHAPES));
        const color = pickColor(seed[(idx + 2) % 8], palette);
        cells.push({ x, y, shapeKey, color });
      }
    }
  }
  
  // Aplicar simetria 4x
  const finalCells = [];
  cells.forEach(cell => {
    // Quadrante 1 (Top-Left)
    finalCells.push(cell);
    // Quadrante 2 (Top-Right)
    finalCells.push({ ...cell, x: gridSize - 1 - cell.x });
    // Quadrante 3 (Bottom-Left)
    finalCells.push({ ...cell, y: gridSize - 1 - cell.y });
    // Quadrante 4 (Bottom-Right)
    finalCells.push({ ...cell, x: gridSize - 1 - cell.x, y: gridSize - 1 - cell.y });
  });

  const cellSize = 512 / gridSize;
  const svgContent = finalCells.map(cell => {
    const renderFn = SHAPES[cell.shapeKey];
    const px = cell.x * cellSize + cellSize / 2;
    const py = cell.y * cellSize + cellSize / 2;
    return renderFn(px, py, cellSize, cell.color);
  }).join('\n');

  const svgString = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" data-seed="${slug}">
    <rect width="512" height="512" fill="transparent" />
    ${svgContent}
  </svg>`;

  const hash = await sha256(svgString);
  
  return {
    svgString,
    hash,
    metadata: { gridSize, shapesUsed: [...new Set(finalCells.map(c => c.shapeKey))] }
  };
}
