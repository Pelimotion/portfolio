/**
 * camera.ts — Câmera Traseira Unificada, Rastreamento Espacial por Giroscópio e Âncora AR
 */

import * as THREE from 'three';

export interface SpatialRotation {
  pitch: number; // Delta rotação X (rad)
  yaw: number;   // Delta rotação Y (rad)
  roll: number;  // Delta rotação Z (rad)
  isTracking: boolean;
}

export class CameraManager {
  private videoEl: HTMLVideoElement;
  private visionCanvas: HTMLCanvasElement;
  private visionCtx: CanvasRenderingContext2D | null = null;
  public stream: MediaStream | null = null;
  private wakeLock: any = null;

  // Estado do Giroscópio
  private currentRaw = { alpha: 0, beta: 0, gamma: 0 };
  private anchorRaw = { alpha: 0, beta: 0, gamma: 0 };
  private isAnchored: boolean = false;
  private gyroSupported: boolean = false;

  // Rotação suavizada (LERP)
  public rotation: SpatialRotation = {
    pitch: 0,
    yaw: 0,
    roll: 0,
    isTracking: false
  };

  constructor(videoElement: HTMLVideoElement, visionCanvas: HTMLCanvasElement) {
    this.videoEl = videoElement;
    this.visionCanvas = visionCanvas;
    this.visionCanvas.width = 64;
    this.visionCanvas.height = 64;
    this.visionCtx = this.visionCanvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Inicia Câmera Traseira e Microfone em UMA ÚNICA chamada getUserMedia
   * Isso evita cancelamento mútuo ou erros de permissão duplicada no Android/iOS
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
      console.warn('[CameraManager] Falha ao capturar vídeo+áudio juntos, tentando vídeo isolado:', unifiedErr);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch (fallbackErr) {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    this.videoEl.srcObject = this.stream;
    await this.videoEl.play();

    // Mantém a tela ligada durante a visualização na galeria
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

      this.currentRaw.alpha = e.alpha ?? 0;
      this.currentRaw.beta  = e.beta;
      this.currentRaw.gamma = e.gamma;
      this.gyroSupported = true;

      // Se ainda não estiver ancorado manualmente, define a pose atual como referência
      if (!this.isAnchored) {
        this.anchorRaw = { ...this.currentRaw };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    // Em alguns navegadores Android modernos, deviceorientationabsolute é mais estável
    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, { passive: true });
  }

  /**
   * Trava a âncora espacial na orientação física atual da parede de projeção
   */
  public lockSpatialAnchor(): void {
    this.anchorRaw = { ...this.currentRaw };
    this.isAnchored = true;
    this.rotation.pitch = 0;
    this.rotation.yaw = 0;
    this.rotation.roll = 0;
    this.rotation.isTracking = true;
    console.log('[CameraManager] Âncora espacial travada na parede:', this.anchorRaw);
  }

  public resetSpatialAnchor(): void {
    this.anchorRaw = { ...this.currentRaw };
    this.isAnchored = false;
    this.rotation.pitch = 0;
    this.rotation.yaw = 0;
    this.rotation.roll = 0;
  }

  /**
   * Atualiza a rotação relativa a cada frame com suavização LERP
   */
  public updateOrientation(): void {
    if (!this.gyroSupported) return;

    // Diferença angular com tratamento de descontinuidade 0-360° (wrap-around)
    const degToRad = Math.PI / 180;

    const diffAlpha = (this.currentRaw.alpha - this.anchorRaw.alpha) * degToRad;
    const diffBeta  = (this.currentRaw.beta - this.anchorRaw.beta) * degToRad;
    const diffGamma = (this.currentRaw.gamma - this.anchorRaw.gamma) * degToRad;

    // Normaliza delta de yaw no intervalo [-PI, PI]
    const deltaYaw   = Math.atan2(Math.sin(diffAlpha), Math.cos(diffAlpha));
    const deltaPitch = diffBeta;
    const deltaRoll  = diffGamma;

    // Suavização exponencial para filtrar tremulação natural das mãos
    const lerpFactor = 0.22;
    this.rotation.pitch += (deltaPitch - this.rotation.pitch) * lerpFactor;
    this.rotation.yaw   += (deltaYaw - this.rotation.yaw) * lerpFactor;
    this.rotation.roll  += (deltaRoll - this.rotation.roll) * lerpFactor;
    this.rotation.isTracking = true;
  }

  /**
   * Analisador óptico: detecta luminância e contraste da projeção central
   */
  public analyzeProjectionBeam(): { confidence: number; luminance: number } {
    if (!this.visionCtx || this.videoEl.readyState < 2) {
      return { confidence: 0, luminance: 0 };
    }

    const vw = this.videoEl.videoWidth;
    const vh = this.videoEl.videoHeight;
    if (vw === 0 || vh === 0) return { confidence: 0, luminance: 0 };

    const cropSize = Math.min(vw, vh) * 0.5;
    const sx = (vw - cropSize) / 2;
    const sy = (vh - cropSize) / 2;

    this.visionCtx.drawImage(this.videoEl, sx, sy, cropSize, cropSize, 0, 0, 64, 64);
    const imgData = this.visionCtx.getImageData(0, 0, 64, 64).data;

    let totalLum = 0;
    let maxLum = 0;
    let minLum = 255;
    const count = 64 * 64;

    for (let i = 0; i < imgData.length; i += 4) {
      const lum = 0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2];
      totalLum += lum;
      if (lum > maxLum) maxLum = lum;
      if (lum < minLum) minLum = lum;
    }

    const avgLum = totalLum / count;
    const contrast = maxLum - minLum;

    let score = 0;
    if (avgLum > 30 && avgLum < 240) score += 0.5;
    if (contrast > 50) score += Math.min((contrast - 50) / 100, 0.5);

    return {
      confidence: Math.min(Math.max(score, 0), 1),
      luminance: avgLum / 255
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
