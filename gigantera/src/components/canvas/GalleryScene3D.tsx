import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { useAppStore } from '../../core/store';
import { ARTWORKS_CATALOG } from '../../data/artworks';
import { Artwork } from '../../types/art';
import { TOKENS } from '../../tokens';
import { soundEngine } from '../../core/soundEngine';
import { CDViewmodel3D } from './CDViewmodel3D';
import { PlayerController } from '../../core/playerController';
import { computeModularGalleryLayout, ViewingSpotInfo } from '../../core/modularGallery';

/**
 * Gerador procedural de textura de piso: Microcimento / Marmorite Alabastro claro
 * com juntas de dilatação de placas de 2x2 metros, agregados minerais finos e reflexo aveludado suave.
 */
function createFloorTexture(isLight: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Tom de base marmorite alabastro contemporâneo (nunca branco estourado)
  ctx.fillStyle = isLight ? '#eae7df' : '#121514';
  ctx.fillRect(0, 0, 1024, 1024);

  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Micro-granulação mineral e agregados de quartzo/calcário
    const noise = (Math.random() - 0.5) * (isLight ? 14 : 9);
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Juntas de dilatação sutis e elegantes
  ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 1024, 1024);
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 1024);
  ctx.moveTo(0, 512);
  ctx.lineTo(1024, 512);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 44);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Gerador procedural de textura de parede: Gesso arquitectural mate de museu
 * com micro-relevo tátil, leve textura de rolo e suave oclusão ambiental vertical
 */
function createWallTexture(isLight: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Tom de cal/gesso arquitetural contemporâneo acolhedor e sólido
  const baseFill = isLight ? '#edeae2' : '#111413';
  ctx.fillStyle = baseFill;
  ctx.fillRect(0, 0, 1024, 1024);

  // Leve gradiente vertical de oclusão ambiental (base e topo suavemente mais profundos)
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.22)');
  grad.addColorStop(0.12, 'rgba(0,0,0,0)');
  grad.addColorStop(0.88, 'rgba(0,0,0,0)');
  grad.addColorStop(1.0, isLight ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * (isLight ? 9 : 6);
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Gerador procedural de mapa de rugosidade para os vidros das vitrines:
 * Simula a presença física do vidro com sutis impressões digitais nas bordas,
 * leves marcas de limpeza de museu e reflexo não uniforme.
 */
function createGlassRoughnessTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base com rugosidade baixa (vidro polido limpo)
  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-marcas e manchas táteis suaves de visitantes nas bordas inferiores
  for (let b = 0; b < 14; b++) {
    const rx = 30 + Math.random() * 452;
    const ry = 340 + Math.random() * 150;
    const rad = 15 + Math.random() * 32;
    const smg = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    smg.addColorStop(0, 'rgba(80, 80, 80, 0.42)');
    smg.addColorStop(0.5, 'rgba(50, 50, 50, 0.22)');
    smg.addColorStop(1, 'rgba(16, 16, 16, 0)');
    ctx.fillStyle = smg;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Marcas de flanela / limpeza suave de museu
  ctx.strokeStyle = 'rgba(60, 60, 60, 0.15)';
  ctx.lineWidth = 18;
  for (let s = 0; s < 4; s++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Gerador procedural da Plaquinha Física 3D de cada obra com tipografia brutalista/minimalista
 */
function createPlaqueTexture(art: Artwork, index: number, isLight: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isLight ? '#fbfbfa' : '#141716';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, 1012, 244);

  ctx.fillStyle = isLight ? '#b88d34' : '#e4c379';
  ctx.fillRect(28, 28, 6, 200);

  const numStr = String(index + 1).padStart(2, '0');
  ctx.fillStyle = isLight ? '#0d0f0e' : '#f4f3ef';
  ctx.font = 'bold 36px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${numStr}. ${art.title.toUpperCase()}`, 52, 78);

  ctx.fillStyle = isLight ? '#484d4a' : '#909692';
  ctx.font = '600 22px "Space Mono", monospace';
  const mediumStr = art.medium === 'video' ? 'VITRINE CINÉTICA // LOOP' : 'IMPRESSO GICLÉE EM VIDRO';
  ctx.fillText(`${art.year} · ${mediumStr}`, 52, 126);

  ctx.font = '400 20px "Space Mono", monospace';
  ctx.fillStyle = isLight ? '#7a807c' : '#68706c';
  ctx.fillText(`PELIMOTION // FELIPE CONCEIÇÃO · ${art.series || 'GIGANTERA'}`, 52, 170);

  ctx.font = 'bold 18px "Space Mono", monospace';
  ctx.fillStyle = isLight ? '#b88d34' : '#e4c379';
  ctx.fillText('[E] / [CLIQUE] INSPECIONAR 3D', 52, 214);

  ctx.textAlign = 'right';
  ctx.fillStyle = isLight ? '#8a908c' : '#4d5551';
  ctx.font = '18px "Space Mono", monospace';
  ctx.fillText(`PLM-ACC-${numStr}`, 990, 78);

  const bcX = 860;
  const bcY = 110;
  ctx.fillStyle = isLight ? '#222' : '#ddd';
  const bars = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2];
  let curX = bcX;
  for (let b = 0; b < bars.length; b++) {
    ctx.fillRect(curX, bcY, bars[b] * 2, 60);
    curX += bars[b] * 2 + 3;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/**
 * Gerador procedural da Plaquinha Física 3D do Pedestal de CD
 */
function createPedestalPlaqueTexture(isLight: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isLight ? '#fbfbfa' : '#141716';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, 1012, 244);

  ctx.fillStyle = isLight ? '#d94726' : '#ff6b4a';
  ctx.fillRect(28, 28, 6, 200);

  ctx.fillStyle = isLight ? '#0d0f0e' : '#f4f3ef';
  ctx.font = 'bold 34px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('00. ESTAÇÃO DE ÁUDIO POV // JEWEL CASE', 52, 78);

  ctx.fillStyle = isLight ? '#484d4a' : '#909692';
  ctx.font = '600 22px "Space Mono", monospace';
  ctx.fillText('FELIPE CONCEIÇÃO // ÁLBUM AUTORAL COM 17 FAIXAS ORIGINAIS', 52, 126);

  ctx.font = '400 20px "Space Mono", monospace';
  ctx.fillStyle = isLight ? '#7a807c' : '#68706c';
  ctx.fillText('ESTOJO FÍSICO DE CD 3D INTERATIVO · FOLHEIE AS FAIXAS COM O MOUSE', 52, 170);

  ctx.font = 'bold 18px "Space Mono", monospace';
  ctx.fillStyle = isLight ? '#d94726' : '#ff6b4a';
  ctx.fillText("[E] / [CLIQUE] PEGAR CD EM PRIMEIRA PESSOA", 52, 214);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const GalleryScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const theme = useAppStore((s) => s.theme);
  const cameraTargetZ = useAppStore((s) => s.cameraTargetZ);
  const updateCameraZ = useAppStore((s) => s.updateCameraZ);
  const setProximityArtwork = useAppStore((s) => s.setProximityArtwork);
  const setHoveredArtwork = useAppStore((s) => s.setHoveredArtwork);
  const openCinema = useAppStore((s) => s.openCinema);
  const cinemaArtwork = useAppStore((s) => s.cinemaArtwork);
  const isAudioPlaying = useAppStore((s) => s.isAudioPlaying);
  const setIntroPhase = useAppStore((s) => s.setIntroPhase);
  const setIntroSpawnProgress = useAppStore((s) => s.setIntroSpawnProgress);
  const isHoldingCD = useAppStore((s) => s.isHoldingCD);
  const gameControlPrompt = useAppStore((s) => s.gameControlPrompt);
  const setGameControlPrompt = useAppStore((s) => s.setGameControlPrompt);
  const setCurrentAudioTrack = useAppStore((s) => s.setCurrentAudioTrack);
  const setIsAudioPlaying = useAppStore((s) => s.setIsAudioPlaying);
  const isPointerLocked = useAppStore((s) => s.isPointerLocked);
  const hoveredTarget = useAppStore((s) => s.hoveredTarget);
  const isMobile = useAppStore((s) => s.isMobile);

  const [reticleState, setReticleState] = useState<'idle' | 'artwork' | 'cd'>('idle');

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;
    const isLight = theme === 'light';

    // 1. Cena, Câmera e Renderizador com Sombras Suaves PCF
    const scene = new THREE.Scene();
    const currentThemeTokens = TOKENS.themes[theme];
    scene.fog = new THREE.FogExp2(currentThemeTokens.canvasFog, 0.014);

    const camera = new THREE.PerspectiveCamera(TOKENS.navigation.cameraFov, width / height, 0.1, 180);
    camera.position.set(0, 0.4, cameraTargetZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 0.98 : 1.08;
    renderer.setClearColor(currentThemeTokens.canvasFog);
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // 2. Sistema de Iluminação Realista Contemporâneo com Sombras Suaves e Contraste Arquitetural
    const hemiLight = new THREE.HemisphereLight(
      isLight ? 0xf4f2ea : 0x181c1a,
      isLight ? 0xdcd8cd : 0x0a0c0b,
      isLight ? 0.90 : 0.75
    );
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(
      isLight ? 0xf0ede4 : 0x141716,
      isLight ? 0.38 : 0.42
    );
    scene.add(ambientLight);

    // 3. Arquitetura Modular Dinâmica: Salão Procedural Adaptável ao Acervo
    const layout = computeModularGalleryLayout(ARTWORKS_CATALOG);
    const hallCenterZ = (layout.frontWallZ + layout.backWallZ) / 2;
    const hallLen = layout.hallLength;

    const sunLight = new THREE.DirectionalLight(
      isLight ? 0xfff8ed : 0xffebd0,
      isLight ? 1.65 : 1.95
    );
    sunLight.position.set(12, 24, hallCenterZ + 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = hallLen + 50;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const visitorLight = new THREE.PointLight(
      isLight ? 0xfff3d8 : 0xe4c379,
      isLight ? 0.55 : 0.95,
      32
    );
    scene.add(visitorLight);

    const floorLightTex = createFloorTexture(true);
    const floorDarkTex = createFloorTexture(false);
    const wallLightTex = createWallTexture(true);
    const wallDarkTex = createWallTexture(false);

    const floorGeo = new THREE.PlaneGeometry(layout.roomWidth + 6, hallLen + 12, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: isLight ? floorLightTex : floorDarkTex,
      roughness: isLight ? 0.38 : 0.45,
      metalness: isLight ? 0.08 : 0.12
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -3.2, hallCenterZ);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Reflexão Planar em Tempo Real do Piso (Simulação Raytracing / RTX)
    const floorReflector = new Reflector(new THREE.PlaneGeometry(layout.roomWidth, hallLen), {
      clipBias: 0.003,
      textureWidth: Math.min(1024, (typeof window !== 'undefined' ? window.innerWidth : 1280) * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)),
      textureHeight: Math.min(1024, (typeof window !== 'undefined' ? window.innerHeight : 720) * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)),
      color: isLight ? 0xd0cec7 : 0x666666
    });
    floorReflector.position.set(0, -3.193, hallCenterZ);
    floorReflector.rotateX(-Math.PI / 2);
    (floorReflector.material as any).transparent = true;
    (floorReflector.material as any).opacity = isLight ? 0.38 : 0.44;
    scene.add(floorReflector);

    const wallGeo = new THREE.PlaneGeometry(hallLen + 12, 24);
    const wallMat = new THREE.MeshStandardMaterial({
      map: isLight ? wallLightTex : wallDarkTex,
      roughness: 0.88,
      metalness: 0.02
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-layout.halfWidth - 1, 6, hallCenterZ);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(layout.halfWidth + 1, 6, hallCenterZ);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const backWallGeo = new THREE.PlaneGeometry(layout.roomWidth + 4, 24);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 6, layout.backWallZ);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Rodapé negativo arquitetural
    const revealMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x222423 : 0x050606 });
    const revealGeo = new THREE.BoxGeometry(0.08, 0.08, hallLen + 12);
    const leftReveal = new THREE.Mesh(revealGeo, revealMat);
    leftReveal.position.set(-layout.halfWidth - 0.94, -3.16, hallCenterZ);
    scene.add(leftReveal);

    const rightReveal = new THREE.Mesh(revealGeo, revealMat);
    rightReveal.position.set(layout.halfWidth + 0.94, -3.16, hallCenterZ);
    scene.add(rightReveal);

    // Bancos Monolíticos Quase Brancos
    const benchesGroup = new THREE.Group();
    const benchGeo = new THREE.BoxGeometry(1.6, 0.52, 4.4);
    const benchMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xf4f3ee : 0x1b1e1d,
      roughness: 0.86,
      metalness: 0.04
    });
    layout.benchesZ.forEach((bz) => {
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(0, -2.94, bz);
      bench.castShadow = true;
      bench.receiveShadow = true;
      benchesGroup.add(bench);

      const baseGeo = new THREE.BoxGeometry(1.35, 0.12, 4.1);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xdedcd4 : 0x090b0a,
        roughness: 0.95
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(0, -3.14, bz);
      baseMesh.receiveShadow = true;
      benchesGroup.add(baseMesh);
    });
    scene.add(benchesGroup);

    // Vigas Estruturais no Teto com Claraboias
    const ceilingBeamsGroup = new THREE.Group();
    const beamGeo = new THREE.BoxGeometry(layout.roomWidth + 4, 1.4, 1.2);
    const beamMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xebe9e2 : 0x141716,
      roughness: 0.9
    });

    const lightShaftGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.8, 5.2, 18, 16, 1, true);
    const shaftMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0xfffcf5 : 0xffeed1,
      transparent: true,
      opacity: isLight ? 0.03 : 0.05,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    layout.ceilingBeamsZ.forEach((bz) => {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 11, bz);
      beam.castShadow = true;
      beam.receiveShadow = true;
      ceilingBeamsGroup.add(beam);

      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(0, 2, bz - 2);
      shaft.rotation.z = -0.15;
      lightShaftGroup.add(shaft);
    });
    scene.add(ceilingBeamsGroup);
    scene.add(lightShaftGroup);

    // 3.01 Partículas Atmosféricas Sutis (Dust Motes de Museu em Luz Volumétrica)
    const dustCount = 140;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustBaseY = new Float32Array(dustCount);
    for (let p = 0; p < dustCount; p++) {
      dustPositions[p * 3] = (Math.random() - 0.5) * 26;
      dustBaseY[p] = -2.5 + Math.random() * 8.5;
      dustPositions[p * 3 + 1] = dustBaseY[p];
      dustPositions[p * 3 + 2] = 25 - Math.random() * 125;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isLight ? 0xb88d34 : 0xe4c379,
      size: 0.045,
      transparent: true,
      opacity: isLight ? 0.35 : 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 3.1 CAIXAS ACÚSTICAS 3D FIXADAS NAS PAREDES (Voltadas das Paredes para o Centro do Salão)
    const speakerCabinets: THREE.Group[] = [];
    const acousticAirHaze: { mesh: THREE.Mesh; speakerIdx: number; puffIdx: number }[] = [];
    const speakerWoofers: THREE.Mesh[] = [];

    // Textura procedural de gradiente radial suave (sem linhas duras de vetor) para distorção de ar
    const hazeCanvas = document.createElement('canvas');
    hazeCanvas.width = 128;
    hazeCanvas.height = 128;
    const hctx = hazeCanvas.getContext('2d')!;
    const grad = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.22)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    hctx.fillStyle = grad;
    hctx.fillRect(0, 0, 128, 128);
    const hazeTexture = new THREE.CanvasTexture(hazeCanvas);

    // Materiais compartilhados das caixas acústicas (alta performance e suporte a troca de tema instantânea)
    const bracketMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x666866 : 0x242826,
      metalness: 0.8,
      roughness: 0.25
    });
    const spkBodyMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xeeece5 : 0x181a19,
      roughness: 0.75,
      metalness: 0.15
    });
    const baffleMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x242725 : 0x0c0e0d });
    const coneMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xd0cec7 : 0x333635,
      roughness: 0.45,
      metalness: 0.3
    });

    layout.speakers.forEach((spk, sIdx) => {
      const spkGroup = new THREE.Group();
      spkGroup.position.set(spk.x, spk.y, spk.z);
      spkGroup.rotation.y = spk.rotY;

      // Suporte metálico de ancoragem na parede de concreto
      const bracketGeo = new THREE.BoxGeometry(0.16, 0.26, 0.22);
      const bracket = new THREE.Mesh(bracketGeo, bracketMat);
      bracket.position.z = -0.25;
      spkGroup.add(bracket);

      // Gabinete acústico elegante
      const spkBodyGeo = new THREE.BoxGeometry(0.52, 0.78, 0.38);
      const spkBody = new THREE.Mesh(spkBodyGeo, spkBodyMat);
      spkBody.castShadow = true;
      spkGroup.add(spkBody);

      // Baffle frontal rebaixado
      const baffleGeo = new THREE.PlaneGeometry(0.46, 0.72);
      const baffle = new THREE.Mesh(baffleGeo, baffleMat);
      baffle.position.z = 0.191;
      spkGroup.add(baffle);

      // Cones de alto-falante (Woofer & Tweeter) — Woofer fixo em z = 0.196 eliminando Z-fighting e piscamento
      const wooferGeo = new THREE.CircleGeometry(0.15, 24);
      const woofer = new THREE.Mesh(wooferGeo, coneMat);
      woofer.position.set(0, -0.13, 0.196);
      spkGroup.add(woofer);
      speakerWoofers.push(woofer);

      const tweeterGeo = new THREE.CircleGeometry(0.065, 20);
      const tweeter = new THREE.Mesh(tweeterGeo, coneMat);
      tweeter.position.set(0, 0.17, 0.196);
      spkGroup.add(tweeter);

      // LED indicador acústico
      const ledGeo = new THREE.CircleGeometry(0.012, 12);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x63e2b7 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, -0.3, 0.193);
      spkGroup.add(led);

      // Efeito Acústico Volumétrico 3D (Cúpula hemisférica visível tanto de frente quanto de perfil/lado)
      for (let p = 0; p < 4; p++) {
        // Hemisfério 3D aberto apontando para fora da caixa de som (+Z)
        const domeGeo = new THREE.SphereGeometry(0.25, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
        domeGeo.rotateX(Math.PI * 0.5);

        const puffMat = new THREE.MeshBasicMaterial({
          map: hazeTexture,
          color: isLight ? 0xc8baa8 : 0xdfd2b8,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const puffMesh = new THREE.Mesh(domeGeo, puffMat);
        puffMesh.position.set(0, -0.13, 0.20);
        spkGroup.add(puffMesh);
        acousticAirHaze.push({ mesh: puffMesh, speakerIdx: sIdx, puffIdx: p });
      }

      scene.add(spkGroup);
      speakerCabinets.push(spkGroup);
    });

    // 3.2 PONTOS CONTEMPLATIVOS NO PISO (Viewing Spots Sutis)
    const viewingSpotRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; spot: ViewingSpotInfo }[] = [];
    const viewingSpotsGroup = new THREE.Group();

    layout.viewingSpots.forEach((spot) => {
      const isStill = spot.medium === 'still';
      const color = isStill ? 0xe4c379 : 0x63e2b7;

      // Anel fino no piso
      const ringGeo = new THREE.RingGeometry(0.68, 0.76, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(spot.x, -3.191, spot.z);
      viewingSpotsGroup.add(ringMesh);

      // Ponto central
      const dotGeo = new THREE.CircleGeometry(0.045, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.rotation.x = -Math.PI / 2;
      dotMesh.position.set(spot.x, -3.19, spot.z);
      viewingSpotsGroup.add(dotMesh);

      viewingSpotRings.push({ mesh: ringMesh, mat: ringMat, spot });
    });
    scene.add(viewingSpotsGroup);

    // 4. Estação do CD Jewel Case logo na Entrada (Z = +18, X = 2.8)
    const cdStationGroup = new THREE.Group();
    cdStationGroup.position.set(2.8, -0.6, 18);
    cdStationGroup.rotation.y = -0.32;

    // Plinto Monolítico de Concreto Grafite Arquitetural
    const plinthGeo = new THREE.BoxGeometry(0.86, 1.9, 0.72);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x222625 : 0x161918,
      roughness: 0.88,
      metalness: 0.12
    });
    const cdStand = new THREE.Mesh(plinthGeo, plinthMat);
    cdStand.position.y = -0.95;
    cdStand.castShadow = true;
    cdStand.receiveShadow = true;
    cdStationGroup.add(cdStand);

    // Rodapé de Sombra Negativa da Base
    const plinthBaseGeo = new THREE.BoxGeometry(0.76, 0.12, 0.62);
    const plinthBaseMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x0c0e0d : 0x050606 });
    const plinthBase = new THREE.Mesh(plinthBaseGeo, plinthBaseMat);
    plinthBase.position.y = -1.94;
    cdStationGroup.add(plinthBase);

    // Tampo Cantilever em Titânio Escovado
    const deckGeo = new THREE.BoxGeometry(0.82, 0.08, 0.64);
    const deckMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x333836 : 0x242826,
      roughness: 0.35,
      metalness: 0.78
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = 0.04;
    deckMesh.castShadow = true;
    deckMesh.receiveShadow = true;
    cdStationGroup.add(deckMesh);

    // Plaquinha Arquitetural Metálica Embutida no Plinto
    const cdPlaqueGeo = new THREE.BoxGeometry(0.72, 0.22, 0.02);
    const cdPlaqueTex = createPedestalPlaqueTexture(isLight);
    const cdPlaqueMat = new THREE.MeshStandardMaterial({
      map: cdPlaqueTex,
      roughness: 0.75,
      metalness: 0.15
    });
    const cdPlaqueMesh = new THREE.Mesh(cdPlaqueGeo, cdPlaqueMat);
    cdPlaqueMesh.position.set(0, -0.22, 0.365);
    cdPlaqueMesh.castShadow = true;
    cdPlaqueMesh.receiveShadow = true;
    cdStationGroup.add(cdPlaqueMesh);

    // ESTOJO DE CD FÍSICO REALISTA REPOUSANDO NO SUPORTE (sem caixa de vidro externa!)
    const restingCDGroup = new THREE.Group();
    restingCDGroup.position.set(0, 0.36, 0.02);
    restingCDGroup.rotation.x = -0.42;

    const restingCaseGeo = new THREE.BoxGeometry(0.56, 0.56, 0.045);
    const restingCaseMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.06,
      ior: 1.52,
      thickness: 0.06,
      transparent: true,
      opacity: 0.94,
      reflectivity: 0.75
    });
    const cdCaseMesh = new THREE.Mesh(restingCaseGeo, restingCaseMat);
    cdCaseMesh.castShadow = true;
    (cdCaseMesh as any).isCDStation = true;
    restingCDGroup.add(cdCaseMesh);

    const restingSpineGeo = new THREE.BoxGeometry(0.026, 0.54, 0.04);
    const restingSpineMat = new THREE.MeshStandardMaterial({ color: 0x111312, roughness: 0.4 });
    const restingSpine = new THREE.Mesh(restingSpineGeo, restingSpineMat);
    restingSpine.position.set(-0.27, 0, 0);
    restingCDGroup.add(restingSpine);

    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const getCDAssetUrl = (fileName: string) => `${cleanBase}cd/${fileName}`;

    const textureLoader = new THREE.TextureLoader();
    const cdCoverTex = textureLoader.load(getCDAssetUrl('capa-opt.jpg'), undefined, undefined, () => {
      textureLoader.load(getCDAssetUrl('CAPA.jpeg'));
    });
    cdCoverTex.colorSpace = THREE.SRGBColorSpace;
    const cdPaperGeo = new THREE.PlaneGeometry(0.53, 0.53);
    const cdPaperMat = new THREE.MeshStandardMaterial({
      map: cdCoverTex,
      roughness: 0.88,
      metalness: 0.04
    });
    const cdPaperMesh = new THREE.Mesh(cdPaperGeo, cdPaperMat);
    cdPaperMesh.position.set(0.005, 0, 0.013);
    (cdPaperMesh as any).isCDStation = true;
    restingCDGroup.add(cdPaperMesh);

    const cdBackTex = textureLoader.load(getCDAssetUrl('contracapa-opt.jpg'), undefined, undefined, () => {
      textureLoader.load(getCDAssetUrl('CONTRACAPA.jpeg'));
    });
    cdBackTex.colorSpace = THREE.SRGBColorSpace;
    const cdBackMat = new THREE.MeshStandardMaterial({
      map: cdBackTex,
      roughness: 0.88,
      metalness: 0.04
    });
    const cdBackMesh = new THREE.Mesh(cdPaperGeo, cdBackMat);
    cdBackMesh.position.set(0.005, 0, -0.013);
    cdBackMesh.rotation.y = Math.PI;
    (cdBackMesh as any).isCDStation = true;
    restingCDGroup.add(cdBackMesh);

    cdStationGroup.add(restingCDGroup);
    scene.add(cdStationGroup);

    // 5. Vitrines de Vidro Flutuantes & Plaquinhas Físicas 3D em Baixo de Cada Obra
    const glassRoughnessTex = createGlassRoughnessTexture();

    const artworkItems: {
      group: THREE.Group;
      glassMesh: THREE.Mesh;
      paperMesh: THREE.Mesh;
      plaqueMesh: THREE.Mesh;
      artwork: Artwork;
      paperMat: THREE.MeshStandardMaterial;
      texture: THREE.Texture;
      videoEl?: HTMLVideoElement;
    }[] = [];

    layout.artworksWithCoords.forEach((art, idx) => {
      const coords = art.computedCoords;
      const group = new THREE.Group();
      group.position.set(coords.x, coords.y, coords.z);
      if (coords.rotY) group.rotation.y = coords.rotY;

      group.scale.set(0.001, 0.001, 0.001);

      // Cálculo de proporção nativa exata (sem achatamento nem distorção)
      const ratio = art.aspectRatioNum || (art.aspectRatio === '16 / 9' ? 1400 / 787 : 781 / 1400);
      const isLandscape = ratio > 1.0;

      let paperW: number;
      let paperH: number;
      if (isLandscape) {
        paperW = 4.8;
        paperH = paperW / ratio; // ~2.70m
      } else {
        paperH = 4.8;
        paperW = paperH * ratio; // ~2.68m
      }

      const glassW = paperW + 0.6;
      const glassH = paperH + 0.8;
      const glassD = 0.45;

      const glassGeo = new THREE.BoxGeometry(glassW, glassH, glassD);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        roughness: isLight ? 0.07 : 0.09,
        roughnessMap: glassRoughnessTex,
        ior: 1.52,
        thickness: 0.65,
        attenuationColor: new THREE.Color(0xe0fff3),
        attenuationDistance: 3.5,
        transparent: true,
        opacity: 0.92,
        reflectivity: 0.72
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.castShadow = true;
      glassMesh.receiveShadow = true;
      group.add(glassMesh);

      const edgeGeo = new THREE.EdgesGeometry(glassGeo);
      // Moldura Arquitetural Minimalista (Filete metálico de 1.8cm em torno do vidro)
      const frameMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0x2d302e : 0x0a0c0b,
        metalness: 0.88,
        roughness: 0.22
      });
      const frameGeo = new THREE.BoxGeometry(glassW + 0.036, glassH + 0.036, glassD + 0.036);
      const frameEdges = new THREE.EdgesGeometry(frameGeo);
      const wireframe = new THREE.LineSegments(frameEdges, new THREE.LineBasicMaterial({
        color: isLight ? 0x4a4d4b : 0x242826,
        linewidth: 1
      }));
      group.add(wireframe);

      let paperMat: THREE.MeshStandardMaterial;
      let videoElement: HTMLVideoElement | undefined;
      let artworkTex: THREE.Texture;

      if (art.medium === 'video' && art.videoSrc) {
        const vid = document.createElement('video');
        vid.src = art.videoSrc;
        vid.crossOrigin = 'anonymous';
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.setAttribute('data-art-id', art.id);
        vid.play().catch(() => {});

        const videoTex = new THREE.VideoTexture(vid);
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.colorSpace = THREE.SRGBColorSpace;
        artworkTex = videoTex;

        paperMat = new THREE.MeshStandardMaterial({
          map: videoTex,
          roughness: 0.95,
          metalness: 0.0,
          side: THREE.DoubleSide
        });
        videoElement = vid;
      } else {
        const tex = textureLoader.load(art.imageSrc);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        artworkTex = tex;

        paperMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.96,
          metalness: 0.0,
          side: THREE.DoubleSide
        });
      }

      // Painel Físico 3D da Obra (espessura de 3.2cm, passepartout e visibilidade bilateral 360°)
      const boardThickness = 0.032;
      const paperGeo = new THREE.BoxGeometry(paperW, paperH, boardThickness);
      const panelEdgeMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xc8c6be : 0x161817,
        roughness: 0.92,
        metalness: 0.02
      });

      // BoxGeometry (6 faces: Right, Left, Top, Bottom, Front, Back)
      // Front (+Z) e Back (-Z) exibem a arte, enquanto as laterais têm acabamento fosco de papelaria
      const panelMaterials = [
        panelEdgeMat,
        panelEdgeMat,
        panelEdgeMat,
        panelEdgeMat,
        paperMat,
        paperMat
      ];
      const paperMesh = new THREE.Mesh(paperGeo, panelMaterials);
      // Posição no centro físico e geométrico absoluto da caixa de vidro (Z = 0)
      paperMesh.position.set(0, 0, 0);
      (paperMesh as any).artworkData = art;
      (glassMesh as any).artworkData = art;
      group.add(paperMesh);

      // Plaquinha Física 3D em Baixo da Obra (dimensionada proporcionalmente à vitrine)
      const plaqueW = Math.min(glassW * 0.75, 2.8);
      const plaqueGeo = new THREE.BoxGeometry(plaqueW, 0.62, 0.04);
      const plaqueTex = createPlaqueTexture(art, idx, isLight);
      const plaqueMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.82,
        metalness: 0.08
      });
      const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaqueMesh.position.set(0, -(glassH / 2) - 0.42, 0.02);
      plaqueMesh.castShadow = true;
      plaqueMesh.receiveShadow = true;
      (plaqueMesh as any).artworkData = art;
      (plaqueMesh as any).isArtworkPlaque = true;
      group.add(plaqueMesh);

      scene.add(group);
      artworkItems.push({
        group,
        glassMesh,
        paperMesh,
        plaqueMesh,
        artwork: art,
        paperMat,
        texture: artworkTex,
        videoEl: videoElement
      });
    });

    // 7. RIG DE INSPEÇÃO 3D EM PRIMEIRO PLANO (A Obra saindo da caixa de vidro em 3D)
    // Acoplado diretamente à câmera: o jogador pode rotacionar e dar zoom na peça sem interferência de luz externa
    const inspectionRig = new THREE.Group();
    inspectionRig.position.set(0, 0, -2.1);
    inspectionRig.visible = false;

    // Fundo neutro fino de passe-partout / moldura
    const backingGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const backingMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x141615 : 0x050606 });
    const inspectionBacking = new THREE.Mesh(backingGeo, backingMat);
    inspectionRig.add(inspectionBacking);

    // Plano da Obra em Primeiro Plano (Imunidade total à iluminação externa)
    const artPlaneGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const artPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
      toneMapped: false // Imunidade a sombras ou luzes externas da galeria
    });
    const inspectionArtMesh = new THREE.Mesh(artPlaneGeo, artPlaneMat);
    inspectionArtMesh.position.z = 0.01;
    inspectionRig.add(inspectionArtMesh);

    camera.add(inspectionRig);

    // Variáveis de controle de inspeção 3D (Rotação, Pan e Zoom fluidos)
    let targetInspRotX = 0;
    let targetInspRotY = 0;
    let curInspRotX = 0;
    let curInspRotY = 0;
    let targetInspZoom = 1.0;
    let curInspZoom = 1.0;
    let targetPanX = 0;
    let targetPanY = 0;
    let curPanX = 0;
    let curPanY = 0;
    let currentArtW = 1.0;
    let currentArtH = 1.3;
    let inspectionTransition = 0.0;
    let activeCinemaArtId: string | null = null;
    let isMouseDown = false;

    // 8. Viewmodel 3D do CD Jewel Case em POV com Mão Low-Poly
    const cdViewmodel = new CDViewmodel3D((track) => {
      setCurrentAudioTrack(track);
      setIsAudioPlaying(true);
    });
    camera.add(cdViewmodel.rootGroup);
    scene.add(camera);

    // 9. Motor de Jogabilidade em Primeira Pessoa (Player Controller FPS)
    const playerController = new PlayerController(camera, container, {
      walkSpeed: 10.5,
      sprintMultiplier: 1.65,
      minZ: layout.playerBounds.minZ,
      maxZ: layout.playerBounds.maxZ,
      minX: layout.playerBounds.minX,
      maxX: layout.playerBounds.maxX
    });
    playerController.updateBounds(layout.playerBounds);
    playerController.obstacles = layout.artworksWithCoords.map((a) => ({
      x: a.computedCoords.x,
      z: a.computedCoords.z,
      radius: 1.8
    }));
    playerController.obstacles.push({ x: 2.8, z: 18, radius: 1.3 });

    // Enquadramento cinematográfico inicial na entrada: CD em primeiro plano e galeria em perspectiva
    camera.position.set(0, 0.4, 23.5);
    playerController.position.set(0, 0.4, 23.5);
    playerController.yaw = -0.16;
    camera.rotation.y = -0.16;

    playerController.onStepTrackCD = (step) => {
      cdViewmodel.stepTrack(step);
    };

    playerController.onPointerLockChange = (locked) => {
      useAppStore.getState().setPointerLocked(locked);
    };

    playerController.onInteract = () => {
      const state = useAppStore.getState();
      if (state.cinemaArtwork) {
        state.closeCinema();
        return;
      }
      if (state.isHoldingCD) {
        state.stowCD();
        cdViewmodel.stow();
        return;
      }

      // 1. Raycast frontal central com prioridade estrita para obras de arte
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const candidates = [
        ...artworkItems.map((m) => m.glassMesh),
        ...artworkItems.map((m) => m.paperMesh),
        ...artworkItems.map((m) => m.plaqueMesh),
        cdCaseMesh,
        cdPaperMesh,
        cdBackMesh
      ];
      const hits = raycaster.intersectObjects(candidates);
      const validHits = hits.filter((h) => h.distance <= 6.5);
      if (validHits.length > 0) {
        const hitObj = validHits[0].object as any;
        if (hitObj.artworkData) {
          soundEngine.playGlassPassSound();
          openCinema(hitObj.artworkData as Artwork);
          return;
        } else if (hitObj.isCDStation && validHits[0].distance <= 3.5) {
          const isFirst = !useAppStore.getState().hasInspectedCDBefore;
          state.takeCD();
          cdViewmodel.take(isFirst);
          return;
        }
      }

      // 2. Se estiver próximo ao ponto contemplativo ideal de uma obra
      const closest = useAppStore.getState().proximityArtwork;
      if (closest) {
        soundEngine.playGlassPassSound();
        openCinema(closest);
        return;
      }

      // 3. Somente se não houver obra e estiver mirando na estação do CD a menos de 2.5m
      const distToCD = Math.hypot(camera.position.x - 2.8, camera.position.z - 18);
      if (distToCD < 2.5) {
        const isFirst = !useAppStore.getState().hasInspectedCDBefore;
        state.takeCD();
        cdViewmodel.take(isFirst);
      }
    };

    playerController.onCancelAction = () => {
      const state = useAppStore.getState();
      if (state.cinemaArtwork) {
        state.closeCinema();
      } else if (state.isHoldingCD) {
        state.stowCD();
        cdViewmodel.stow();
      }
    };

    playerController.onTouchTap = (clientX: number, clientY: number) => {
      const state = useAppStore.getState();
      if (state.cinemaArtwork || state.isHoldingCD) return;

      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // 1. Toque no CD / Pedestal
      const cdCandidates = [restingCDGroup, cdPlaqueMesh, cdStand, deckMesh];
      const cdHits = raycaster.intersectObjects(cdCandidates, true);
      if (cdHits.length > 0 && cdHits[0].distance < 15) {
        if (cdHits[0].distance < 4.8) {
          const isFirst = !useAppStore.getState().hasInspectedCDBefore;
          state.takeCD();
          cdViewmodel.take(isFirst);
        } else {
          playerController.glideTo(0, 19.5, 0.08);
        }
        return;
      }

      // 2. Toque em uma vitrine ou obra de arte
      const artCandidates = [
        ...artworkItems.map((m) => m.glassMesh),
        ...artworkItems.map((m) => m.paperMesh),
        ...artworkItems.map((m) => m.plaqueMesh)
      ];
      const artHits = raycaster.intersectObjects(artCandidates, true);
      if (artHits.length > 0) {
        const hit = artHits[0];
        const hitArt = (hit.object as any).artworkData as Artwork | undefined;
        if (hitArt) {
          const foundItem = artworkItems.find((a) => a.artwork.id === hitArt.id);
          if (foundItem) {
            if (hit.distance <= 5.5) {
              soundEngine.playGlassPassSound();
              openCinema(hitArt);
            } else {
              const spot = layout.viewingSpots.find((s) => s.artworkId === hitArt.id);
              if (spot) {
                const dx = foundItem.group.position.x - spot.x;
                const dz = foundItem.group.position.z - spot.z;
                const targetYaw = Math.atan2(-dx, -dz);
                playerController.glideTo(spot.x, spot.z, targetYaw);
                const artIdx = layout.artworksWithCoords.findIndex((a) => a.id === hitArt.id);
                if (artIdx !== -1) {
                  state.setCurrentArtworkIndex(artIdx);
                }
              }
            }
            return;
          }
        }
      }

      // 3. Toque nos anéis contemplativos no piso
      const ringCandidates = viewingSpotRings.map((r) => r.mesh);
      const ringHits = raycaster.intersectObjects(ringCandidates, true);
      if (ringHits.length > 0) {
        const hitRing = viewingSpotRings.find((r) => r.mesh === ringHits[0].object);
        if (hitRing) {
          const foundItem = artworkItems.find((a) => a.artwork.id === hitRing.spot.artworkId);
          if (foundItem) {
            const dx = foundItem.group.position.x - hitRing.spot.x;
            const dz = foundItem.group.position.z - hitRing.spot.z;
            const targetYaw = Math.atan2(-dx, -dz);
            playerController.glideTo(hitRing.spot.x, hitRing.spot.z, targetYaw);
            const artIdx = layout.artworksWithCoords.findIndex((a) => a.id === hitRing.spot.artworkId);
            if (artIdx !== -1) {
              state.setCurrentArtworkIndex(artIdx);
            }
            return;
          }
        }
      }
    };

    playerController.onToggleArchive = () => {
      const cur = useAppStore.getState().viewMode;
      const next = cur === 'spatial' ? 'archive' : 'spatial';
      useAppStore.getState().setViewMode(next);
      if (next === 'spatial') {
        playerController.requestLock();
      } else {
        playerController.exitLock();
      }
    };

    playerController.onToggleGuide = () => {
      useAppStore.getState().toggleGuideModal();
    };

    playerController.onPlayerActivity = () => {
      if (!useAppStore.getState().hasPlayerMoved) {
        useAppStore.getState().setHasPlayerMoved(true);
      }
    };

    playerController.onNextStill = () => {
      useAppStore.getState().nextStillSheet();
    };

    playerController.onPrevStill = () => {
      useAppStore.getState().prevStillSheet();
    };

    playerController.onResetStillZoom = () => {
      useAppStore.getState().toggleLoupeMode();
    };

    playerController.onToggleVideoAudio = () => {
      useAppStore.getState().toggleVideoAudio();
    };

    playerController.onFlipCD = () => {
      const state = useAppStore.getState();
      if (state.isHoldingCD) {
        state.flipCD();
        cdViewmodel.flip();
      }
    };

    playerController.onScrollCD = (delta) => {
      cdViewmodel.scrollTracks(delta);
    };

    // 10. Interação por Raycasting & Clique
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
      const state = useAppStore.getState();
      if (state.cinemaArtwork) {
        try {
          document.body.style.cursor = state.isLoupeMode ? 'move' : 'default';
        } catch {}
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      const state = useAppStore.getState();
      const isCinema = Boolean(state.cinemaArtwork);
      const holding = state.isHoldingCD;

      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / height) * 2 + 1;

      // Se estiver no Modo Cinema (Inspeção 3D da Obra)
      if (isCinema) {
        if (state.isLoupeMode) {
          // Pan fluido do Modo Lupa de Crítico
          targetPanX -= e.movementX * 0.0035;
          targetPanY += e.movementY * 0.0035;
          const maxPanX = Math.max(0.35, (currentArtW * (curInspZoom - 1.0)) * 0.45);
          const maxPanY = Math.max(0.35, (currentArtH * (curInspZoom - 1.0)) * 0.45);
          targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
          targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));
          document.body.style.cursor = 'move';
        } else if (isMouseDown) {
          targetInspRotY += e.movementX * 0.0035;
          targetInspRotX += e.movementY * 0.0035;
          targetInspRotY = Math.max(-0.55, Math.min(0.55, targetInspRotY));
          targetInspRotX = Math.max(-0.4, Math.min(0.4, targetInspRotX));
          document.body.style.cursor = 'grabbing';
        } else {
          document.body.style.cursor = 'default';
        }
        return;
      }

      // Se estiver segurando o CD na mão
      if (holding) {
        // Sem sway de cursor para manter a precisão e estabilidade total do clique nas faixas!
        if (cdViewmodel.backInlayMesh) {
          raycaster.setFromCamera(mouseCoord, camera);
          const cdHits = raycaster.intersectObject(cdViewmodel.backInlayMesh);
          if (cdHits.length > 0 && cdHits[0].uv) {
            const trackIdx = cdViewmodel.getTrackIndexAtUV(cdHits[0].uv);
            cdViewmodel.setHoveredTrack(trackIdx);
            useAppStore.getState().setHoveredTrackIndex(trackIdx);
            document.body.style.cursor = 'pointer';
            return;
          } else {
            cdViewmodel.setHoveredTrack(null);
            useAppStore.getState().setHoveredTrackIndex(null);
          }
        }
        document.body.style.cursor = 'default';
        return;
      }

      // Raycasting normal na galeria: em Pointer Lock, usa estritamente o centro (0, 0)
      if (playerController.isLocked) {
        mouseCoord.set(0, 0);
      }
      raycaster.setFromCamera(mouseCoord, camera);
      const candidates = [
        ...artworkItems.map((m) => m.glassMesh),
        ...artworkItems.map((m) => m.paperMesh),
        ...artworkItems.map((m) => m.plaqueMesh),
        cdCaseMesh,
        cdPaperMesh,
        cdBackMesh,
        cdPlaqueMesh,
        cdStand,
        deckMesh
      ];
      const hits = raycaster.intersectObjects(candidates);
      const validHits = hits.filter((h) => h.distance <= 6.5);

      if (validHits.length > 0) {
        const hitObj = validHits[0].object as any;
        if (hitObj.artworkData) {
          setHoveredArtwork(hitObj.artworkData as Artwork);
          useAppStore.getState().setHoveredTarget('artwork');
          setReticleState('artwork');
          document.body.style.cursor = 'pointer';
        } else if (hitObj.isCDStation) {
          useAppStore.getState().setHoveredTarget('cd');
          setReticleState('cd');
          document.body.style.cursor = 'pointer';
        }
      } else {
        setHoveredArtwork(null);
        useAppStore.getState().setHoveredTarget(null);
        setReticleState('idle');
        document.body.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, aside, nav, .cd-viewmodel-hud-dock, .cinema-bottom-feather-bar, .cinema-top-inspection-hud, .still-prancheta-dock, .modal-backdrop, .controls-guide-card, .controls-guide-card-graphic, header, footer, [role="dialog"]')) {
        return;
      }

      try {
        (document.activeElement as HTMLElement)?.blur?.();
      } catch {}

      const state = useAppStore.getState();

      // Se uma ação acabou de ser fechada (cooldown anti-clique fantasma de 250ms)
      if (Date.now() - state.lastActionCloseTime < 250) {
        return;
      }

      // Se estiver no Modo Cinema, não interage com a galeria de fundo
      if (state.cinemaArtwork) {
        return;
      }

      // Se estiver segurando o CD na mão
      if (state.isHoldingCD) {
        if (cdViewmodel.backInlayMesh) {
          raycaster.setFromCamera(mouseCoord, camera);
          const cdHits = raycaster.intersectObject(cdViewmodel.backInlayMesh);
          if (cdHits.length > 0 && cdHits[0].uv) {
            const trackIdx = cdViewmodel.getTrackIndexAtUV(cdHits[0].uv);
            if (trackIdx !== null) {
              cdViewmodel.selectTrackByIndex(trackIdx);
              return;
            }
          }
        }
        // Se clicou fora da tracklist, guarda o CD e volta a controlar a mira
        state.stowCD();
        cdViewmodel.stow();
        playerController.requestLock();
        return;
      }

      // Raycast dinâmico: se Pointer Lock estiver ativo usa retículo central (0,0); se livre, usa a posição real do mouse
      const clickCoord = playerController.isLocked ? new THREE.Vector2(0, 0) : mouseCoord;
      raycaster.setFromCamera(clickCoord, camera);
      const candidates = [
        ...artworkItems.map((m) => m.glassMesh),
        ...artworkItems.map((m) => m.paperMesh),
        ...artworkItems.map((m) => m.plaqueMesh),
        cdCaseMesh,
        cdPaperMesh,
        cdBackMesh
      ];
      const hits = raycaster.intersectObjects(candidates);
      const validHits = hits.filter((h) => h.distance <= 6.5);

      if (validHits.length > 0) {
        const hitObj = validHits[0].object as any;
        if (hitObj.artworkData) {
          soundEngine.playGlassPassSound();
          openCinema(hitObj.artworkData as Artwork);
          return;
        } else if (hitObj.isCDStation && validHits[0].distance <= 3.5) {
          const isFirst = !useAppStore.getState().hasInspectedCDBefore;
          useAppStore.getState().takeCD();
          cdViewmodel.take(isFirst);
          return;
        }
      }

      // Se clicou no espaço vazio, reativa o Pointer Lock para mira livre
      if (!playerController.isLocked) {
        playerController.requestLock();
      }
    };

    // Zoom fluido com Roda do Mouse no Modo Cinema 3D
    const onWheel = (e: WheelEvent) => {
      const state = useAppStore.getState();
      if (state.cinemaArtwork) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.12 : 0.12;
        targetInspZoom = Math.max(0.5, Math.min(3.5, targetInspZoom + delta));
        state.setInspectionZoom(targetInspZoom);
        if (targetInspZoom > 1.8 && !state.isLoupeMode) {
          state.setLoupeMode(true);
        } else if (targetInspZoom <= 1.2 && state.isLoupeMode) {
          state.setLoupeMode(false);
        }
        return;
      }
    };

    // Escuta global para atalhos táteis de jogabilidade (R, Q, E, Escape)
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        const state = useAppStore.getState();
        if (state.cinemaArtwork) {
          e.preventDefault();
          e.stopPropagation();
          state.toggleLoupeMode();
        }
      } else if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
        const state = useAppStore.getState();
        if (state.cinemaArtwork || state.isHoldingCD) {
          e.preventDefault();
          e.stopPropagation();
          if (state.cinemaArtwork) state.closeCinema();
          if (state.isHoldingCD) {
            state.stowCD();
            cdViewmodel.stow();
          }
          playerController.resumeAimControl();
          handleRequestLock();
        }
      }
    };

    // Sincronização direta com o estado da store para alternância do Modo Lupa
    const unsubLoupe = useAppStore.subscribe((state, prev) => {
      if (state.isLoupeMode !== prev.isLoupeMode) {
        if (state.isLoupeMode) {
          targetInspZoom = 2.8;
          targetInspRotX = 0;
          targetInspRotY = 0;
        } else {
          targetInspZoom = 1.0;
          targetInspRotX = 0;
          targetInspRotY = 0;
          targetPanX = 0;
          targetPanY = 0;
        }
      }
    });

    const handleRequestLock = () => {
      try {
        (document.activeElement as HTMLElement)?.blur?.();
      } catch {}
      playerController.resumeAimControl();
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onGlobalKeyDown, { capture: true });
    window.addEventListener('gigantera:request-lock', handleRequestLock);

    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Assinatura dinâmica da qualidade gráfica com Pixel Ratio adaptativo para Mac M1 / Retina
    const applyQualitySettings = (q: 'light' | 'med' | 'high') => {
      if (q === 'high') {
        floorReflector.visible = true;
        (floorReflector.material as any).opacity = isLight ? 0.38 : 0.44;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      } else if (q === 'med') {
        floorReflector.visible = true;
        (floorReflector.material as any).opacity = isLight ? 0.18 : 0.22;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      } else {
        floorReflector.visible = false;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
      }
      renderer.shadowMap.needsUpdate = true;
    };

    applyQualitySettings(useAppStore.getState().graphicsQuality);

    const unsubQuality = useAppStore.subscribe((state) => {
      applyQualitySettings(state.graphicsQuality);
    });

    // Função de transição instantânea de tema sem recriar a cena Three.js nem o PlayerController
    const applyTheme3D = (currentTheme: 'light' | 'dark') => {
      const isL = currentTheme === 'light';
      const tokens = TOKENS.themes[currentTheme];
      scene.fog = new THREE.FogExp2(tokens.canvasFog, 0.014);
      renderer.setClearColor(tokens.canvasFog);
      renderer.toneMappingExposure = isL ? 0.98 : 1.08;

      hemiLight.color.set(isL ? 0xf4f2ea : 0x181c1a);
      hemiLight.groundColor.set(isL ? 0xdcd8cd : 0x0a0c0b);
      hemiLight.intensity = isL ? 0.90 : 0.75;

      ambientLight.color.set(isL ? 0xf0ede4 : 0x141716);
      ambientLight.intensity = isL ? 0.38 : 0.42;

      sunLight.color.set(isL ? 0xfff8ed : 0xffebd0);
      sunLight.intensity = isL ? 1.65 : 1.95;

      visitorLight.color.set(isL ? 0xfff3d8 : 0xe4c379);
      visitorLight.intensity = isL ? 0.85 : 1.45;

      floorMat.map = isL ? floorLightTex : floorDarkTex;
      floorMat.roughness = isL ? 0.38 : 0.45;
      floorMat.metalness = isL ? 0.08 : 0.12;
      floorMat.needsUpdate = true;

      wallMat.map = isL ? wallLightTex : wallDarkTex;
      wallMat.needsUpdate = true;

      (floorReflector.material as any).opacity = isL ? 0.38 : 0.44;

      plinthMat.color.set(isL ? 0x222625 : 0x161918);
      deckMat.color.set(isL ? 0x333836 : 0x242826);
      spkBodyMat.color.set(isL ? 0xeeece5 : 0x181a19);
      baffleMat.color.set(isL ? 0x242725 : 0x0c0e0d);
      coneMat.color.set(isL ? 0xd0cec7 : 0x333635);
      bracketMat.color.set(isL ? 0x666866 : 0x242826);
    };

    const unsubTheme = useAppStore.subscribe((state, prev) => {
      if (state.theme !== prev.theme) {
        applyTheme3D(state.theme);
      }
    });

    const unsubGlide = useAppStore.subscribe((state) => {
      if (state.targetGlideSpot) {
        playerController.glideTo(
          state.targetGlideSpot.x,
          state.targetGlideSpot.z,
          state.targetGlideSpot.targetYaw
        );
        useAppStore.getState().setTargetGlideSpot(null);
      }
    });

    const unsubGyro = useAppStore.subscribe((state) => {
      playerController.setGyroActive(state.isGyroscopeActive);
    });

    const checkMobile = () => {
      const isMob = window.innerWidth <= 960 || ('ontouchstart' in window);
      useAppStore.getState().setIsMobile(isMob);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 11. Loop de Animação a 60 FPS com Frustum Culling Otimizado e Monitor de Performance
    let rafId: number;
    let prevCamZ = camera.position.z;
    let prevTargetZ = useAppStore.getState().cameraTargetZ;

    const clock = new THREE.Clock();
    const cameraFrustum = new THREE.Frustum();
    const cameraProjScreenMatrix = new THREE.Matrix4();

    const fpsRingBuffer: number[] = [];
    let lastFpsReportTime = performance.now();
    const benchmarkStartTime = performance.now();
    let benchmarkEvaluated = false;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      try {
        const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      const storeState = useAppStore.getState();
      const currentCinemaArt = storeState.cinemaArtwork;
      const holdingCD = storeState.isHoldingCD;
      const isAudioPlaying = storeState.isAudioPlaying;

      playerController.isHoldingCD = holdingCD;
      playerController.isCinemaActive = Boolean(currentCinemaArt);

      // Oculta o CD no pedestal quando estiver na mão
      restingCDGroup.visible = !holdingCD;

      // Monitor de performance rolling FPS e auto-benchmark inicial
      const now = performance.now();
      fpsRingBuffer.push(delta);
      if (fpsRingBuffer.length > 60) fpsRingBuffer.shift();

      if (now - lastFpsReportTime > 300) {
        const avgD = fpsRingBuffer.reduce((a, b) => a + b, 0) / fpsRingBuffer.length;
        const curFps = Math.round(1 / Math.max(0.001, avgD));
        useAppStore.getState().setCurrentFps(curFps);
        lastFpsReportTime = now;

        if (!benchmarkEvaluated && now - benchmarkStartTime > 3500) {
          benchmarkEvaluated = true;
          if (curFps < 45 && storeState.graphicsQuality === 'high') {
            useAppStore.getState().setGraphicsQuality('med');
            useAppStore.getState().setPerformanceSuggestion('Performance ajustada para Médio');
            setTimeout(() => useAppStore.getState().setPerformanceSuggestion(null), 5000);
          }
        } else if (benchmarkEvaluated) {
          if (curFps < 40 && storeState.graphicsQuality === 'high') {
            useAppStore.getState().setPerformanceSuggestion('Taxa reduzida — Recomendamos Médio');
          } else if (curFps < 32 && storeState.graphicsQuality === 'med') {
            useAppStore.getState().setPerformanceSuggestion('Taxa reduzida — Recomendamos Baixo');
          } else if (curFps >= 57 && storeState.performanceSuggestion) {
            useAppStore.getState().setPerformanceSuggestion(null);
          }
        }
      }

      // Transição suave de Z por botões da interface
      const currentStoreTargetZ = storeState.cameraTargetZ;
      if (Math.abs(currentStoreTargetZ - prevTargetZ) > 0.5) {
        playerController.position.z = THREE.MathUtils.lerp(playerController.position.z, currentStoreTargetZ, 0.12);
        if (Math.abs(playerController.position.z - currentStoreTargetZ) < 0.2) {
          prevTargetZ = currentStoreTargetZ;
        }
      } else {
        prevTargetZ = currentStoreTargetZ;
      }

      // Atualiza física do jogador (só anda se não estiver inspecionando obra)
      playerController.update(delta);
      cdViewmodel.update(elapsedTime, playerController.isMoving());

      // Rotina de Materialização das Obras (Intro 4s)
      if (elapsedTime <= 4.2) {
        const progress = Math.min(1, elapsedTime / 4.0);
        setIntroSpawnProgress(progress);

        artworkItems.forEach((item, idx) => {
          const spawnDelay = 0.3 + (idx / artworkItems.length) * 2.8;
          if (elapsedTime > spawnDelay) {
            const itemT = Math.min(1, (elapsedTime - spawnDelay) / 0.8);
            const easeScale = 1 - Math.pow(1 - itemT, 3);
            item.group.scale.set(easeScale, easeScale, easeScale);
          }
        });

        if (elapsedTime >= 4.0) {
          setIntroPhase('ready');
        }
      }

      // Otimização de Performance & Decodificação GPU (LOD de Proximidade para Vídeos)
      // Pausa decodificação em segundo plano se o visitante estiver a mais de 18m
      // Retoma reprodução contínua ao se aproximar (< 15m) ou no modo cinema
      const camPos = camera.position;
      artworkItems.forEach((item) => {
        if (!item.videoEl) return;
        const isCinemaActiveThis = currentCinemaArt?.id === item.artwork.id;
        if (isCinemaActiveThis) {
          if (item.videoEl.paused) {
            item.videoEl.play().catch(() => {});
          }
          return;
        }

        const dist = camPos.distanceTo(item.group.position);
        if (dist <= 15.0) {
          if (item.videoEl.paused) {
            item.videoEl.play().catch(() => {});
          }
        } else if (dist > 18.0) {
          if (!item.videoEl.paused) {
            item.videoEl.pause();
          }
        }
      });

      // DINÂMICA DO MODO DE INSPEÇÃO 3D (Obra no Primeiro Plano saindo da vitrine)
      if (currentCinemaArt) {
        // Se a obra acabou de ser aberta ou se mudou de prancheta
        if (activeCinemaArtId !== currentCinemaArt.id) {
          if (activeCinemaArtId) {
            const prevFound = artworkItems.find((a) => a.artwork.id === activeCinemaArtId);
            if (prevFound) prevFound.group.visible = true;
          }

          const found = artworkItems.find((a) => a.artwork.id === currentCinemaArt.id);
          if (found) {
            // Oculta completamente a vitrine do salão para eliminar camadas duplicadas
            found.group.visible = false;

            const isVid = currentCinemaArt.medium === 'video';
            if (isVid && found.videoEl) {
              artPlaneMat.map = found.texture;
              found.videoEl.play().catch(() => {});
            } else {
              artPlaneMat.map = found.texture;
            }
            artPlaneMat.needsUpdate = true;

            // Cálculo de proporção rigorosa no rig de inspeção em primeiro plano
            const ratio = currentCinemaArt.aspectRatioNum || (currentCinemaArt.aspectRatio === '16 / 9' ? 1400 / 787 : 781 / 1400);
            let w: number;
            let h: number;

            if (ratio > 1.0) {
              w = Math.min(1.80, 1.30 * ratio);
              h = w / ratio;
            } else {
              h = 1.30;
              w = h * ratio;
            }

            currentArtW = w;
            currentArtH = h;

            inspectionArtMesh.geometry.dispose();
            inspectionArtMesh.geometry = new THREE.PlaneGeometry(w, h);
            inspectionBacking.geometry.dispose();
            inspectionBacking.geometry = new THREE.PlaneGeometry(w + 0.06, h + 0.06);

            inspectionRig.visible = true;
            inspectionTransition = 0.1;
            targetInspRotX = 0;
            targetInspRotY = 0;
            curInspRotX = 0;
            curInspRotY = 0;
            targetInspZoom = 1.0;
            curInspZoom = 1.0;
            curPanX = 0;
            curPanY = 0;
            targetPanX = 0;
            targetPanY = 0;
            activeCinemaArtId = currentCinemaArt.id;
          } else {
            // Obra aberta externamente ou via catálogo/admin
            const isVid = currentCinemaArt.medium === 'video';
            if (isVid && currentCinemaArt.videoSrc) {
              const tempVid = document.createElement('video');
              tempVid.src = currentCinemaArt.videoSrc;
              tempVid.crossOrigin = 'anonymous';
              tempVid.loop = true;
              tempVid.muted = false;
              tempVid.playsInline = true;
              tempVid.play().catch(() => {});
              const vidTex = new THREE.VideoTexture(tempVid);
              vidTex.colorSpace = THREE.SRGBColorSpace;
              artPlaneMat.map = vidTex;
            } else if (currentCinemaArt.imageSrc) {
              const tex = textureLoader.load(currentCinemaArt.imageSrc);
              tex.colorSpace = THREE.SRGBColorSpace;
              artPlaneMat.map = tex;
            }
            artPlaneMat.needsUpdate = true;

            const ratio = currentCinemaArt.aspectRatioNum || 1.0;
            const h = 1.30;
            const w = h * ratio;
            currentArtW = w;
            currentArtH = h;
            inspectionArtMesh.geometry.dispose();
            inspectionArtMesh.geometry = new THREE.PlaneGeometry(w, h);
            inspectionBacking.geometry.dispose();
            inspectionBacking.geometry = new THREE.PlaneGeometry(w + 0.06, h + 0.06);

            inspectionRig.visible = true;
            inspectionTransition = 0.1;
            targetInspRotX = 0;
            targetInspRotY = 0;
            curInspRotX = 0;
            curInspRotY = 0;
            targetInspZoom = 1.0;
            curInspZoom = 1.0;
            curPanX = 0;
            curPanY = 0;
            targetPanX = 0;
            targetPanY = 0;
            activeCinemaArtId = currentCinemaArt.id;
          }
        }

        // Animação de interpolação da inspeção 3D
        inspectionTransition = THREE.MathUtils.lerp(inspectionTransition, 1.0, 0.1);

        if (storeState.isLoupeMode) {
          curInspZoom = THREE.MathUtils.lerp(curInspZoom, 2.8, 0.14);
          curInspRotX = THREE.MathUtils.lerp(curInspRotX, 0, 0.18);
          curInspRotY = THREE.MathUtils.lerp(curInspRotY, 0, 0.18);
          curPanX = THREE.MathUtils.lerp(curPanX, targetPanX, 0.15);
          curPanY = THREE.MathUtils.lerp(curPanY, targetPanY, 0.15);
        } else {
          curInspZoom = THREE.MathUtils.lerp(curInspZoom, targetInspZoom, 0.14);
          curInspRotX = THREE.MathUtils.lerp(curInspRotX, targetInspRotX, 0.12);
          curInspRotY = THREE.MathUtils.lerp(curInspRotY, targetInspRotY, 0.12);
          curPanX = THREE.MathUtils.lerp(curPanX, 0, 0.18);
          curPanY = THREE.MathUtils.lerp(curPanY, 0, 0.18);
        }

        inspectionRig.position.set(curPanX, curPanY, -2.1);
        inspectionRig.rotation.x = curInspRotX;
        inspectionRig.rotation.y = curInspRotY;
        const totalScale = curInspZoom * inspectionTransition;
        inspectionRig.scale.set(totalScale, totalScale, totalScale);

        // A iluminação externa da galeria apaga suavemente, isolando a obra em 3D
        ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, 0.02, 0.08);
        sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, 0.02, 0.08);
      } else {
        // Se saiu da inspeção, devolve a obra à vitrine original no salão
        if (activeCinemaArtId) {
          const found = artworkItems.find((a) => a.artwork.id === activeCinemaArtId);
          if (found) {
            found.group.visible = true; // Vitrine completa reaparece no salão
          }
          inspectionRig.visible = false;
          activeCinemaArtId = null;
          curPanX = 0;
          curPanY = 0;
          targetPanX = 0;
          targetPanY = 0;
        }

        const defAmbient = isLight ? 0.75 : 0.55;
        const defSun = isLight ? 1.9 : 2.2;
        ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, defAmbient, 0.08);
        sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, defSun, 0.08);

        // Pulsação sutil dos pontos contemplativos no piso quando livre no salão
        viewingSpotRings.forEach(({ mesh, mat, spot }) => {
          const dist = Math.hypot(camera.position.x - spot.x, camera.position.z - spot.z);
          const isNear = dist < 2.2;
          const targetOpacity = isNear
            ? 0.5 + Math.sin(elapsedTime * 3.2) * 0.15
            : (spot.medium === 'video' ? 0.22 : 0.14);
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
          if (isNear) {
            mesh.scale.setScalar(1.0 + Math.sin(elapsedTime * 2.8) * 0.04);
          } else {
            mesh.scale.setScalar(1.0);
          }
        });
      }

      // DISTORÇÃO DE AR ACÚSTICO & ATENUAÇÃO ESPACIAL FÍSICA
      if (isAudioPlaying) {
        const energy = soundEngine.getEnergy();

        // Efeito elegante de cúpula sônica 3D saindo das caixas (visível de frente e de lado)
        // Nota: O cone do woofer permanece estático em z = 0.196 eliminando qualquer Z-fighting ou piscamento
        acousticAirHaze.forEach(({ mesh, puffIdx }) => {
          const progress = ((elapsedTime * 0.70 + puffIdx * 0.25) % 1.0);
          // Expansão volumétrica tridimensional (X, Y e Z)
          mesh.scale.set(
            0.65 + progress * 2.8,
            0.65 + progress * 2.8,
            0.45 + progress * 2.3
          );
          // O domo avança para fora da parede em direção ao salão
          mesh.position.z = 0.20 + progress * 2.6;
          // Turbulência de ar sutil
          mesh.position.x = Math.sin(elapsedTime * 1.8 + puffIdx * 1.5) * 0.04 * progress;
          mesh.position.y = -0.13 + Math.cos(elapsedTime * 1.4 + puffIdx * 1.2) * 0.03 * progress;
          // Opacidade acústica sutil (sem linhas duras)
          (mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(progress * Math.PI) * (0.05 + energy * 0.09);
        });

        // Atualização de áudio espacial físico com atenuação e panner estéreo
        soundEngine.updateSpatialAcoustics(
          camera.position.x,
          camera.position.z,
          layout.speakers,
          storeState.soundVolume
        );
      } else {
        acousticAirHaze.forEach(({ mesh }) => {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.15);
        });
      }

      // Telemetria Z
      const velocityZ = camera.position.z - prevCamZ;
      prevCamZ = camera.position.z;
      updateCameraZ(camera.position.z, velocityZ);

      visitorLight.position.set(camera.position.x, camera.position.y + 1.0, camera.position.z);
      // Luz do visitante firme e constante (elimina oscilação/piscamento dos alto-falantes e paredes)
      visitorLight.intensity = isLight ? 0.85 : 1.45;

      // Atualiza matriz de frustum para culling de vídeos e objetos fora do campo de visão
      cameraProjScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      cameraFrustum.setFromProjectionMatrix(cameraProjScreenMatrix);

      // Otimização de fill-rate M1: durante a inspeção de obras em primeiro plano,
      // desativa o refletor do piso para economizar 100% do pass secundário de renderização
      if (currentCinemaArt) {
        if (floorReflector.visible) floorReflector.visible = false;
      } else {
        const targetReflVis = storeState.graphicsQuality !== 'light';
        if (floorReflector.visible !== targetReflVis) floorReflector.visible = targetReflVis;
      }

      // Animação sutil dos dust motes atmosféricos
      const dustPosAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      const dustPosArr = dustPosAttr.array as Float32Array;
      for (let p = 0; p < dustCount; p++) {
        dustPosArr[p * 3 + 1] = dustBaseY[p] + Math.sin(elapsedTime * 0.4 + p * 0.2) * 0.35;
        dustPosArr[p * 3] += Math.sin(elapsedTime * 0.3 + p) * 0.001;
      }
      dustPosAttr.needsUpdate = true;

      // Flutuação suave das vitrines quando livres
      if (!currentCinemaArt) {
        artworkItems.forEach((item, idx) => {
          item.group.position.y = THREE.MathUtils.lerp(
            item.group.position.y,
            Math.sin(elapsedTime * 0.8 + idx * 0.9) * 0.08,
            0.04
          );
        });
      }

      // Detecção de Proximidade das Obras com Culling Inteligente de Vídeo
      let closestArt: Artwork | null = null;
      let minDistance = Infinity;

      for (const item of artworkItems) {
        const d = camera.position.distanceTo(item.group.position);
        if (d < minDistance) {
          minDistance = d;
          closestArt = item.artwork;
        }

        if (item.videoEl) {
          if (currentCinemaArt) {
            // Se estiver inspecionando uma obra no cinema, pausa todas as outras vitrines de vídeo
            if (currentCinemaArt.id !== item.artwork.id && !item.videoEl.paused) {
              item.videoEl.pause();
            }
          } else {
            const isNear = Math.abs(camera.position.z - item.group.position.z) < 32;
            const inFrustum = cameraFrustum.containsPoint(item.group.position);
            if (isNear && inFrustum) {
              if (item.videoEl.paused) {
                item.videoEl.play().catch(() => {});
              }
            } else if (!item.videoEl.paused) {
              item.videoEl.pause();
            }
          }
        }
      }

      if (minDistance < TOKENS.navigation.proximityThreshold && closestArt && !currentCinemaArt) {
        setProximityArtwork(closestArt);
      } else {
        setProximityArtwork(null);
      }

      // Atualização dos Prompts Táticos de Jogo (Minimalista & Contextual — sem sobreposições)
      const distToCD = Math.hypot(camera.position.x - 2.8, camera.position.z - 18);
      const currentHoveredTarget = storeState.hoveredTarget;

      if (currentCinemaArt || holdingCD) {
        setGameControlPrompt(null);
      } else if (currentHoveredTarget === 'cd' && distToCD < 4.5) {
        setGameControlPrompt('cd');
      } else if ((currentHoveredTarget === 'artwork' || currentHoveredTarget === 'plaque') && closestArt && minDistance < 6.5) {
        setGameControlPrompt(`art:${closestArt.title.toUpperCase()}`);
      } else {
        setGameControlPrompt(null);
      }

      renderer.render(scene, camera);
      } catch (renderErr) {
        console.warn('[Gigantera 3D Render Non-fatal Error]:', renderErr);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onGlobalKeyDown, { capture: true });
      window.removeEventListener('gigantera:request-lock', handleRequestLock);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('resize', checkMobile);
      unsubQuality();
      unsubTheme();
      unsubLoupe();
      unsubGlide();
      unsubGyro();

      playerController.dispose();
      cdViewmodel.rootGroup.removeFromParent();
      inspectionRig.removeFromParent();
      dustGeo.dispose();
      dustMat.dispose();
      hazeTexture.dispose();

      artworkItems.forEach((item) => {
        if (item.videoEl) {
          item.videoEl.pause();
          item.videoEl.removeAttribute('src');
          item.videoEl.load();
        }
      });

      floorLightTex.dispose();
      floorDarkTex.dispose();
      wallLightTex.dispose();
      wallDarkTex.dispose();
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="gallery-3d-viewport"
      className="gallery-3d-container"
      aria-label="Espaço 3D Brutalista Realista — Caminhe livremente pela galeria entre vitrines de vidro, plaquinhas 3D e o álbum de CD"
    >
      {/* Retículo Central Tático Minimalista Brutalista */}
      {!isHoldingCD && !cinemaArtwork && (
        <div className={`tactile-center-reticle ${reticleState !== 'idle' ? 'is-targeting' : ''}`} aria-hidden="true">
          <span className="reticle-bracket">[</span>
          <span className="reticle-dot">
            {reticleState === 'artwork' ? '⌕' : reticleState === 'cd' ? '☊' : '·'}
          </span>
          <span className="reticle-bracket">]</span>
        </div>
      )}

      {/* Floating Tactical Game Action Prompt (Minimalista com Keycaps e Ícones) */}
      {gameControlPrompt && !cinemaArtwork && (
        <div className="game-action-prompt-overlay" aria-live="polite">
          <div className="game-action-prompt-badge font-mono">
            {gameControlPrompt === 'cd' ? (
              <>
                <kbd className="keycap">E</kbd>
                <span className="keycap-label">/</span>
                <span className="mouse-badge">
                  <span className="mouse-icon mouse-left-click" />
                </span>
                <span className="keycap-label">PEGAR ÁLBUM CD</span>
              </>
            ) : gameControlPrompt.startsWith('art:') ? (
              <>
                <kbd className="keycap">E</kbd>
                <span className="keycap-label">/</span>
                <span className="mouse-badge">
                  <span className="mouse-icon mouse-left-click" />
                </span>
                <span className="keycap-label">INSPECIONAR {gameControlPrompt.replace('art:', '')}</span>
              </>
            ) : (
              <span className="keycap-label">{gameControlPrompt}</span>
            )}
          </div>
        </div>
      )}

      {/* Dica discreta de clique para ativar Câmera Livre se não estiver bloqueado (Apenas Desktop) */}
      {!isPointerLocked && !isHoldingCD && !cinemaArtwork && !isMobile && (
        <div
          className="pointer-lock-hint-dock font-mono"
          aria-hidden="true"
          onClick={() => window.dispatchEvent(new CustomEvent('gigantera:request-lock'))}
          style={{ cursor: 'pointer' }}
        >
          <span className="mouse-badge">
            <span className="mouse-icon mouse-left-click" />
            <span className="keycap-label">CLIQUE P/ MIRA LIVRE</span>
          </span>
        </div>
      )}
    </div>
  );
};
