/**
 * PLAYER CONTROLLER — Física e Jogabilidade de Game Web 3D (Primeira Pessoa / FPS)
 * Suporta movimentação fluida (WASD, Setas, Shift para correr), mouse look livre com Pointer Lock,
 * pitch/yaw clamping suave, head bobbing, amortecimento por fricção, limites espaciais da galeria
 * e bloqueio inteligente de rotação ao interagir com o CD na mão ou modais.
 */

import * as THREE from 'three';
import { soundEngine } from './soundEngine';
import { useAppStore } from './store';

export interface PlayerControlsConfig {
  walkSpeed: number;
  sprintMultiplier: number;
  friction: number;
  mouseSensitivity: number;
  bobIntensity: number;
  minZ: number;
  maxZ: number;
  minX: number;
  maxX: number;
}

const DEFAULT_CONFIG: PlayerControlsConfig = {
  walkSpeed: 10.5,
  sprintMultiplier: 1.65,
  friction: 0.88,
  mouseSensitivity: 0.0022,
  bobIntensity: 0.035,
  minZ: -102.0,
  maxZ: 25.0,
  minX: -12.5,
  maxX: 12.5
};

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public config: PlayerControlsConfig;

  // Vetores de posição e física
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;

  // Ângulos de rotação Euler
  public yaw: number = 0; // Rotação horizontal
  public pitch: number = 0; // Inclinação vertical

  // Estados de teclas
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };

  // Head Bobbing e passos
  private stepTimer: number = 0;
  public headBobX: number = 0;
  public headBobY: number = 0;
  private lastFootstepTime: number = 0;
  private forwardHoldTime: number = 0; // Aceleração dinâmica e orgânica de passada ao caminhar continuo
  private isPointerDown: boolean = false;
  private prevMouseX: number = -1; // -1 = nunca inicializado
  private prevMouseY: number = -1;
  public isLocked: boolean = false;
  // Flag que indica que o usuário deu pelo menos 1 clique intencional no canvas 3D
  private hasClickedCanvas: boolean = false;

  // Interação e Callbacks
  public onInteract?: () => void;
  public onCancelAction?: () => void;
  public onToggleArchive?: () => void;
  public onToggleGuide?: () => void;
  public onPlayerActivity?: () => void;
  public onFlipCD?: () => void;
  public onEscape?: () => void;
  public onScrollCD?: (delta: number) => void;
  public onStepTrackCD?: (step: number) => void;
  public onPointerLockChange?: (locked: boolean) => void;
  public onNextStill?: () => void;
  public onPrevStill?: () => void;
  public onResetStillZoom?: () => void;
  public onToggleVideoAudio?: () => void;
  public onTouchTap?: (clientX: number, clientY: number) => void;
  public onSectorSelect?: (sectorNum: 1 | 2 | 3 | 4) => void;

  public isHoldingCD: boolean = false;
  public isCinemaActive: boolean = false;
  public isArchiveActive: boolean = false;

  // Sistema de Vôo Cinemático Suave (Glide para Waypoints / Obras)
  public glideTarget: { x: number; z: number; targetYaw?: number } | null = null;
  public isGliding: boolean = false;
  public obstacles: { x: number; z: number; radius: number }[] = [];

  // Sistema de Giroscópio (Janela Mágica Mobile)
  public isGyroActive: boolean = false;
  private gyroCalibrated: boolean = false;
  private gyroBaseAlpha: number = 0;
  private gyroBaseBeta: number = 0;
  private gyroTargetYaw: number = 0;
  private gyroTargetPitch: number = 0;
  private curGyroYaw: number = 0;
  private curGyroPitch: number = 0;

  public triggerHaptic(duration: number | number[] = 12): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration as any);
      } catch {}
    }
  }

  public glideTo(x: number, z: number, targetYaw?: number): void {
    this.glideTarget = { x, z, targetYaw };
    this.isGliding = true;
    this.triggerHaptic(15);
  }

  public stopGlide(): void {
    this.isGliding = false;
    this.glideTarget = null;
  }

  public setGyroActive(active: boolean): void {
    this.isGyroActive = active;
    if (active) {
      this.gyroCalibrated = false;
      this.triggerHaptic([10, 30, 15]);
    } else {
      this.curGyroYaw = 0;
      this.curGyroPitch = 0;
    }
  }

  public static async requestOrientationPermission(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        return response === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  }

  public updateBounds(bounds: { minZ: number; maxZ: number; minX: number; maxX: number }): void {
    this.config.minZ = bounds.minZ;
    this.config.maxZ = bounds.maxZ;
    this.config.minX = bounds.minX;
    this.config.maxX = bounds.maxX;
  }

  private domElement: HTMLElement;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, config?: Partial<PlayerControlsConfig>) {
    this.camera = camera;
    this.domElement = domElement;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.position = camera.position.clone();
    this.velocity = new THREE.Vector3();

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.domElement.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.domElement.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    // Touch support para mobile
    this.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.domElement.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.domElement.addEventListener('touchend', this.handleTouchEnd);

    // Giroscópio / Sensor de Movimento Orientacional
    window.addEventListener('deviceorientation', this.handleDeviceOrientation);
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.domElement.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.domElement.removeEventListener('wheel', this.handleWheel);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);

    this.domElement.removeEventListener('touchstart', this.handleTouchStart);
    this.domElement.removeEventListener('touchmove', this.handleTouchMove);
    this.domElement.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
  }

  private getLockTarget(): HTMLElement {
    return (this.domElement.querySelector('canvas') as HTMLElement) || this.domElement;
  }

  private handlePointerLockChange = (): void => {
    const lockEl = document.pointerLockElement;
    this.isLocked = Boolean(
      lockEl && (lockEl === this.domElement || this.domElement.contains(lockEl) || lockEl === document.body)
    );
    if (this.onPointerLockChange) {
      this.onPointerLockChange(this.isLocked);
    }
    if (!this.isLocked) {
      this.isPointerDown = false;
    } else {
      // Pointer Lock recém concedido: reseta deltas para evitar salto na câmera
      // O próximo mousemove usará e.movementX/Y limpos em vez de delta com prevMouseX
      this.prevMouseX = -1;
      this.prevMouseY = -1;
    }
  };

  public requestLock(): void {
    if (this.isHoldingCD || this.isCinemaActive || useAppStore.getState().isMobile) return;
    if (!this.domElement || !this.domElement.isConnected) return;
    const target = this.getLockTarget();
    if (!this.isLocked) {
      try {
        const p = (target.requestPointerLock || this.domElement.requestPointerLock).call(target) as any;
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {
        // Ignora caso bloqueado pelo navegador
      }
    }
  }

  public exitLock(): void {
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // Ignora
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Ignora inputs se o usuário estiver digitando em um input HTML
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (this.isHoldingCD) {
          if (this.onStepTrackCD) this.onStepTrackCD(-1);
          return;
        }
        this.keys.forward = true;
        if (this.onPlayerActivity) this.onPlayerActivity();
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (this.isHoldingCD) {
          if (this.onStepTrackCD) this.onStepTrackCD(1);
          return;
        }
        this.keys.backward = true;
        if (this.onPlayerActivity) this.onPlayerActivity();
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (this.isCinemaActive) {
          if (this.onPrevStill) this.onPrevStill();
          return;
        }
        if (this.isHoldingCD) {
          if (this.onFlipCD) this.onFlipCD();
          return;
        }
        this.keys.left = true;
        if (this.onPlayerActivity) this.onPlayerActivity();
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (this.isCinemaActive) {
          if (this.onNextStill) this.onNextStill();
          return;
        }
        if (this.isHoldingCD) {
          if (this.onFlipCD) this.onFlipCD();
          return;
        }
        this.keys.right = true;
        if (this.onPlayerActivity) this.onPlayerActivity();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        if (this.onPlayerActivity) this.onPlayerActivity();
        break;
      case 'KeyE':
        if (this.isCinemaActive || this.isHoldingCD) {
          this.isCinemaActive = false;
          this.isHoldingCD = false;
          this.prevMouseX = 0;
          this.prevMouseY = 0;
          if (this.onCancelAction) this.onCancelAction();
          this.requestLock();
        } else if (this.onInteract) {
          this.onInteract();
        }
        break;
      case 'KeyQ':
        if (this.isCinemaActive || this.isHoldingCD) {
          this.isCinemaActive = false;
          this.isHoldingCD = false;
          this.prevMouseX = 0;
          this.prevMouseY = 0;
          if (this.onCancelAction) this.onCancelAction();
          this.requestLock();
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (this.onToggleArchive) this.onToggleArchive();
        break;
      case 'KeyH':
        if (this.onToggleGuide) this.onToggleGuide();
        break;
      case 'KeyF':
        if (this.onFlipCD) this.onFlipCD();
        break;
      case 'KeyR':
        if (this.isCinemaActive && this.onResetStillZoom) {
          this.onResetStillZoom();
        }
        break;
      case 'KeyI':
        if (this.isCinemaActive) {
          e.preventDefault();
          useAppStore.getState().toggleCinemaInfo();
        }
        break;
      case 'KeyM':
        if (this.isCinemaActive && this.onToggleVideoAudio) {
          this.onToggleVideoAudio();
        }
        break;
      default:
        // Handle e.key for characters that might not map to the expected e.code on some layouts
        if (e.key.toLowerCase() === 'i') {
          if (this.isCinemaActive) {
            e.preventDefault();
            useAppStore.getState().toggleCinemaInfo();
          }
        }
        break;
    }
    
    switch (e.code) {
      case 'Digit1':
      case 'Numpad1':
        if (!this.isCinemaActive && !this.isHoldingCD) {
          if (this.onSectorSelect) this.onSectorSelect(1);
        }
        break;
      case 'Digit2':
      case 'Numpad2':
        if (!this.isCinemaActive && !this.isHoldingCD) {
          if (this.onSectorSelect) this.onSectorSelect(2);
        }
        break;
      case 'Digit3':
      case 'Numpad3':
        if (!this.isCinemaActive && !this.isHoldingCD) {
          if (this.onSectorSelect) this.onSectorSelect(3);
        }
        break;
      case 'Digit4':
      case 'Numpad4':
        if (!this.isCinemaActive && !this.isHoldingCD) {
          if (this.onSectorSelect) this.onSectorSelect(4);
        }
        break;
      case 'BracketLeft':
        useAppStore.getState().stepDJFilter(-1);
        soundEngine.playTactileHoverTick();
        break;
      case 'BracketRight':
        useAppStore.getState().stepDJFilter(1);
        soundEngine.playTactileHoverTick();
        break;
      case 'Digit0':
      case 'Numpad0':
        if (!this.isCinemaActive && !this.isHoldingCD) {
          useAppStore.getState().resetDJFilter();
          soundEngine.playTactileHoverTick();
        }
        break;
      case 'Escape':
        if (this.isCinemaActive || this.isHoldingCD) {
          this.isCinemaActive = false;
          this.isHoldingCD = false;
          this.prevMouseX = 0;
          this.prevMouseY = 0;
          if (this.onCancelAction) this.onCancelAction();
          return;
        }
        if (this.onEscape) {
          this.onEscape();
        }
        if (this.isLocked) {
          this.exitLock();
        }
        break;
    }
  };

  public resumeAimControl(): void {
    this.isHoldingCD = false;
    this.isCinemaActive = false;
    this.prevMouseX = -1;
    this.prevMouseY = -1;
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    // Se estiver segurando o CD na mão, em modo cinema ou no modo acervo, NÃO captura rotação de câmera
    if (this.isHoldingCD || this.isCinemaActive || this.isArchiveActive) {
      this.isPointerDown = false;
      return;
    }

    // Não captura se o clique foi em um elemento de interface
    if ((e.target as HTMLElement).closest('button, aside, nav, .cd-viewmodel-hud-dock, .cinema-backdrop, .modal-backdrop, header, footer, [role="dialog"], .archive-portfolio-overlay')) {
      return;
    }

    if (e.button === 0) {
      this.isPointerDown = true;
      this.hasClickedCanvas = true; // Marca intenção: o usuário clicou no espaço 3D
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      // Se o usuário clicar no espaço 3D, solicita pointer lock para controle FPS livre
      if (!this.isLocked) {
        this.requestLock();
      }
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    // CRÍTICO: Quando segurando o CD, no cinema ou no acervo, a câmera de fundo NUNCA gira!
    if (this.isHoldingCD || this.isCinemaActive || this.isArchiveActive) {
      this.prevMouseX = -1;
      this.prevMouseY = -1;
      return;
    }

    if (this.isLocked) {
      // Modo FPS puro com Pointer Lock (Giro livre 360° sem esbarrar nas bordas da janela)
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this.yaw -= movementX * this.config.mouseSensitivity;
      this.pitch -= movementY * this.config.mouseSensitivity;
      this.pitch = Math.max(-0.72, Math.min(0.72, this.pitch));
      return;
    }

    // Controle de mira contínuo (Desktop sem Pointer Lock):
    // Após o primeiro clique intencional no canvas, o mouse controla a mira suavemente
    // sem precisar manter o botão pressionado (single-click look).
    const target = e.target as HTMLElement | null;
    const isInteractiveUI = !!target?.closest?.('header, nav, aside, button, a, [role="dialog"], input, select, textarea, .modal-backdrop');
    if (isInteractiveUI) {
      // Ao entrar em UI, preserva prevMouse para não causar salto ao retornar ao canvas
      return;
    }

    // Primeiro movimento após clique: inicializa sem delta (evita salto de câmera)
    if (this.prevMouseX === -1 || this.prevMouseY === -1) {
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      return;
    }

    // Single-click look: rastreia delta de posição do mouse continuamente
    // (funciona mesmo sem botão pressionado, desde que hasClickedCanvas seja true)
    let moveX = 0;
    let moveY = 0;

    if (typeof e.movementX === 'number' && (e.movementX !== 0 || e.movementY !== 0) && Math.abs(e.movementX) < 120 && Math.abs(e.movementY) < 120) {
      moveX = e.movementX;
      moveY = e.movementY;
    } else {
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
        // Single-click: aplica delta mesmo sem botão pressionado, se já clicou no canvas
        if (this.hasClickedCanvas) {
          moveX = dx;
          moveY = dy;
        } else if (this.isPointerDown) {
          // Fallback: modo arraste clássico enquanto o botão está pressionado (antes do primeiro clique)
          moveX = dx;
          moveY = dy;
        }
      }
    }

    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    if (moveX !== 0 || moveY !== 0) {
      this.yaw -= moveX * this.config.mouseSensitivity;
      this.pitch -= moveY * this.config.mouseSensitivity;
      this.pitch = Math.max(-0.72, Math.min(0.72, this.pitch));
    }
  };

  private handleMouseUp = (): void => {
    this.isPointerDown = false;
  };

  private touchStartTime = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;

  private handleTouchStart = (e: TouchEvent): void => {
    if (this.isHoldingCD || this.isCinemaActive || this.isArchiveActive) return;
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
      this.touchMoved = false;
      this.isPointerDown = true;
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.isHoldingCD || this.isCinemaActive || this.isArchiveActive) return;
    if (!this.isPointerDown || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - this.touchStartX;
    const deltaY = e.touches[0].clientY - this.touchStartY;

    if (Math.hypot(deltaX, deltaY) > 8) {
      this.touchMoved = true;
      if (this.isGliding) {
        this.stopGlide();
      }
    }

    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;

    this.yaw -= deltaX * this.config.mouseSensitivity * 1.6;
    this.pitch -= deltaY * this.config.mouseSensitivity * 1.6;
    this.pitch = Math.max(-0.68, Math.min(0.68, this.pitch));

  };

  private handleTouchEnd = (e: TouchEvent): void => {
    this.isPointerDown = false;
    const elapsed = performance.now() - this.touchStartTime;

    // Se o toque foi rápido e sem arrasto, dispara Tap tátil para seleção e aproximação
    if (!this.touchMoved && elapsed < 280 && this.onTouchTap) {
      const clientX = e.changedTouches?.[0]?.clientX ?? this.touchStartX;
      const clientY = e.changedTouches?.[0]?.clientY ?? this.touchStartY;
      this.onTouchTap(clientX, clientY);
    }
  };

  private handleDeviceOrientation = (e: DeviceOrientationEvent): void => {
    if (!this.isGyroActive || this.isHoldingCD || this.isCinemaActive || this.isArchiveActive) return;
    if (e.beta === null || e.gamma === null) return;

    if (!this.gyroCalibrated) {
      this.gyroBaseAlpha = e.alpha ?? 0;
      this.gyroBaseBeta = e.beta;
      this.gyroCalibrated = true;
      return;
    }

    const deltaBeta = e.beta - this.gyroBaseBeta;
    const deltaGamma = e.gamma;

    // Converte inclinação suave do smartphone em offsets radianos
    const targetP = THREE.MathUtils.degToRad(Math.max(-35, Math.min(35, deltaBeta))) * 0.65;
    const targetY = THREE.MathUtils.degToRad(Math.max(-50, Math.min(50, deltaGamma))) * 0.75;

    this.gyroTargetPitch = targetP;
    this.gyroTargetYaw = targetY;
  };

  private wheelCDAccumulator = 0;
  private lastCDWheelTime = 0;

  private handleWheel = (e: WheelEvent): void => {
    if (this.isHoldingCD) {
      // Quando estiver segurando o CD na mão, o scroll da roda navega pelas faixas de forma suave e calibrada
      e.preventDefault();
      const now = performance.now();
      this.wheelCDAccumulator += e.deltaY;
      if (Math.abs(this.wheelCDAccumulator) >= 35 || (now - this.lastCDWheelTime > 160 && Math.abs(this.wheelCDAccumulator) > 6)) {
        const step = this.wheelCDAccumulator > 0 ? 1 : -1;
        this.wheelCDAccumulator = 0;
        this.lastCDWheelTime = now;
        if (this.onScrollCD) {
          this.onScrollCD(step);
        }
      }
    } else if (!this.isCinemaActive && !this.isArchiveActive) {
      // Quando livre no espaço, roda do mouse permite deslizar suavemente pelo eixo Z (calibrado para Trackpad de Mac e Mouse)
      e.preventDefault();
      const clampedDelta = Math.max(-100, Math.min(100, e.deltaY));
      const force = clampedDelta * 0.009; // Scroll mais responsivo e suave
      this.velocity.z += force;
    }
  };

  public isMoving(): boolean {
    return this.velocity.lengthSq() > 0.05 || this.isGliding;
  }

  /**
   * Atualização a cada frame do motor físico (delta time em segundos)
   */
  public update(delta: number): void {
    if (this.isCinemaActive || this.isHoldingCD || this.isArchiveActive) {
      this.velocity.set(0, 0, 0);
      this.forwardHoldTime = 0;
      if ((this.isHoldingCD || this.isArchiveActive) && this.isLocked) {
        this.exitLock();
      }
      return;
    }

    // 1. Atualização do Vôo Cinemático Suave (Glide para Waypoints / Obras)
    if (this.isGliding && this.glideTarget) {
      const dist = Math.hypot(this.position.x - this.glideTarget.x, this.position.z - this.glideTarget.z);
      this.position.x = THREE.MathUtils.lerp(this.position.x, this.glideTarget.x, 0.09);
      this.position.z = THREE.MathUtils.lerp(this.position.z, this.glideTarget.z, 0.09);

      if (this.glideTarget.targetYaw !== undefined) {
        let diffYaw = this.glideTarget.targetYaw - this.yaw;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        this.yaw += diffYaw * 0.09;
      }

      if (dist < 0.12) {
        this.isGliding = false;
        this.glideTarget = null;
      }
    }

    // Aceleração Contínua de Passada (Dynamic Stride):
    // Ao segurar W continuamente por mais de 0.8s, o passo do visitante ganha
    // embalo suave (até 1.85x), permitindo cruzar o corredor com dinamismo
    // sem exigir botões/teclas extras (Shift/Corrida). Ao soltar, reseta imediatamente.
    if (this.keys.forward && !this.keys.backward) {
      this.forwardHoldTime += delta;
    } else {
      this.forwardHoldTime = Math.max(0, this.forwardHoldTime - delta * 4.0);
    }

    const strideMultiplier = this.forwardHoldTime > 0.8
      ? Math.min(1.85, 1.0 + (this.forwardHoldTime - 0.8) * 0.85)
      : 1.0;

    const currentSpeed = this.config.walkSpeed * strideMultiplier * (this.keys.sprint ? this.config.sprintMultiplier : 1.0);

    // Vetores direcionais baseados no ângulo Yaw da câmera
    const forwardX = -Math.sin(this.yaw);
    const forwardZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);

    // Entrada direcional
    let moveDirX = 0;
    let moveDirZ = 0;

    if (this.keys.forward) {
      moveDirX += forwardX;
      moveDirZ += forwardZ;
      if (this.isGliding) this.stopGlide();
    }
    if (this.keys.backward) {
      moveDirX -= forwardX;
      moveDirZ -= forwardZ;
      if (this.isGliding) this.stopGlide();
    }
    if (this.keys.left) {
      moveDirX -= rightX;
      moveDirZ -= rightZ;
      if (this.isGliding) this.stopGlide();
    }
    if (this.keys.right) {
      moveDirX += rightX;
      moveDirZ += rightZ;
      if (this.isGliding) this.stopGlide();
    }

    // Normaliza vetor de movimento se houver movimento diagonal
    const len = Math.hypot(moveDirX, moveDirZ);
    if (len > 0.001) {
      moveDirX /= len;
      moveDirZ /= len;

      this.velocity.x += moveDirX * currentSpeed * delta * 4;
      this.velocity.z += moveDirZ * currentSpeed * delta * 4;
    }

    // Aplica fricção / amortecimento
    this.velocity.x *= this.config.friction;
    this.velocity.z *= this.config.friction;

    // Atualiza posição do jogador
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // Colisão cilíndrica com vitrines e pedestais (impede atravessar o vidro)
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const dx = this.position.x - obs.x;
      const dz = this.position.z - obs.z;
      const dist = Math.hypot(dx, dz);
      if (dist < obs.radius && dist > 0.001) {
        const overlap = obs.radius - dist;
        this.position.x += (dx / dist) * overlap;
        this.position.z += (dz / dist) * overlap;
      }
    }

    // Aplica limites das paredes da galeria
    this.position.x = Math.max(this.config.minX, Math.min(this.config.maxX, this.position.x));
    this.position.z = Math.max(this.config.minZ, Math.min(this.config.maxZ, this.position.z));

    // Head bobbing e detecção de passos
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.4 && !this.isGliding) {
      const bobFreq = this.keys.sprint ? 12.0 : 8.5;
      this.stepTimer += delta * bobFreq;
      this.headBobY = Math.sin(this.stepTimer) * this.config.bobIntensity;
      this.headBobX = Math.cos(this.stepTimer * 0.5) * (this.config.bobIntensity * 0.5);

      // Dispara som tátil de passo no piso de concreto
      const now = performance.now();
      if (Math.sin(this.stepTimer) < -0.94 && now - this.lastFootstepTime > 280) {
        soundEngine.playFootstepSound();
        this.lastFootstepTime = now;
      }
    } else {
      this.headBobY = THREE.MathUtils.lerp(this.headBobY, 0, 0.15);
      this.headBobX = THREE.MathUtils.lerp(this.headBobX, 0, 0.15);
    }

    // Amortecimento do Giroscópio
    if (this.isGyroActive) {
      this.curGyroPitch = THREE.MathUtils.lerp(this.curGyroPitch, this.gyroTargetPitch, 0.12);
      this.curGyroYaw = THREE.MathUtils.lerp(this.curGyroYaw, this.gyroTargetYaw, 0.12);
    } else {
      this.curGyroPitch = THREE.MathUtils.lerp(this.curGyroPitch, 0, 0.15);
      this.curGyroYaw = THREE.MathUtils.lerp(this.curGyroYaw, 0, 0.15);
    }

    // Aplica na câmera Three.js
    this.camera.position.x = this.position.x + this.headBobX;
    this.camera.position.y = 0.0 + this.headBobY; // Altura padrão dos olhos
    this.camera.position.z = this.position.z;

    // Aplica rotações Euler somando a navegação com o sensor de movimento
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw + this.curGyroYaw;
    this.camera.rotation.x = this.pitch + this.curGyroPitch;
  }
}
