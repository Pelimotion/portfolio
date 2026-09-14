/**
 * TOKENS.TS — Sistema de Design Brutalista Espacial para Gigantera
 * Suporte a Temas Dual (Obsidiana / Escuro e Alabastro / Claro)
 * Tipografia monumental, coordenadas de galeria e física de navegação Z.
 */

export interface ColorToken {
  hex: string;
  rgb: [number, number, number];
  threeHex: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function createToken(hex: string): ColorToken {
  const [r, g, b] = hexToRgb(hex);
  return {
    hex,
    rgb: [r, g, b],
    threeHex: parseInt(cleanHex(hex), 16)
  };
}

function cleanHex(hex: string): string {
  return hex.replace('#', '0x');
}

export const TOKENS = {
  themes: {
    dark: {
      bgPrimary: createToken('#08090A'),
      bgSurface: createToken('#121514'),
      bgSurfaceElevated: createToken('#1B201D'),
      borderSubtle: 'rgba(255, 255, 255, 0.09)',
      borderStrong: 'rgba(255, 255, 255, 0.24)',
      textPrimary: createToken('#F4F3EF'),
      textSecondary: createToken('#909692'),
      textTertiary: createToken('#5B625E'),
      accentGold: createToken('#E4C379'),
      accentCyan: createToken('#63E2B7'),
      accentCoral: createToken('#FF6B4A'),
      canvasFog: 0x08090a,
      canvasPlinth: 0x141816,
      canvasFrame: 0x1e2421,
      wireframe: 0xe4c379
    },
    light: {
      bgPrimary: createToken('#F5F4EE'),
      bgSurface: createToken('#ECEAE3'),
      bgSurfaceElevated: createToken('#E2DFD6'),
      borderSubtle: 'rgba(0, 0, 0, 0.08)',
      borderStrong: 'rgba(0, 0, 0, 0.22)',
      textPrimary: createToken('#0D0F0E'),
      textSecondary: createToken('#484D4A'),
      textTertiary: createToken('#7A807C'),
      accentGold: createToken('#B88D34'),
      accentCyan: createToken('#1A8B67'),
      accentCoral: createToken('#D94726'),
      canvasFog: 0xf5f4ee,
      canvasPlinth: 0xeae8df,
      canvasFrame: 0xdcd8cd,
      wireframe: 0x0d0f0e
    }
  },
  typography: {
    display: "'Syne', 'Fraunces', sans-serif",
    serif: "'Fraunces', Georgia, serif",
    mono: "'Space Mono', 'Courier New', monospace",
    body: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  navigation: {
    zStart: 25,
    zEnd: -95,
    cameraFov: 48,
    proximityThreshold: 6.5,
    cinemaSnapDistance: 3.2
  }
} as const;

export function applyThemeTokens(theme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const t = TOKENS.themes[theme];

  root.dataset.theme = theme;
  root.style.setProperty('--bg-primary', t.bgPrimary.hex);
  root.style.setProperty('--bg-surface', t.bgSurface.hex);
  root.style.setProperty('--bg-surface-elevated', t.bgSurfaceElevated.hex);
  root.style.setProperty('--border-subtle', t.borderSubtle);
  root.style.setProperty('--border-strong', t.borderStrong);
  root.style.setProperty('--text-primary', t.textPrimary.hex);
  root.style.setProperty('--text-secondary', t.textSecondary.hex);
  root.style.setProperty('--text-tertiary', t.textTertiary.hex);
  root.style.setProperty('--accent-gold', t.accentGold.hex);
  root.style.setProperty('--accent-cyan', t.accentCyan.hex);
  root.style.setProperty('--accent-coral', t.accentCoral.hex);

  root.style.setProperty('--font-display', TOKENS.typography.display);
  root.style.setProperty('--font-serif', TOKENS.typography.serif);
  root.style.setProperty('--font-mono', TOKENS.typography.mono);
  root.style.setProperty('--font-body', TOKENS.typography.body);
}
