/**
 * particleSystem.ts — Trânsito Parede 2D → Salto 3D e Reatividade Acústica
 * Gerencia o enxame de 50.000 partículas com ShaderMaterial WebGL2 calibrado.
 */

import * as THREE from 'three';
import { ParticleData } from './pointsLoader';
import { AudioMetrics } from './audio';

export interface BiomeTheme {
  id: string;
  name: string;
  primary: THREE.Color;
  secondary: THREE.Color;
  accent: THREE.Color;
}

export const BIOMES: BiomeTheme[] = [
  {
    id: 'abissal',
    name: 'ABISSAL',
    primary: new THREE.Color(0x00e5ff),
    secondary: new THREE.Color(0xd8f4ff),
    accent: new THREE.Color(0x00ffb3)
  },
  {
    id: 'titanio',
    name: 'TITÂNIO',
    primary: new THREE.Color(0xf0f6fc),
    secondary: new THREE.Color(0x9fc5e8),
    accent: new THREE.Color(0xffffff)
  },
  {
    id: 'magma',
    name: 'MAGMA',
    primary: new THREE.Color(0xff7b00),
    secondary: new THREE.Color(0xffe066),
    accent: new THREE.Color(0xff3344)
  },
  {
    id: 'espectral',
    name: 'ESPECTRAL',
    primary: new THREE.Color(0xb84dff),
    secondary: new THREE.Color(0x00ffcc),
    accent: new THREE.Color(0x5eead4)
  }
];

export class ARParticleSystem {
  public group: THREE.Group;
  private points!: THREE.Points;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.ShaderMaterial;

  public burstProgress: number = 0.0; // 0.0 = na parede | 1.0 = saltou para 3D
  private targetBurstProgress: number = 0.0;

  private currentPrimary = new THREE.Color(0x00e5ff);
  private currentSecondary = new THREE.Color(0xd8f4ff);
  private activeBiomeIndex: number = 0;

  // Ajustes táteis do usuário (toque na tela para reposicionar)
  public userOffset = new THREE.Vector3(0, 0, 0);
  public userScale: number = 1.0;
  public userRotation = new THREE.Euler(0, 0, 0);

  constructor(scene: THREE.Scene, particleData: ParticleData) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.buildGeometry(particleData);
    this.buildMaterial();
    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);

    // Posicionamento base na parede diante da câmera
    this.group.position.set(0, 0, -3.2);
  }

  private buildGeometry(data: ParticleData): void {
    this.geometry = new THREE.BufferGeometry();
    const count = data.pointCount;

    const initialPositions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      initialPositions[i] = data.wallPositions[i];
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    this.geometry.setAttribute('aPosWall', new THREE.BufferAttribute(data.wallPositions, 3));
    this.geometry.setAttribute('aPosSpine', new THREE.BufferAttribute(data.spinePositions, 3));

    const indices = new Float32Array(count);
    for (let i = 0; i < count; i++) indices[i] = i / count;
    this.geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));

    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) randoms[i] = Math.random();
    this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
  }

  private buildMaterial(): void {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0 },
        uBurstProgress: { value: 0 },
        uBass:          { value: 0 },
        uMid:           { value: 0 },
        uTreble:        { value: 0 },
        uTransient:     { value: 0 },
        uColorPrimary:  { value: this.currentPrimary },
        uColorSecondary:{ value: this.currentSecondary },
        uPixelRatio:    { value: Math.min(window.devicePixelRatio || 1, 2) }
      },
      vertexShader: `
        attribute vec3 aPosWall;
        attribute vec3 aPosSpine;
        attribute float aIndex;
        attribute vec3 aRandom;

        uniform float uTime;
        uniform float uBurstProgress;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uTransient;
        uniform vec3  uColorPrimary;
        uniform vec3  uColorSecondary;
        uniform float uPixelRatio;

        varying vec3  vColor;
        varying float vAlpha;

        void main() {
          float t = smoothstep(0.0, 1.0, uBurstProgress);
          vec3 basePos = mix(aPosWall, aPosSpine, t);

          // O SALTO: impulso que ejeta as partículas para fora da parede (Z = 0)
          // e as mantém flutuando à frente no espaço (+Z)
          float leapArc = sin(t * 3.14159265);
          float settleZ = t * 0.75;
          float forwardBurst = leapArc * (1.6 + aRandom.z * 0.8);
          basePos.z += settleZ + forwardBurst;

          // REATIVIDADE A GRAVES: respiração volumétrica e solavanco de profundidade
          float ribExpansion = 1.0 + (uBass * 0.28 * t);
          basePos.x *= ribExpansion;
          basePos.y *= 1.0 + (uBass * 0.16 * t);
          basePos.z += uBass * 0.45 * t;

          // REATIVIDADE A MÉDIOS: onda cinética que viaja pela coluna vertebral
          float spineWave = sin(uTime * 3.8 + aIndex * 14.0) * (uMid * 0.22 + 0.03) * t;
          basePos.x += spineWave;
          basePos.y += cos(uTime * 3.2 + aIndex * 10.0) * (uMid * 0.14) * t;

          // REATIVIDADE A AGUDOS E PICOS (TRANSIENTES):
          if (uTransient > 0.05) {
            vec3 scatter = (aRandom - 0.5) * uTransient * 0.5;
            basePos += scatter;
          }

          // Turbulência sutil das partículas na parede antes do salto
          if (uBurstProgress < 0.3) {
            basePos.x += sin(uTime * 2.5 + aRandom.x * 24.0) * 0.02;
            basePos.y += cos(uTime * 2.0 + aRandom.y * 24.0) * 0.02;
          }

          vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Tamanho das partículas calibrado para corpúsculos bioluminescentes delicados
          float baseSize = mix(2.4, 4.0, aRandom.x);
          float soundSparkle = 1.0 + (uTreble * 1.5) + (uBass * 0.7);
          gl_PointSize = clamp((baseSize * soundSparkle * uPixelRatio) / -mvPosition.z, 1.8, 14.0);

          // Gradiente bioluminescente ao longo das vértebras
          float colorBlend = aIndex + (sin(uTime * 1.8 + aIndex * 5.0) * 0.18 * uMid);
          vec3 particleColor = mix(uColorPrimary, uColorSecondary, clamp(colorBlend, 0.0, 1.0));

          // Realce de cintilação branca nos corpúsculos periféricos
          if (aRandom.y > 0.70) {
            particleColor = mix(particleColor, vec3(1.0), uTreble * 0.75);
          }

          vColor = particleColor;
          vAlpha = mix(0.45, 0.90, t);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          // Decaimento suave com núcleo brilhante
          float glow = 1.0 - (distSq * 4.0);
          glow = pow(glow, 1.6);
          vec3 finalColor = mix(vColor, vec3(1.0), pow(glow, 4.0) * 0.85);

          gl_FragColor = vec4(finalColor, vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }

  public triggerBurst(): void {
    this.targetBurstProgress = 1.0;
  }

  public resetToWall(): void {
    this.targetBurstProgress = 0.0;
  }

  public setBiome(index: number): void {
    this.activeBiomeIndex = index % BIOMES.length;
  }

  public update(timeSec: number, audio: AudioMetrics): void {
    const burstSpeed = this.targetBurstProgress > this.burstProgress ? 0.04 : 0.08;
    this.burstProgress += (this.targetBurstProgress - this.burstProgress) * burstSpeed;

    const targetBiome = BIOMES[this.activeBiomeIndex];
    this.currentPrimary.lerp(targetBiome.primary, 0.08);
    this.currentSecondary.lerp(targetBiome.secondary, 0.08);

    const u = this.material.uniforms;
    u.uTime.value          = timeSec;
    u.uBurstProgress.value = this.burstProgress;
    u.uBass.value          = audio.bass;
    u.uMid.value           = audio.mid;
    u.uTreble.value        = audio.treble;
    u.uTransient.value     = audio.isTransient ? 1.0 : 0.0;
    u.uColorPrimary.value  = this.currentPrimary;
    u.uColorSecondary.value= this.currentSecondary;

    // Posicionamento ajustável por toque
    this.group.position.x = this.userOffset.x;
    this.group.position.y = this.userOffset.y;
    this.group.position.z = -3.2 + this.userOffset.z;

    this.group.rotation.x = this.userRotation.x;
    this.group.rotation.y = this.userRotation.y;
    this.group.rotation.z = this.userRotation.z;

    this.group.scale.set(this.userScale, this.userScale, this.userScale);
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
