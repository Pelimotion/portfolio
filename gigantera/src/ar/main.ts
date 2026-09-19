/**
 * main.ts — Orquestrador do Aplicativo Mobile AR Espinhaço
 * Integração de Câmera, Áudio FFT Unificado, Rastreamento Espacial por Quatérnions e Three.js
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

    // 5. Pré-carregamento das partículas
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
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const userAudioCtx = new AudioCtx();
    if (userAudioCtx.state === 'suspended') {
      await userAudioCtx.resume();
    }

    const stream = await this.camera.startMedia();
    await this.camera.initGyro();
    await this.audio.initFromStream(stream, userAudioCtx);

    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = performance.now() * 0.001;
      this.animate();
    }
  }

  private lockProjection(): void {
    if (!this.particleSystem) return;

    // 1. Memoriza a orientação do celular no exato instante do travamento
    const lockQuat = this.camera.lockSpatialAnchor();

    // 2. Calcula o vetor frontal no espaço do mundo (direção para a qual o celular aponta)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(lockQuat);

    // 3. Posiciona a âncora do fóssil a exatamente 3.0 metros na direção da parede
    const wallPos = forward.clone().multiplyScalar(3.0);

    // 4. Ancoragem do grupo de partículas nas coordenadas mundiais
    this.particleSystem.anchorToWorld(wallPos, lockQuat);

    // 5. Atualiza o HUD
    this.ui.lockProjection();
    console.log('[EspinhacoAR] ✓ Projeção ancorada na parede em:', wallPos);
  }

  private resetAnchor(): void {
    this.camera.resetSpatialAnchor();
    if (this.particleSystem) {
      this.particleSystem.resetToWall();
    }
    this.threeCamera.quaternion.identity();
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

    if (this.camera.isAnchored && this.camera.gyroSupported) {
      // Quando ancorado, a câmera 3D orienta-se no espaço físico pelo giroscópio,
      // mantendo o fóssil imóvel diante da parede física em 3D
      this.threeCamera.quaternion.copy(this.camera.currentQuaternion);
    } else {
      this.threeCamera.quaternion.identity();
    }

    // 3. Analisador óptico a cada 10 frames
    if (this.frameCount % 10 === 0) {
      const vision = this.camera.analyzeProjectionBeam();
      this.ui.updateOpticalStatus(vision.confidence, vision.isDetected);
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
