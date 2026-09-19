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
  private silentFrames: number = 0;

  // Ganho de sensibilidade para amplificar sons na galeria
  private sensitivityGain: number = 3.0;

  public metrics: AudioMetrics = {
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    decibels: -50,
    isTransient: false,
    frequencyData: new Uint8Array(256)
  };

  /**
   * Conecta o analisador usando um stream exclusivo de áudio
   * (Resolve bug do Chromium/Android onde MediaStream misto de vídeo+áudio fica mudo no Web Audio)
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
        // Isola a faixa de áudio em um MediaStream próprio
        const audioOnlyStream = new MediaStream([audioTracks[0]]);
        const source = this.ctx.createMediaStreamSource(audioOnlyStream);

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
        console.log('[AudioReactor] ✓ Microfone conectado via MediaStream isolado com ganho 3.0x');
      } else {
        console.warn('[AudioReactor] Faixa de áudio indisponível, ativando ressonância orgânica');
      }
    } catch (err) {
      console.warn('[AudioReactor] Erro ao instanciar microfone, usando simulação acústica:', err);
    }
  }

  /**
   * Atualiza as métricas acústicas a cada frame
   */
  public update(timeSec: number = 0): void {
    const t = timeSec || (performance.now() * 0.001);

    if (this.analyser && this.isMicActive) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);

      const binCount = this.analyser.frequencyBinCount;

      // 1. Graves: bins 1..12 (~40Hz - 1000Hz)
      let sumBass = 0;
      const bassEnd = Math.min(12, binCount);
      for (let i = 1; i < bassEnd; i++) {
        sumBass += this.dataArray[i];
      }
      const rawBass = Math.min((sumBass / (bassEnd - 1) / 255) * 1.6, 1.0);

      // 2. Médios: bins 13..45 (~1000Hz - 3800Hz)
      let sumMid = 0;
      const midEnd = Math.min(45, binCount);
      for (let i = bassEnd; i < midEnd; i++) {
        sumMid += this.dataArray[i];
      }
      const rawMid = Math.min((sumMid / (midEnd - bassEnd) / 255) * 1.5, 1.0);

      // 3. Agudos: bins 46..128 (~3800Hz - 11000Hz)
      let sumTreble = 0;
      const trebleEnd = Math.min(128, binCount);
      for (let i = midEnd; i < trebleEnd; i++) {
        sumTreble += this.dataArray[i];
      }
      const rawTreble = Math.min((sumTreble / (trebleEnd - midEnd) / 255) * 1.4, 1.0);

      // 4. Volume RMS Total
      let sumAll = 0;
      for (let i = 0; i < binCount; i++) {
        sumAll += this.dataArray[i];
      }
      const rawVolume = Math.min((sumAll / binCount / 255) * 1.5, 1.0);

      // Se a entrada do hardware estiver abaixo de 0.02, conta frames silenciosos
      if (rawVolume < 0.02) {
        this.silentFrames++;
      } else {
        this.silentFrames = 0;
      }

      // Se o microfone estiver em silêncio absoluto (ou bloqueado pelo sistema),
      // mescla uma respiração orgânica sutil para a instalação nunca parecer congelada
      let finalBass = rawBass;
      let finalMid = rawMid;
      let finalTreble = rawTreble;
      let finalVolume = rawVolume;

      if (this.silentFrames > 30) {
        const breath = (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.14;
        finalBass   = Math.max(rawBass, breath * 1.2);
        finalMid    = Math.max(rawMid, breath * 0.8);
        finalTreble = Math.max(rawTreble, breath * 0.5);
        finalVolume = Math.max(rawVolume, breath);

        // Preenche leve ondulação nas barras do visualizador
        for (let i = 0; i < 16; i++) {
          const barWave = (Math.sin(t * 3.5 + i * 0.4) * 0.5 + 0.5) * 60 * breath;
          if (this.dataArray[i * 4] < barWave) {
            this.dataArray[i * 4] = Math.floor(barWave);
          }
        }
      }

      const isTransient = (finalVolume - this.lastVolume) > 0.12;
      this.lastVolume = finalVolume;

      // Suavização LERP
      this.metrics.bass   += (finalBass - this.metrics.bass) * 0.32;
      this.metrics.mid    += (finalMid - this.metrics.mid) * 0.30;
      this.metrics.treble += (finalTreble - this.metrics.treble) * 0.35;
      this.metrics.volume += (finalVolume - this.metrics.volume) * 0.30;

      this.metrics.decibels = -55 + this.metrics.volume * 50;
      this.metrics.isTransient = isTransient;
    } else {
      // Simulação acústica autônoma fluida
      const simBass = 0.15 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.18 + (Math.sin(t * 6.5) > 0.7 ? 0.25 : 0);
      const simMid  = 0.12 + (Math.cos(t * 1.9) * 0.5 + 0.5) * 0.15;
      const simTreb = 0.10 + (Math.sin(t * 4.2) * 0.5 + 0.5) * 0.12;
      const simVol  = (simBass + simMid + simTreb) / 3;

      this.metrics.bass   = simBass;
      this.metrics.mid    = simMid;
      this.metrics.treble = simTreb;
      this.metrics.volume = simVol;
      this.metrics.decibels = -45 + simVol * 38;
      this.metrics.isTransient = Math.sin(t * 3.8) > 0.88;

      for (let i = 0; i < this.dataArray.length; i++) {
        const wave = Math.sin(t * 3.5 + i * 0.18) * 0.5 + 0.5;
        this.dataArray[i] = Math.floor(wave * 120 * simVol);
      }
    }
  }

  public stop(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
  }
}
