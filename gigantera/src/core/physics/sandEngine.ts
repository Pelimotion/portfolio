import { TOKENS } from '../../tokens';

export interface SandGrain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
  friction: number;
}

export class SandPhysicsEngine {
  private grains: SandGrain[] = [];
  private width: number = 0;
  private height: number = 0;
  
  // Vetor de gravidade inercial efetivo
  public gx: number = 0;
  public gy: number = 18;
  
  private targetGx: number = 0;
  private targetGy: number = 18;

  constructor(numGrains: number = 1800) {
    this.initGrains(numGrains);
  }

  public resize(w: number, h: number): void {
    const prevW = this.width || w;
    const prevH = this.height || h;
    this.width = w;
    this.height = h;

    // Reposiciona grãos proporcionalmente
    for (const g of this.grains) {
      g.x = (g.x / prevW) * w;
      g.y = (g.y / prevH) * h;
    }
  }

  private initGrains(count: number): void {
    const palette = [
      TOKENS.colors.sedimentClay.hex, // Argila terracota
      TOKENS.colors.lightCaustic.hex, // Areia solar dourada
      TOKENS.colors.depthMid.hex,     // Silte ardósia escuro
      TOKENS.colors.surfaceGlass.hex  // Grânulos de sílica
    ];

    this.grains = [];
    for (let i = 0; i < count; i++) {
      // 50% iniciam acumulados no canto inferior esquerdo, 50% no direito
      const isLeft = i % 2 === 0;
      this.grains.push({
        x: isLeft ? Math.random() * 200 : (this.width || 1200) - Math.random() * 200,
        y: (this.height || 800) - Math.random() * 120,
        vx: 0,
        vy: 0,
        radius: 1.0 + Math.random() * 1.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        mass: 0.8 + Math.random() * 0.5,
        friction: 0.82 + Math.random() * 0.08
      });
    }
  }

  /**
   * Aplica força inercial gerada por aceleração da câmera ou cursor
   */
  public addInertia(deltaX: number, deltaY: number): void {
    // Força inercial oposta à aceleração
    this.targetGx = Math.max(-25, Math.min(25, -deltaX * 3.2));
    this.targetGy = Math.max(8, Math.min(32, 18 - deltaY * 2.5));
  }

  /**
   * Altura do leito/rampa física nos cantos da tela (função de contorno)
   */
  private getFloorY(x: number): number {
    const h = this.height;
    const w = this.width;
    if (w === 0 || h === 0) return 0;

    const cornerWidth = Math.min(w * 0.28, 320);
    const cornerHeight = Math.min(h * 0.18, 140);

    // Rampa do canto esquerdo
    if (x < cornerWidth) {
      const t = x / cornerWidth;
      return h - (1 - t * t) * cornerHeight;
    }
    // Rampa do canto direito
    if (x > w - cornerWidth) {
      const t = (w - x) / cornerWidth;
      return h - (1 - t * t) * cornerHeight;
    }
    // Fundo plano central
    return h - 4;
  }

  public update(dt: number = 0.016): void {
    // Interpolação suave do vetor de gravidade (amortecimento hidrodinâmico)
    this.gx += (this.targetGx - this.gx) * 0.08;
    this.gy += (this.targetGy - this.gy) * 0.08;

    // Retorna gradualmente à gravidade vertical de repouso
    this.targetGx *= 0.94;
    this.targetGy += (18 - this.targetGy) * 0.04;

    const w = this.width;
    const h = this.height;
    if (w === 0 || h === 0) return;

    for (let i = 0; i < this.grains.length; i++) {
      const g = this.grains[i];

      // Aceleração da gravidade e atrito fluido
      g.vx += this.gx * dt * 18;
      g.vy += this.gy * dt * 18;

      // Arrasto hidrodinâmico na água (grãos de areia desaceleram na água)
      g.vx *= 0.96;
      g.vy *= 0.96;

      g.x += g.vx * dt * 30;
      g.y += g.vy * dt * 30;

      // Colisão com as paredes laterais
      if (g.x < g.radius) {
        g.x = g.radius;
        g.vx *= -0.3;
      } else if (g.x > w - g.radius) {
        g.x = w - g.radius;
        g.vx *= -0.3;
      }

      // Colisão com o piso contornado (cantos elevados e fundo)
      const floorY = this.getFloorY(g.x) - g.radius;
      if (g.y >= floorY) {
        g.y = floorY;
        g.vy *= -0.2;

        // Atrito granular contra o leito
        g.vx *= g.friction;

        // Efeito de avalanche por ângulo de repouso:
        // Grãos em superfícies inclinadas deslizam se a gravidade lateral for alta
        const slopeDx = 4;
        const slope = (this.getFloorY(g.x + slopeDx) - this.getFloorY(g.x - slopeDx)) / (slopeDx * 2);
        
        // Deslizamento ao longo da declividade
        g.vx += slope * 1.8;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.width === 0 || this.height === 0) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // Desenha os grãos com leve brilho e micro-dimensões
    for (let i = 0; i < this.grains.length; i++) {
      const g = this.grains[i];
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
