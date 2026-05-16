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

    this._startLoop()
  }

  _startLoop() {
    const loop = () => {
      if (!this.isRunning) return
      requestAnimationFrame(loop)
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
