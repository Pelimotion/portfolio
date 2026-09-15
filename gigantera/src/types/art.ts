export type MediumType = 'still' | 'video' | 'sound';
export type ThemeMode = 'dark' | 'light';
export type ViewMode = 'spatial' | 'archive' | 'media';

export interface PressKitAsset {
  id: string;
  category: 'bio' | 'statement' | 'photos' | 'logos' | 'release' | 'promopack' | 'process' | 'cv';
  title: string;
  description: string;
  format: string; // ex: 'PDF', 'SVG', 'PNG', 'ZIP', 'TXT'
  resolutionOrSize?: string; // ex: '300 DPI · 4000x5000px'
  fileUrl?: string;
  previewUrl?: string;
  copyableContent?: string;
  externalDriveUrl?: string;
  status?: 'ready' | 'pending' | 'hidden'; // 'ready' = disponível, 'pending' = em preparação, 'hidden' = oculto
}

export interface MasterWorkAsset {
  id: string;
  artworkId: string;
  title: string;
  series: string;
  medium: MediumType;
  year: number;
  materials: string;
  masterFormat: string; // ex: 'Apple ProRes 422 HQ (4K)', 'TIFF 16-bit 300 DPI', 'WAV 24-bit 48kHz'
  dimensionsOrDuration: string; // ex: '3840x2160 UHD', '4500x5600 px (300 DPI)', '02:44 min'
  colorSpace: string; // ex: 'Rec.709 / sRGB', 'DCI-P3'
  fileSizeApprox: string; // ex: '1.4 GB', '85 MB', '45 MB'
  webFileSize?: string; // ex: '514 KB', '385 KB'
  masterFileSize?: string; // ex: '1.85 GB', '65 MB'
  previewSrc: string;
  downloadUrl: string;
  cloudStorageUrl?: string;
  citationCredit: string;
  curatorialStatement: string;
  availableInMediaKit?: boolean;
}

export interface SpatialCoordinates {
  x: number;
  y: number;
  z: number;
  rotY?: number;
}

export interface Artwork {
  id: string;
  title: string;
  series: string;
  medium: MediumType;
  categoryLabel: string;
  year: number;
  materials: string;
  description: string;
  imageSrc: string;
  videoSrc?: string;
  audioSrc?: string;
  previewSrc?: string;
  duration?: string;
  bpm?: number;
  aspectRatio?: string;
  aspectRatioNum?: number;
  spatialCoords?: SpatialCoordinates;
  curatorialNotes?: string;
  availableInMediaKit?: boolean;
  masterFormat?: string;
  dimensionsOrDuration?: string;
  cloudStorageUrl?: string;
  status?: 'active' | 'hidden';
}


export interface AudioTrackInfo {
  id: string;
  trackNumber: string;
  title: string;
  series: string;
  genre: string;
  bpm: number;
  duration: string;
  previewSrc: string;
  fullSrc: string;
  coverImage: string;
  year: number;
  description: string;
}

export interface SectorInfo {
  id: string;
  sectorCode: string;
  title: string;
  medium: MediumType;
  zRange: string;
  description: string;
  accentColor: string;
}

export interface OutputClusterItem {
  id: string;
  filename: string;
  proposedTitle: string;
  format: string;
  sizeApprox: string;
  type: 'master' | 'study' | 'mockup' | 'still' | 'simulation';
  notes?: string;
  sourceDir: string;
}

export interface OutputCluster {
  id: string;
  clusterName: string;
  series: string;
  sourceDir: string;
  concept: string;
  items: OutputClusterItem[];
}

