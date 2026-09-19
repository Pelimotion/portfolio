/**
 * main.ts — Orquestrador Principal do Aplicativo Mobile AR Espinhaço
 * Integra Autenticação, Câmera Traseira, Giroscópio, Áudio FFT e Three.js
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

    // 1. Inicializa Three.js
    this.initThree(canvasEl);

    // 2. Inicializa Gerenciadores de Sensores
    this.camera = new CameraManager(videoEl, visionCanvas);
    this.audio = new AudioReactor();

    // 3. Inicializa Interface de Usuário (HUD)
    this.ui = new UIManager(hudContainer, canvasEl, {
      onUnlockAttempt: (code) => this.auth.validatePasscode(code),
      onStartExperience: async () => this.startExperience(),
      onLockProjection: () => this.lockProjection(),
      onResetAnchor: () => this.resetAnchor(),
      onSelectBiome: (idx) => this.particleSystem?.setBiome(idx),
      onTouchRotate: (dx, dy) => {
        if (this.particleSystem) {
          this.particleSystem.userRotation.y += dx;
          this.particleSystem.userRotation.x += dy;
        }
      },
      onTouchZoom: (factor) => {
        if (this.particleSystem) {
          this.particleSystem.userScale = Math.min(Math.max(this.particleSystem.userScale * factor, 0.4), 3.0);
        }
      }
    });

    // 4. Fluxo de Autenticação Inicial
    if (this.auth.isAuthorized()) {
      this.ui.hideLockScreen();
      this.ui.showPermScreen();
    } else {
      this.ui.showLockScreen();
    }

    // 5. Carrega o modelo 3D em background para inicialização instantânea
    this.preloadParticles();

    // 6. Listener de redimensionamento
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

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambLight);
  }

  private async preloadParticles(): Promise<void> {
    try {
      const data = await loadEspinhacoParticles();
      this.particleSystem = new ARParticleSystem(this.scene, data);
      console.log('[EspinhacoAR] ✓ Partículas instanciadas no espaço 3D');
    } catch (e) {
      console.error('[EspinhacoAR] Erro ao carregar partículas:', e);
    }
  }

  private async startExperience(): Promise<void> {
    // 1. Inicia câmera traseira
    await this.camera.startCamera();

    // 2. Solicita permissão do giroscópio (iOS Safari requer gesto direto)
    await this.camera.requestGyroPermission();

    // 3. Inicia captura do microfone
    await this.audio.initMicrophone();

    // 4. Inicia loop de animação
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = performance.now() * 0.001;
      this.animate();
    }
  }

  private lockProjection(): void {
    if (this.particleSystem) {
      // Dispara o salto do Espinhaço para fora da parede (+Z)
      this.particleSystem.triggerBurst();
      this.ui.lockProjection();
    }
  }

  private resetAnchor(): void {
    this.camera.resetGyroAnchor();
    if (this.particleSystem) {
      this.particleSystem.resetToWall();
      this.particleSystem.userRotation.set(0, 0, 0);
      this.particleSystem.userScale = 1.0;
    }
  }

  private animate(): void {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    this.frameCount++;
    const elapsedTime = (performance.now() * 0.001) - this.startTime;

    // 1. Atualiza áudio do microfone
    this.audio.update();

    // 2. Analisador óptico da projeção a cada 15 frames para máxima performance
    if (this.frameCount % 15 === 0) {
      const vision = this.camera.analyzeProjectionBeam();
      this.ui.updateOpticalStatus(vision.confidence);
    }

    // 3. Atualiza partículas com áudio e giroscópio
    if (this.particleSystem) {
      const gyroYaw = this.camera.gyro.yaw;
      const gyroPitch = this.camera.gyro.pitch;
      this.particleSystem.update(elapsedTime, this.audio.metrics, gyroYaw, gyroPitch);
    }

    // 4. Renderiza Three.js
    this.renderer.render(this.scene, this.threeCamera);

    // 5. Atualiza mostrador do HUD
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

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EspinhacoARApp());
} else {
  new EspinhacoARApp();
}
