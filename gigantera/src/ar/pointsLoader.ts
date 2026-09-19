/**
 * pointsLoader.ts — Carregador de Alta Performance das Partículas do Espinhaço
 * Carrega preferencialmente o buffer binário pré-amostrado (586KB) para renderização
 * instantânea no celular, com fallback transparente para o modelo 3D GLB completo.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

export const PARTICLE_COUNT = 50_000;

export interface ParticleData {
  spinePositions: Float32Array; // Posições 3D da vértebra/fóssil
  wallPositions: Float32Array;  // Posições iniciais 2D chapadas na parede de projeção (Z = 0)
  pointCount: number;
}

export async function loadEspinhacoParticles(
  onProgress?: (ratio: number, message: string) => void
): Promise<ParticleData> {
  let spinePositions: Float32Array | null = null;
  const base = (import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  // 1. Tenta carregar o buffer binário de alta performance
  try {
    onProgress?.(0.2, 'Carregando malha ultra-leve de partículas…');
    const binUrl = `${cleanBase}models/espinhaco_points.bin`;
    const res = await fetch(binUrl);

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      spinePositions = new Float32Array(buffer);
      console.log(`[PointsLoader] ✓ Buffer binário carregado: ${spinePositions.length / 3} partículas`);
      onProgress?.(0.8, 'Preparando plano de projeção 2D…');
    }
  } catch (err) {
    console.warn('[PointsLoader] Buffer binário indisponível, recorrendo ao GLB:', err);
  }

  // 2. Fallback: carregar o GLB de 12MB e amostrar na hora se o binário falhou
  if (!spinePositions) {
    onProgress?.(0.3, 'Acessando modelo 3D GLB…');
    spinePositions = await sampleFromGLB(`${cleanBase}models/espinhaco.glb`, PARTICLE_COUNT, onProgress);
  }

  // 3. Gera as posições 2D da parede (Z = 0) onde as partículas aguardam a projeção
  const count = spinePositions.length / 3;
  const wallPositions = new Float32Array(count * 3);

  // Dimensões do retângulo da projeção vertical na parede calibradas com a escala do fóssil (9:16)
  const wallWidth = 0.85;
  const wallHeight = 1.50;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    // Distribuição com densidade maior em direção ao centro da projeção
    const r = Math.sqrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const u = Math.cos(theta) * r;
    const v = Math.sin(theta) * r;

    wallPositions[idx]     = u * (wallWidth * 0.5);
    wallPositions[idx + 1] = v * (wallHeight * 0.5);
    wallPositions[idx + 2] = (Math.random() - 0.5) * 0.05; // Levíssima espessura na parede (Z = 0)
  }

  onProgress?.(1.0, 'Pronto para rastreamento!');

  return {
    spinePositions,
    wallPositions,
    pointCount: count
  };
}

async function sampleFromGLB(
  url: string,
  targetCount: number,
  onProgress?: (ratio: number, message: string) => void
): Promise<Float32Array> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await new Promise<{ scene: THREE.Object3D }>((resolve, reject) => {
    loader.load(url, (g) => resolve(g as any), undefined, reject);
  });

  onProgress?.(0.6, 'Extraindo geometria das vértebras…');

  const meshes: THREE.Mesh[] = [];
  gltf.scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geom = mesh.geometry.clone();
      geom.applyMatrix4(mesh.matrixWorld);
      meshes.push(new THREE.Mesh(geom, new THREE.MeshBasicMaterial()));
    }
  });

  if (meshes.length === 0) {
    throw new Error('Nenhuma malha 3D encontrada no modelo GLB');
  }

  const mainMesh = meshes[0];
  const box = new THREE.Box3().setFromBufferAttribute(mainMesh.geometry.attributes.position as THREE.BufferAttribute);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const targetSize = 1.45;
  const scale = targetSize / maxDim;

  mainMesh.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  mainMesh.geometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  mainMesh.geometry.applyMatrix4(new THREE.Matrix4().makeScale(-scale, scale, scale));

  onProgress?.(0.85, 'Amostrando superfície orgânica…');

  const sampler = new MeshSurfaceSampler(mainMesh).build();
  const positions = new Float32Array(targetCount * 3);
  const tmp = new THREE.Vector3();

  for (let i = 0; i < targetCount; i++) {
    sampler.sample(tmp);
    positions[i * 3]     = tmp.x;
    positions[i * 3 + 1] = tmp.y;
    positions[i * 3 + 2] = tmp.z;
  }

  meshes.forEach((m) => {
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
  });

  return positions;
}
