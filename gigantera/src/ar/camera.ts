/**
 * camera.ts — Câmera Traseira Unificada, Rastreamento Espacial por Quatérnions (AR Gyro) e Analisador Óptico
 */

import * as THREE from 'three';

const _zee = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 em torno de X

/**
 * Converte DeviceOrientation (alpha, beta, gamma, orient) no quatérnion Three.js da câmera traseira
 * Elimina gimbal lock e distorção em modo retrato vertical.
 */
export function computeDeviceOrientationQuaternion(
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
  orientDeg: number = 0
): THREE.Quaternion {
  const alpha = THREE.MathUtils.degToRad(alphaDeg);
  const beta  = THREE.MathUtils.degToRad(betaDeg);
  const gamma = THREE.MathUtils.degToRad(gammaDeg);
  const orient= THREE.MathUtils.degToRad(orientDeg);

  const q = new THREE.Quaternion();
  _euler.set(beta, alpha, -gamma, 'YXZ');
  q.setFromEuler(_euler);
  q.multiply(_q1);
  q.multiply(_q0.setFromAxisAngle(_zee, -orient));
  return q;
}

export class CameraManager {
  private videoEl: HTMLVideoElement;
  private visionCanvas: HTMLCanvasElement;
  private visionCtx: CanvasRenderingContext2D | null = null;
  public stream: MediaStream | null = null;
  private wakeLock: any = null;

  // Estado do Giroscópio
  public currentQuaternion = new THREE.Quaternion();
  public targetQuaternion = new THREE.Quaternion();
  public lockQuaternion = new THREE.Quaternion();
  public isAnchored: boolean = false;
  public gyroSupported: boolean = false;

  private rawOrientation = { alpha: 0, beta: 90, gamma: 0 };
  private smoothedConfidence: number = 0.10;

  constructor(videoElement: HTMLVideoElement, visionCanvas: HTMLCanvasElement) {
    this.videoEl = videoElement;
    this.visionCanvas = visionCanvas;
    this.visionCanvas.width = 128;
    this.visionCanvas.height = 128;
    this.visionCtx = this.visionCanvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Inicia Câmera Traseira e Microfone em UMA ÚNICA chamada getUserMedia
   */
  public async startMedia(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
    } catch (unifiedErr) {
      console.warn('[CameraManager] Falha na captura unificada, recorrendo a vídeo:', unifiedErr);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    this.videoEl.srcObject = this.stream;
    await this.videoEl.play();

    this.requestWakeLock();
    return this.stream;
  }

  /**
   * Permissão e escuta de Giroscópio / DeviceOrientation
   */
  public async initGyro(): Promise<boolean> {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          this.bindGyroEvents();
          return true;
        }
      } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
        this.bindGyroEvents();
        return true;
      }
    } catch (e) {
      console.warn('[CameraManager] Erro ao registrar giroscópio:', e);
    }
    return false;
  }

  private bindGyroEvents(): void {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      this.rawOrientation.alpha = e.alpha ?? 0;
      this.rawOrientation.beta  = e.beta;
      this.rawOrientation.gamma = e.gamma;
      this.gyroSupported = true;

      const screenAngle = (screen.orientation && screen.orientation.angle) || (window.orientation as number) || 0;
      const q = computeDeviceOrientationQuaternion(
        this.rawOrientation.alpha,
        this.rawOrientation.beta,
        this.rawOrientation.gamma,
        screenAngle
      );

      this.targetQuaternion.copy(q);

      // Se ainda não inicializou o quatérnion atual, copia diretamente
      if (this.currentQuaternion.lengthSq() < 0.1) {
        this.currentQuaternion.copy(q);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, { passive: true });
  }

  /**
   * Atualiza a orientação interpolada (slerp suave para evitar jitter)
   */
  public updateOrientation(): void {
    if (!this.gyroSupported) return;
    this.currentQuaternion.slerp(this.targetQuaternion, 0.35);
  }

  /**
   * Trava a âncora espacial na orientação física atual da projeção
   */
  public lockSpatialAnchor(): THREE.Quaternion {
    this.updateOrientation();
    this.lockQuaternion.copy(this.currentQuaternion);
    this.isAnchored = true;
    console.log('[CameraManager] Âncora AR travada com quatérnion:', this.lockQuaternion);
    return this.lockQuaternion;
  }

  public resetSpatialAnchor(): void {
    this.isAnchored = false;
  }

  /**
   * Analisador óptico: compara o contraste e textura da área central (retículo 9:16)
   * com as bordas periféricas da imagem para detectar a projeção de forma autêntica.
   */
  public analyzeProjectionBeam(): { confidence: number; isDetected: boolean } {
    if (!this.visionCtx || this.videoEl.readyState < 2) {
      return { confidence: 0, isDetected: false };
    }

    const vw = this.videoEl.videoWidth;
    const vh = this.videoEl.videoHeight;
    if (vw === 0 || vh === 0) return { confidence: 0, isDetected: false };

    // Desenha o quadro reduzido no canvas de visão (128x128)
    this.visionCtx.drawImage(this.videoEl, 0, 0, 128, 128);
    const img = this.visionCtx.getImageData(0, 0, 128, 128).data;

    // Região central (aproximadamente o retângulo 9:16 vertical no meio: x: 38..90, y: 16..112)
    const cxStart = 38, cxEnd = 90;
    const cyStart = 16, cyEnd = 112;

    let centerLumSum = 0;
    let centerLumSqSum = 0;
    let centerCount = 0;
    let centerMax = 0;
    let centerMin = 255;

    let borderLumSum = 0;
    let borderCount = 0;

    for (let y = 0; y < 128; y += 2) {
      for (let x = 0; x < 128; x += 2) {
        const idx = (y * 128 + x) * 4;
        const lum = 0.2126 * img[idx] + 0.7152 * img[idx + 1] + 0.0722 * img[idx + 2];

        if (x >= cxStart && x <= cxEnd && y >= cyStart && y <= cyEnd) {
          centerLumSum += lum;
          centerLumSqSum += lum * lum;
          centerCount++;
          if (lum > centerMax) centerMax = lum;
          if (lum < centerMin) centerMin = lum;
        } else if (x < 24 || x > 104 || y < 12 || y > 116) {
          // Borda periférica da sala/parede
          borderLumSum += lum;
          borderCount++;
        }
      }
    }

    if (centerCount === 0 || borderCount === 0) {
      return { confidence: 0, isDetected: false };
    }

    const avgCenter = centerLumSum / centerCount;
    const variance = (centerLumSqSum / centerCount) - (avgCenter * avgCenter);
    const stdDev = Math.sqrt(Math.max(variance, 0));
    const avgBorder = borderLumSum / borderCount;
    const centerContrast = centerMax - centerMin;

    // 1. Razão de contraste entre o centro e a periferia (o feixe projetado é mais claro que o ambiente)
    const beamRatio = avgCenter / (avgBorder + 8.0);

    let rawScore = 0.0;

    // Se o centro se destaca da periferia:
    if (beamRatio > 1.20) {
      rawScore += Math.min((beamRatio - 1.20) * 0.8, 0.45);
    }

    // Se há alta textura/arestas internas (vértebras e costelas contrastadas):
    if (stdDev > 22) {
      rawScore += Math.min((stdDev - 22) / 45, 0.35);
    }

    // Se a faixa dinâmica interna do retângulo é ampla:
    if (centerContrast > 70) {
      rawScore += Math.min((centerContrast - 70) / 120, 0.20);
    }

    // Filtro LERP suave para não ter oscilação nervosa no visor
    this.smoothedConfidence += (rawScore - this.smoothedConfidence) * 0.25;
    const finalConfidence = Math.min(Math.max(this.smoothedConfidence, 0), 1);

    return {
      confidence: finalConfidence,
      isDetected: finalConfidence >= 0.70
    };
  }

  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // Ignore
    }
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }
}
