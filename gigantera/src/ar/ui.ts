/**
 * ui.ts — Interface Tátil Mobile, Telas de Acesso/Permissão e HUD de AR
 */

import { BIOMES, BiomeTheme } from './particleSystem';
import { AudioMetrics } from './audio';

export interface UIEventCallbacks {
  onUnlockAttempt: (code: string) => boolean;
  onStartExperience: () => Promise<void>;
  onLockProjection: () => void;
  onResetAnchor: () => void;
  onSelectBiome: (index: number) => void;
  onTouchRotate: (deltaX: number, deltaY: number) => void;
  onTouchZoom: (factor: number) => void;
}

export class UIManager {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private callbacks: UIEventCallbacks;

  // Elementos do DOM
  private lockOverlay!: HTMLElement;
  private permOverlay!: HTMLElement;
  private reticleEl!: HTMLElement;
  private statusChip!: HTMLElement;
  private statusText!: HTMLElement;
  private audioValEl!: HTMLElement;
  private audioBars: HTMLElement[] = [];
  private biomeBtns: HTMLElement[] = [];
  private btnLockProj!: HTMLElement;

  private isLocked: boolean = false;

  // Gestos touch
  private touchStartDist: number = 0;
  private lastTouchX: number = 0;
  private lastTouchY: number = 0;
  private isTouching: boolean = false;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    callbacks: UIEventCallbacks
  ) {
    this.container = container;
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.render();
    this.bindGestures();
  }

  private render(): void {
    const base = (import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
    const cleanBase = base.endsWith('/') ? base : base + '/';

    this.container.innerHTML = `
      <!-- TOP BAR -->
      <header class="hud-top-bar ar-interactive">
        <div class="hud-title-badge">
          <span class="hud-tag">GIGANTERA AR</span>
          <span class="hud-subtag">ESPINHAÇO</span>
        </div>

        <div class="hud-status-chip" id="hud-status-chip">
          <span class="hud-status-dot"></span>
          <span id="hud-status-text">BUSCANDO PROJEÇÃO</span>
        </div>

        <button class="hud-action-btn" id="btn-recalibrate" title="Recalibrar Alvo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          RESET
        </button>
      </header>

      <!-- RETÍCULO CENTRAL DE MIRA NA PAREDE (9:16 VERTICAL) -->
      <div class="hud-target-reticle" id="hud-reticle">
        <div class="reticle-frame">
          <img
            src="${cleanBase}ar/projection_target.jpg"
            id="reticle-ghost-img"
            class="reticle-ghost-img"
            alt="Silhueta de alinhamento"
          />
          <div class="reticle-corner tl"></div>
          <div class="reticle-corner tr"></div>
          <div class="reticle-corner bl"></div>
          <div class="reticle-corner br"></div>
          <div class="reticle-scan-line"></div>
        </div>

        <div class="reticle-center-cross"></div>

        <div class="reticle-prompt-box">
          <div class="reticle-prompt-title">ENQUADRE A PROJEÇÃO (9:16)</div>
          <div class="reticle-prompt-desc">Alinhe a câmera com a videoarte projetada na parede</div>
        </div>

        <button class="btn-lock-projection ar-interactive" id="btn-lock-projection">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 14 14"/>
          </svg>
          TRAVAR NA PROJEÇÃO
        </button>
      </div>

      <!-- PAINEL DE ÁUDIO & BIOMAS -->
      <footer class="hud-bottom-dock ar-interactive">
        <div class="hud-audio-panel">
          <div class="audio-meter-info">
            <span class="audio-meter-label">MICROFONE // RESSONÂNCIA</span>
            <span class="audio-meter-val" id="hud-audio-val">-60 dB · CALMO</span>
          </div>

          <div class="audio-bars-container" id="hud-audio-bars">
            ${Array.from({ length: 16 }).map(() => '<div class="audio-bar"></div>').join('')}
          </div>
        </div>

        <div class="biome-selector-bar">
          ${BIOMES.map((b, idx) => `
            <button class="biome-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
              <span class="biome-dot" style="background: #${b.primary.getHexString()}"></span>
              ${b.name}
            </button>
          `).join('')}
        </div>

        <div class="hud-hint-bar">
          <span>Arraste para girar</span>
          <span>•</span>
          <span>Pinça para zoom</span>
          <span>•</span>
          <span>O som distorce o fóssil</span>
        </div>
      </footer>

      <!-- TELA DE BLOQUEIO / ACESSO RESTRITO -->
      <div class="ar-modal-overlay" id="modal-lock">
        <div class="lock-card">
          <div class="lock-badge">ACESSO RESTRITO</div>
          <h1 class="lock-title">ESPINHAÇO AR</h1>
          <p class="lock-desc">
            Instalação imersiva de realidade aumentada para projeção em parede.
            Digite sua senha de acesso ou utilize o link individual de convidado.
          </p>

          <div class="lock-input-group">
            <input
              type="text"
              id="input-passcode"
              class="lock-input"
              placeholder="CÓDIGO / PIN"
              maxlength="16"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="characters"
              spellcheck="false"
            />
            <div class="lock-error-msg" id="lock-error"></div>
          </div>

          <button class="btn-primary-action" id="btn-unlock">
            LIBERAR ACESSO
          </button>
        </div>
      </div>

      <!-- TELA PRE-FLIGHT (PERMISSÕES DE SENSORES) -->
      <div class="ar-modal-overlay hidden" id="modal-perm">
        <div class="perm-card">
          <div class="lock-badge">CONEXÃO SENSORIAL</div>
          <h2 class="lock-title">PREPARAR AMBIENTE</h2>
          <p class="lock-desc">
            Para que o Espinhaço salte da parede e ressoe com o espaço, precisamos do acesso aos sensores do seu celular:
          </p>

          <div class="perm-list">
            <div class="perm-item">
              <span class="perm-icon">📷</span>
              <div>
                <div class="perm-text-title">CÂMERA TRASEIRA</div>
                <div class="perm-text-sub">Para enquadrar a projeção na parede</div>
              </div>
            </div>

            <div class="perm-item">
              <span class="perm-icon">🎙️</span>
              <div>
                <div class="perm-text-title">MICROFONE</div>
                <div class="perm-text-sub">Para o fóssil vibrar com o som ambiente</div>
              </div>
            </div>

            <div class="perm-item">
              <span class="perm-icon">🧭</span>
              <div>
                <div class="perm-text-title">GIROSCÓPIO</div>
                <div class="perm-text-sub">Para profundidade espacial 3D realista</div>
              </div>
            </div>
          </div>

          <button class="btn-primary-action" id="btn-start-exp">
            INICIAR EXPERIÊNCIA
          </button>
        </div>
      </div>
    `;

    // Cache de referências
    this.lockOverlay = document.getElementById('modal-lock')!;
    this.permOverlay = document.getElementById('modal-perm')!;
    this.reticleEl = document.getElementById('hud-reticle')!;
    this.statusChip = document.getElementById('hud-status-chip')!;
    this.statusText = document.getElementById('hud-status-text')!;
    this.audioValEl = document.getElementById('hud-audio-val')!;
    this.audioBars = Array.from(document.querySelectorAll('.audio-bar'));
    this.btnLockProj = document.getElementById('btn-lock-projection')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    // 1. Tela de Desbloqueio
    const inputPass = document.getElementById('input-passcode') as HTMLInputElement;
    const btnUnlock = document.getElementById('btn-unlock')!;
    const lockError = document.getElementById('lock-error')!;

    const doUnlock = () => {
      const code = inputPass.value;
      const success = this.callbacks.onUnlockAttempt(code);
      if (success) {
        this.hideLockScreen();
        this.showPermScreen();
      } else {
        inputPass.classList.add('error');
        lockError.textContent = 'CÓDIGO INVÁLIDO. TENTE "ESPINHACO"';
        setTimeout(() => inputPass.classList.remove('error'), 600);
      }
    };

    btnUnlock.addEventListener('click', doUnlock);
    inputPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doUnlock();
    });

    // 2. Tela de Permissões
    const btnStart = document.getElementById('btn-start-exp')!;
    btnStart.addEventListener('click', async () => {
      btnStart.textContent = 'CONECTANDO SENSORES…';
      try {
        await this.callbacks.onStartExperience();
        this.hidePermScreen();
      } catch (err) {
        console.error(err);
        btnStart.textContent = 'TENTAR NOVAMENTE';
      }
    });

    // 3. Botão Travar na Projeção
    this.btnLockProj.addEventListener('click', () => {
      this.triggerHaptic();
      this.callbacks.onLockProjection();
    });

    // 4. Botão Recalibrar
    const btnRecalibrate = document.getElementById('btn-recalibrate')!;
    btnRecalibrate.addEventListener('click', () => {
      this.callbacks.onResetAnchor();
      this.unlockProjection();
    });

    // 5. Seletores de Bioma
    this.biomeBtns = Array.from(document.querySelectorAll('.biome-btn'));
    this.biomeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx || '0', 10);
        this.biomeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks.onSelectBiome(idx);
      });
    });
  }

  public showLockScreen(): void {
    this.lockOverlay.classList.remove('hidden');
  }

  public hideLockScreen(): void {
    this.lockOverlay.classList.add('hidden');
  }

  public showPermScreen(): void {
    this.permOverlay.classList.remove('hidden');
  }

  public hidePermScreen(): void {
    this.permOverlay.classList.add('hidden');
  }

  public lockProjection(): void {
    this.isLocked = true;
    this.reticleEl.classList.add('hidden');
    this.statusChip.classList.add('locked');
    this.statusText.textContent = 'PROJEÇÃO ANCORADA';
    this.triggerHaptic();
  }

  public unlockProjection(): void {
    this.isLocked = false;
    this.reticleEl.classList.remove('hidden');
    this.statusChip.classList.remove('locked');
    this.statusText.textContent = 'BUSCANDO PROJEÇÃO';
  }

  public updateOpticalStatus(confidence: number, isDetected: boolean = false): void {
    if (this.isLocked) return;

    if (confidence >= 0.70 || isDetected) {
      this.statusText.textContent = `PROJEÇÃO ENQUADRADA (${Math.round(confidence * 100)}%)`;
      this.statusChip.classList.add('detected');
      this.btnLockProj.classList.add('ready');
      this.btnLockProj.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        ● TRAVAR NA PROJEÇÃO
      `;
    } else if (confidence >= 0.35) {
      this.statusText.textContent = `LOCALIZANDO (${Math.round(confidence * 100)}%)`;
      this.statusChip.classList.remove('detected');
      this.btnLockProj.classList.remove('ready');
      this.btnLockProj.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        TRAVAR NA PROJEÇÃO
      `;
    } else {
      this.statusText.textContent = 'ALINHE COM A PROJEÇÃO';
      this.statusChip.classList.remove('detected');
      this.btnLockProj.classList.remove('ready');
      this.btnLockProj.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        TRAVAR NA PROJEÇÃO
      `;
    }
  }

  public updateAudioDisplay(metrics: AudioMetrics): void {
    // Decibéis
    const db = Math.round(metrics.decibels);
    let state = 'CALMO';
    if (metrics.bass > 0.45) state = 'GRAVES FORTES';
    else if (metrics.volume > 0.35) state = 'RESSONÂNCIA ALTA';
    this.audioValEl.textContent = `${db} dB · ${state}`;

    // Barras de visualizador de áudio
    const data = metrics.frequencyData;
    const step = Math.floor(data.length / this.audioBars.length);
    for (let i = 0; i < this.audioBars.length; i++) {
      const val = data[i * step] / 255;
      const h = Math.max(val * 24, 3);
      this.audioBars[i].style.height = `${h}px`;
    }
  }

  private triggerHaptic(): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
    } catch {
      // Ignore
    }
  }

  private bindGestures(): void {
    // Gestos touch na tela para girar e pinçar o objeto 3D
    this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isTouching = true;
        this.lastTouchX = e.touches[0].clientX;
        this.lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 1 && this.isTouching) {
        const dx = e.touches[0].clientX - this.lastTouchX;
        const dy = e.touches[0].clientY - this.lastTouchY;
        this.lastTouchX = e.touches[0].clientX;
        this.lastTouchY = e.touches[0].clientY;
        this.callbacks.onTouchRotate(dx * 0.008, dy * 0.008);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (this.touchStartDist > 0) {
          const factor = dist / this.touchStartDist;
          this.callbacks.onTouchZoom(factor);
          this.touchStartDist = dist;
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.isTouching = false;
      this.touchStartDist = 0;
    }, { passive: true });
  }
}
