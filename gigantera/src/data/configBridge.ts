import { Artwork, PressKitAsset } from '../types/art';
import { ARTWORKS_CATALOG } from './artworks';
import {
  ARTIST_INFO,
  CURATORIAL_STATEMENTS,
  PRESS_KIT_ASSETS
} from './mediaKitData';

export const CONFIG_STORAGE_KEY = 'gigantera_custom_config';

export interface GiganteraCustomConfig {
  artworks?: Artwork[];
  pressKitAssets?: PressKitAsset[];
  curatorialStatements?: {
    tagline?: string;
    miniBio?: string;
    bioPt?: string;
    bioShort?: string;
    bioInstitutional?: string;
    bioEn?: string;
    statementPt?: string;
    statementEn?: string;
    processNotes?: string;
    cvSkeleton?: string;
  };
  artistInfo?: {
    name?: string;
    alias?: string;
    role?: string;
    contactEmail?: string;
    cloudDriveUrl?: string;
    portfolioUrl?: string;
    galleryUrl?: string;
  };
  siteConfig?: {
    title?: string;
    metaDescription?: string;
    heroHeadline?: string;
    subhead?: string;
    ctaText?: string;
    curatorialProverb?: string;
  };
  updatedAt?: string;
}

export function loadCustomConfig(): GiganteraCustomConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Gigantera ConfigBridge] Erro ao ler configuração local:', err);
    return null;
  }
}

export function saveCustomConfig(config: GiganteraCustomConfig): void {
  if (typeof window === 'undefined') return;
  try {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('gigantera:config-updated', { detail: config }));
  } catch (err) {
    console.error('[Gigantera ConfigBridge] Erro ao salvar configuração:', err);
  }
}

export function getMergedArtworks(): Artwork[] {
  const custom = loadCustomConfig();
  if (custom && Array.isArray(custom.artworks) && custom.artworks.length > 0) {
    return custom.artworks;
  }
  return ARTWORKS_CATALOG;
}

export function getMergedPressKitAssets(): PressKitAsset[] {
  const custom = loadCustomConfig();
  if (custom && Array.isArray(custom.pressKitAssets) && custom.pressKitAssets.length > 0) {
    return custom.pressKitAssets;
  }
  return PRESS_KIT_ASSETS;
}

export function getMergedCuratorialStatements() {
  const custom = loadCustomConfig();
  if (custom && custom.curatorialStatements) {
    return {
      tagline: custom.curatorialStatements.tagline ?? CURATORIAL_STATEMENTS.tagline,
      miniBio: custom.curatorialStatements.miniBio ?? CURATORIAL_STATEMENTS.miniBio,
      bioPt: custom.curatorialStatements.bioPt ?? CURATORIAL_STATEMENTS.bioPt,
      bioShort: custom.curatorialStatements.bioShort ?? CURATORIAL_STATEMENTS.bioShort,
      bioInstitutional: custom.curatorialStatements.bioInstitutional ?? CURATORIAL_STATEMENTS.bioInstitutional,
      bioEn: custom.curatorialStatements.bioEn ?? CURATORIAL_STATEMENTS.bioEn,
      statementPt: custom.curatorialStatements.statementPt ?? CURATORIAL_STATEMENTS.statementPt,
      statementEn: custom.curatorialStatements.statementEn ?? CURATORIAL_STATEMENTS.statementEn,
      processNotes: custom.curatorialStatements.processNotes ?? CURATORIAL_STATEMENTS.processNotes,
      cvSkeleton: custom.curatorialStatements.cvSkeleton ?? CURATORIAL_STATEMENTS.cvSkeleton
    };
  }
  return CURATORIAL_STATEMENTS;
}

export function getMergedArtistInfo() {
  const custom = loadCustomConfig();
  if (custom && custom.artistInfo) {
    return {
      ...ARTIST_INFO,
      ...custom.artistInfo
    };
  }
  return ARTIST_INFO;
}

export const DEFAULT_SITE_CONFIG = {
  title: 'GIGANTERA | Pavilhão Digital',
  metaDescription: 'Um pavilhão imersivo. Você flutua entre vitrines suspensas com obras provocativas e uma sala de som autoral.',
  heroHeadline: 'GIGANTERA\nUm pavilhão. Não um portfólio.',
  subhead: 'Concreto, luz e som suspensos no espaço — entre e ande.',
  ctaText: 'ENTRAR NO PAVILHÃO',
  curatorialProverb: 'Tainhas gigantes só podem ser pescadas com uma tarrafa gigante.'
};

export function getMergedSiteConfig() {
  const custom = loadCustomConfig();
  if (custom && custom.siteConfig) {
    return {
      ...DEFAULT_SITE_CONFIG,
      ...custom.siteConfig
    };
  }
  return DEFAULT_SITE_CONFIG;
}
