export type MediumType = 'still' | 'video' | 'sound';
export type ThemeMode = 'dark' | 'light';
export type ViewMode = 'spatial' | 'archive';

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
