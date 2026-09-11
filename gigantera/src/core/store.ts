import { create } from 'zustand';
import { StratumId, Artwork } from '../types/art';
import { STRATA_CATALOG } from '../data/artworks';

export type ViewMode = 'explore' | 'gallery';

interface AppState {
  // Profundidade e Scroll Estratigráfico (Pilar 3)
  depthProgress: number; // 0.0 (superfície) a 1.0 (abismo)
  activeStratum: StratumId;
  
  // Coordenadas Espaciais da Câmera 3D
  cameraTargetY: number; // Y de destino para glide suave (12 a -24)
  cameraCurrentY: number; // Y atual interpolado
  cameraVelocity: number; // Taxa de variação para inércia da areia
  viewMode: ViewMode;
  hoveredArtwork: Artwork | null;

  // Sintonia Cimática (Pilar 2)
  cymaticFrequency: number; // em Hertz
  isTuned: boolean; // travado em um modo harmônico estável
  
  // Áudio Generativo Tone.js
  isAudioEnabled: boolean;
  
  // Acessibilidade & Água Parada (Still Water Mode)
  isStillWaterMode: boolean;
  
  // Transição por Erosão (Pilar 4)
  selectedArtwork: Artwork | null;
  erosionProgress: number; // 0.0 (estável) a 1.0 (totalmente erodido)
  
  // Ações
  setDepthProgress: (progress: number) => void;
  setActiveStratum: (stratum: StratumId) => void;
  setCameraTargetY: (y: number) => void;
  updateCameraPosition: (currentY: number, velocity: number) => void;
  warpToStratum: (stratumId: StratumId) => void;
  setViewMode: (mode: ViewMode) => void;
  setHoveredArtwork: (art: Artwork | null) => void;
  setCymaticFrequency: (freq: number) => void;
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleStillWaterMode: () => void;
  selectArtwork: (art: Artwork | null) => void;
  setErosionProgress: (p: number) => void;
}

// Mapeamento de profundidade Y para cada estrato
export const STRATA_Y_MAP: Record<StratumId, number> = {
  epipelagic: 10,
  mesopelagic: -3,
  bathypelagic: -18
};

export const useAppStore = create<AppState>((set, get) => ({
  depthProgress: 0.0,
  activeStratum: 'epipelagic',
  cameraTargetY: 10,
  cameraCurrentY: 10,
  cameraVelocity: 0,
  viewMode: 'explore',
  hoveredArtwork: null,
  cymaticFrequency: 174,
  isTuned: true,
  isAudioEnabled: false,
  isStillWaterMode: false,
  selectedArtwork: null,
  erosionProgress: 0.0,

  setDepthProgress: (progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    let currentStratum: StratumId = 'epipelagic';
    if (clamped > 0.66) {
      currentStratum = 'bathypelagic';
    } else if (clamped > 0.33) {
      currentStratum = 'mesopelagic';
    }
    set({
      depthProgress: clamped,
      activeStratum: currentStratum
    });
  },

  setActiveStratum: (stratum: StratumId) => {
    const target = STRATA_CATALOG.find((s) => s.id === stratum);
    if (target) {
      set({
        activeStratum: stratum,
        cymaticFrequency: target.resonanceFreqHz,
        isTuned: true,
        cameraTargetY: STRATA_Y_MAP[stratum]
      });
    } else {
      set({ activeStratum: stratum });
    }
  },

  setCameraTargetY: (y: number) => {
    const clampedY = Math.max(-24, Math.min(14, y));
    // Converte Y (14 a -24) para depthProgress (0.0 a 1.0)
    const progress = (14 - clampedY) / 38;
    get().setDepthProgress(progress);
    set({ cameraTargetY: clampedY });
  },

  updateCameraPosition: (currentY: number, velocity: number) => {
    set({
      cameraCurrentY: currentY,
      cameraVelocity: velocity
    });
  },

  warpToStratum: (stratumId: StratumId) => {
    const targetY = STRATA_Y_MAP[stratumId];
    get().setActiveStratum(stratumId);
    get().setCameraTargetY(targetY);
  },

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  setHoveredArtwork: (art: Artwork | null) => set({ hoveredArtwork: art }),

  setCymaticFrequency: (freq: number) => {
    const tunedStratum = STRATA_CATALOG.find(
      (s) => Math.abs(s.resonanceFreqHz - freq) <= 14
    );

    if (tunedStratum) {
      set({
        cymaticFrequency: freq,
        isTuned: true,
        activeStratum: tunedStratum.id
      });
    } else {
      set({
        cymaticFrequency: freq,
        isTuned: false
      });
    }
  },

  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  setAudioEnabled: (enabled: boolean) => set({ isAudioEnabled: enabled }),

  toggleStillWaterMode: () => {
    const next = !get().isStillWaterMode;
    set({ isStillWaterMode: next });
    if (typeof document !== 'undefined') {
      if (next) {
        document.body.classList.add('still-water-mode');
      } else {
        document.body.classList.remove('still-water-mode');
      }
    }
  },

  selectArtwork: (art: Artwork | null) => set({ selectedArtwork: art }),
  setErosionProgress: (p: number) => set({ erosionProgress: Math.max(0, Math.min(1, p)) })
}));
