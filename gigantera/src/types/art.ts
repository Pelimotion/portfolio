export type StratumId = 'epipelagic' | 'mesopelagic' | 'bathypelagic';

export interface Artwork {
  id: string;
  title: string;
  series: string;
  stratum: StratumId;
  year: number;
  materials: string;
  description: string;
  depthMeters: number;
  imageSrc: string;
  imageAlt: string;
  colorSeed?: string;
  aspectRatio?: string;
}

export interface StratumInfo {
  id: StratumId;
  title: string;
  depthRange: string;
  description: string;
  resonanceFreqHz: number;
  nodalMode: { n: number; m: number };
  artworks: Artwork[];
}
