/**
 * SEED ENGINE™
 * Gera sementes determinísticas de 32 bits a partir de um slug + salt.
 */

export async function getSeed(slug, salt = '') {
  const combined = `${slug || 'default-seed'}_${salt}`;
  const msgUint8 = new TextEncoder().encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  
  // Converter para Float32Array de 8 posições (0.0 a 1.0)
  const floats = new Float32Array(8);
  for (let i = 0; i < 8; i++) {
    const start = i * 4;
    const view = new DataView(hashBuffer, start, 4);
    floats[i] = view.getUint32(0) / 0xFFFFFFFF;
  }
  
  return floats;
}

export function createPRNG(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
