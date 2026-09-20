/**
 * MODULAR GALLERY — Gerador Arquitetural Procedural da Galeria 3D Gigantera
 * Calcula dinamicamente o comprimento do salão, espaçamento e coordenadas de vitrines,
 * pontos contemplativos no piso, caixas acústicas fixadas nas paredes voltadas para o centro,
 * vigas do teto, bancos centrais e limites de movimentação (minZ, maxZ) com base no acervo.
 */

import { Artwork } from '../types/art';

export interface ViewingSpotInfo {
  artworkId: string;
  x: number;
  z: number;
  medium: 'still' | 'video' | 'interactive';
  title: string;
}

export interface SpeakerPlacement {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number; // Radianos: voltada para o centro do salão
  wall: 'left' | 'right';
}

export interface ModularGalleryLayout {
  // Limites da sala
  roomWidth: number;       // Largura total (ex: 28m)
  halfWidth: number;       // x: -14m a +14m
  roomHeight: number;      // Altura total (ex: 12m)
  hallLength: number;      // Comprimento total calculado
  zStart: number;          // Início da galeria (ex: +30m)
  zEnd: number;            // Fim da galeria (ex: -95m)
  entranceZ: number;       // Posição inicial da câmera (ex: +22m)
  backWallZ: number;       // Parede de fundo (ex: zEnd - 4m)
  frontWallZ: number;      // Parede de entrada (ex: zStart + 4m)

  // Layout das Obras
  artworksWithCoords: (Artwork & {
    computedCoords: { x: number; y: number; z: number; rotY: number };
    viewingSpot: ViewingSpotInfo;
  })[];

  // Elementos Arquiteturais
  viewingSpots: ViewingSpotInfo[];
  speakers: SpeakerPlacement[];
  ceilingBeamsZ: number[];
  benchesZ: number[];

  // Limites para o PlayerController
  playerBounds: {
    minZ: number;
    maxZ: number;
    minX: number;
    maxX: number;
  };
}

export function computeModularGalleryLayout(artworks: Artwork[]): ModularGalleryLayout {
  const roomWidth = 28.0;
  const halfWidth = 14.0;
  const roomHeight = 12.0;

  const entranceZ = 22.0;
  const zStart = 30.0;
  const cdStationZ = 18.0;

  // Separação por setor: Interativo (Átrio) → Setor 01 (VÍDEO) → Setor 02 (STILL)
  const interactiveWorks = artworks.filter((a) => a.medium === 'interactive');
  const videoWorks = artworks.filter((a) => a.medium === 'video');
  const stillWorks = artworks.filter((a) => a.medium === 'still');

  // Espaçamento longitudinal amplo entre obras consecutivas para criar um percurso serpentino intercalado
  const videoSpacing = 10.0;          // Z: +12m a -8m (3 vitrines cinéticas bem espaçadas)
  const sectorTransitionGap = 14.0;   // Portal arquitetural de transição (área contemplativa ampla)
  const stillSpacing = 10.0;          // Z: -22m a -85m (monólitos giclée intercalados sem sobreposição)

  const stillStartX = 4.6;   // Distância lateral da parede/centro (salão amplo e arejado)
  const viewingOffset = 3.6; // Distância do ponto de observação ideal em frente à vitrine

  let currentZ = 12.0; // Posição de Z da obra interativa central
  const artworksWithCoords: ModularGalleryLayout['artworksWithCoords'] = [];
  const viewingSpots: ViewingSpotInfo[] = [];

  const centerInteractiveZ = 10.0;
  
  // 0. Obra Interativa Monumental: No epicentro do U-Shape (Z = 10.0m, X = 0.0m)
  interactiveWorks.forEach((art) => {
    const x = 0.0;
    const z = centerInteractiveZ;
    const rotY = 0.0; // Voltada para a entrada (+Z)

    const computedCoords = { x, y: 0.45, z, rotY };

    // Ponto de visualização mais próximo para interação
    const spotX = x + Math.sin(rotY) * (viewingOffset * 0.8);
    const spotZ = z + Math.cos(rotY) * (viewingOffset * 0.8);

    const viewingSpot: ViewingSpotInfo = {
      artworkId: art.id,
      x: spotX,
      z: spotZ,
      medium: 'interactive',
      title: art.title
    };

    artworksWithCoords.push({ ...art, computedCoords, viewingSpot });
    viewingSpots.push(viewingSpot);
  });

  // 1. Obras em U-Shape (Meia-Lua) orbitando a obra interativa
  // Vamos juntar vídeos e stills e distribuí-los em um semicírculo
  const uShapeWorks = [...videoWorks, ...stillWorks];
  
  // Intercalar para que os vídeos não fiquem todos juntos
  // (temos tipicamente 3 vídeos e 6 stills)
  const interleavedWorks: Artwork[] = [];
  let vIndex = 0;
  let sIndex = 0;
  while (vIndex < videoWorks.length || sIndex < stillWorks.length) {
    if (sIndex < stillWorks.length) interleavedWorks.push(stillWorks[sIndex++]);
    if (sIndex < stillWorks.length) interleavedWorks.push(stillWorks[sIndex++]);
    if (vIndex < videoWorks.length) interleavedWorks.push(videoWorks[vIndex++]);
  }

  const radius = 9.0;
  const totalItems = interleavedWorks.length;
  
  interleavedWorks.forEach((art, i) => {
    // theta varia de Math.PI até 0 para distribuir da esquerda para a direita
    const theta = Math.PI - (i / (totalItems - 1)) * Math.PI;
    const x = 0.0 + radius * Math.cos(theta);
    const z = centerInteractiveZ - radius * Math.sin(theta);
    
    // Calcula o ângulo rotY para apontar para o centro (0, centerInteractiveZ)
    const dx = 0.0 - x;
    const dz = centerInteractiveZ - z;
    const rotY = Math.atan2(dx, dz);

    const computedCoords = { x, y: 0.45, z, rotY };

    // O viewing spot fica na normal da obra, mas numa distância confortável
    const spotX = x + Math.sin(rotY) * viewingOffset;
    const spotZ = z + Math.cos(rotY) * viewingOffset;

    const viewingSpot: ViewingSpotInfo = {
      artworkId: art.id,
      x: spotX,
      z: spotZ,
      medium: art.medium as 'video' | 'still',
      title: art.title
    };

    artworksWithCoords.push({ ...art, computedCoords, viewingSpot });
    viewingSpots.push(viewingSpot);
  });

  // Fim do salão calculado proporcionalmente à meia-lua
  currentZ = centerInteractiveZ - radius;


  // Fim do salão calculado proporcionalmente
  const zEnd = currentZ - 14.0;
  const backWallZ = zEnd - 4.0;
  const frontWallZ = zStart + 4.0;
  const hallLength = Math.abs(frontWallZ - backWallZ);

  // 3. Distribuição de Vigas de Teto (A cada 14m)
  const ceilingBeamsZ: number[] = [];
  for (let z = zStart + 2; z >= zEnd - 2; z -= 14.0) {
    ceilingBeamsZ.push(z);
  }

  // 4. Distribuição de Bancos Monolíticos no Corredor Central
  const benchesZ: number[] = [];
  const benchSpacing = 22.0;
  for (let z = 8.0; z >= zEnd + 10.0; z -= benchSpacing) {
    benchesZ.push(z);
  }

  // 5. Caixas Acústicas Montadas nas Paredes Laterais Voltadas para o Centro
  // Parede Esquerda (x = -13.2m): rotY = Math.PI / 2 (90°) -> aponta para +X (centro)
  // Parede Direita (x = +13.2m): rotY = -Math.PI / 2 (-90°) -> aponta para -X (centro)
  const speakers: SpeakerPlacement[] = [];
  const spkWallOffset = 13.2;
  const spkInterval = 18.0;
  let spkCount = 0;

  for (let z = cdStationZ; z >= zEnd + 6.0; z -= spkInterval) {
    speakers.push({
      id: `spk-left-${spkCount}`,
      x: -spkWallOffset,
      y: 1.8,
      z,
      rotY: Math.PI / 2, // Aponta da parede esquerda para o centro
      wall: 'left'
    });

    speakers.push({
      id: `spk-right-${spkCount}`,
      x: spkWallOffset,
      y: 1.8,
      z: z - 4.0, // Levemente defasado para enriquecer o campo acústico difuso
      rotY: -Math.PI / 2, // Aponta da parede direita para o centro
      wall: 'right'
    });

    spkCount++;
  }

  return {
    roomWidth,
    halfWidth,
    roomHeight,
    hallLength,
    zStart,
    zEnd,
    entranceZ,
    backWallZ,
    frontWallZ,
    artworksWithCoords,
    viewingSpots,
    speakers,
    ceilingBeamsZ,
    benchesZ,
    playerBounds: {
      minZ: zEnd + 2.0,
      maxZ: zStart - 4.0,
      minX: -11.5,
      maxX: 11.5
    }
  };
}
