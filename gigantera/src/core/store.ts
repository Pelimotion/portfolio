import { create } from 'zustand';
import { StratumId, Artwork } from '../types/art';
import { STRATA_CATALOG } from '../data/artworks';

interface AppState {
  // Profundidade e Scroll Estratigráfico (Pilar 3)
  depthProgress: number; // 0.0 (superfície) a 1.0 (abismo)
  activeStratum: StratumId;
  
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
  setCymaticFrequency: (freq: number) => void;
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleStillWaterMode: () => void;
  selectArtwork: (art: Artwork | null) => void;
  setErosionProgress: (p: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  depthProgress: 0.0,
  activeStratum: 'epipelagic',
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
        isTuned: true
      });
    } else {
      set({ activeStratum: stratum });
    }
  },

  setCymaticFrequency: (freq: number) => {
    // Verifica se a frequência está próxima de algum dos nós estáveis (tolerância de ±12 Hz)
    const tunedStratum = STRATA_CATALOG.find(
      (s) => Math.abs(s.resonanceFreqHz - freq) <= 12
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
