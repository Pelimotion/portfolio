/**
 * GENERATIVE PALETTES
 */

export const ICON_PALETTE = [
  ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'], // Blue
  ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8'], // Pink
  ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'], // Emerald
  ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'], // Amber
  ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'], // Violet
  ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'], // Blue 2
  ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'], // Red
  ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'], // Teal
];

export const PATTERN_PALETTE = [
  ['#1E1B4B', '#312E81', '#3730A3', '#4338CA', '#4F46E5', '#6366F1'], // Deep Blue
  ['#450A0A', '#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444'], // Deep Red
  ['#064E3B', '#065F46', '#047857', '#059669', '#10B981', '#34D399'], // Deep Green
  ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'], // Deep Purple
];

export function pickColor(val, palette) {
  const index = Math.floor(val * palette.length);
  return palette[index];
}

export function pickFromList(val, list) {
  const index = Math.floor(val * list.length);
  return list[index];
}
