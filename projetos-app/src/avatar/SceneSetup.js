// SceneSetup.js
import * as THREE from 'three'

export function createScene(canvas) {
  // ── RENDERER ──────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,     // Desligado — pixelado como PS2
    alpha: true,          // Background transparente
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  // ── CÂMERA ────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.set(0, 0.2, 5.5)
  camera.lookAt(0, 0.1, 0)

  // ── LUZES ─────────────────────────────────────────────
  const scene = new THREE.Scene()
  const lights = setupLights()
  lights.forEach(l => scene.add(l))

  return { renderer, camera, scene }
}

function setupLights() {
  const lights = []

  const ambient = new THREE.AmbientLight(0xffffff, 0.15)
  lights.push(ambient)

  const key = new THREE.DirectionalLight(0xFFFAE0, 1.8)
  key.position.set(2, 3, 4)
  key.castShadow = false
  lights.push(key)

  const fill = new THREE.DirectionalLight(0xC0D8FF, 0.6)
  fill.position.set(-3, 1, 2)
  lights.push(fill)

  const rim = new THREE.DirectionalLight(0xFFFFFF, 0.8)
  rim.position.set(0, -1, -3)
  lights.push(rim)

  return lights
}

export function createToonMaterial(hexColor, options = {}) {
  const {
    steps = 3,
    emissive = 0.05,
    outlineMode = false
  } = options

  if (outlineMode) {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide
    })
  }

  return new THREE.MeshToonMaterial({
    color: new THREE.Color(hexColor),
    gradientMap: buildGradientMap(steps),
    emissive: new THREE.Color(hexColor).multiplyScalar(emissive)
  })
}

const gradientCache = new Map()

function buildGradientMap(steps) {
  if (gradientCache.has(steps)) return gradientCache.get(steps)

  const width = steps * 4
  const data = new Uint8Array(width)

  for (let i = 0; i < width; i++) {
    const step = Math.floor(i / 4)
    const t = step / (steps - 1)
    data[i] = Math.floor(t * 255)
  }

  const tex = new THREE.DataTexture(data, width, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  gradientCache.set(steps, tex)
  return tex
}
