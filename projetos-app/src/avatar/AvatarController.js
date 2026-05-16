// AvatarController.js
import * as THREE from 'three'
import { IdleAnimator } from './IdleAnimator'
import { createScene } from './SceneSetup'

export class AvatarController {
  constructor(canvas) {
    const { renderer, camera, scene } = createScene(canvas)
    this.renderer = renderer
    this.camera   = camera
    this.scene    = scene

    this.animator = null
    this.avatarGroup = null
    this.isRunning = true

    // Mouse Tracking
    this.targetRot = new THREE.Vector2(0, 0)
    this.currentRot = new THREE.Vector2(0, 0)
    this.mouseHandler = this.onMouseMove.bind(this)
    window.addEventListener('mousemove', this.mouseHandler)

    this._startLoop()
  }

  onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    // Limites de rotação sutis para o estilo PS2
    this.targetRot.set(x * 0.35, y * 0.2)
  }

  _startLoop() {
    const loop = () => {
      if (!this.isRunning) return
      requestAnimationFrame(loop)
      
      // Interpolação suave (lerp)
      this.currentRot.lerp(this.targetRot, 0.08)
      
      if (this.avatarGroup) {
        this.avatarGroup.rotation.y = this.currentRot.x
        this.avatarGroup.rotation.x = this.currentRot.y
      }

      if (this.animator) this.animator.update()
      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  mountAvatar(faceGroup, outfitGroup, faceRefs) {
    if (this.avatarGroup) this.scene.remove(this.avatarGroup)

    this.avatarGroup = new THREE.Group()
    this.avatarGroup.add(faceGroup)
    if (outfitGroup) this.avatarGroup.add(outfitGroup)
    this.scene.add(this.avatarGroup)

    this.animator = new IdleAnimator(this.avatarGroup, faceRefs)
  }

  swapFace(newFaceGroup, newFaceRefs) {
    if (!this.avatarGroup) return
    const oldFace = this.avatarGroup.children[0]
    this.avatarGroup.remove(oldFace)
    this._dispose(oldFace)
    
    this.avatarGroup.children.unshift(newFaceGroup)
    this.animator = new IdleAnimator(this.avatarGroup, newFaceRefs)
  }

  swapOutfit(newOutfitGroup) {
    if (!this.avatarGroup) return
    const oldOutfit = this.avatarGroup.children[1]
    if (oldOutfit) {
      this.avatarGroup.remove(oldOutfit)
      this._dispose(oldOutfit)
    }
    this.avatarGroup.add(newOutfitGroup)
  }

  resize(width, height) {
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.isRunning = false
    window.removeEventListener('mousemove', this.mouseHandler)
    this._dispose(this.scene)
    this.renderer.dispose()
  }

  _dispose(obj) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}
