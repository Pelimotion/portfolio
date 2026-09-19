/**
 * camera.ts — Gerenciamento da Câmera Traseira, Giroscópio (Parallax) e Detecção Óptica
 */

export interface GyroState {
  pitch: number; // Radianos X
  yaw: number;   // Radianos Y
  roll: number;  // Radianos Z
  available: boolean;
}

export class CameraManager {
  private videoEl: HTMLVideoElement;
  private visionCanvas: HTMLCanvasElement;
  private visionCtx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private wakeLock: any = null;

  public gyro: GyroState = {
    pitch: 0,
    yaw: 0,
    roll: 0,
    available: false
  };

  private initialGyro: { pitch: number; yaw: number; roll: number } | null = null;

  constructor(videoElement: HTMLVideoElement, visionCanvas: HTMLCanvasElement) {
    this.videoEl = videoElement;
    this.visionCanvas = visionCanvas;
    this.visionCanvas.width = 64;
    this.visionCanvas.height = 64;
    this.visionCtx = this.visionCanvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Inicia o fluxo de vídeo da câmera traseira (environment)
   */
  public async startCamera(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();

      // Solicita Screen Wake Lock para impedir que o celular apague a tela na galeria
      this.requestWakeLock();
    } catch (err) {
      console.warn('[CameraManager] Erro ao iniciar câmera traseira:', err);
      // Fallback para qualquer câmera disponível
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.videoEl.srcObject = this.stream;
        await this.videoEl.play();
      } catch (fallbackErr) {
        console.error('[CameraManager] Falha crítica ao acessar vídeo:', fallbackErr);
        throw fallbackErr;
      }
    }
  }

  /**
   * Solicita permissão do giroscópio (iOS Safari requer requestPermission)
   */
  public async requestGyroPermission(): Promise<boolean> {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          this.bindGyroListener();
          return true;
        }
        return false;
      } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
        this.bindGyroListener();
        return true;
      }
    } catch (e) {
      console.warn('[CameraManager] Permissão de giroscópio não suportada ou negada:', e);
    }
    return false;
  }

  private bindGyroListener(): void {
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      const pitchDeg = e.beta;  // [-180, 180]
      const rollDeg = e.gamma;  // [-90, 90]
      const yawDeg = e.alpha ?? 0; // [0, 360]

      const pitchRad = (pitchDeg * Math.PI) / 180;
      const rollRad = (rollDeg * Math.PI) / 180;
      const yawRad = (yawDeg * Math.PI) / 180;

      if (!this.initialGyro) {
        this.initialGyro = { pitch: pitchRad, yaw: yawRad, roll: rollRad };
      }

      // Delta suave a partir da posição inicial
      const deltaPitch = pitchRad - this.initialGyro.pitch;
      const deltaRoll = rollRad - this.initialGyro.roll;
      const deltaYaw = yawRad - this.initialGyro.yaw;

      this.gyro.pitch = deltaPitch * 0.4;
      this.gyro.roll = deltaRoll * 0.4;
      this.gyro.yaw = deltaYaw * 0.4;
      this.gyro.available = true;
    }, { passive: true });
  }

  public resetGyroAnchor(): void {
    this.initialGyro = null;
  }

  /**
   * Analisador óptico: avalia o centro da imagem para detectar contraste
   * e intensidade de luz característicos de uma projeção de vídeo na parede.
   * Retorna um índice de confiança de 0.0 a 1.0.
   */
  public analyzeProjectionBeam(): { confidence: number; luminance: number } {
    if (!this.visionCtx || this.videoEl.readyState < 2) {
      return { confidence: 0, luminance: 0 };
    }

    const vw = this.videoEl.videoWidth;
    const vh = this.videoEl.videoHeight;
    if (vw === 0 || vh === 0) return { confidence: 0, luminance: 0 };

    // Enquadra o quadrado central 50%
    const cropSize = Math.min(vw, vh) * 0.5;
    const sx = (vw - cropSize) / 2;
    const sy = (vh - cropSize) / 2;

    this.visionCtx.drawImage(
      this.videoEl,
      sx, sy, cropSize, cropSize,
      0, 0, 64, 64
    );

    const imgData = this.visionCtx.getImageData(0, 0, 64, 64).data;
    let totalLum = 0;
    let maxLum = 0;
    let minLum = 255;
    const count = 64 * 64;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      // Luminância ITU-R BT.709
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      totalLum += lum;
      if (lum > maxLum) maxLum = lum;
      if (lum < minLum) minLum = lum;
    }

    const avgLum = totalLum / count;
    const contrast = maxLum - minLum;

    // Em ambiente escuro com projeção, a luminância média varia entre 40 e 200,
    // e o contraste local é significativo (> 70)
    let score = 0;
    if (avgLum > 35 && avgLum < 235) {
      score += 0.5;
    }
    if (contrast > 60) {
      score += Math.min((contrast - 60) / 100, 0.5);
    }

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
    } catch (e) {
      console.warn('[CameraManager] WakeLock não disponível:', e);
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
