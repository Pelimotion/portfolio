/**
 * main.ts — Orquestrador do Aplicativo Mobile AR Espinhaço
 * Integração de Câmera, Áudio FFT Unificado, Rastreamento Espacial e Three.js
 */

import * as THREE from 'three';
import { AuthManager } from './auth';
import { CameraManager } from './camera';
import { AudioReactor } from './audio';
import { loadEspinhacoParticles } from './pointsLoader';
import { ARParticleSystem } from './particleSystem';
import { UIManager } from './ui';

class EspinhacoARApp {
  private auth: AuthManager;
  private camera!: CameraManager;
  private audio!: AudioReactor;
  private ui!: UIManager;
  private particleSystem!: ARParticleSystem;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private threeCamera!: THREE.PerspectiveCamera;

  private isRunning: boolean = false;
  private startTime: number = 0;
  private frameCount: number = 0;

  constructor() {
    this.auth = new AuthManager();
    this.init();
  }

  private async init(): Promise<void> {
    const videoEl = document.getElementById('camera-feed') as HTMLVideoElement;
    const canvasEl = document.getElementById('ar-canvas') as HTMLCanvasElement;
    const visionCanvas = document.getElementById('vision-canvas') as HTMLCanvasElement;
    const hudContainer = document.getElementById('ar-hud') as HTMLElement;

    // 1. Configuração do Three.js WebGL2
    this.initThree(canvasEl);

    // 2. Sensores
    this.camera = new CameraManager(videoEl, visionCanvas);
    this.audio = new AudioReactor();

    // 3. Interface e Controles Táteis
    this.ui = new UIManager(hudContainer, canvasEl, {
      onUnlockAttempt: (code) => this.auth.validatePasscode(code),
      onStartExperience: async () => this.startExperience(),
      onLockProjection: () => this.lockProjection(),
      onResetAnchor: () => this.resetAnchor(),
      onSelectBiome: (idx) => this.particleSystem?.setBiome(idx),
      onTouchRotate: (dx, dy) => {
        if (this.particleSystem) {
          // Permite ao usuário girar o fóssil 3D para inspecionar de lado
          this.particleSystem.userRotation.y += dx * 1.5;
          this.particleSystem.userRotation.x += dy * 1.5;
        }
      },
      onTouchZoom: (factor) => {
        if (this.particleSystem) {
          this.particleSystem.userScale = Math.min(
            Math.max(this.particleSystem.userScale * factor, 0.4),
            2.5
          );
        }
      }
    });

    // 4. Fluxo de Autorização
    if (this.auth.isAuthorized()) {
      this.ui.hideLockScreen();
      this.ui.showPermScreen();
    } else {
      this.ui.showLockScreen();
    }

    // 5. Pré-carregamento dos 50.000 pontos
    this.preloadParticles();

    // 6. Redimensionamento de tela
    window.addEventListener('resize', () => this.onResize());
  }

  private initThree(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();

    this.threeCamera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.threeCamera.position.set(0, 0, 0);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambLight);
  }

  private async preloadParticles(): Promise<void> {
    try {
      const data = await loadEspinhacoParticles();
      this.particleSystem = new ARParticleSystem(this.scene, data);
      console.log('[EspinhacoAR] ✓ Partículas calibradas e carregadas');
    } catch (e) {
      console.error('[EspinhacoAR] Erro ao carregar partículas:', e);
    }
  }

  private async startExperience(): Promise<void> {
    // 1. Cria e descongela AudioContext SINCRONAMENTE no gesto do usuário (requisito estrito do Chrome/Safari)
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const userAudioCtx = new AudioCtx();
    if (userAudioCtx.state === 'suspended') {
      await userAudioCtx.resume();
    }

    // 2. Captura câmera traseira e microfone em uma ÚNICA chamada unificada
    const stream = await this.camera.startMedia();

    // 3. Inicializa giroscópio do celular
    await this.camera.initGyro();

    // 4. Conecta microfone com ganho otimizado
    await this.audio.initFromStream(stream, userAudioCtx);

    // 5. Inicia loop de renderização
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = performance.now() * 0.001;
      this.animate();
    }
  }

  private lockProjection(): void {
    if (this.particleSystem) {
      // Trava a orientação atual como a pose da parede de projeção
      this.camera.lockSpatialAnchor();

      // Dispara o salto do Espinhaço para fora da parede (+Z)
      this.particleSystem.triggerBurst();
      this.ui.lockProjection();
    }
  }

  private resetAnchor(): void {
    this.camera.resetSpatialAnchor();
    if (this.particleSystem) {
      this.particleSystem.resetToWall();
      this.particleSystem.userOffset.set(0, 0, 0);
      this.particleSystem.userRotation.set(0, 0, 0);
      this.particleSystem.userScale = 1.0;
    }
  }

  private animate(): void {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    this.frameCount++;
    const now = performance.now() * 0.001;
    const elapsedTime = now - this.startTime;

    // 1. Atualização do Áudio
    this.audio.update(elapsedTime);

    // 2. Atualização da orientação espacial do celular
    this.camera.updateOrientation();
    const rot = this.camera.rotation;

    if (rot.isTracking) {
      // Rastreamento de perspectiva AR: ao inclinar o celular, a câmera 3D acompanha,
      // fazendo com que o objeto pareça estar fisicamente ancorado no espaço real
      this.threeCamera.rotation.set(-rot.pitch, rot.yaw, -rot.roll, 'YXZ');
    }

    // 3. Analisador óptico a cada 15 frames
    if (this.frameCount % 15 === 0) {
      const vision = this.camera.analyzeProjectionBeam();
      this.ui.updateOpticalStatus(vision.confidence);
    }

    // 4. Atualiza animações e shader de partículas
    if (this.particleSystem) {
      this.particleSystem.update(elapsedTime, this.audio.metrics);
    }

    // 5. Renderização WebGL
    this.renderer.render(this.scene, this.threeCamera);

    // 6. Atualiza medidores no HUD
    this.ui.updateAudioDisplay(this.audio.metrics);
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.threeCamera.aspect = w / h;
    this.threeCamera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EspinhacoARApp());
} else {
  new EspinhacoARApp();
}
