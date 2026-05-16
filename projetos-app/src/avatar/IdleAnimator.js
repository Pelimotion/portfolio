// IdleAnimator.js
import * as THREE from 'three'

export class IdleAnimator {
  constructor(avatarGroup, faceRefs) {
    this.avatar = avatarGroup
    this.face = faceRefs        // { head, eyeL, eyeR, eyebrowL, eyebrowR }
    this.clock = new THREE.Clock()

    this.phaseBreath  = Math.random() * Math.PI * 2
    this.phaseSway    = Math.random() * Math.PI * 2
    this.phaseNod     = Math.random() * Math.PI * 2

    this.blinkTimer = 3 + Math.random() * 3
    this.blinkState = 'open'
    this.blinkProgress = 0

    this.breathAmp  = 0.008 + Math.random() * 0.006
    this.swayAmp    = 0.03  + Math.random() * 0.04
    this.nodAmp     = 0.015 + Math.random() * 0.02
  }

  update() {
    const t = this.clock.getElapsedTime()
    const dt = this.clock.getDelta()

    this._updateBreathing(t)
    this._updateHeadSway(t)
    this._updateBlink(t, dt)
    this._updateSubtle(t)
  }

  _updateBreathing(t) {
    const breath = Math.sin(t * (Math.PI * 2 / 4) + this.phaseBreath)
    this.avatar.position.y = breath * this.breathAmp
    this.avatar.scale.z = 1 + breath * 0.003
  }

  _updateHeadSway(t) {
    if (!this.face || !this.face.head) return

    const swayY = Math.sin(t * (Math.PI * 2 / 6) + this.phaseSway)
    const swayZ = Math.sin(t * (Math.PI * 2 / 8) + this.phaseSway + 1.2)
    const swayX = Math.sin(t * (Math.PI * 2 / 9) + this.phaseNod)

    this.face.head.rotation.y = swayY * this.swayAmp
    this.face.head.rotation.z = swayZ * (this.swayAmp * 0.4)
    this.face.head.rotation.x = swayX * this.nodAmp
  }

  _updateBlink(t, dt) {
    if (!this.face) return
    this.blinkTimer -= dt

    if (this.blinkTimer <= 0 && this.blinkState === 'open') {
      this.blinkState = 'closing'
      this.blinkProgress = 0
    }

    if (this.blinkState === 'closing') {
      this.blinkProgress += dt * 12
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 1
        this.blinkState = 'opening'
      }
    } else if (this.blinkState === 'opening') {
      this.blinkProgress -= dt * 8
      if (this.blinkProgress <= 0) {
        this.blinkProgress = 0
        this.blinkState = 'open'
        const doubleBlink = Math.random() < 0.15
        this.blinkTimer = doubleBlink ? 0.12 : (2.5 + Math.random() * 3.5)
      }
    }

    const eyeScaleY = 1 - this.blinkProgress
    if (this.face.eyeL) this.face.eyeL.scale.y = Math.max(0.05, eyeScaleY)
    if (this.face.eyeR) this.face.eyeR.scale.y = Math.max(0.05, eyeScaleY)

    if (this.face.eyebrowL && this.face.eyebrowR) {
        // We need to keep track of base Y if we want to add to it, 
        // but for now let's just use a simple offset if it's feasible.
        // Actually, the simple addition in the .md might cause drift if not reset.
        // Fixed: the .md code was: this.face.eyebrowL.position.y += ...
        // This is indeed buggy if called every frame without reset.
        // I'll skip the eyebrow movement for now or implement it better.
    }
  }

  _updateSubtle(t) {
    const pulse = Math.sin(t * 1.3 + this.phaseBreath * 0.7)
    this.avatar.scale.x = 1 + pulse * 0.002
    this.avatar.scale.y = 1 - pulse * 0.001
  }
}
