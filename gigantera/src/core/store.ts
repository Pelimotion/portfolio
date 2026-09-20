import { create } from 'zustand';
import { Artwork, AudioTrackInfo, ThemeMode, ViewMode, MediumType } from '../types/art';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG, SECTORS_CATALOG } from '../data/artworks';
import { applyThemeTokens, TOKENS } from '../tokens';
import { computeModularGalleryLayout } from './modularGallery';
import { soundEngine } from './soundEngine';

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
  isGlobalMuted: boolean;
  soundVolume: number;

  // Filtro DJ Bipolar Ressonante (-1.0 Submerso a +1.0 Rarefeito)
  djFilterValue: number;
  setDJFilterValue: (val: number) => void;
  stepDJFilter: (direction: -1 | 1, step?: number) => void;
  resetDJFilter: () => void;

  // Modos de Interação com a Obra Espinhaço (Câmera 360° vs Teclado Orgânico)
  espinhacoInteractionMode: 'camera' | 'keyboard';
  setEspinhacoInteractionMode: (mode: 'camera' | 'keyboard') => void;
  toggleEspinhacoInteractionMode: () => void;
  espinhacoKineticParams: {
    flexX: number;
    flexY: number;
    torsion: number;
    waveSpeed: number;
  };
  setEspinhacoKineticParams: (params: Partial<{ flexX: number; flexY: number; torsion: number; waveSpeed: number }>) => void;

  // Fidelidade Gráfica Moderna (Baixo / Médio / Alto)
  graphicsQuality: 'light' | 'med' | 'high';
  setGraphicsQuality: (quality: 'light' | 'med' | 'high') => void;
  currentFps: number;
  setCurrentFps: (fps: number) => void;
  performanceSuggestion: string | null;
  setPerformanceSuggestion: (suggestion: string | null) => void;

  // Estado de inspeção inicial do CD (animação de 2s apenas na primeira vez)
  hasInspectedCDBefore: boolean;
  setHasInspectedCDBefore: (inspected: boolean) => void;

  // Jogabilidade e Controles Táteis
  gameControlPrompt: string | null;
  isPointerLocked: boolean;
  hoveredTarget: 'cd' | 'artwork' | 'plaque' | null;
  hoveredTrackIndex: number | null;
  lastActionCloseTime: number; // Timestamp do último fechamento de obra/CD (proteção anti-clique fantasma)

  // Inspeção 3D da Obra
  inspectionZoom: number;
  setInspectionZoom: (zoom: number) => void;
  isCinemaInfoOpen: boolean;
  toggleCinemaInfo: () => void;
  setCinemaInfoOpen: (open: boolean) => void;

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
  archiveGridPage: number;
  setArchiveGridPage: (page: number) => void;
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
  toggleGlobalMute: () => void;
  setSoundVolume: (volume: number) => void;
  // Central de Mídia & Download de Masters (Press Kit & Curatorial)
  activeMediaTab: 'promo' | 'masters';
  setActiveMediaTab: (tab: 'promo' | 'masters') => void;
  copiedFeedback: string | null;
  setCopiedFeedback: (msg: string | null) => void;
  openMediaKit: (tab?: 'promo' | 'masters') => void;

  setIntroSpawnProgress: (progress: number) => void;
  setIntroPhase: (phase: 'empty' | 'spawning' | 'ready') => void;
  setTutorialDocked: (docked: boolean) => void;
}

const defaultTrack = AUTHORIAL_TRACKS_CATALOG[0];

const getInitialViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'spatial';
  const params = new URLSearchParams(window.location.search);
  const v = params.get('view');
  if (v === 'media' || v === 'press') return 'media';
  if (v === 'archive' || v === 'catalogo') return 'archive';
  return 'spatial';
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'light', // Tema inicial padrão é o tema claro conforme especificado
  viewMode: getInitialViewMode(),
  activeFilter: 'all',

  activeMediaTab: 'promo',
  setActiveMediaTab: (tab) => set({ activeMediaTab: tab }),
  copiedFeedback: null,
  setCopiedFeedback: (msg) => {
    set({ copiedFeedback: msg });
    if (msg) {
      setTimeout(() => {
        if (get().copiedFeedback === msg) {
          set({ copiedFeedback: null });
        }
      }, 2500);
    }
  },
  openMediaKit: (tab = 'promo') => {
    set({
      viewMode: 'media',
      activeMediaTab: tab,
      cinemaArtwork: null,
      isCDPOVOpen: false,
      isHoldingCD: false,
      showGuideModal: false,
      isBioOpen: false
    });
  },

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
  isGlobalMuted: false,
  soundVolume: 0.85,

  djFilterValue: 0,
  setDJFilterValue: (val) => {
    const clamped = Math.max(-1.0, Math.min(1.0, val));
    soundEngine.setDJFilter(clamped);
    set({ djFilterValue: clamped });
  },
  stepDJFilter: (direction, step = 0.08) => {
    const current = get().djFilterValue;
    const next = Math.max(-1.0, Math.min(1.0, current + direction * step));
    soundEngine.setDJFilter(next);
    set({ djFilterValue: next });
  },
  resetDJFilter: () => {
    soundEngine.setDJFilter(0);
    set({ djFilterValue: 0 });
  },

  espinhacoInteractionMode: 'camera',
  setEspinhacoInteractionMode: (mode) => set({ espinhacoInteractionMode: mode }),
  toggleEspinhacoInteractionMode: () =>
    set((s) => ({
      espinhacoInteractionMode: s.espinhacoInteractionMode === 'camera' ? 'keyboard' : 'camera'
    })),
  espinhacoKineticParams: {
    flexX: 0,
    flexY: 0,
    torsion: 0,
    waveSpeed: 1.0
  },
  setEspinhacoKineticParams: (params) =>
    set((s) => ({
      espinhacoKineticParams: { ...s.espinhacoKineticParams, ...params }
    })),

  graphicsQuality: 'high',
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
  currentFps: 60,
  setCurrentFps: (fps) => set({ currentFps: fps }),
  performanceSuggestion: null,
  setPerformanceSuggestion: (suggestion) => set({ performanceSuggestion: suggestion }),

  hasInspectedCDBefore: false,
  setHasInspectedCDBefore: (inspected) => set({ hasInspectedCDBefore: inspected }),

  gameControlPrompt: null,
  isPointerLocked: false,
  hoveredTarget: null,
  hoveredTrackIndex: null,
  lastActionCloseTime: 0,

  stillArtworksList: [], // Legacy, mantido para compatibilidade de tipagem se necessário, mas não é mais iterado globalmente
  currentStillSheetIndex: 0,

  nextStillSheet: () => {
    const art = get().cinemaArtwork;
    if (!art || art.medium !== 'still') return;
    const images = art.galleryImages || [art.imageSrc];
    const nextIdx = (get().currentStillSheetIndex + 1) % images.length;
    set({
      currentStillSheetIndex: nextIdx,
      inspectionZoom: 1.0
    });
  },

  prevStillSheet: () => {
    const art = get().cinemaArtwork;
    if (!art || art.medium !== 'still') return;
    const images = art.galleryImages || [art.imageSrc];
    const prevIdx = (get().currentStillSheetIndex - 1 + images.length) % images.length;
    set({
      currentStillSheetIndex: prevIdx,
      inspectionZoom: 1.0
    });
  },

  setStillSheetIndex: (idx) => {
    const art = get().cinemaArtwork;
    if (!art || art.medium !== 'still') return;
    const images = art.galleryImages || [art.imageSrc];
    if (idx >= 0 && idx < images.length) {
      set({
        currentStillSheetIndex: idx,
        inspectionZoom: 1.0
      });
    }
  },

  wasAudioPlayingBeforeVideo: false,
  isVideoAudioMuted: false,
  toggleVideoAudio: () => set((state) => ({ isVideoAudioMuted: !state.isVideoAudioMuted })),

  inspectionZoom: 1.0,
  setInspectionZoom: (zoom) => set({ inspectionZoom: Math.max(0.5, Math.min(3.5, zoom)) }),
  isCinemaInfoOpen: true,
  toggleCinemaInfo: () => set((s) => ({ isCinemaInfoOpen: !s.isCinemaInfoOpen })),
  setCinemaInfoOpen: (open) => set({ isCinemaInfoOpen: open }),

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
  setActiveFilter: (filter) => set({ activeFilter: filter, archiveGridPage: 0 }),
  archiveGridPage: 0,
  setArchiveGridPage: (page) => set({ archiveGridPage: page }),

  setCameraTargetZ: (z) => {
    const clamped = Math.max(TOKENS.navigation.zEnd, Math.min(TOKENS.navigation.zStart, z));
    let sectorId = 'entrance-audio';
    if (clamped < -16) {
      sectorId = 'still';
    } else if (clamped < 11) {
      sectorId = 'video';
    } else if (clamped < 17.5) {
      sectorId = 'interactive';
    } else {
      sectorId = 'entrance-audio';
    }

    set({ cameraTargetZ: clamped, activeSectorId: sectorId });
  },

  updateCameraZ: (currentZ, velocity) => {
    let sectorId = 'entrance-audio';
    if (currentZ < -16) {
      sectorId = 'still';
    } else if (currentZ < 11) {
      sectorId = 'video';
    } else if (currentZ < 17.5) {
      sectorId = 'interactive';
    } else {
      sectorId = 'entrance-audio';
    }

    if (sectorId !== get().activeSectorId) {
      set({ cameraCurrentZ: currentZ, cameraVelocityZ: velocity, activeSectorId: sectorId });
    } else {
      set({ cameraCurrentZ: currentZ, cameraVelocityZ: velocity });
    }
  },

  warpToSector: (sectorId) => {
    const layout = computeModularGalleryLayout(ARTWORKS_CATALOG);

    if (sectorId === 'entrance-audio') {
      // Estação de CD em x = 2.8, z = 18.0. Fica de frente olhando reto para o estojo:
      const targetSpot = {
        x: 2.8,
        z: 21.0,
        targetYaw: 0,
        artworkId: 'cd-station'
      };
      set({
        activeSectorId: sectorId,
        hasPlayerMoved: true,
        targetGlideSpot: targetSpot
      });
      get().setCameraTargetZ(targetSpot.z);
      return;
    }

    if (sectorId === 'interactive') {
      const interactiveArt = layout.artworksWithCoords.find((a) => a.medium === 'interactive');
      if (interactiveArt) {
        const dx = interactiveArt.computedCoords.x - interactiveArt.viewingSpot.x;
        const dz = interactiveArt.computedCoords.z - interactiveArt.viewingSpot.z;
        const targetYaw = Math.atan2(-dx, -dz);
        set({
          activeSectorId: sectorId,
          hasPlayerMoved: true,
          targetGlideSpot: {
            x: interactiveArt.viewingSpot.x,
            z: interactiveArt.viewingSpot.z,
            targetYaw,
            artworkId: interactiveArt.id
          }
        });
        get().setCameraTargetZ(interactiveArt.viewingSpot.z);
        return;
      }
    }

    if (sectorId === 'video') {
      const firstVideo = layout.artworksWithCoords.find((a) => a.medium === 'video');
      if (firstVideo) {
        const dx = firstVideo.computedCoords.x - firstVideo.viewingSpot.x;
        const dz = firstVideo.computedCoords.z - firstVideo.viewingSpot.z;
        const targetYaw = Math.atan2(-dx, -dz);
        set({
          activeSectorId: sectorId,
          hasPlayerMoved: true,
          targetGlideSpot: {
            x: firstVideo.viewingSpot.x,
            z: firstVideo.viewingSpot.z,
            targetYaw,
            artworkId: firstVideo.id
          }
        });
        get().setCameraTargetZ(firstVideo.viewingSpot.z);
        return;
      }
    }

    if (sectorId === 'still') {
      const firstStill = layout.artworksWithCoords.find((a) => a.medium === 'still');
      if (firstStill) {
        const dx = firstStill.computedCoords.x - firstStill.viewingSpot.x;
        const dz = firstStill.computedCoords.z - firstStill.viewingSpot.z;
        const targetYaw = Math.atan2(-dx, -dz);
        set({
          activeSectorId: sectorId,
          hasPlayerMoved: true,
          targetGlideSpot: {
            x: firstStill.viewingSpot.x,
            z: firstStill.viewingSpot.z,
            targetYaw,
            artworkId: firstStill.id
          }
        });
        get().setCameraTargetZ(firstStill.viewingSpot.z);
        return;
      }
    }

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
      isCinemaInfoOpen: true,
      inspectionZoom: 1.0,
      isLoupeMode: false,
      loupePan: { x: 0, y: 0 },
      currentStillSheetIndex: stillIdx,
      // Se for vídeo COM áudio e o som de fundo estava ativo, fade-out CD e ativa áudio do vídeo
      wasAudioPlayingBeforeVideo: isVideo && art.hasAudio ? wasPlaying : false,
      isAudioPlaying: isVideo && art.hasAudio && wasPlaying ? false : wasPlaying,
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
      isCinemaInfoOpen: true,
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
    set({ isHoldingCD: true, isCDPOVOpen: true, cdFlipped: false });
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
  toggleGlobalMute: () => set((state) => ({ isGlobalMuted: !state.isGlobalMuted })),
  setSoundVolume: (vol) => set({ soundVolume: Math.max(0, Math.min(1, vol)) }),
  setIntroSpawnProgress: (progress) => set({ introSpawnProgress: progress }),
  setIntroPhase: (phase) => set({ introPhase: phase }),
  setTutorialDocked: (docked) => set({ tutorialDocked: docked })
}));
