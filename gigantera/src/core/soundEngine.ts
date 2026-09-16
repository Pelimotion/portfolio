/**
 * SOUND ENGINE — Web Audio API para a Sala de Apreciação Acústica e CD em POV
 * Gerencia previews leves de 10s para troca instantânea ao rolar a contracapa do CD,
 * upgrade automático para streaming completo após permanência e analisador de frequências em tempo real.
 */

import { AudioTrackInfo } from '../types/art';

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private freqArray: Uint8Array<ArrayBuffer> | null = null;
  private isInitialized = false;

  private currentTrackId: string | null = null;
  private upgradeTimer: any = null;
  private isFullStreaming = false;

  public init(): void {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.loop = true;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.85;

      const compressorNode = this.audioCtx.createDynamicsCompressor();
      compressorNode.threshold.value = -12;
      compressorNode.knee.value = 30;
      compressorNode.ratio.value = 6;
      compressorNode.attack.value = 0.05;
      compressorNode.release.value = 0.25;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyserNode);

      if (this.audioCtx.createStereoPanner) {
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.pannerNode.pan.value = 0;
        this.analyserNode.connect(this.pannerNode);
        this.pannerNode.connect(this.gainNode);
      } else {
        this.analyserNode.connect(this.gainNode);
      }

      this.gainNode.connect(compressorNode);
      compressorNode.connect(this.audioCtx.destination);

      this.freqArray = new Uint8Array(this.analyserNode.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API não inicializada:', err);
    }
  }

  public async playTrackPreview(track: AudioTrackInfo): Promise<void> {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (!this.audioElement) return;

    // Cancela timer de upgrade anterior
    if (this.upgradeTimer) {
      clearTimeout(this.upgradeTimer);
      this.upgradeTimer = null;
    }

    this.currentTrackId = track.id;
    this.isFullStreaming = false;

    // Toca o preview leve imediatamente
    this.audioElement.src = track.previewSrc;
    this.audioElement.loop = true;
    this.audioElement.currentTime = 0;

    try {
      await this.audioElement.play();
    } catch (e) {
      console.warn('Autoplay bloqueado pelo navegador, aguardando clique:', e);
    }

    // Se o ouvinte permanecer ouvindo a mesma faixa por 4 segundos, faz upgrade transparente para a versão full
    this.upgradeTimer = setTimeout(async () => {
      if (this.currentTrackId === track.id && this.audioElement) {
        const curTime = this.audioElement.currentTime;
        this.audioElement.src = track.fullSrc;
        this.audioElement.currentTime = curTime % 10;
        this.isFullStreaming = true;
        try {
          await this.audioElement.play();
        } catch (_) {}
      }
    }, 4000);
  }

  public async playFullDirectly(track: AudioTrackInfo): Promise<void> {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (!this.audioElement) return;

    if (this.upgradeTimer) {
      clearTimeout(this.upgradeTimer);
      this.upgradeTimer = null;
    }

    this.currentTrackId = track.id;
    this.isFullStreaming = true;
    this.audioElement.src = track.fullSrc;
    this.audioElement.loop = true;
    try {
      await this.audioElement.play();
    } catch (_) {}
  }

  public pause(): void {
    if (this.upgradeTimer) {
      clearTimeout(this.upgradeTimer);
      this.upgradeTimer = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public async resume(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (this.audioElement && this.audioElement.src) {
      try {
        await this.audioElement.play();
      } catch (_) {}
    }
  }

  private _globalMute = false;
  private _lastVolume = 0.85;

  public toggleGlobalMute(): boolean {
    this._globalMute = !this._globalMute;
    if (this._globalMute) {
      this.setVolume(0);
    } else {
      this.setVolume(this._lastVolume);
    }
    return this._globalMute;
  }

  public setVolume(volume: number): void {
    if (volume > 0) this._lastVolume = volume;
    if (this.gainNode && this.audioCtx) {
      const targetVol = this._globalMute ? 0 : Math.max(0, Math.min(1, volume));
      this.gainNode.gain.setValueAtTime(targetVol, this.audioCtx.currentTime);
    }
  }

  /**
   * Atualização contínua de acústica espacial baseada na física das caixas de som nas paredes
   * - Pan estéreo: se o jogador se aproxima da parede esquerda (-13.2m), som desloca para canal L;
   *   se da parede direita (+13.2m), desloca para R; no corredor central (x = 0), estéreo perfeito.
   * - Atenuação de distância e presença: calculada contra a caixa acústica mais próxima.
   */
  public updateSpatialAcoustics(
    playerX: number,
    playerZ: number,
    playerYaw: number,
    speakers: { x: number; z: number }[],
    masterVolume: number
  ): void {
    if (!this.isInitialized || !this.audioCtx || !this.gainNode) return;

    // Pan Estéreo Binaural Verdadeiro: considera a posição da fonte (centro do corredor X=0, ou caixas)
    // e para onde o jogador está olhando (playerYaw).
    // Assumimos que a fonte principal de som ecoa do longo do eixo Z central (x=0).
    const dx = 0 - playerX; // direção da fonte central em X
    const dz = 0 - playerZ; // direção genérica
    
    // Simplificando o azimute relativo: 
    // Se o player está em playerX = -10, a fonte está à direita (+10).
    // Mas precisamos rotacionar isso pelo yaw do player.
    // Vetor local da fonte de som:
    const cosY = Math.cos(-playerYaw);
    const sinY = Math.sin(-playerYaw);
    
    // Posição local X do som (Left/Right)
    const localX = dx * cosY - dz * sinY;
    
    // Normalizando o localX para o Panner
    const targetPan = Math.max(-1.0, Math.min(1.0, localX * 0.15));

    if (this.pannerNode && this.pannerNode.pan) {
      this.pannerNode.pan.setTargetAtTime(targetPan, this.audioCtx.currentTime, 0.06);
    }

    // Proximidade à caixa acústica mais próxima
    let minDist = 999;
    for (let i = 0; i < speakers.length; i++) {
      const spk = speakers[i];
      const d = Math.hypot(playerX - spk.x, playerZ - spk.z);
      if (d < minDist) minDist = d;
    }

    if (this.isFading) return;

    const presence = Math.max(0.38, Math.min(1.0, 1.0 - (minDist - 3.0) / 22.0));
    const finalVol = Math.max(0.01, Math.min(1.0, masterVolume * presence));
    this.gainNode.gain.setTargetAtTime(finalVol, this.audioCtx.currentTime, 0.06);
  }

  private isFading = false;

  public async fadeOut(durationMs = 1200): Promise<void> {
    if (!this.gainNode || !this.audioCtx) {
      this.pause();
      return;
    }
    this.isFading = true;
    const t = this.audioCtx.currentTime;
    const currentGain = Math.max(0.001, this.gainNode.gain.value);
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.setValueAtTime(currentGain, t);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.pause();
        this.isFading = false;
        resolve();
      }, durationMs);
    });
  }

  public async fadeIn(targetVolume = 0.85, durationMs = 1400): Promise<void> {
    if (!this.gainNode || !this.audioCtx) {
      await this.resume();
      return;
    }
    this.isFading = true;
    const t = this.audioCtx.currentTime;
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.setValueAtTime(0.0001, t);
    await this.resume();
    this.gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.01, Math.min(1, targetVolume)),
      t + durationMs / 1000
    );
    setTimeout(() => {
      this.isFading = false;
    }, durationMs);
  }

  public getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode || !this.freqArray) return null;
    this.analyserNode.getByteFrequencyData(this.freqArray);
    return this.freqArray;
  }

  public getEnergy(): number {
    const data = this.getFrequencyData();
    if (!data || data.length === 0) return 0;

    let sum = 0;
    const count = Math.min(data.length, 16);
    for (let i = 0; i < count; i++) {
      sum += data[i];
    }
    return sum / (count * 255);
  }

  public isFullActive(): boolean {
    return this.isFullStreaming;
  }

  // SFX Procedural: Clique tátil do estojo de CD (Jewel case plastic snap)
  public playCaseSnapSound(): void {
    if (!this.isInitialized) this.init();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(4.0, t);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode || this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // SFX Procedural: Sussurro harmônico e etéreo ao transpassar o vidro da vitrine
  public playGlassPassSound(): void {
    if (!this.isInitialized) this.init();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const t = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, t);
    osc1.frequency.exponentialRampToValueAtTime(880, t + 0.6);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1040, t);
    osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.6);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.gainNode || this.audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.85);
    osc2.stop(t + 0.85);
  }

  // SFX Procedural: Passo suave no piso de concreto
  public playFootstepSound(): void {
    if (!this.isInitialized) this.init();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, t);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode || this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // SFX Procedural: Micro-click tátil suave de hover para interface e vitrines
  public playTactileHoverTick(): void {
    if (!this.isInitialized) this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(340, t + 0.022);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

      osc.connect(gain);
      gain.connect(this.gainNode || this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
