/**
 * TOKENS.TS — Fonte única de verdade do Sistema de Design gigantera
 * Alimenta simultaneamente as variáveis CSS e os uniforms dos Shaders WebGL/OGL.
 * Nenhuma cor ou métrica deve ser declarada fora deste arquivo.
 */

export interface ColorToken {
  hex: string;
  rgb: [number, number, number]; // [0..255]
  glsl: [number, number, number]; // [0.0..1.0] normalizado para shaders
  description: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function createToken(hex: string, description: string): ColorToken {
  const [r, g, b] = hexToRgb(hex);
  return {
    hex,
    rgb: [r, g, b],
    glsl: [r / 255, g / 255, b / 255],
    description
  };
}

export const TOKENS = {
  colors: {
    depthAbyss: createToken(
      '#0E1613',
      'Fundo mais profundo — preto azul-esverdeado orgânico'
    ),
    depthMid: createToken(
      '#37443F',
      'Camada intermediária — verde-ardósia'
    ),
    surfaceGlass: createToken(
      '#DDE3DC',
      'Superfície próxima ao topo — verde-vidro pálido'
    ),
    lightCaustic: createToken(
      '#E8C77E',
      'Luz refratada solar — accent primário de iluminação'
    ),
    sedimentClay: createToken(
      '#8C6142',
      'Argila/sedimento úmido — accent geológico secundário'
    ),
    foamWhite: createToken(
      '#F2F0E9',
      'Espuma cálcica — texto de alto contraste com moderação'
    )
  },
  typography: {
    display: "'Fraunces', Georgia, serif",
    body: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Space Mono', 'Courier New', monospace",
    experimentalDisplay: "'Syne', 'Fraunces', sans-serif",
    frauncesAxes: {
      opsz: { min: 9, max: 144, default: 72 },
      wght: { min: 100, max: 900, default: 400 },
      soft: { min: 0, max: 100, default: 50 },
      wonk: { min: 0, max: 1, default: 0 }
    }
  },
  strata: {
    depthLevels: [
      { id: 'epipelagic', name: 'Estrato Epipelágico', depthMeters: 0, offsetPx: 0 },
      { id: 'mesopelagic', name: 'Estrato Mesopelágico', depthMeters: 200, offsetPx: 48 },
      { id: 'bathypelagic', name: 'Estrato Batipelágico', depthMeters: 1000, offsetPx: 16 }
    ]
  },
  physics: {
    waterFriction: 0.94,
    lightAttenuationCoeff: 1.8,
    chladniGridResolution: 128
  }
} as const;

/**
 * Gera as variáveis CSS correspondentes para injeção no :root
 */
export function injectCssTokens(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  root.style.setProperty('--depth-abyss', TOKENS.colors.depthAbyss.hex);
  root.style.setProperty('--depth-mid', TOKENS.colors.depthMid.hex);
  root.style.setProperty('--surface-glass', TOKENS.colors.surfaceGlass.hex);
  root.style.setProperty('--light-caustic', TOKENS.colors.lightCaustic.hex);
  root.style.setProperty('--sediment-clay', TOKENS.colors.sedimentClay.hex);
  root.style.setProperty('--foam-white', TOKENS.colors.foamWhite.hex);
  
  root.style.setProperty('--font-display', TOKENS.typography.display);
  root.style.setProperty('--font-body', TOKENS.typography.body);
  root.style.setProperty('--font-mono', TOKENS.typography.mono);
  root.style.setProperty('--font-exp', TOKENS.typography.experimentalDisplay);
}
