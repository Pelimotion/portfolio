/**
 * particleSystem.ts — Trânsito Parede 2D → Salto 3D e Reatividade Acústica
 * Gerencia o enxame de 50.000 partículas com ShaderMaterial WebGL2.
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
    primary: new THREE.Color(0x00f0ff),
    secondary: new THREE.Color(0xd6f7ff),
    accent: new THREE.Color(0x00ffb3)
  },
  {
    id: 'titanio',
    name: 'TITÂNIO',
    primary: new THREE.Color(0xe6eff8),
    secondary: new THREE.Color(0x8ab4f8),
    accent: new THREE.Color(0xffffff)
  },
  {
    id: 'magma',
    name: 'MAGMA',
    primary: new THREE.Color(0xff8c00),
    secondary: new THREE.Color(0xffd700),
    accent: new THREE.Color(0xff3b30)
  },
  {
    id: 'espectral',
    name: 'ESPECTRAL',
    primary: new THREE.Color(0xbb66ff),
    secondary: new THREE.Color(0x00ffb3),
    accent: new THREE.Color(0x70d6ff)
  }
];

export class ARParticleSystem {
  public group: THREE.Group;
  private points!: THREE.Points;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.ShaderMaterial;

  public burstProgress: number = 0.0; // 0.0 = na parede 2D | 1.0 = saltou para 3D
  private targetBurstProgress: number = 0.0;

  private currentPrimary = new THREE.Color(0x00f0ff);
  private currentSecondary = new THREE.Color(0xd6f7ff);
  private activeBiomeIndex: number = 0;

  // Parâmetros de rotação e zoom do usuário via touch
  public userRotation = new THREE.Euler(0, 0, 0);
  public userScale: number = 1.0;
  public userPosition = new THREE.Vector3(0, 0, 0);

  constructor(scene: THREE.Scene, particleData: ParticleData) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.buildGeometry(particleData);
    this.buildMaterial();
    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);

    // Ajuste de posição padrão: o modelo fica centrado no campo visual
    this.group.position.set(0, 0, -3.5);
  }

  private buildGeometry(data: ParticleData): void {
    this.geometry = new THREE.BufferGeometry();
    const count = data.pointCount;

    // 1. Posições iniciais do buffer (começam no plano da parede Z = 0)
    const initialPositions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      initialPositions[i] = data.wallPositions[i];
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));

    // 2. Atributos da parede 2D e do fóssil 3D para interpolação na GPU
    this.geometry.setAttribute('aPosWall', new THREE.BufferAttribute(data.wallPositions, 3));
    this.geometry.setAttribute('aPosSpine', new THREE.BufferAttribute(data.spinePositions, 3));

    // 3. Índice normalizado ao longo da coluna (0 a 1) para onda cinética
    const indices = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      indices[i] = i / count;
    }
    this.geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));

    // 4. Semente pseudo-aleatória por partícula para turbulência e cintilação
    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      randoms[i] = Math.random();
    }
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
          // 1. Interpolação suave entre a parede (0.0) e o fóssil 3D (1.0)
          // Curva cúbica para desaceleração dramática
          float t = smoothstep(0.0, 1.0, uBurstProgress);
          vec3 basePos = mix(aPosWall, aPosSpine, t);

          // 2. O SALTO: impulso hiperbólico no eixo Z que ejeta as partículas da parede
          float leapArc = sin(t * 3.14159265);
          float forwardBurst = leapArc * (2.4 + aRandom.z * 1.2);
          basePos.z += forwardBurst;

          // 3. REATIVIDADE AO SOM (GRAVES):
          // Expansão volumétrica radial e empurrão Z com o subwoofer da sala
          float ribExpansion = 1.0 + (uBass * 0.45 * t);
          basePos.x *= ribExpansion;
          basePos.y *= 1.0 + (uBass * 0.25 * t);
          basePos.z += uBass * 0.7 * t; // O espinhaço avança em direção ao espectador nos graves

          // 4. REATIVIDADE AO SOM (MÉDIOS):
          // Onda senoidal cinética que viaja pela coluna vertebral como um organismo vivo
          float waveSpeed = uTime * 4.2;
          float spineWave = sin(waveSpeed + aIndex * 18.0) * (uMid * 0.35 + 0.05) * t;
          basePos.x += spineWave;
          basePos.y += cos(waveSpeed * 0.8 + aIndex * 12.0) * (uMid * 0.2) * t;

          // 5. REATIVIDADE AO SOM (AGUDOS & PICO SÚBITO):
          // Faíscas estocásticas e dispersão centrífuga
          if (uTransient > 0.1) {
            vec3 scatterDir = normalize(aRandom - 0.5);
            basePos += scatterDir * uTransient * 0.6;
          }

          // Turbulência sutil nas partículas quando na parede
          if (uBurstProgress < 0.2) {
            basePos.x += sin(uTime * 3.0 + aRandom.x * 20.0) * 0.03;
            basePos.y += cos(uTime * 2.5 + aRandom.y * 20.0) * 0.03;
          }

          vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // 6. Tamanho dos pontos ajustado por profundidade, tela e áudio
          float baseSize = mix(5.5, 7.5, aRandom.x);
          float soundSparkle = 1.0 + (uTreble * 1.4) + (uBass * 0.6);
          gl_PointSize = (baseSize * soundSparkle * uPixelRatio) / -mvPosition.z;
          gl_PointSize = clamp(gl_PointSize, 2.0, 32.0);

          // 7. Gradiente de cor e iluminação bioluminescente
          float colorBlend = aIndex + (sin(uTime * 2.0 + aIndex * 6.0) * 0.2 * uMid);
          vec3 particleColor = mix(uColorPrimary, uColorSecondary, clamp(colorBlend, 0.0, 1.0));

          // Realce de pico de agudos (brilho branco nos pontos)
          if (aRandom.y > 0.75) {
            particleColor = mix(particleColor, vec3(1.0, 1.0, 1.0), uTreble * 0.8);
          }

          vColor = particleColor;
          vAlpha = mix(0.55, 0.95, t);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Formato circular com decaimento suave (estilo corpúsculo brilhante)
          vec2 centerCoord = gl_PointCoord - vec2(0.5);
          float distSq = dot(centerCoord, centerCoord);

          if (distSq > 0.25) {
            discard;
          }

          // Gradiente radial do centro para a borda
          float glow = 1.0 - (distSq * 4.0);
          glow = pow(glow, 1.5);

          // Centro branco superbrilhante
          vec3 finalColor = mix(vColor, vec3(1.0), pow(glow, 3.5) * 0.8);

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

  public nextBiome(): void {
    this.activeBiomeIndex = (this.activeBiomeIndex + 1) % BIOMES.length;
  }

  public getActiveBiome(): BiomeTheme {
    return BIOMES[this.activeBiomeIndex];
  }

  public update(timeSec: number, audio: AudioMetrics, gyroAlpha: number = 0, gyroBeta: number = 0): void {
    // 1. Transição suave do progresso do salto
    const burstSpeed = this.targetBurstProgress > this.burstProgress ? 0.035 : 0.08;
    this.burstProgress += (this.targetBurstProgress - this.burstProgress) * burstSpeed;

    // 2. Transição suave de cor do bioma
    const targetBiome = BIOMES[this.activeBiomeIndex];
    this.currentPrimary.lerp(targetBiome.primary, 0.08);
    this.currentSecondary.lerp(targetBiome.secondary, 0.08);

    // 3. Atualiza uniforms do Shader
    const u = this.material.uniforms;
    u.uTime.value          = timeSec;
    u.uBurstProgress.value = this.burstProgress;
    u.uBass.value          = audio.bass;
    u.uMid.value           = audio.mid;
    u.uTreble.value        = audio.treble;
    u.uTransient.value     = audio.isTransient ? 1.0 : 0.0;
    u.uColorPrimary.value  = this.currentPrimary;
    u.uColorSecondary.value= this.currentSecondary;

    // 4. Aplica transformações do usuário e giroscópio (Parallax)
    this.group.rotation.x = this.userRotation.x + gyroBeta;
    this.group.rotation.y = this.userRotation.y + gyroAlpha;
    this.group.rotation.z = this.userRotation.z;

    this.group.scale.set(this.userScale, this.userScale, this.userScale);
    this.group.position.x = this.userPosition.x;
    this.group.position.y = this.userPosition.y;
    this.group.position.z = this.userPosition.z - 3.5;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
