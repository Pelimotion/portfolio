import * as Tone from 'tone';

class AudioEngine {
  private synth: Tone.Synth | null = null;
  private filter: Tone.Filter | null = null;
  private volume: Tone.Volume | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();

      // Volume master suave e não agressivo (-18dB)
      this.volume = new Tone.Volume(-18).toDestination();

      // Filtro passa-baixa analógico para amortecer harmônicos agudos
      this.filter = new Tone.Filter({
        frequency: 850,
        type: 'lowpass',
        rolloff: -24
      }).connect(this.volume);

      // Sintetizador senoidal puro com envelope orgânico
      this.synth = new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.15,
          decay: 0.2,
          sustain: 0.85,
          release: 1.2
        }
      }).connect(this.filter);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio não pôde ser inicializado automaticamente:', e);
    }
  }

  public setFrequency(freqHz: number): void {
    if (!this.synth || !this.isInitialized) return;
    try {
      // Interpolação suave para evitar cliques de fase
      this.synth.frequency.rampTo(freqHz, 0.12);
    } catch (e) {
      // Ignora pequenos saltos
    }
  }

  public triggerTone(freqHz: number): void {
    if (!this.synth || !this.isInitialized) return;
    try {
      this.synth.triggerAttack(freqHz);
    } catch (e) {
      // Ignora se já estiver soando
    }
  }

  public releaseTone(): void {
    if (!this.synth || !this.isInitialized) return;
    try {
      this.synth.triggerRelease();
    } catch (e) {
      // Ignora se já liberado
    }
  }

  public setMute(muted: boolean): void {
    if (this.volume) {
      this.volume.mute = muted;
    }
  }

  public dispose(): void {
    this.synth?.dispose();
    this.filter?.dispose();
    this.volume?.dispose();
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngine();
