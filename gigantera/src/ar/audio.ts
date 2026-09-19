/**
 * audio.ts — Captura do Microfone e Análise Espectral FFT em Tempo Real
 */

export interface AudioMetrics {
  bass: number;       // [0, 1] — kick, sub, graves
  mid: number;        // [0, 1] — vozes, instrumentos, ambiência
  treble: number;     // [0, 1] — agudos, ar, estalos
  volume: number;     // [0, 1] — RMS normalizado
  decibels: number;   // Estimativa em dB [-60, 0]
  isTransient: boolean; // Pico súbito (palmas, batidas fortes)
  frequencyData: Uint8Array;
}

export class AudioReactor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array = new Uint8Array(256);
  private lastVolume: number = 0;

  public metrics: AudioMetrics = {
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    decibels: -60,
    isTransient: false,
    frequencyData: new Uint8Array(256)
  };

  /**
   * Inicia o microfone e o contexto de áudio em resposta a um clique do usuário
   */
  public async initMicrophone(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Tenta capturar sem supressão de ruído para máxima fidelidade artística
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
      } catch {
        // Fallback para permissão padrão de áudio
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const source = this.ctx.createMediaStreamSource(this.micStream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.75;

      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.metrics.frequencyData = this.dataArray;
    } catch (err) {
      console.warn('[AudioReactor] Não foi possível capturar microfone:', err);
      // O app continua funcionando mesmo se o usuário recusar o microfone (modo silencioso/autônomo)
    }
  }

  /**
   * Atualiza as métricas espectrais no loop de animação
   */
  public update(): void {
    if (!this.analyser) {
      // Modulação sutil autônoma para quando o microfone não estiver disponível
      const t = performance.now() * 0.002;
      this.metrics.bass = 0.15 + Math.sin(t * 2) * 0.08;
      this.metrics.mid = 0.12 + Math.cos(t * 3.1) * 0.06;
      this.metrics.treble = 0.1 + Math.sin(t * 5.3) * 0.05;
      this.metrics.volume = 0.12;
      this.metrics.decibels = -35;
      this.metrics.isTransient = false;
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);

    const binCount = this.analyser.frequencyBinCount;
    // Bins para Sample Rate ~44.1/48kHz: cada bin ~90Hz
    // Graves: bins 1..8 (90Hz - 720Hz)
    let sumBass = 0;
    const bassEnd = Math.min(8, binCount);
    for (let i = 1; i < bassEnd; i++) {
      sumBass += this.dataArray[i];
    }
    const rawBass = sumBass / (bassEnd - 1) / 255;

    // Médios: bins 9..35 (800Hz - 3100Hz)
    let sumMid = 0;
    const midEnd = Math.min(35, binCount);
    for (let i = bassEnd; i < midEnd; i++) {
      sumMid += this.dataArray[i];
    }
    const rawMid = sumMid / (midEnd - bassEnd) / 255;

    // Agudos: bins 36..120 (3200Hz - 10000Hz)
    let sumTreble = 0;
    const trebleEnd = Math.min(120, binCount);
    for (let i = midEnd; i < trebleEnd; i++) {
      sumTreble += this.dataArray[i];
    }
    const rawTreble = sumTreble / (trebleEnd - midEnd) / 255;

    // RMS Volume total
    let sumAll = 0;
    for (let i = 0; i < binCount; i++) {
      sumAll += this.dataArray[i];
    }
    const rawVolume = sumAll / binCount / 255;

    // Detecção de pico / transiente
    const isTransient = (rawVolume - this.lastVolume) > 0.15;
    this.lastVolume = rawVolume;

    // Suavização exponencial (LERP)
    this.metrics.bass += (rawBass - this.metrics.bass) * 0.25;
    this.metrics.mid += (rawMid - this.metrics.mid) * 0.25;
    this.metrics.treble += (rawTreble - this.metrics.treble) * 0.3;
    this.metrics.volume += (rawVolume - this.metrics.volume) * 0.25;

    // Estimativa de dB
    this.metrics.decibels = -60 + this.metrics.volume * 60;
    this.metrics.isTransient = isTransient;
  }

  public stop(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
  }
}
