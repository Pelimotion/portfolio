/**
 * audio.ts — Captura do Microfone e Análise Espectral FFT com Alta Sensibilidade
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
  private dataArray: Uint8Array = new Uint8Array(256);
  private lastVolume: number = 0;
  private isMicActive: boolean = false;

  // Ganho de sensibilidade para captar áudio ambiente na galeria
  private sensitivityGain: number = 2.2;

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
   * Conecta o analisador ao stream já obtido pela câmera (evitando conflito de permissão no celular)
   */
  public async initFromStream(stream: MediaStream, userCtx?: AudioContext): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = userCtx || new AudioContextClass();

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        const source = this.ctx.createMediaStreamSource(stream);

        // Nó de ganho para amplificar sons ambientes da galeria
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = this.sensitivityGain;

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.70;

        source.connect(gainNode);
        gainNode.connect(this.analyser);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.metrics.frequencyData = this.dataArray;
        this.isMicActive = true;
        console.log('[AudioReactor] ✓ Microfone conectado com sucesso via stream unificado');
      } else {
        console.warn('[AudioReactor] Stream não contém faixa de áudio ativa, usando simulação acústica');
      }
    } catch (err) {
      console.warn('[AudioReactor] Falha ao conectar microfone:', err);
    }
  }

  /**
   * Atualiza as métricas espectrais a cada frame
   */
  public update(timeSec: number = 0): void {
    if (this.analyser && this.isMicActive) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);

      const binCount = this.analyser.frequencyBinCount;

      // 1. Graves: bins 1..10 (~40Hz - 900Hz)
      let sumBass = 0;
      const bassEnd = Math.min(10, binCount);
      for (let i = 1; i < bassEnd; i++) {
        sumBass += this.dataArray[i];
      }
      const rawBass = Math.min((sumBass / (bassEnd - 1) / 255) * 1.5, 1.0);

      // 2. Médios: bins 11..40 (~900Hz - 3500Hz)
      let sumMid = 0;
      const midEnd = Math.min(40, binCount);
      for (let i = bassEnd; i < midEnd; i++) {
        sumMid += this.dataArray[i];
      }
      const rawMid = Math.min((sumMid / (midEnd - bassEnd) / 255) * 1.4, 1.0);

      // 3. Agudos: bins 41..128 (~3500Hz - 11000Hz)
      let sumTreble = 0;
      const trebleEnd = Math.min(128, binCount);
      for (let i = midEnd; i < trebleEnd; i++) {
        sumTreble += this.dataArray[i];
      }
      const rawTreble = Math.min((sumTreble / (trebleEnd - midEnd) / 255) * 1.3, 1.0);

      // 4. Volume RMS Total
      let sumAll = 0;
      for (let i = 0; i < binCount; i++) {
        sumAll += this.dataArray[i];
      }
      const rawVolume = Math.min((sumAll / binCount / 255) * 1.4, 1.0);

      // Transiente (pico de impacto)
      const isTransient = (rawVolume - this.lastVolume) > 0.12;
      this.lastVolume = rawVolume;

      // Suavização LERP
      this.metrics.bass   += (rawBass - this.metrics.bass) * 0.32;
      this.metrics.mid    += (rawMid - this.metrics.mid) * 0.30;
      this.metrics.treble += (rawTreble - this.metrics.treble) * 0.35;
      this.metrics.volume += (rawVolume - this.metrics.volume) * 0.30;

      // dB estimado
      this.metrics.decibels = -60 + this.metrics.volume * 54;
      this.metrics.isTransient = isTransient;
    } else {
      // Simulação acústica orgânica autônoma (nunca fica estático em -60 dB)
      const t = timeSec || (performance.now() * 0.001);
      const simBass = 0.18 + Math.sin(t * 3.1) * 0.12 + (Math.sin(t * 7.4) > 0.6 ? 0.22 : 0);
      const simMid  = 0.16 + Math.cos(t * 2.5) * 0.10;
      const simTreb = 0.12 + Math.sin(t * 5.8) * 0.08;
      const simVol  = (simBass + simMid + simTreb) / 3;

      this.metrics.bass   = Math.max(simBass, 0);
      this.metrics.mid    = Math.max(simMid, 0);
      this.metrics.treble = Math.max(simTreb, 0);
      this.metrics.volume = Math.max(simVol, 0);
      this.metrics.decibels = -42 + this.metrics.volume * 36;
      this.metrics.isTransient = Math.sin(t * 4) > 0.85;

      // Gera barras animadas no visualizador
      for (let i = 0; i < this.dataArray.length; i++) {
        const wave = Math.sin(t * 4 + i * 0.15) * 0.5 + 0.5;
        this.dataArray[i] = Math.floor(wave * 140 * this.metrics.volume);
      }
    }
  }

  public stop(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
  }
}
