import { create } from 'zustand';
import { Artwork, AudioTrackInfo, ThemeMode, ViewMode, MediumType } from '../types/art';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG, SECTORS_CATALOG } from '../data/artworks';
import { applyThemeTokens, TOKENS } from '../tokens';
import { computeModularGalleryLayout } from './modularGallery';

interface AppState {
  // Tema & Visualização
  theme: ThemeMode;
  viewMode: ViewMode;
  activeFilter: 'all' | MediumType;

  // Navegação Espacial 3D (Eixo Z)
  cameraTargetZ: number;
  cameraCurrentZ: number;
  cameraVelocityZ: number;
  activeSectorId: string;

  // Interação & Detecção de Proximidade
  proximityArtwork: Artwork | null;
  hoveredArtwork: Artwork | null;
  cinemaArtwork: Artwork | null;

  // Intro & Materialização Sequencial
  introPhase: 'empty' | 'spawning' | 'ready';
  introSpawnProgress: number; // 0.0 a 1.0 (materialização ao longo de 4s)
  tutorialDocked: boolean;

  // Experiência de Áudio & CD em POV (Física de Game 3D)
  isCDPOVOpen: boolean;
  isHoldingCD: boolean;
  cdFlipped: boolean; // false = capa frontal, true = contracapa com faixas (como na referência)
  currentAudioTrack: AudioTrackInfo;
  isAudioPlaying: boolean;
  soundVolume: number;

  // Fidelidade Gráfica Moderna (Light / Med / RTX com Raytracing)
  graphicsQuality: 'light' | 'med' | 'high';
  setGraphicsQuality: (quality: 'light' | 'med' | 'high') => void;

  // Jogabilidade e Controles Táteis
  gameControlPrompt: string | null;
  isPointerLocked: boolean;
  hoveredTarget: 'cd' | 'artwork' | 'plaque' | null;
  hoveredTrackIndex: number | null;
  lastActionCloseTime: number; // Timestamp do último fechamento de obra/CD (proteção anti-clique fantasma)

  // Inspeção 3D da Obra
  inspectionZoom: number;
  setInspectionZoom: (zoom: number) => void;

  // Sistema de Pranchetas de Obras Still (Folheação de Ilustrações)
  stillArtworksList: Artwork[];
  currentStillSheetIndex: number;
  nextStillSheet: () => void;
  prevStillSheet: () => void;
  setStillSheetIndex: (idx: number) => void;

  // Sistema de Áudio para Obras em Vídeo (Crossfade com o CD)
  wasAudioPlayingBeforeVideo: boolean;
  isVideoAudioMuted: boolean;
  toggleVideoAudio: () => void;

  // Modo Lupa de Crítico de Arte (Super Zoom & Pan Analítico)
  isLoupeMode: boolean;
  toggleLoupeMode: () => void;
  setLoupeMode: (active: boolean) => void;
  loupePan: { x: number; y: number };
  setLoupePan: (pan: { x: number; y: number }) => void;

  // Guia de Controles e Atalhos (Modal)
  showGuideModal: boolean;
  setShowGuideModal: (open: boolean) => void;
  toggleGuideModal: () => void;

  // Detecção de movimentação para auto-ocultação do tutorial
  hasPlayerMoved: boolean;
  setHasPlayerMoved: (moved: boolean) => void;

  // Modais de Conteúdo
  isBioOpen: boolean;

  // Detecção e Experiência Mobile de Alta Sofisticação
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  isGyroscopeActive: boolean;
  setGyroscopeActive: (active: boolean) => void;
  toggleGyroscope: () => void;
  currentArtworkIndex: number;
  setCurrentArtworkIndex: (index: number) => void;
  navigateToArtworkIndex: (index: number) => void;
  nextArtwork: () => void;
  prevArtwork: () => void;
  targetGlideSpot: { x: number; z: number; targetYaw?: number; artworkId?: string } | null;
  setTargetGlideSpot: (spot: { x: number; z: number; targetYaw?: number; artworkId?: string } | null) => void;

  // Ações
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveFilter: (filter: 'all' | MediumType) => void;
  setCameraTargetZ: (z: number) => void;
  updateCameraZ: (currentZ: number, velocity: number) => void;
  warpToSector: (sectorId: string) => void;
  setProximityArtwork: (art: Artwork | null) => void;
  setHoveredArtwork: (art: Artwork | null) => void;
  openCinema: (art: Artwork) => void;
  closeCinema: () => void;
  setBioOpen: (open: boolean) => void;
  setCDPOVOpen: (open: boolean) => void;
  takeCD: () => void;
  stowCD: () => void;
  flipCD: () => void;
  setGameControlPrompt: (prompt: string | null) => void;
  setPointerLocked: (locked: boolean) => void;
  setHoveredTarget: (target: 'cd' | 'artwork' | 'plaque' | null) => void;
  setHoveredTrackIndex: (idx: number | null) => void;
  setCurrentAudioTrack: (track: AudioTrackInfo) => void;
  setIsAudioPlaying: (playing: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setIntroSpawnProgress: (progress: number) => void;
  setIntroPhase: (phase: 'empty' | 'spawning' | 'ready') => void;
  setTutorialDocked: (docked: boolean) => void;
}

const defaultTrack = AUTHORIAL_TRACKS_CATALOG[0];

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'light', // Tema inicial padrão é o tema claro conforme especificado
  viewMode: 'spatial',
  activeFilter: 'all',

  cameraTargetZ: 22,
  cameraCurrentZ: 22,
  cameraVelocityZ: 0,
  activeSectorId: 'entrance-audio',

  proximityArtwork: null,
  hoveredArtwork: null,
  cinemaArtwork: null,

  introPhase: 'spawning',
  introSpawnProgress: 0.0,
  tutorialDocked: false,

  isCDPOVOpen: false,
  isHoldingCD: false,
  cdFlipped: true, // Começa mostrando a contracapa como na imagem de referência!
  currentAudioTrack: defaultTrack,
  isAudioPlaying: false,
  soundVolume: 0.85,

  graphicsQuality: 'high',
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  gameControlPrompt: null,
  isPointerLocked: false,
  hoveredTarget: null,
  hoveredTrackIndex: null,
  lastActionCloseTime: 0,

  stillArtworksList: ARTWORKS_CATALOG.filter((a) => a.medium === 'still'),
  currentStillSheetIndex: 0,

  nextStillSheet: () => {
    const list = get().stillArtworksList;
    if (list.length === 0) return;
    const nextIdx = (get().currentStillSheetIndex + 1) % list.length;
    set({
      currentStillSheetIndex: nextIdx,
      cinemaArtwork: list[nextIdx],
      inspectionZoom: 1.0
    });
  },

  prevStillSheet: () => {
    const list = get().stillArtworksList;
    if (list.length === 0) return;
    const prevIdx = (get().currentStillSheetIndex - 1 + list.length) % list.length;
    set({
      currentStillSheetIndex: prevIdx,
      cinemaArtwork: list[prevIdx],
      inspectionZoom: 1.0
    });
  },

  setStillSheetIndex: (idx) => {
    const list = get().stillArtworksList;
    if (idx >= 0 && idx < list.length) {
      set({
        currentStillSheetIndex: idx,
        cinemaArtwork: list[idx],
        inspectionZoom: 1.0
      });
    }
  },

  wasAudioPlayingBeforeVideo: false,
  isVideoAudioMuted: false,
  toggleVideoAudio: () => set((state) => ({ isVideoAudioMuted: !state.isVideoAudioMuted })),

  inspectionZoom: 1.0,
  setInspectionZoom: (zoom) => set({ inspectionZoom: Math.max(0.5, Math.min(3.5, zoom)) }),

  isLoupeMode: false,
  loupePan: { x: 0, y: 0 },
  toggleLoupeMode: () => {
    const next = !get().isLoupeMode;
    set({
      isLoupeMode: next,
      inspectionZoom: next ? 2.8 : 1.0,
      loupePan: { x: 0, y: 0 }
    });
  },
  setLoupeMode: (active) => set({ isLoupeMode: active, inspectionZoom: active ? 2.8 : 1.0, loupePan: { x: 0, y: 0 } }),
  setLoupePan: (pan) => set({ loupePan: pan }),

  showGuideModal: false,
  setShowGuideModal: (open) => set({ showGuideModal: open }),
  toggleGuideModal: () => set((s) => ({ showGuideModal: !s.showGuideModal })),

  hasPlayerMoved: false,
  setHasPlayerMoved: (moved) => set({ hasPlayerMoved: moved }),

  isBioOpen: false,

  isMobile: typeof window !== 'undefined' ? window.innerWidth <= 960 : false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  isGyroscopeActive: false,
  setGyroscopeActive: (active) => set({ isGyroscopeActive: active }),
  toggleGyroscope: () => set((s) => ({ isGyroscopeActive: !s.isGyroscopeActive })),

  currentArtworkIndex: 0,
  setCurrentArtworkIndex: (idx) => set({ currentArtworkIndex: idx }),

  targetGlideSpot: null,
  setTargetGlideSpot: (spot) => set({ targetGlideSpot: spot }),

  navigateToArtworkIndex: (idx) => {
    const layout = computeModularGalleryLayout(ARTWORKS_CATALOG);
    const list = layout.artworksWithCoords;
    if (list.length === 0) return;
    const boundedIdx = (idx + list.length) % list.length;
    const target = list[boundedIdx];
    if (!target) return;

    const dx = target.computedCoords.x - target.viewingSpot.x;
    const dz = target.computedCoords.z - target.viewingSpot.z;
    const targetYaw = Math.atan2(-dx, -dz);

    set({
      currentArtworkIndex: boundedIdx,
      targetGlideSpot: {
        x: target.viewingSpot.x,
        z: target.viewingSpot.z,
        targetYaw,
        artworkId: target.id
      },
      hasPlayerMoved: true
    });
    get().setCameraTargetZ(target.viewingSpot.z);
  },

  nextArtwork: () => {
    const nextIdx = get().currentArtworkIndex + 1;
    get().navigateToArtworkIndex(nextIdx);
  },

  prevArtwork: () => {
    const prevIdx = get().currentArtworkIndex - 1;
    get().navigateToArtworkIndex(prevIdx);
  },

  setTheme: (theme) => {
    set({ theme });
    applyThemeTokens(theme);
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setCameraTargetZ: (z) => {
    const clamped = Math.max(TOKENS.navigation.zEnd, Math.min(TOKENS.navigation.zStart, z));
    let sectorId = 'entrance-audio';
    if (clamped < -16) {
      sectorId = 'video';
    } else if (clamped < 16) {
      sectorId = 'still';
    }

    set({ cameraTargetZ: clamped, activeSectorId: sectorId });
  },

  updateCameraZ: (currentZ, velocity) => {
    set({ cameraCurrentZ: currentZ, cameraVelocityZ: velocity });
  },

  warpToSector: (sectorId) => {
    let targetZ = 22;
    if (sectorId === 'entrance-audio') targetZ = 20;
    if (sectorId === 'still') targetZ = 10;
    if (sectorId === 'video') targetZ = -22;

    get().setCameraTargetZ(targetZ);
    set({ activeSectorId: sectorId });
  },

  setProximityArtwork: (art) => set({ proximityArtwork: art }),
  setHoveredArtwork: (art) => set({ hoveredArtwork: art }),

  openCinema: (art) => {
    const wasPlaying = get().isAudioPlaying;
    const isVideo = art.medium === 'video';

    // Se for Still, calcula o índice da prancheta
    let stillIdx = 0;
    if (art.medium === 'still') {
      const idx = get().stillArtworksList.findIndex((a) => a.id === art.id);
      if (idx !== -1) stillIdx = idx;
    }

    set({
      cinemaArtwork: art,
      inspectionZoom: 1.0,
      isLoupeMode: false,
      loupePan: { x: 0, y: 0 },
      currentStillSheetIndex: stillIdx,
      // Se for vídeo e o som de fundo estava ativo, fade-out CD e ativa áudio do vídeo
      wasAudioPlayingBeforeVideo: isVideo ? wasPlaying : false,
      isAudioPlaying: isVideo && wasPlaying ? false : wasPlaying,
      isVideoAudioMuted: false
    });
  },

  closeCinema: () => {
    try {
      document.body.style.cursor = 'default';
    } catch {}
    const wasPlayingBefore = get().wasAudioPlayingBeforeVideo;
    set({
      cinemaArtwork: null,
      inspectionZoom: 1.0,
      isLoupeMode: false,
      loupePan: { x: 0, y: 0 },
      lastActionCloseTime: Date.now(),
      // Se a música do CD estava tocando antes de inspecionar o vídeo, retoma com fade-in
      isAudioPlaying: wasPlayingBefore ? true : get().isAudioPlaying,
      wasAudioPlayingBeforeVideo: false
    });
  },

  setBioOpen: (open) => set({ isBioOpen: open }),
  setCDPOVOpen: (open) => set({ isCDPOVOpen: open, isHoldingCD: open }),

  takeCD: () => {
    set({ isHoldingCD: true, isCDPOVOpen: true });
  },

  stowCD: () => {
    try {
      document.body.style.cursor = 'default';
    } catch {}
    set({
      isHoldingCD: false,
      isCDPOVOpen: false,
      hoveredTrackIndex: null,
      lastActionCloseTime: Date.now()
    });
  },

  flipCD: () => {
    set((state) => ({ cdFlipped: !state.cdFlipped }));
  },

  setGameControlPrompt: (prompt) => set({ gameControlPrompt: prompt }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  setHoveredTarget: (target) => set({ hoveredTarget: target }),
  setHoveredTrackIndex: (idx) => set({ hoveredTrackIndex: idx }),

  setCurrentAudioTrack: (track) => set({ currentAudioTrack: track }),
  setIsAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
  setSoundVolume: (vol) => set({ soundVolume: Math.max(0, Math.min(1, vol)) }),
  setIntroSpawnProgress: (progress) => set({ introSpawnProgress: progress }),
  setIntroPhase: (phase) => set({ introPhase: phase }),
  setTutorialDocked: (docked) => set({ tutorialDocked: docked })
}));
