/**
 * CD VIEWMODEL 3D — Primeira Pessoa (POV) com Mão Low-Poly Facetada (PS1/PS2 Aesthetic)
 * Integração oficial das artes CAPA.jpeg (Winamp / PlayStation) e CONTRACAPA.jpeg (Terminal Matrix).
 * Rotação fluida de 180°, animação cinematográfica de 2s no primeiro take e renderização
 * da tracklist perfeitamente posicionada no espaço negativo da tela verde do terminal.
 */

import * as THREE from 'three';
import { AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { AudioTrackInfo } from '../../types/art';
import { soundEngine } from '../../core/soundEngine';
import { useAppStore } from '../../core/store';

export class CDViewmodel3D {
  public rootGroup: THREE.Group;
  public caseGroup: THREE.Group;
  public handGroup: THREE.Group;
  public backInlayMesh!: THREE.Mesh;
  public frontInlayMesh!: THREE.Mesh;

  private isVisible: boolean = false;
  private currentY: number = -1.6; // Começa abaixado fora do campo de visão
  private targetY: number = -1.6;
  private targetZ: number = -0.46;
  private currentZ: number = -0.46;

  // Giro Capa / Contracapa (0 = Capa Frontal, Math.PI = Contracapa)
  private currentFlipAngle: number = Math.PI;
  private targetFlipAngle: number = Math.PI;

  // Sequência cinematográfica de inspeção inicial (2 segundos apenas no 1º take)
  private isFirstTakeInspecting: boolean = false;
  private firstTakeStartTime: number = 0;

  // Canvas dinâmico para a contracapa com imagem de fundo e tracklist no monitor verde
  private backCoverCanvas: HTMLCanvasElement;
  private backCoverCtx: CanvasRenderingContext2D;
  private backCoverTexture: THREE.CanvasTexture;
  private backCoverImage: HTMLImageElement;
  private backCoverLoaded: boolean = false;

  // Estado das faixas
  private tracks: AudioTrackInfo[] = AUTHORIAL_TRACKS_CATALOG;
  private activeTrackIndex: number = 0;
  private hoveredTrackIndex: number | null = null;
  private scrollOffset: number = 0;
  private targetScrollOffset: number = 0;

  // Inércia de mouse e balanço
  private swayX: number = 0;
  private swayY: number = 0;
  private targetSwayX: number = 0;
  private targetSwayY: number = 0;

  // Callback de troca de faixa para o Zustand store
  private onTrackSelected?: (track: AudioTrackInfo) => void;

  constructor(onTrackSelected?: (track: AudioTrackInfo) => void) {
    this.onTrackSelected = onTrackSelected;

    const isMob = typeof window !== 'undefined' && window.innerWidth < 768;
    this.rootGroup = new THREE.Group();
    this.rootGroup.position.set(isMob ? 0.02 : 0.18, this.currentY, this.currentZ);

    this.caseGroup = new THREE.Group();
    this.handGroup = new THREE.Group();

    // 1. Cria a textura dinâmica da contracapa
    this.backCoverCanvas = document.createElement('canvas');
    this.backCoverCanvas.width = 1024;
    this.backCoverCanvas.height = 1024;
    this.backCoverCtx = this.backCoverCanvas.getContext('2d')!;
    this.backCoverTexture = new THREE.CanvasTexture(this.backCoverCanvas);
    this.backCoverTexture.colorSpace = THREE.SRGBColorSpace;
    this.backCoverTexture.minFilter = THREE.LinearFilter;
    this.backCoverTexture.magFilter = THREE.LinearFilter;

    // Helper para resolução de caminho de assets com base URL
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const getCDAssetUrl = (fileName: string) => `${cleanBase}cd/${fileName}`;

    // Carrega a imagem oficial da contracapa com proteção contra loops de retry
    this.backCoverImage = new Image();
    this.backCoverImage.crossOrigin = 'anonymous';
    this.backCoverImage.onload = () => {
      this.backCoverLoaded = true;
      this.renderBackCover();
    };
    let attemptedBackCoverFallback = false;
    this.backCoverImage.onerror = () => {
      if (!attemptedBackCoverFallback) {
        attemptedBackCoverFallback = true;
        this.backCoverImage.src = getCDAssetUrl('CONTRACAPA.jpeg');
      } else {
        this.backCoverImage.onerror = null;
        // Fallback gráfico padrão caso a imagem não esteja disponível
        this.renderBackCover();
      }
    };
    this.backCoverImage.src = getCDAssetUrl('contracapa-opt.jpg');

    // Render inicial temporário
    this.renderBackCover();

    // 2. Constrói o estojo de acrílico Jewel Case 3D
    this.buildJewelCase();

    // 3. Constrói a mão 3D em wireframe cibernético detalhado (carne 100% invisível)
    this.buildWireframeCyberHand();

    // Monta hierarquia
    this.rootGroup.add(this.caseGroup);
    this.rootGroup.add(this.handGroup);
  }

  /**
   * Constrói o estojo acrílico Jewel Case 3D com proporções físicas reais
   */
  private buildJewelCase(): void {
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/gigantera/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const getCDAssetUrl = (fileName: string) => `${cleanBase}cd/${fileName}`;

    const caseWidth = 0.52;
    const caseHeight = 0.52;
    const caseDepth = 0.042;

    // Estrutura em acrílico transparente com chanfros e reflexo
    const acrylicMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.06,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.75
    });

    // Moldura externa da caixa
    const frameGeo = new THREE.BoxGeometry(caseWidth, caseHeight, caseDepth);
    const frameMesh = new THREE.Mesh(frameGeo, acrylicMat);
    this.caseGroup.add(frameMesh);

    // Lombada esquerda do CD (Spine acrílico rígido)
    const spineGeo = new THREE.BoxGeometry(0.024, caseHeight * 0.98, caseDepth * 0.9);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x111312,
      roughness: 0.4
    });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(-caseWidth / 2 + 0.012, 0, 0);
    this.caseGroup.add(spineMesh);

    // Contracapa (Back Cover): Plano voltado para trás (Z = -0.012) com rotação Y de 180°
    const backInlayGeo = new THREE.PlaneGeometry(caseWidth * 0.93, caseHeight * 0.94);
    const backInlayMat = new THREE.MeshBasicMaterial({
      map: this.backCoverTexture,
      side: THREE.FrontSide
    });
    this.backInlayMesh = new THREE.Mesh(backInlayGeo, backInlayMat);
    this.backInlayMesh.position.set(0.005, 0, -0.012);
    this.backInlayMesh.rotation.y = Math.PI; // Voltado para trás
    (this.backInlayMesh as any).isCDBackCover = true;
    this.caseGroup.add(this.backInlayMesh);

    // Capa Frontal (Front Cover Artwork): Arte oficial de CAPA.jpeg voltada para frente (Z = +0.012)
    const texLoader = new THREE.TextureLoader();
    const frontTex = texLoader.load(getCDAssetUrl('capa-opt.jpg'), undefined, undefined, () => {
      texLoader.load(getCDAssetUrl('CAPA.jpeg'), (fallbackTex) => {
        fallbackTex.colorSpace = THREE.SRGBColorSpace;
        this.frontInlayMesh.material = new THREE.MeshStandardMaterial({
          map: fallbackTex,
          roughness: 0.88,
          metalness: 0.04
        });
      });
    });
    frontTex.colorSpace = THREE.SRGBColorSpace;
    const frontInlayMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: 0.88,
      metalness: 0.04
    });
    this.frontInlayMesh = new THREE.Mesh(backInlayGeo, frontInlayMat);
    this.frontInlayMesh.position.set(0.005, 0, 0.012);
    this.caseGroup.add(this.frontInlayMesh);

    // Bandeja interna translúcida cinza escuro
    const trayGeo = new THREE.PlaneGeometry(caseWidth * 0.88, caseHeight * 0.9);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x141716,
      roughness: 0.65,
      metalness: 0.12
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0.008, 0, -0.006);
    this.caseGroup.add(trayMesh);

    // Roseta central dos dentinhos do CD (Hub)
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.014, 16);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x282c2a,
      roughness: 0.45,
      metalness: 0.25
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.set(0.01, 0, -0.002);
    this.caseGroup.add(hubMesh);
  }

  /**
   * Constrói a mão 3D em wireframe cibernético detalhado e arredondado (16-24 segmentos)
   * A carne/pele é 100% invisível — renderizam-se apenas as linhas de contorno e nós articulares luminosos.
   */
  private buildWireframeCyberHand(): void {
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Cianita luminescente de alta precisão
      transparent: true,
      opacity: 0.76,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const nodeMat = new THREE.LineBasicMaterial({
      color: 0x6df5b5, // Jade terminal neon para nós articulares
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const addWireGeo = (geo: THREE.BufferGeometry, px: number, py: number, pz: number, rx: number, ry: number, rz: number) => {
      const wireGeo = new THREE.WireframeGeometry(geo);
      const lines = new THREE.LineSegments(wireGeo, wireMat);
      lines.position.set(px, py, pz);
      lines.rotation.set(rx, ry, rz);
      this.handGroup.add(lines);
      return lines;
    };

    const addJointNode = (radius: number, px: number, py: number, pz: number) => {
      const sphGeo = new THREE.SphereGeometry(radius, 10, 8);
      const wireGeo = new THREE.WireframeGeometry(sphGeo);
      const node = new THREE.LineSegments(wireGeo, nodeMat);
      node.position.set(px, py, pz);
      this.handGroup.add(node);
      return node;
    };

    // 1. Antebraço arredondado e anatômico (20 segmentos radiais)
    const armGeo = new THREE.CylinderGeometry(0.075, 0.11, 0.55, 20, 5);
    addWireGeo(armGeo, 0.38, -0.28, -0.08, 0.35, 0.2, -0.75);

    // 2. Pulso cilíndrico curvo
    const wristGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 18, 2);
    addWireGeo(wristGeo, 0.26, -0.12, -0.05, 0.2, 0.1, -0.4);
    addJointNode(0.038, 0.26, -0.12, -0.05);

    // 3. Palma da mão curvilínea com subdivisões finas
    const palmGeo = new THREE.BoxGeometry(0.14, 0.16, 0.07, 3, 3, 2);
    addWireGeo(palmGeo, 0.24, -0.05, -0.02, 0.1, -0.15, -0.25);

    // Nós dos nós dos dedos (Knuckles)
    addJointNode(0.022, 0.21, 0.02, 0.015);  // Polegar base
    addJointNode(0.018, 0.26, 0.06, -0.02);  // Indicador base
    addJointNode(0.018, 0.27, 0.00, -0.03);  // Médio base
    addJointNode(0.017, 0.26, -0.05, -0.04); // Anelar base
    addJointNode(0.015, 0.24, -0.11, -0.045);// Mindinho base

    // 4. Polegar arredondado (16 segmentos radiais)
    const thumbProxGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.09, 16, 2);
    addWireGeo(thumbProxGeo, 0.18, 0.02, 0.028, -0.4, 0.3, -0.6);
    addJointNode(0.016, 0.165, 0.05, 0.032);

    const thumbDistGeo = new THREE.CylinderGeometry(0.02, 0.024, 0.08, 16, 2);
    addWireGeo(thumbDistGeo, 0.16, 0.07, 0.035, -0.6, 0.1, -0.2);

    // 5. Dedo Indicador arredondado
    const indexGeo1 = new THREE.CylinderGeometry(0.02, 0.024, 0.09, 16, 2);
    addWireGeo(indexGeo1, 0.26, 0.08, -0.02, 0.2, 0.1, 0.4);
    addJointNode(0.016, 0.245, 0.11, -0.018);

    const indexGeo2 = new THREE.CylinderGeometry(0.017, 0.02, 0.08, 16, 2);
    addWireGeo(indexGeo2, 0.23, 0.13, -0.015, 0.1, -0.4, 0.9);

    // 6. Dedo Médio arredondado
    const midGeo1 = new THREE.CylinderGeometry(0.021, 0.025, 0.1, 16, 2);
    addWireGeo(midGeo1, 0.27, 0.01, -0.03, 0.1, 0.0, 0.25);
    addJointNode(0.016, 0.255, 0.015, -0.022);

    const midGeo2 = new THREE.CylinderGeometry(0.018, 0.021, 0.085, 16, 2);
    addWireGeo(midGeo2, 0.24, 0.02, -0.015, 0.0, -0.4, 0.85);

    // 7. Dedo Anelar arredondado
    const ringGeo1 = new THREE.CylinderGeometry(0.019, 0.023, 0.09, 16, 2);
    addWireGeo(ringGeo1, 0.26, -0.06, -0.04, 0.0, 0.0, 0.15);
    addJointNode(0.015, 0.245, -0.06, -0.03);

    const ringGeo2 = new THREE.CylinderGeometry(0.016, 0.019, 0.075, 16, 2);
    addWireGeo(ringGeo2, 0.23, -0.06, -0.02, -0.1, -0.3, 0.75);

    // 8. Dedo Mindinho arredondado
    const pinkyGeo = new THREE.CylinderGeometry(0.015, 0.019, 0.08, 16, 2);
    addWireGeo(pinkyGeo, 0.24, -0.13, -0.045, -0.2, 0.0, 0.35);
    addJointNode(0.014, 0.22, -0.14, -0.035);
  }

  /**
   * Renderiza a contracapa em alta resolução no canvas:
   * Desenha a imagem de fundo CONTRACAPA.jpeg e posiciona a tracklist interativa
   * rigorosamente dentro do espaço negativo da tela verde do terminal!
   */
  public renderBackCover(): void {
    const ctx = this.backCoverCtx;
    const w = this.backCoverCanvas.width;
    const h = this.backCoverCanvas.height;

    // 1. Desenha a arte de fundo oficial se já carregada
    if (this.backCoverLoaded && this.backCoverImage.complete) {
      ctx.drawImage(this.backCoverImage, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#101614');
      grad.addColorStop(1, '#080c0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Coordenadas da tela verde do terminal no espaço negativo da arte (1024x1024):
    // X: 84px a 940px (largura ~856px)
    // Y: 92px a 752px (altura ~660px)
    const screenX = 84;
    const screenY = 92;
    const screenW = w - 168; // 856px
    const screenH = 660;

    // Fundo translúcido sutil para aumentar legibilidade da matriz
    ctx.fillStyle = 'rgba(6, 18, 12, 0.42)';
    ctx.fillRect(screenX + 4, screenY + 4, screenW - 8, screenH - 8);

    // 3. Cabeçalho do Terminal Matrix
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6df5b5';
    ctx.font = 'bold 24px "Space Mono", monospace';
    ctx.fillText('PELIMOTION // GIGA \'N\' TERA ARCHIVE', screenX + 24, screenY + 46);

    ctx.font = '500 15px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(120, 240, 180, 0.72)';
    ctx.fillText('WINAMP INTERACTIVE MATRIX [17 TRACKS] · CLIQUE OU USE SETAS [↑/↓]', screenX + 24, screenY + 74);

    // Linha divisória de terminal
    ctx.strokeStyle = 'rgba(109, 245, 181, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(screenX + 20, screenY + 88);
    ctx.lineTo(screenX + screenW - 20, screenY + 88);
    ctx.stroke();

    // 4. Lista de faixas (janela deslizante de 8 faixas visíveis no monitor)
    const visibleCount = 8;
    const totalTracks = this.tracks.length;
    const startY = screenY + 138;
    const lineHeight = 62;

    for (let i = 0; i < visibleCount; i++) {
      const trackIdx = Math.floor(this.scrollOffset) + i;
      if (trackIdx >= totalTracks) break;

      const track = this.tracks[trackIdx];
      const y = startY + i * lineHeight;
      const isCurrent = trackIdx === this.activeTrackIndex;
      const isHovered = trackIdx === this.hoveredTrackIndex;

      if (isCurrent) {
        // Faixa ativa em reprodução
        ctx.fillStyle = 'rgba(14, 48, 30, 0.88)';
        ctx.fillRect(screenX + 16, y - 42, screenW - 32, 52);

        ctx.strokeStyle = '#6df5b5';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX + 16, y - 42, screenW - 32, 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 25px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`▶ TRACK ${numStr}: ${titleStr}`, screenX + 32, y - 8);

        ctx.font = 'bold 16px "Space Mono", monospace';
        ctx.fillStyle = '#6df5b5';
        ctx.textAlign = 'right';
        ctx.fillText(`● EM REPRODUÇÃO [${track.bpm} BPM]`, screenX + screenW - 32, y - 8);
        ctx.textAlign = 'left';
      } else if (isHovered) {
        // Hover sobre a faixa
        ctx.fillStyle = 'rgba(109, 245, 181, 0.18)';
        ctx.fillRect(screenX + 16, y - 42, screenW - 32, 52);

        ctx.strokeStyle = 'rgba(109, 245, 181, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 16, y - 42, screenW - 32, 52);

        ctx.fillStyle = '#bdfce0';
        ctx.font = 'bold 24px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`▷ TRACK ${numStr}: ${titleStr}`, screenX + 32, y - 8);

        ctx.font = 'bold 15px "Space Mono", monospace';
        ctx.fillStyle = '#fce595';
        ctx.textAlign = 'right';
        ctx.fillText(`CLIQUE P/ TOCAR [${track.bpm} BPM]`, screenX + screenW - 32, y - 8);
        ctx.textAlign = 'left';
      } else {
        // Faixa normal
        ctx.fillStyle = 'rgba(180, 240, 210, 0.88)';
        ctx.font = '600 23px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`TRACK ${numStr}: ${titleStr}`, screenX + 32, y - 8);

        ctx.font = '500 17px "Space Mono", monospace';
        ctx.fillStyle = 'rgba(109, 245, 181, 0.55)';
        ctx.textAlign = 'right';
        ctx.fillText(`${track.bpm} BPM`, screenX + screenW - 32, y - 8);
        ctx.textAlign = 'left';
      }
    }

    // 5. Rodapé do Terminal Matrix
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(109, 245, 181, 0.65)';
    ctx.font = '500 14px "Space Mono", monospace';
    const curStart = Math.floor(this.scrollOffset) + 1;
    const curEnd = Math.min(totalTracks, Math.floor(this.scrollOffset) + visibleCount);
    ctx.fillText(
      `EXIBINDO ${curStart}-${curEnd} DE ${totalTracks} FAIXAS · [F] VIRAR CAPA · [ESC] GUARDAR`,
      screenX + 24,
      screenY + screenH - 24
    );

    this.backCoverTexture.needsUpdate = true;
  }

  /**
   * Define a faixa sob o cursor para feedback visual em tempo real
   */
  public setHoveredTrack(index: number | null): void {
    if (this.hoveredTrackIndex !== index) {
      this.hoveredTrackIndex = index;
      this.renderBackCover();
    }
  }

  /**
   * Converte coordenadas UV do raycast na contracapa do CD para o índice exato da faixa
   */
  public getTrackIndexAtUV(uv: THREE.Vector2): number | null {
    const canvasY = (1.0 - uv.y) * 1024;
    const canvasX = uv.x * 1024;
    const screenX = 84;
    const screenW = 1024 - 168;
    const screenY = 92;
    const startY = screenY + 138;
    const lineHeight = 62;
    const visibleCount = 8;
    const totalTracks = this.tracks.length;

    if (canvasX >= screenX + 16 && canvasX <= screenX + screenW - 16) {
      if (canvasY >= startY - 42 && canvasY <= startY + visibleCount * lineHeight) {
        const row = Math.floor((canvasY - (startY - 42)) / lineHeight);
        if (row >= 0 && row < visibleCount) {
          const idx = Math.floor(this.scrollOffset) + row;
          if (idx < totalTracks) return idx;
        }
      }
    }
    return null;
  }

  /**
   * Seleciona e reproduz uma faixa específica diretamente por índice
   */
  public selectTrackByIndex(index: number): void {
    if (index >= 0 && index < this.tracks.length) {
      this.activeTrackIndex = index;
      this.playActiveTrack();
    }
  }

  public getActiveTrackIndex(): number {
    return this.activeTrackIndex;
  }

  /**
   * Pega o CD na mão.
   * Se for a primeira vez no site, executa animação de 2s de inspeção (afastada, gira capa e contracapa).
   * Se já inspecionou, vai diretamente para a posição de leitura e seleção.
   */
  public take(isFirstEver: boolean = false): void {
    this.isVisible = true;
    soundEngine.playCaseSnapSound();

    if (isFirstEver) {
      this.isFirstTakeInspecting = true;
      this.firstTakeStartTime = performance.now();
      this.currentY = -0.06;
      this.targetY = -0.06;
      this.currentZ = -0.62;
      this.targetZ = -0.62;
      this.currentFlipAngle = 0; // Inicia mostrando capa frontal CAPA.jpeg
      this.targetFlipAngle = 0;
    } else {
      this.isFirstTakeInspecting = false;
      this.targetY = -0.04;
      this.targetZ = -0.46;
      this.targetFlipAngle = 0; // Inicia mostrando a arte da capa frontal (GIGA 'N' TERA)
    }
  }

  /**
   * Guarda o CD no pedestal (Abaixa o viewmodel fora da tela)
   */
  public stow(): void {
    this.targetY = -1.6;
    this.isFirstTakeInspecting = false;
    soundEngine.playCaseSnapSound();
    setTimeout(() => {
      if (this.targetY < -1.0) {
        this.isVisible = false;
      }
    }, 450);
  }

  /**
   * Gira o estojo de CD em 180° (Alterna Capa Frontal e Contracapa com Faixas)
   */
  public flip(): void {
    soundEngine.playCaseSnapSound();
    if (Math.abs(this.targetFlipAngle - Math.PI) < 0.2) {
      this.targetFlipAngle = 0; // Mostra capa frontal
    } else {
      this.targetFlipAngle = Math.PI; // Mostra contracapa com faixas
    }
  }

  /**
   * Scroll contínuo e suave pelas faixas (com clamping e sem loops caóticos)
   */
  public scrollTracks(delta: number): void {
    const maxScroll = Math.max(0, this.tracks.length - 8);
    const nextOffset = Math.max(0, Math.min(maxScroll, this.targetScrollOffset + delta));
    this.targetScrollOffset = nextOffset;
  }

  /**
   * Navega para a próxima faixa ou anterior via teclado (Arrow Up/Down ou W/S)
   */
  public stepTrack(step: number): void {
    const nextIdx = Math.max(0, Math.min(this.tracks.length - 1, this.activeTrackIndex + step));
    this.activeTrackIndex = nextIdx;

    // Ajusta a janela de scroll para manter a faixa ativa visível
    const maxScroll = Math.max(0, this.tracks.length - 8);
    if (nextIdx < this.targetScrollOffset) {
      this.targetScrollOffset = nextIdx;
    } else if (nextIdx >= this.targetScrollOffset + 8) {
      this.targetScrollOffset = Math.min(maxScroll, nextIdx - 7);
    }

    this.playActiveTrack();
  }

  public nextTrack(): void {
    this.stepTrack(1);
  }

  public prevTrack(): void {
    this.stepTrack(-1);
  }

  /**
   * Toca a faixa ativa
   */
  public playActiveTrack(): void {
    const track = this.tracks[this.activeTrackIndex];
    if (track) {
      soundEngine.playTrackPreview(track);
      if (this.onTrackSelected) {
        this.onTrackSelected(track);
      }
      this.renderBackCover();
    }
  }

  /**
   * Define a faixa ativa externamente
   */
  public setActiveTrack(trackId: string): void {
    const idx = this.tracks.findIndex((t) => t.id === trackId);
    if (idx >= 0) {
      this.activeTrackIndex = idx;
      this.targetScrollOffset = Math.max(0, Math.min(this.tracks.length - 8, idx));
      this.renderBackCover();
    }
  }

  /**
   * Balanço de mouse (intencionalmente desativado/suave quando segurando o CD
   * para que o mouse possa clicar com absoluta precisão e sem oscilar o CD)
   */
  public addSway(deltaX: number, deltaY: number): void {
    // Quando segurando o CD na mão para seleção de faixas, o CD deve ficar estável!
  }

  /**
   * Loop de atualização do Viewmodel a cada frame (60 FPS)
   */
  public update(time: number, isMoving: boolean): void {
    if (!this.isVisible && this.currentY <= -1.5) {
      this.rootGroup.visible = false;
      return;
    }
    this.rootGroup.visible = true;

    // 0. Sequência de Inspeção Inicial (2s apenas na primeira pegada de CD)
    if (this.isFirstTakeInspecting) {
      const elapsed = (performance.now() - this.firstTakeStartTime) / 1000;
      if (elapsed < 0.75) {
        // Exibe a capa frontal afastada
        this.targetFlipAngle = 0;
        this.targetZ = -0.62;
        this.targetY = -0.06;
      } else if (elapsed < 1.45) {
        // Gira 180° revelando a contracapa
        this.targetFlipAngle = Math.PI;
        this.targetZ = -0.52;
        this.targetY = -0.05;
      } else if (elapsed < 2.1) {
        // Aproxima para o POV confortável de seleção de faixas
        this.targetFlipAngle = Math.PI;
        this.targetZ = -0.46;
        this.targetY = -0.04;
      } else {
        this.isFirstTakeInspecting = false;
        useAppStore.getState().setHasInspectedCDBefore(true);
      }
    }

    // 1. Interpolação de elevação (Subida / Descida)
    this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, 0.12);
    this.currentZ = THREE.MathUtils.lerp(this.currentZ, this.targetZ, 0.12);

    // 2. Interpolação de rotação de giro Capa / Contracapa
    this.currentFlipAngle = THREE.MathUtils.lerp(this.currentFlipAngle, this.targetFlipAngle, 0.14);
    this.caseGroup.rotation.y = this.currentFlipAngle;

    // 3. Interpolação suave do scroll de faixas
    if (Math.abs(this.scrollOffset - this.targetScrollOffset) > 0.01) {
      this.scrollOffset = THREE.MathUtils.lerp(this.scrollOffset, this.targetScrollOffset, 0.22);
      this.renderBackCover();
    }

    // 4. Idle breathing ultra sutil (apenas respiração orgânica, sem sway de cursor)
    const breathingY = Math.sin(time * 1.8) * 0.0018;
    const breathingX = Math.cos(time * 0.9) * 0.001;

    const isMob = useAppStore.getState().isMobile;
    const baseTargetX = isMob ? 0.02 : 0.18;

    this.rootGroup.position.x = baseTargetX + breathingX;
    this.rootGroup.position.y = this.currentY + breathingY;
    this.rootGroup.position.z = this.currentZ;

    this.rootGroup.rotation.z = 0;
    this.rootGroup.rotation.x = 0.03;
  }
}
