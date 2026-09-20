/**
 * EspinhacoInteractive — Obra Interativa Imersiva Autêntica
 * Espinhaço // Tração Vertebral // 2026 // Pelimotion
 *
 * Utiliza o modelo 3D escultural original (espinhaco.glb) e a nuvem de
 * 50.000 partículas amostradas da geometria real (espinhaco_points.bin).
 *
 * Tendências globais 2025–2026 de vanguarda implementadas:
 * - Renderização PBR em Three.js com mapas normais, rugosidade e iluminação de galeria
 * - Três Modos de Visão Curatorial: [1] MATÉRIA (Sólido PBR), [2] CORPÚSCULOS (50k Partículas), [3] RAIO-X (Wireframe Holográfico)
 * - 4 Biomas Cromáticos: TITÂNIO, ABISSAL, MAGMA, ESPECTRAL
 * - Rotação Orbital 3D 360° com inércia física, zoom macro e auto-turntable
 * - Áudio-reatividade em tempo real via FFT do soundEngine da galeria (respiração de graves, ondas de médios, cintilação de agudos)
 * - Deformação cinética sutil da coluna vertebral por ruído hidrodinâmico
 * - HUD Brutalista com telemetria 3D espacial em tempo real
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { useAppStore } from '../../core/store';
import { soundEngine } from '../../core/soundEngine';

// ---------------------------------------------------------------------------
// Types & Biomes
// ---------------------------------------------------------------------------
export type RenderMode = 'pbr' | 'particles' | 'wireframe';

export interface BiomeTheme {
  id: string;
  name: string;
  primary: THREE.Color;
  secondary: THREE.Color;
  accent: THREE.Color;
  hex: string;
}

export const BIOMES: BiomeTheme[] = [
  {
    id: 'titanio',
    name: 'TITÂNIO',
    primary: new THREE.Color(0xf0f6fc),
    secondary: new THREE.Color(0x9fc5e8),
    accent: new THREE.Color(0xffffff),
    hex: '#e2e8f0'
  },
  {
    id: 'abissal',
    name: 'ABISSAL',
    primary: new THREE.Color(0x00e5ff),
    secondary: new THREE.Color(0x005588),
    accent: new THREE.Color(0x5eead4),
    hex: '#00e5ff'
  },
  {
    id: 'magma',
    name: 'MAGMA',
    primary: new THREE.Color(0xff7b00),
    secondary: new THREE.Color(0x992200),
    accent: new THREE.Color(0xffd700),
    hex: '#ff7b00'
  },
  {
    id: 'espectral',
    name: 'ESPECTRAL',
    primary: new THREE.Color(0xc084fc),
    secondary: new THREE.Color(0x4f46e5),
    accent: new THREE.Color(0x38bdf8),
    hex: '#c084fc'
  }
];

// ---------------------------------------------------------------------------
// Particle Shader Source (50,000 Points from Real Geometry)
// ---------------------------------------------------------------------------
const particleVertexShader = `
  attribute vec3 aRandom;
  attribute float aIndex;

  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uTransient;
  uniform vec3  uColorPrimary;
  uniform vec3  uColorSecondary;
  uniform float uPixelRatio;
  uniform float uAlpha;

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Respiração e expansão volumétrica das vértebras com sub-graves
    float ribExpand = 1.0 + (uBass * 0.18);
    pos.x *= ribExpand;
    pos.z *= ribExpand;

    // Onda cinética ondulatória percorrendo a coluna com médios
    float spineWaveX = sin(uTime * 2.8 + pos.y * 3.5) * (uMid * 0.08 + 0.015);
    float spineWaveZ = cos(uTime * 2.2 + pos.y * 3.0) * (uMid * 0.06 + 0.012);
    pos.x += spineWaveX;
    pos.z += spineWaveZ;

    // Dispersão quântica transitória em picos sonoros ou cliques
    if (uTransient > 0.02) {
      pos += (aRandom - 0.5) * uTransient * 0.45;
    }

    // Levíssima flutuação hidrostática orgânica
    pos.y += sin(uTime * 1.5 + aRandom.y * 6.28) * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Tamanho com escala de proximidade e cintilação de agudos
    float baseSize = mix(2.2, 4.2, aRandom.x);
    float sparkle = 1.0 + (uTreble * 1.6) + (uBass * 0.5);
    gl_PointSize = clamp((baseSize * sparkle * uPixelRatio) / -mvPosition.z, 1.5, 12.0);

    // Gradiente bioluminescente baseado na posição vertical da vértebra
    float colorT = clamp((pos.y + 1.1) / 2.2, 0.0, 1.0);
    vec3 col = mix(uColorPrimary, uColorSecondary, colorT);

    // Cintilação nos corpúsculos periféricos
    if (aRandom.y > 0.75) {
      col = mix(col, vec3(1.0), uTreble * 0.8);
    }

    vColor = col;
    vAlpha = uAlpha;
  }
`;

const particleFragmentShader = `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float glow = pow(1.0 - dist * 2.0, 1.8);
    vec3 finalColor = mix(vColor, vec3(1.0), pow(glow, 3.5) * 0.8);
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------
export const EspinhacoInteractive: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados Curadoriais
  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [activeBiomeIndex, setActiveBiomeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadMessage, setLoadMessage] = useState('Carregando geometria original…');
  const [showHUD, setShowHUD] = useState(true);

  // Telemetria em tempo real para o HUD
  const [hudStats, setHudStats] = useState({
    rotX: 0,
    rotY: 0,
    zoom: 2.5,
    fftLevel: 0,
    meshLoaded: false,
    pointsCount: 50000
  });

  // Referências Three.js persistentes
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sculptureGroupRef = useRef<THREE.Group | null>(null);
  const pbrMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const particlePointsRef = useRef<THREE.Points | null>(null);
  const particleMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rafRef = useRef(0);

  // Controle de mouse e inércia orbital
  const isMouseDownRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0.1, y: 0.2 });
  const targetZoomRef = useRef(2.5);
  const lastInteractionTimeRef = useRef(Date.now());
  const transientRef = useRef(0);

  const activeBiome = BIOMES[activeBiomeIndex];

  // ---------------------------------------------------------------------------
  // 1. Inicialização da Cena 3D Three.js
  // ---------------------------------------------------------------------------
  const initScene = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Fog sutil volumétrico de profundidade
    scene.fog = new THREE.FogExp2(isDark ? 0x06090c : 0xd8dad6, 0.18);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
    camera.position.set(0, 0, targetZoomRef.current);
    cameraRef.current = camera;

    // Grupo de Articulação do Fóssil Espinhaço
    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);
    sculptureGroupRef.current = sculptureGroup;

    // Iluminação de Estúdio / Galeria
    const ambientLight = new THREE.AmbientLight(isDark ? 0x223344 : 0x778899, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(activeBiome.primary, 3.2);
    rimLight.position.set(-3.5, 2.5, -3.5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const fillLight = new THREE.PointLight(0x60a5fa, 1.4, 8);
    fillLight.position.set(0, -2.5, 2.5);
    scene.add(fillLight);

    // Poeira subaquática cósmica (350 motes ao redor da escultura)
    const dustCount = 350;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 8;
      dustPos[i + 1] = (Math.random() - 0.5) * 8;
      dustPos[i + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0x88ccff : 0x336699,
      size: 0.028,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const dustPoints = new THREE.Points(dustGeom, dustMat);
    scene.add(dustPoints);
  }, [isDark, activeBiome]);

  // ---------------------------------------------------------------------------
  // 2. Carregador de Geometria Original (espinhaco_points.bin + espinhaco.glb)
  // ---------------------------------------------------------------------------
  const loadAssets = useCallback(async () => {
    const group = sculptureGroupRef.current;
    if (!group) return;

    const base = (import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
    const cleanBase = base.endsWith('/') ? base : base + '/';

    // 1. CARREGAMENTO ULTRA-RÁPIDO DOS PONTOS ORIGINAIS (586KB)
    try {
      setLoadMessage('Carregando 50.000 corpúsculos do fóssil…');
      setLoadProgress(0.2);
      const binRes = await fetch(`${cleanBase}models/espinhaco_points.bin`);
      if (binRes.ok) {
        const binBuf = await binRes.arrayBuffer();
        const positions = new Float32Array(binBuf);
        const count = positions.length / 3;

        // Escala e centralização precisa para 2.2m de altura vertical
        const pGeom = new THREE.BufferGeometry();
        const scaledPositions = new Float32Array(positions.length);
        const scaleFactor = 1.52;

        for (let i = 0; i < positions.length; i += 3) {
          scaledPositions[i] = positions[i] * scaleFactor;
          scaledPositions[i + 1] = positions[i + 1] * scaleFactor;
          scaledPositions[i + 2] = positions[i + 2] * scaleFactor;
        }

        pGeom.setAttribute('position', new THREE.BufferAttribute(scaledPositions, 3));

        const randoms = new Float32Array(count * 3);
        const indices = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          randoms[i * 3] = Math.random();
          randoms[i * 3 + 1] = Math.random();
          randoms[i * 3 + 2] = Math.random();
          indices[i] = i / count;
        }
        pGeom.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
        pGeom.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));

        const pMat = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uBass: { value: 0 },
            uMid: { value: 0 },
            uTreble: { value: 0 },
            uTransient: { value: 0 },
            uColorPrimary: { value: activeBiome.primary },
            uColorSecondary: { value: activeBiome.secondary },
            uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
            uAlpha: { value: 0.95 }
          },
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(pGeom, pMat);
        group.add(points);
        particlePointsRef.current = points;
        particleMaterialRef.current = pMat;

        setLoadProgress(0.6);
        setIsLoading(false); // Já pronto para interação instantânea enquanto o GLB finaliza!
      }
    } catch (err) {
      console.warn('[Espinhaco] Erro no carregamento de pontos:', err);
    }

    // 2. CARREGAMENTO DO MODELO 3D GLB TEXTURIZADO COMPLETO (12MB)
    try {
      setLoadMessage('Processando malha 3D e mapas de rugosidade PBR…');
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        `${cleanBase}models/espinhaco.glb`,
        (gltf) => {
          let originalMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh && !originalMesh) {
              originalMesh = obj as THREE.Mesh;
            }
          });

          if (originalMesh) {
            const geom = (originalMesh as THREE.Mesh).geometry.clone();
            geom.computeVertexNormals();
            geom.center();
            // Rotação Z de 90° para posicionar a coluna vertebral na vertical
            geom.rotateZ(Math.PI / 2);

            // Escala para encaixe exato com a nuvem de pontos
            const box = new THREE.Box3().setFromBufferAttribute(geom.attributes.position as THREE.BufferAttribute);
            const size = new THREE.Vector3();
            box.getSize(size);
            const targetHeight = 2.2;
            const meshScale = targetHeight / Math.max(size.x, size.y, size.z);
            geom.scale(meshScale, meshScale, meshScale);

            // 1. Malha Sólida PBR com materiais originais calibrados
            const pbrMat = ((originalMesh as THREE.Mesh).material as THREE.MeshStandardMaterial).clone();
            pbrMat.roughness = 0.32;
            pbrMat.metalness = 0.88;
            pbrMat.envMapIntensity = 1.3;
            pbrMat.needsUpdate = true;

            const pbrMesh = new THREE.Mesh(geom, pbrMat);
            pbrMesh.castShadow = true;
            pbrMesh.receiveShadow = true;
            group.add(pbrMesh);
            pbrMeshRef.current = pbrMesh;

            // 2. Malha Wireframe Raio-X Holográfico
            const wireMat = new THREE.MeshBasicMaterial({
              color: activeBiome.primary,
              wireframe: true,
              transparent: true,
              opacity: 0.55,
              blending: THREE.AdditiveBlending
            });
            const wireMesh = new THREE.Mesh(geom.clone(), wireMat);
            wireMesh.visible = false;
            group.add(wireMesh);
            wireframeMeshRef.current = wireMesh;

            // Atualiza visibilidade com base no modo corrente
            pbrMesh.visible = renderMode === 'pbr';
            wireMesh.visible = renderMode === 'wireframe';
            if (particlePointsRef.current) {
              particlePointsRef.current.visible = renderMode !== 'pbr';
            }

            setHudStats((s) => ({ ...s, meshLoaded: true }));
            setLoadProgress(1.0);
          }
        },
        (xhr) => {
          if (xhr.total > 0) {
            const ratio = xhr.loaded / xhr.total;
            setLoadProgress(0.6 + ratio * 0.4);
          }
        },
        (err) => {
          console.warn('[Espinhaco] GLB carregado parcialmente ou indisponível:', err);
        }
      );
    } catch (e) {
      console.error('[Espinhaco] Falha geral no carregamento:', e);
    }
  }, [activeBiome, renderMode]);

  // ---------------------------------------------------------------------------
  // 3. Loop de Animação 60 FPS com Áudio-Reatividade
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let t = 0;

    const animate = () => {
      t += 0.016;

      const group = sculptureGroupRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;

      if (!group || !camera || !renderer || !scene) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // 1. ÁUDIO-REATIVIDADE VIA FFT (soundEngine)
      let bass = 0;
      let mid = 0;
      let treble = 0;
      let overallFFT = 0;

      try {
        const fftData = soundEngine.getFrequencyData();
        if (fftData && fftData.length > 0) {
          let sumLow = 0, sumMid = 0, sumHigh = 0;
          for (let i = 0; i < 4; i++) sumLow += fftData[i] || 0;
          for (let i = 4; i < 16; i++) sumMid += fftData[i] || 0;
          for (let i = 16; i < 48; i++) sumHigh += fftData[i] || 0;

          bass = sumLow / (4 * 255);
          mid = sumMid / (12 * 255);
          treble = sumHigh / (32 * 255);
          overallFFT = (bass + mid + treble) / 3;
        }
      } catch {}

      // Decaimento do transiente de clique
      if (transientRef.current > 0.001) {
        transientRef.current *= 0.92;
      }

      // 2. ATUALIZAÇÃO DOS UNIFORMS DE SHADER DAS PARTÍCULAS
      if (particleMaterialRef.current) {
        const u = particleMaterialRef.current.uniforms;
        u.uTime.value = t;
        u.uBass.value = bass;
        u.uMid.value = mid;
        u.uTreble.value = treble;
        u.uTransient.value = transientRef.current;
        u.uColorPrimary.value = activeBiome.primary;
        u.uColorSecondary.value = activeBiome.secondary;
      }

      // 3. INÉRCIA ORBITAL & ROTAÇÃO MAJESTOSA
      const now = Date.now();
      const isIdle = !isMouseDownRef.current && now - lastInteractionTimeRef.current > 2500;

      if (isIdle) {
        // Auto-turntable suave de museu
        targetRotRef.current.y += 0.004;
      }

      // Inércia amortecida suave
      targetRotRef.current.y += rotVelocityRef.current.y;
      targetRotRef.current.x += rotVelocityRef.current.x;
      rotVelocityRef.current.x *= 0.90;
      rotVelocityRef.current.y *= 0.90;

      group.rotation.y += (targetRotRef.current.y - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotRef.current.x - group.rotation.x) * 0.08;

      // Respiração volumétrica sutil com os graves
      const pulseScale = 1.0 + Math.sin(t * 1.5) * 0.012 + bass * 0.035;
      group.scale.set(pulseScale, pulseScale, pulseScale);

      // Câmera & Zoom
      camera.position.z += (targetZoomRef.current - camera.position.z) * 0.08;

      // Rim light pulsa com os agudos e a cor do bioma
      if (rimLightRef.current) {
        rimLightRef.current.color.copy(activeBiome.primary);
        rimLightRef.current.intensity = 2.8 + treble * 2.0;
      }

      // Render
      renderer.render(scene, camera);

      // Atualiza telemetria do HUD a cada 6 quadros
      if (Math.floor(t * 60) % 6 === 0) {
        setHudStats((s) => ({
          ...s,
          rotX: Math.round(((group.rotation.x * 180) / Math.PI) % 360),
          rotY: Math.round(((group.rotation.y * 180) / Math.PI) % 360),
          zoom: parseFloat(camera.position.z.toFixed(2)),
          fftLevel: Math.round(overallFFT * 100)
        }));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeBiome]);

  // ---------------------------------------------------------------------------
  // 4. Montagem e Handlers de Eventos Táteis
  // ---------------------------------------------------------------------------
  useEffect(() => {
    initScene();
    loadAssets();

    const handleResize = () => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initScene, loadAssets]);

  // Alternador de Modo de Renderização
  const handleSetMode = (mode: RenderMode) => {
    setRenderMode(mode);
    soundEngine.playTactileHoverTick();

    if (pbrMeshRef.current) {
      pbrMeshRef.current.visible = mode === 'pbr';
    }
    if (wireframeMeshRef.current) {
      wireframeMeshRef.current.visible = mode === 'wireframe';
    }
    if (particlePointsRef.current && particleMaterialRef.current) {
      particlePointsRef.current.visible = mode !== 'pbr';
      particleMaterialRef.current.uniforms.uAlpha.value = mode === 'particles' ? 0.95 : 0.40;
    }
  };

  // Alternador de Bioma
  const handleSelectBiome = (index: number) => {
    setActiveBiomeIndex(index);
    soundEngine.playTactileHoverTick();
    const b = BIOMES[index];

    if (wireframeMeshRef.current) {
      (wireframeMeshRef.current.material as THREE.MeshBasicMaterial).color.copy(b.primary);
    }
    if (particleMaterialRef.current) {
      particleMaterialRef.current.uniforms.uColorPrimary.value = b.primary;
      particleMaterialRef.current.uniforms.uColorSecondary.value = b.secondary;
    }
  };

  // Disparo de pulso cinético
  const triggerShockPulse = () => {
    transientRef.current = 1.0;
    soundEngine.playTactileHoverTick();
  };

  // Handlers de Mouse & Touch
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    rotVelocityRef.current.y = dx * 0.005;
    rotVelocityRef.current.x = dy * 0.005;

    // Clamping do tilt vertical
    targetRotRef.current.x = Math.max(-0.85, Math.min(0.85, targetRotRef.current.x + dy * 0.005));
    targetRotRef.current.y += dx * 0.005;
    lastInteractionTimeRef.current = Date.now();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    targetZoomRef.current = Math.max(1.2, Math.min(4.2, targetZoomRef.current + e.deltaY * 0.002));
    lastInteractionTimeRef.current = Date.now();
  };

  // Reset de câmera
  const handleResetCamera = () => {
    targetRotRef.current = { x: 0.1, y: 0.2 };
    targetZoomRef.current = 2.5;
    rotVelocityRef.current = { x: 0, y: 0 };
    soundEngine.playTactileHoverTick();
  };

  // Teclas de atalho
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') handleSetMode('pbr');
      else if (e.key === '2') handleSetMode('particles');
      else if (e.key === '3') handleSetMode('wireframe');
      else if (e.key === 'b' || e.key === 'B') {
        setActiveBiomeIndex((idx) => (idx + 1) % BIOMES.length);
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetCamera();
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerShockPulse();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const accentColor = activeBiome.hex;
  const fgColor = isDark ? '#c8cfc8' : '#2a3028';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={triggerShockPulse}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isMouseDownRef.current ? 'grabbing' : 'grab',
        background: isDark
          ? 'radial-gradient(ellipse at center, #0b1218 0%, #05080a 75%, #020304 100%)'
          : 'radial-gradient(ellipse at center, #f4f6f8 0%, #e2e6ea 75%, #cbd2d8 100%)',
        userSelect: 'none'
      }}
      aria-label="Espinhaço — Obra Escultural 3D Interativa"
      role="application"
    >
      {/* Canvas WebGL Three.js */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Loading Overlay com Progresso Suave */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(5,8,10,0.88)' : 'rgba(240,244,248,0.92)',
            backdropFilter: 'blur(10px)',
            fontFamily: '"Space Mono", monospace',
            color: accentColor
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: '0.2em', marginBottom: 12 }}>
            ESPINHAÇO // RECUPERANDO MALHA 3D
          </div>
          <div
            style={{
              width: 240,
              height: 2,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              marginBottom: 10
            }}
          >
            <div
              style={{
                width: `${Math.round(loadProgress * 100)}%`,
                height: '100%',
                background: accentColor,
                transition: 'width 0.3s ease-out'
              }}
            />
          </div>
          <div style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.08em' }}>
            {loadMessage}
          </div>
        </div>
      )}

      {/* HUD Telemetria Brutalista — Canto Superior Esquerdo */}
      {showHUD && (
        <aside
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            zIndex: 20,
            fontFamily: '"Space Mono", monospace',
            fontSize: 11,
            lineHeight: 1.6,
            color: fgColor,
            letterSpacing: '0.06em',
            background: isDark ? 'rgba(8,12,14,0.72)' : 'rgba(245,247,250,0.78)',
            backdropFilter: 'blur(10px)',
            padding: '14px 18px',
            borderRadius: '4px',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            maxWidth: '310px',
            pointerEvents: 'auto'
          }}
          aria-label="Telemetria da Escultura 3D"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: accentColor, fontWeight: 'bold', fontSize: 11 }}>
              ESPINHAÇO // 2026
            </span>
            <span style={{ fontSize: 9, opacity: 0.5 }}>PELIMOTION</span>
          </div>
          <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 8 }}>
            ESCULTURA DIGITAL INTERATIVA
          </div>

          <div style={{ opacity: 0.35, margin: '6px 0' }}>────────────────────────────</div>

          {/* Modos de Visão Curatorial */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 4 }}>MODO DE VISÃO:</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['pbr', 'particles', 'wireframe'] as RenderMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSetMode(mode)}
                  style={{
                    background: renderMode === mode ? accentColor : 'transparent',
                    color: renderMode === mode ? (isDark ? '#080c0e' : '#ffffff') : fgColor,
                    border: `1px solid ${renderMode === mode ? accentColor : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                    padding: '3px 8px',
                    fontSize: 9,
                    fontFamily: 'inherit',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {mode === 'pbr' ? 'MATÉRIA' : mode === 'particles' ? 'CORPÚSCULOS' : 'RAIO-X'}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Biomas */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 4 }}>BIOMA CROMÁTICO:</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {BIOMES.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBiome(idx)}
                  title={`Ativar bioma ${b.name}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: activeBiomeIndex === idx ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: `1px solid ${activeBiomeIndex === idx ? b.hex : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    padding: '2px 6px',
                    fontSize: 9,
                    fontFamily: 'inherit',
                    borderRadius: 3,
                    color: activeBiomeIndex === idx ? b.hex : fgColor,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.hex }} />
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ opacity: 0.35, margin: '6px 0' }}>────────────────────────────</div>

          {/* Dados Técnicos em Tempo Real */}
          <div>ROTAÇÃO 3D&nbsp;&nbsp; {hudStats.rotX}° / {hudStats.rotY}°</div>
          <div>PROXIMIDADE&nbsp; {hudStats.zoom} m</div>
          <div>ENERGIA FFT&nbsp; {hudStats.fftLevel}%</div>
          <div>TOPOLOGIA&nbsp;&nbsp;&nbsp; 50K CORPÚSCULOS // PBR</div>

          <div style={{ opacity: 0.35, margin: '6px 0' }}>────────────────────────────</div>

          {/* Instruções Táteis */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.65 }}>
            <span>[ARRASTAR] GIRAR 360°</span>
            <span>[SCROLL] ZOOM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.65, marginTop: 2 }}>
            <span>[2× CLIQUE] PULSO</span>
            <button
              type="button"
              onClick={handleResetCamera}
              style={{
                background: 'none',
                border: 'none',
                color: accentColor,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 9,
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              [R] RECENTRALIZAR
            </button>
          </div>
        </aside>
      )}

      {/* Floating Mode Toggle Pill (Centro Superior) */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          gap: 6,
          background: isDark ? 'rgba(8,12,14,0.65)' : 'rgba(245,247,250,0.72)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: 20,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}
      >
        {(['pbr', 'particles', 'wireframe'] as RenderMode[]).map((mode, i) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleSetMode(mode)}
            style={{
              background: renderMode === mode ? accentColor : 'transparent',
              color: renderMode === mode ? (isDark ? '#080c0e' : '#ffffff') : (isDark ? '#cbd5e1' : '#475569'),
              border: 'none',
              borderRadius: 14,
              padding: '4px 12px',
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              fontWeight: renderMode === mode ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {`0${i + 1} · `}{mode === 'pbr' ? 'MATÉRIA' : mode === 'particles' ? 'CORPÚSCULOS' : 'RAIO-X'}
          </button>
        ))}
      </div>
    </div>
  );
};
