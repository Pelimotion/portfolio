/**
 * CD VIEWMODEL 3D — Primeira Pessoa (POV) com Mão Low-Poly Facetada (PS1/PS2 Aesthetic)
 * Reproduz com máxima fidelidade a imagem de referência do usuário:
 * Mão 3D poligonal com sombreamento flat segurando o estojo de acrílico Jewel Case em POV,
 * com contracapa pixel/mono, código de barras, giro de 180° e scroll de faixas autorais.
 */

import * as THREE from 'three';
import { AUTHORIAL_TRACKS_CATALOG } from '../../data/artworks';
import { AudioTrackInfo } from '../../types/art';
import { soundEngine } from '../../core/soundEngine';

export class CDViewmodel3D {
  public rootGroup: THREE.Group;
  public caseGroup: THREE.Group;
  public handGroup: THREE.Group;
  public backInlayMesh!: THREE.Mesh;

  private isVisible: boolean = false;
  private currentY: number = -1.6; // Começa abaixado fora do campo de visão
  private targetY: number = -1.6;
  private targetZ: number = -0.48;
  private currentZ: number = -0.48;

  // Giro Capa / Contracapa (0 = Capa, Math.PI = Contracapa)
  private currentFlipAngle: number = Math.PI; // Inicia mostrando contracapa conforme referência
  private targetFlipAngle: number = Math.PI;

  // Canvas dinâmico para a contracapa (Barcode, Faixas, Tipografia Pixel/Mono)
  private backCoverCanvas: HTMLCanvasElement;
  private backCoverCtx: CanvasRenderingContext2D;
  private backCoverTexture: THREE.CanvasTexture;

  // Estado das faixas
  private tracks: AudioTrackInfo[] = AUTHORIAL_TRACKS_CATALOG;
  private activeTrackIndex: number = 0;
  private hoveredTrackIndex: number | null = null;
  private scrollOffset: number = 0;
  private targetScrollOffset: number = 0;

  // Inércia de mouse e balanço de respiração
  private swayX: number = 0;
  private swayY: number = 0;
  private targetSwayX: number = 0;
  private targetSwayY: number = 0;

  // Callback de troca de faixa para o Zustand store
  private onTrackSelected?: (track: AudioTrackInfo) => void;

  constructor(onTrackSelected?: (track: AudioTrackInfo) => void) {
    this.onTrackSelected = onTrackSelected;

    this.rootGroup = new THREE.Group();
    this.rootGroup.position.set(0.08, this.currentY, this.currentZ);

    this.caseGroup = new THREE.Group();
    this.handGroup = new THREE.Group();

    // 1. Cria a textura dinâmica da contracapa
    this.backCoverCanvas = document.createElement('canvas');
    this.backCoverCanvas.width = 1024;
    this.backCoverCanvas.height = 1024;
    this.backCoverCtx = this.backCoverCanvas.getContext('2d')!;
    this.backCoverTexture = new THREE.CanvasTexture(this.backCoverCanvas);
    this.backCoverTexture.colorSpace = THREE.SRGBColorSpace;
    this.backCoverTexture.minFilter = THREE.NearestFilter;
    this.backCoverTexture.magFilter = THREE.NearestFilter;

    // Render inicial da contracapa
    this.renderBackCover();

    // 2. Constrói o estojo de acrílico Jewel Case 3D
    this.buildJewelCase();

    // 3. Constrói a mão 3D low-poly facetada (PS1/PS2)
    this.buildLowPolyHand();

    // Monta hierarquia
    this.rootGroup.add(this.caseGroup);
    this.rootGroup.add(this.handGroup);
  }

  /**
   * Constrói o estojo acrílico Jewel Case 3D com detalhes físicos
   */
  private buildJewelCase(): void {
    const caseWidth = 0.52;
    const caseHeight = 0.52;
    const caseDepth = 0.042;

    // Estrutura em acrílico transparente com chanfros e reflexo sutil
    const acrylicMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      roughness: 0.06,
      ior: 1.52,
      thickness: 0.08,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.7
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

    // Contracapa (Back Cover): Plano voltado para trás (Z = -0.015) com rotação Y de 180°
    const backInlayGeo = new THREE.PlaneGeometry(caseWidth * 0.92, caseHeight * 0.94);
    const backInlayMat = new THREE.MeshBasicMaterial({
      map: this.backCoverTexture,
      side: THREE.FrontSide
    });
    this.backInlayMesh = new THREE.Mesh(backInlayGeo, backInlayMat);
    this.backInlayMesh.position.set(0.005, 0, -0.012);
    this.backInlayMesh.rotation.y = Math.PI; // Voltado para trás
    (this.backInlayMesh as any).isCDBackCover = true;
    this.caseGroup.add(this.backInlayMesh);

    // Capa Frontal (Front Cover Artwork): Arte impressa de Pelimotion voltada para frente (Z = +0.012)
    const texLoader = new THREE.TextureLoader();
    const frontTex = texLoader.load('/gigantera/works/espinhaco-cinetica-prata.jpg');
    frontTex.colorSpace = THREE.SRGBColorSpace;
    const frontInlayMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: 0.92,
      metalness: 0.02
    });
    const frontInlayMesh = new THREE.Mesh(backInlayGeo, frontInlayMat);
    frontInlayMesh.position.set(0.005, 0, 0.012);
    this.caseGroup.add(frontInlayMesh);

    // Bandeja interna translúcida cinza escuro com rosette do hub
    const trayGeo = new THREE.PlaneGeometry(caseWidth * 0.88, caseHeight * 0.9);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c1b,
      roughness: 0.7,
      metalness: 0.1
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0.008, 0, -0.006);
    this.caseGroup.add(trayMesh);

    // Roseta central dos dentinhos do CD (Hub)
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.014, 12);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x2e3330,
      roughness: 0.5,
      metalness: 0.2
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.set(0.01, 0, -0.002);
    this.caseGroup.add(hubMesh);
  }

  /**
   * Constrói a mão 3D low-poly facetada (Flat Shading) segurando o CD na borda direita,
   * reproduzindo com exatidão a estética angular da imagem de referência.
   */
  private buildLowPolyHand(): void {
    // Material cerâmico / plaster com facetas bem visíveis e especularidade de PS1/PS2
    const handMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3cb,
      roughness: 0.78,
      metalness: 0.06,
      flatShading: true // Exatamente como na referência! Facetas poligonais nítidas
    });

    // Antebraço entrando da direita inferior (X ~ 0.38, Y ~ -0.28, Z ~ -0.08)
    const armGeo = new THREE.CylinderGeometry(0.075, 0.11, 0.55, 6);
    const armMesh = new THREE.Mesh(armGeo, handMat);
    armMesh.position.set(0.38, -0.28, -0.08);
    armMesh.rotation.set(0.35, 0.2, -0.75);
    this.handGroup.add(armMesh);

    // Pulso angular
    const wristGeo = new THREE.BoxGeometry(0.12, 0.08, 0.09);
    const wristMesh = new THREE.Mesh(wristGeo, handMat);
    wristMesh.position.set(0.26, -0.12, -0.05);
    wristMesh.rotation.set(0.2, 0.1, -0.4);
    this.handGroup.add(wristMesh);

    // Palma da mão apoiada no canto direito inferior do estojo
    const palmGeo = new THREE.BoxGeometry(0.14, 0.16, 0.07);
    const palmMesh = new THREE.Mesh(palmGeo, handMat);
    palmMesh.position.set(0.24, -0.05, -0.02);
    palmMesh.rotation.set(0.1, -0.15, -0.25);
    this.handGroup.add(palmMesh);

    // Polegar (Thumb) — segurando a face/borda do estojo
    const thumbProxGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.09, 5);
    const thumbProx = new THREE.Mesh(thumbProxGeo, handMat);
    thumbProx.position.set(0.18, 0.02, 0.028);
    thumbProx.rotation.set(-0.4, 0.3, -0.6);
    this.handGroup.add(thumbProx);

    const thumbDistGeo = new THREE.CylinderGeometry(0.02, 0.024, 0.08, 5);
    const thumbDist = new THREE.Mesh(thumbDistGeo, handMat);
    thumbDist.position.set(0.16, 0.07, 0.035);
    thumbDist.rotation.set(-0.6, 0.1, -0.2);
    this.handGroup.add(thumbDist);

    // Dedo Indicador (Index) — curvado segurando a lateral direita superior
    const indexGeo1 = new THREE.CylinderGeometry(0.02, 0.024, 0.09, 5);
    const index1 = new THREE.Mesh(indexGeo1, handMat);
    index1.position.set(0.26, 0.08, -0.02);
    index1.rotation.set(0.2, 0.1, 0.4);
    this.handGroup.add(index1);

    const indexGeo2 = new THREE.CylinderGeometry(0.017, 0.02, 0.08, 5);
    const index2 = new THREE.Mesh(indexGeo2, handMat);
    index2.position.set(0.23, 0.13, -0.015);
    index2.rotation.set(0.1, -0.4, 0.9);
    this.handGroup.add(index2);

    // Dedo Médio (Middle) — segurando o centro da borda direita
    const midGeo1 = new THREE.CylinderGeometry(0.021, 0.025, 0.1, 5);
    const mid1 = new THREE.Mesh(midGeo1, handMat);
    mid1.position.set(0.27, 0.01, -0.03);
    mid1.rotation.set(0.1, 0.0, 0.25);
    this.handGroup.add(mid1);

    const midGeo2 = new THREE.CylinderGeometry(0.018, 0.021, 0.085, 5);
    const mid2 = new THREE.Mesh(midGeo2, handMat);
    mid2.position.set(0.24, 0.02, -0.015);
    mid2.rotation.set(0.0, -0.4, 0.85);
    this.handGroup.add(mid2);

    // Dedo Anelar (Ring) — borda inferior direita
    const ringGeo1 = new THREE.CylinderGeometry(0.019, 0.023, 0.09, 5);
    const ring1 = new THREE.Mesh(ringGeo1, handMat);
    ring1.position.set(0.26, -0.06, -0.04);
    ring1.rotation.set(0.0, 0.0, 0.15);
    this.handGroup.add(ring1);

    const ringGeo2 = new THREE.CylinderGeometry(0.016, 0.019, 0.075, 5);
    const ring2 = new THREE.Mesh(ringGeo2, handMat);
    ring2.position.set(0.23, -0.06, -0.02);
    ring2.rotation.set(-0.1, -0.3, 0.75);
    this.handGroup.add(ring2);

    // Dedo Mindinho (Pinky) — apoiando a quina inferior
    const pinkyGeo = new THREE.CylinderGeometry(0.015, 0.019, 0.08, 5);
    const pinky = new THREE.Mesh(pinkyGeo, handMat);
    pinky.position.set(0.24, -0.13, -0.045);
    pinky.rotation.set(-0.2, 0.0, 0.35);
    this.handGroup.add(pinky);
  }

  /**
   * Renderiza a contracapa em alta resolução no canvas,
   * reproduzindo com rigor o layout da imagem de referência:
   * "BACK COVER", lista de faixas em pixel/mono, barcode no canto inferior direito.
   */
  public renderBackCover(): void {
    const ctx = this.backCoverCtx;
    const w = this.backCoverCanvas.width;
    const h = this.backCoverCanvas.height;

    // Fundo cinza-azulado com textura de ruído e leve gradiente iridescente estilo holográfico
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#5f6966');
    grad.addColorStop(0.3, '#757c70');
    grad.addColorStop(0.6, '#636c74');
    grad.addColorStop(1, '#4e5652');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Efeito sutil de aberração cromática / ruído impresso
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Moldura interna clássica de encarte
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // 1. TÍTULO PRINCIPAL: "BACK COVER" (Centralizado, tipografia pixel/brutalista)
    ctx.fillStyle = '#111413';
    ctx.font = 'bold 64px "Space Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BACK COVER', w / 2, 130);

    // Subtítulo de arquivo
    ctx.font = '500 22px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(15, 18, 17, 0.7)';
    ctx.fillText('FELIPE CONCEIÇÃO // PELIMOTION AUDIO ARCHIVE', w / 2, 170);

    // 2. LISTA DE FAIXAS (TRACK 01: ..., TRACK 02: ...)
    // Exibição em janela deslizante de 10 faixas visíveis com scroll contínuo
    const visibleCount = 10;
    const totalTracks = this.tracks.length;
    const startY = 240;
    const lineHeight = 54;

    ctx.textAlign = 'left';

    for (let i = 0; i < visibleCount; i++) {
      const trackIdx = (Math.floor(this.scrollOffset) + i) % totalTracks;
      const track = this.tracks[trackIdx];
      const y = startY + i * lineHeight;

      const isCurrent = trackIdx === this.activeTrackIndex;
      const isHovered = trackIdx === this.hoveredTrackIndex;

      if (isCurrent) {
        // Destaque na faixa ativa: faixa preta com texto branco invertido
        ctx.fillStyle = '#0f1211';
        ctx.fillRect(80, y - 38, w - 380, 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`▶ TRACK ${numStr}: ${titleStr}`, 96, y - 6);

        // Indicador de reprodução
        ctx.font = '20px "Space Mono", monospace';
        ctx.fillStyle = '#89f5a2';
        ctx.fillText('● EM REPRODUÇÃO', w - 370, y - 8);
      } else if (isHovered) {
        // Destaque ao passar o mouse sobre a faixa no CD
        ctx.fillStyle = 'rgba(15, 18, 17, 0.4)';
        ctx.fillRect(80, y - 38, w - 380, 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`▷ TRACK ${numStr}: ${titleStr}`, 96, y - 6);

        ctx.font = 'bold 18px "Space Mono", monospace';
        ctx.fillStyle = '#e4c379';
        ctx.fillText('CLIQUE P/ TOCAR', w - 370, y - 8);
      } else {
        ctx.fillStyle = '#181b19';
        ctx.font = '600 27px "Space Mono", monospace';
        const numStr = String(trackIdx + 1).padStart(2, '0');
        const titleStr = track.title.toUpperCase();
        ctx.fillText(`TRACK ${numStr}: ${titleStr}`, 96, y - 6);
      }
    }

    // 3. BARCODE AUTÊNTICO NO CANTO INFERIOR DIREITO (Exatamente como na foto de referência!)
    const bcX = w - 340;
    const bcY = h - 220;
    const bcW = 280;
    const bcH = 140;

    // Fundo branco do código de barras
    ctx.fillStyle = '#f8f8f6';
    ctx.fillRect(bcX, bcY, bcW, bcH);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.strokeRect(bcX, bcY, bcW, bcH);

    // Barras pretas verticais com larguras variáveis estilizadas
    ctx.fillStyle = '#111';
    const barPatterns = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3];
    let curBx = bcX + 18;
    for (let b = 0; b < barPatterns.length; b++) {
      const bWidth = barPatterns[b] * 2.4;
      if (b % 2 === 0) {
        ctx.fillRect(curBx, bcY + 12, bWidth, bcH - 45);
      }
      curBx += bWidth + 2.5;
      if (curBx > bcX + bcW - 20) break;
    }

    // Numeração do código de barras
    ctx.fillStyle = '#111';
    ctx.font = 'bold 22px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('3 710560 038601', bcX + bcW / 2, bcY + bcH - 12);

    // 4. SELO COMPACT DISC DIGITAL AUDIO NO CANTO INFERIOR ESQUERDO
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#181b19';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, h - 180, 200, 70);

    ctx.fillStyle = '#181b19';
    ctx.font = 'bold 19px "Space Mono", monospace';
    ctx.fillText('COMPACT DISC', 96, h - 145);
    ctx.font = '14px "Space Mono", monospace';
    ctx.fillText('DIGITAL AUDIO', 96, h - 124);

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
   * Converte coordenadas UV do raycast na contracapa do CD para o índice da faixa
   */
  public getTrackIndexAtUV(uv: THREE.Vector2): number | null {
    // uv.y vai de 0 (base) a 1 (topo)
    // No canvas (1024x1024), Y = (1.0 - uv.y) * 1024
    const canvasY = (1.0 - uv.y) * 1024;
    const startY = 240;
    const lineHeight = 54;
    const visibleCount = 10;
    const totalTracks = this.tracks.length;

    // Área das faixas no canvas
    if (canvasY >= startY - 38 && canvasY <= startY + visibleCount * lineHeight) {
      const row = Math.floor((canvasY - (startY - 38)) / lineHeight);
      if (row >= 0 && row < visibleCount) {
        return (Math.floor(this.scrollOffset) + row) % totalTracks;
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
   * Pega o CD na mão (Sobe o viewmodel para o centro do POV)
   */
  public take(): void {
    this.isVisible = true;
    this.targetY = -0.04;
    this.targetZ = -0.46;
    soundEngine.playCaseSnapSound();
  }

  /**
   * Guarda o CD no pedestal (Abaixa o viewmodel fora da tela)
   */
  public stow(): void {
    this.targetY = -1.6;
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
    if (Math.abs(this.targetFlipAngle - Math.PI) < 0.1) {
      this.targetFlipAngle = 0; // Mostra capa frontal
    } else {
      this.targetFlipAngle = Math.PI; // Mostra contracapa com faixas
    }
  }

  /**
   * Scroll contínuo pelas faixas (via roda do mouse ou swipe)
   */
  public scrollTracks(delta: number): void {
    const totalTracks = this.tracks.length;
    this.targetScrollOffset = (this.targetScrollOffset + delta + totalTracks) % totalTracks;
  }

  /**
   * Seleciona e toca imediatamente a próxima faixa
   */
  public nextTrack(): void {
    this.activeTrackIndex = (this.activeTrackIndex + 1) % this.tracks.length;
    this.scrollOffset = this.activeTrackIndex;
    this.targetScrollOffset = this.activeTrackIndex;
    this.playActiveTrack();
  }

  /**
   * Seleciona e toca imediatamente a faixa anterior
   */
  public prevTrack(): void {
    this.activeTrackIndex = (this.activeTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.scrollOffset = this.activeTrackIndex;
    this.targetScrollOffset = this.activeTrackIndex;
    this.playActiveTrack();
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
      this.targetScrollOffset = idx;
      this.renderBackCover();
    }
  }

  /**
   * Adiciona inércia de mouse (mouse lag / viewmodel sway)
   */
  public addSway(deltaX: number, deltaY: number): void {
    this.targetSwayX = THREE.MathUtils.clamp(this.targetSwayX + deltaX * 0.0003, -0.05, 0.05);
    this.targetSwayY = THREE.MathUtils.clamp(this.targetSwayY + deltaY * 0.0003, -0.04, 0.04);
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

    // 1. Interpolação de elevação (Subida / Descida)
    this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, 0.12);
    this.currentZ = THREE.MathUtils.lerp(this.currentZ, this.targetZ, 0.12);

    // 2. Interpolação de rotação de giro Capa / Contracapa
    this.currentFlipAngle = THREE.MathUtils.lerp(this.currentFlipAngle, this.targetFlipAngle, 0.14);
    this.caseGroup.rotation.y = this.currentFlipAngle;

    // 3. Interpolação suave do scroll de faixas
    if (Math.abs(this.scrollOffset - this.targetScrollOffset) > 0.01) {
      this.scrollOffset = THREE.MathUtils.lerp(this.scrollOffset, this.targetScrollOffset, 0.18);
      this.renderBackCover();
    }

    // 4. Inércia e retorno do Sway
    this.swayX = THREE.MathUtils.lerp(this.swayX, this.targetSwayX, 0.1);
    this.swayY = THREE.MathUtils.lerp(this.swayY, this.targetSwayY, 0.1);
    this.targetSwayX = THREE.MathUtils.lerp(this.targetSwayX, 0, 0.08);
    this.targetSwayY = THREE.MathUtils.lerp(this.targetSwayY, 0, 0.08);

    // 5. Idle breathing (Balanço de respiração)
    const breathingY = Math.sin(time * 2.2) * 0.0035;
    const breathingX = Math.cos(time * 1.1) * 0.002;

    // 6. Balanço adicional ao caminhar
    const walkBobY = isMoving ? Math.sin(time * 8.5) * 0.008 : 0;
    const walkBobX = isMoving ? Math.cos(time * 4.2) * 0.005 : 0;

    this.rootGroup.position.x = 0.06 + this.swayX + breathingX + walkBobX;
    this.rootGroup.position.y = this.currentY + this.swayY + breathingY + walkBobY;
    this.rootGroup.position.z = this.currentZ;

    // Leve inclinação dinâmica
    this.rootGroup.rotation.z = -this.swayX * 0.8;
    this.rootGroup.rotation.x = 0.04 + this.swayY * 0.8;
  }
}
