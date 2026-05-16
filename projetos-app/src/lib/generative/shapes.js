/**
 * GENERATIVE SHAPES
 * Baseado em patrimônio cultural digital.
 */

export const SHAPES = {
  circle: (x, y, size, color) => `<circle cx="${x}" cy="${y}" r="${size / 2.5}" fill="${color}" />`,
  
  rings: (x, y, size, color) => `
    <circle cx="${x}" cy="${y}" r="${size / 2.5}" fill="none" stroke="${color}" stroke-width="${size/10}" />
    <circle cx="${x}" cy="${y}" r="${size / 5}" fill="none" stroke="${color}" stroke-width="${size/10}" />
  `,

  diamond: (x, y, size, color) => `
    <rect x="${x - size/3}" y="${y - size/3}" width="${size*0.66}" height="${size*0.66}" fill="${color}" 
          transform="rotate(45, ${x}, ${y})" />
  `,

  cross: (x, y, size, color) => `
    <rect x="${x - size/10}" y="${y - size/3}" width="${size/5}" height="${size*0.66}" fill="${color}" />
    <rect x="${x - size/3}" y="${y - size/10}" width="${size*0.66}" height="${size/5}" fill="${color}" />
  `,

  karahanamon: (x, y, size, color) => `
    <path d="M${x},${y-size/3} Q${x+size/3},${y-size/3} ${x+size/3},${y} Q${x+size/3},${y+size/3} ${x},${y+size/3} Q${x-size/3},${y+size/3} ${x-size/3},${y} Q${x-size/3},${y-size/3} ${x},${y-size/3}" 
          fill="${color}" />
  `,

  triangle: (x, y, size, color) => `
    <polygon points="${x},${y - size/2.5} ${x + size/2.5},${y + size/2.5} ${x - size/2.5},${y + size/2.5}" fill="${color}" />
  `,

  chevron: (x, y, size, color) => `
    <path d="M${x - size/3},${y - size/6} L${x},${y + size/6} L${x + size/3},${y - size/6}" fill="none" stroke="${color}" stroke-width="${size/6}" stroke-linecap="round" stroke-linejoin="round" />
  `,

  spiral: (x, y, size, color) => `
    <path d="M${x},${y} Q${x+size/3},${y-size/3} ${x+size/2},${y} Q${x+size/3},${y+size/3} ${x},${y}" fill="none" stroke="${color}" stroke-width="${size/8}" />
  `,

  star6: (x, y, size, color) => `
    <path d="M${x},${y-size/2.5} L${x+size/6},${y-size/8} L${x+size/2.5},${y-size/8} L${x+size/4},${y+size/10} L${x+size/3},${y+size/2.5} L${x},${y+size/4} L${x-size/3},${y+size/2.5} L${x-size/4},${y+size/10} L${x-size/2.5},${y-size/8} L${x-size/6},${y-size/8} Z" 
          fill="${color}" />
  `,

  islamic: (x, y, size, color) => `
    <rect x="${x-size/4}" y="${y-size/4}" width="${size/2}" height="${size/2}" fill="none" stroke="${color}" stroke-width="${size/12}" transform="rotate(45, ${x}, ${y})" />
    <rect x="${x-size/4}" y="${y-size/4}" width="${size/2}" height="${size/2}" fill="none" stroke="${color}" stroke-width="${size/12}" />
  `,

  seigaiha: (x, y, size, color) => `
    <path d="M${x-size/2},${y} A${size/2},${size/2} 0 0,1 ${x+size/2},${y}" fill="none" stroke="${color}" stroke-width="${size/12}" />
    <path d="M${x-size/3},${y} A${size/3},${size/3} 0 0,1 ${x+size/3},${y}" fill="none" stroke="${color}" stroke-width="${size/12}" />
  `
};
