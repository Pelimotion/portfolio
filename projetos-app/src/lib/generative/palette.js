/**
 * GENERATIVE PALETTES — P&B (preto e branco)
 */

export const ICON_PALETTE = [
  ['#ffffff', '#e0e0e0', '#c0c0c0', '#999999'], // White → Gray
  ['#f5f5f5', '#d5d5d5', '#b5b5b5', '#808080'], // Off-white
  ['#eeeeee', '#cccccc', '#aaaaaa', '#777777'], // Silver
  ['#ffffff', '#d8d8d8', '#b0b0b0', '#888888'], // Pure white
  ['#f0f0f0', '#d0d0d0', '#a8a8a8', '#707070'], // Neutral
  ['#ffffff', '#e8e8e8', '#c8c8c8', '#989898'], // Warm white
  ['#f8f8f8', '#dcdcdc', '#bcbcbc', '#848484'], // Cool white
  ['#ffffff', '#e4e4e4', '#b8b8b8', '#747474'], // High contrast
];

export const PATTERN_PALETTE = [
  ['#000000', '#111111', '#222222', '#333333', '#555555', '#888888'],
  ['#050505', '#101010', '#1a1a1a', '#2a2a2a', '#444444', '#777777'],
  ['#020202', '#0d0d0d', '#181818', '#252525', '#3a3a3a', '#666666'],
  ['#000000', '#080808', '#141414', '#202020', '#333333', '#555555'],
];

export function pickColor(val, palette) {
  const index = Math.floor(val * palette.length);
  return palette[index];
}

export function pickFromList(val, list) {
  const index = Math.floor(val * list.length);
  return list[index];
}
