# 03 — Animation System
> Idle animations, blink, breathing, head sway — estilo PS2

---

## Filosofia

O avatar nunca fica completamente parado — exatamente como personagens de jogos PS2 em telas de seleção. Três camadas de animação rodando simultaneamente:

```
BREATHING   → oscilação vertical sutil do busto (4s ciclo)
HEAD SWAY   → balançar lento da cabeça (6s ciclo, random offset)
BLINK       → piscar randômico (3-7s intervalo)
```

Todas as animações usam **easing sinusoidal** — nunca linear. Sem bibliotecas externas, puro `Math.sin()` com `clock.getElapsedTime()`.

---

## IdleAnimator.js

```js
// IdleAnimator.js
import * as THREE from 'three'

export class IdleAnimator {
  constructor(avatarGroup, faceRefs) {
    this.avatar = avatarGroup
    this.face = faceRefs        // { head, eyeL, eyeR, eyebrowL, eyebrowR }
    this.clock = new THREE.Clock()

    // Seeds de fase pra cada avatar ser único no timing
    this.phaseBreath  = Math.random() * Math.PI * 2
    this.phaseSway    = Math.random() * Math.PI * 2
    this.phaseNod     = Math.random() * Math.PI * 2

    // Estado do blink
    this.blinkTimer = 3 + Math.random() * 3   // próximo blink em X segundos
    this.blinkState = 'open'                   // 'open' | 'closing' | 'opening'
    this.blinkProgress = 0

    // Amplitude — personagens diferentes têm idle diferente
    this.breathAmp  = 0.008 + Math.random() * 0.006   // 0.008 - 0.014
    this.swayAmp    = 0.03  + Math.random() * 0.04    // 0.03 - 0.07 radianos
    this.nodAmp     = 0.015 + Math.random() * 0.02    // 0.015 - 0.035
  }

  // Chamado todo frame no loop principal
  update() {
    const t = this.clock.getElapsedTime()
    const dt = this.clock.getDelta()

    this._updateBreathing(t)
    this._updateHeadSway(t)
    this._updateBlink(t, dt)
    this._updateSubtle(t)
  }

  // ── BREATHING ──────────────────────────────────────────
  // Busto sobe e desce levemente
  _updateBreathing(t) {
    const breath = Math.sin(t * (Math.PI * 2 / 4) + this.phaseBreath)
    // Y do avatar inteiro sobe/desce
    this.avatar.position.y = breath * this.breathAmp
    // Leve compressão no eixo Z (tórax expandindo)
    this.avatar.scale.z = 1 + breath * 0.003
  }

  // ── HEAD SWAY ──────────────────────────────────────────
  // Cabeça balança suavemente nos 3 eixos
  _updateHeadSway(t) {
    if (!this.face.head) return

    // Rotação Y — esquerda/direita (principal)
    const swayY = Math.sin(t * (Math.PI * 2 / 6) + this.phaseSway)
    // Rotação Z — inclinação (menos)
    const swayZ = Math.sin(t * (Math.PI * 2 / 8) + this.phaseSway + 1.2)
    // Rotação X — nod (sutil)
    const swayX = Math.sin(t * (Math.PI * 2 / 9) + this.phaseNod)

    this.face.head.rotation.y = swayY * this.swayAmp
    this.face.head.rotation.z = swayZ * (this.swayAmp * 0.4)
    this.face.head.rotation.x = swayX * this.nodAmp
  }

  // ── BLINK ──────────────────────────────────────────────
  // Piscar natural — eixo Y dos olhos
  _updateBlink(t, dt) {
    this.blinkTimer -= dt

    if (this.blinkTimer <= 0 && this.blinkState === 'open') {
      this.blinkState = 'closing'
      this.blinkProgress = 0
    }

    if (this.blinkState === 'closing') {
      this.blinkProgress += dt * 12   // 12x speed — fechar rápido
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 1
        this.blinkState = 'opening'
      }
    } else if (this.blinkState === 'opening') {
      this.blinkProgress -= dt * 8    // abrir um pouco mais devagar
      if (this.blinkProgress <= 0) {
        this.blinkProgress = 0
        this.blinkState = 'open'
        // Próximo blink: 2.5s a 6s, às vezes pisca duas vezes rápido
        const doubleBlink = Math.random() < 0.15
        this.blinkTimer = doubleBlink ? 0.12 : (2.5 + Math.random() * 3.5)
      }
    }

    // Aplicar escala Y nos meshes dos olhos (esmaga o olho)
    const eyeScaleY = 1 - this.blinkProgress
    if (this.face.eyeL) this.face.eyeL.scale.y = Math.max(0.05, eyeScaleY)
    if (this.face.eyeR) this.face.eyeR.scale.y = Math.max(0.05, eyeScaleY)

    // Sobrancelhas levemente sobem ao fechar (expressivo como PS2)
    if (this.face.eyebrowL) {
      this.face.eyebrowL.position.y += this.blinkProgress * 0.02
      this.face.eyebrowR.position.y += this.blinkProgress * 0.02
    }
  }

  // ── MICRO-MOVIMENTOS SUTIS ────────────────────────────
  // Detalhes que fazem o personagem "vivo"
  _updateSubtle(t) {
    // Leve pulsação de escala geral (0.2% — quase imperceptível)
    const pulse = Math.sin(t * 1.3 + this.phaseBreath * 0.7)
    this.avatar.scale.x = 1 + pulse * 0.002
    this.avatar.scale.y = 1 - pulse * 0.001
  }
}
```

---

## Loop Principal de Render

```js
// AvatarController.js
import { IdleAnimator } from './IdleAnimator'

export class AvatarController {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.scene    = new THREE.Scene()
    this.camera   = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    this.camera.position.set(0, 0, 5)

    this.animator = null
    this.avatarGroup = null

    this._startLoop()
  }

  _startLoop() {
    const loop = () => {
      requestAnimationFrame(loop)
      if (this.animator) this.animator.update()
      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  mountAvatar(faceGroup, outfitGroup, faceRefs) {
    // Remove avatar anterior
    if (this.avatarGroup) this.scene.remove(this.avatarGroup)

    this.avatarGroup = new THREE.Group()
    this.avatarGroup.add(faceGroup)
    this.avatarGroup.add(outfitGroup)
    this.scene.add(this.avatarGroup)

    // Inicia animação
    this.animator = new IdleAnimator(this.avatarGroup, faceRefs)
  }

  // Trocar apenas o rosto, mantendo outfit (smooth swap)
  swapFace(newFaceGroup, newFaceRefs) {
    if (!this.avatarGroup) return
    // Remove face antiga
    const oldFace = this.avatarGroup.children[0]
    this.avatarGroup.remove(oldFace)
    oldFace.traverse(c => { if (c.geometry) c.geometry.dispose() })
    // Adiciona nova
    this.avatarGroup.add(newFaceGroup)
    // Reinicia animator com novos refs
    const outfitGroup = this.avatarGroup.children[0]
    this.animator = new IdleAnimator(this.avatarGroup, newFaceRefs)
  }

  // Trocar apenas outfit
  swapOutfit(newOutfitGroup) {
    if (!this.avatarGroup) return
    const oldOutfit = this.avatarGroup.children[1]
    if (oldOutfit) {
      this.avatarGroup.remove(oldOutfit)
      oldOutfit.traverse(c => { if (c.geometry) c.geometry.dispose() })
    }
    this.avatarGroup.add(newOutfitGroup)
  }
}
```

---

## Animação de Transição de Seed

Quando o usuário clica "Randomize" — efeito PS2-style de "dissolve":

```js
// Transition: scale down → rebuild → scale up
async function transitionAvatar(controller, buildFn) {
  const group = controller.avatarGroup
  const DURATION = 180   // ms

  // Squeeze down
  const start = performance.now()
  await new Promise(resolve => {
    const shrink = () => {
      const t = (performance.now() - start) / DURATION
      if (t >= 1) { group.scale.setScalar(0.01); resolve(); return }
      group.scale.setScalar(1 - easeIn(t))
      requestAnimationFrame(shrink)
    }
    shrink()
  })

  // Rebuilds mesh
  await buildFn()

  // Pop back
  const start2 = performance.now()
  await new Promise(resolve => {
    const grow = () => {
      const t = (performance.now() - start2) / DURATION
      if (t >= 1) { group.scale.setScalar(1); resolve(); return }
      group.scale.setScalar(easeOutBack(t))
      requestAnimationFrame(grow)
    }
    grow()
  })
}

function easeIn(t)      { return t * t }
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
```
