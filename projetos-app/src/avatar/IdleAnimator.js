// IdleAnimator.js
import * as THREE from 'three'

export class IdleAnimator {
  constructor(avatarGroup, faceRefs) {
    this.avatar = avatarGroup
    this.face = faceRefs        // { head, eyeL, eyeR, eyebrowL, eyebrowR, eyesGroup }
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

    // Look behavior
    this.lookTarget = new THREE.Vector3(0, 0, 1)
    this.lookCurrent = new THREE.Vector3(0, 0, 1)
    this.lookTimer = 2 + Math.random() * 4

    // Special actions
    this.actionTimer = 5 + Math.random() * 5
    this.actionType = null
    this.actionProgress = 0
  }

  update() {
    const t = this.clock.getElapsedTime()
    const dt = this.clock.getDelta()

    this._updateBreathing(t)
    this._updateHeadSway(t)
    this._updateBlink(t, dt)
    this._updateLook(t, dt)
    this._updateActions(t, dt)
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
      this.blinkProgress += dt * 15
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 1
        this.blinkState = 'opening'
      }
    } else if (this.blinkState === 'opening') {
      this.blinkProgress -= dt * 10
      if (this.blinkProgress <= 0) {
        this.blinkProgress = 0
        this.blinkState = 'open'
        const doubleBlink = Math.random() < 0.15
        this.blinkTimer = doubleBlink ? 0.12 : (2.5 + Math.random() * 4.5)
      }
    }

    const eyeScaleY = 1 - this.blinkProgress
    if (this.face.eyeL) this.face.eyeL.scale.y = Math.max(0.05, eyeScaleY)
    if (this.face.eyeR) this.face.eyeR.scale.y = Math.max(0.05, eyeScaleY)
  }

  _updateLook(t, dt) {
    if (!this.face || !this.face.eyesGroup) return
    
    this.lookTimer -= dt
    if (this.lookTimer <= 0) {
      this.lookTimer = 1.5 + Math.random() * 5
      // Dart eyes to a new subtle position
      this.lookTarget.set(
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.15,
        1
      )
    }

    this.lookCurrent.lerp(this.lookTarget, 0.1)
    // Map X/Y to eye rotation or position
    this.face.eyesGroup.position.x = this.lookCurrent.x
    this.face.eyesGroup.position.y = 0.15 + this.lookCurrent.y
  }

  _updateActions(t, dt) {
    this.actionTimer -= dt
    if (this.actionTimer <= 0 && !this.actionType) {
      this.actionType = Math.random() > 0.5 ? 'tilt' : 'shrug'
      this.actionProgress = 0
      this.actionTimer = 8 + Math.random() * 10
    }

    if (this.actionType) {
      this.actionProgress += dt * 2.5
      const act = Math.sin(this.actionProgress * Math.PI)
      
      if (this.actionType === 'tilt' && this.face.head) {
        this.face.head.rotation.z += act * 0.15
      } else if (this.actionType === 'shrug') {
        this.avatar.position.y += act * 0.05
      }

      if (this.actionProgress >= 1) {
        this.actionType = null
      }
    }
  }
}
