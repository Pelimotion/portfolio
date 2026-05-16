# 04 — Rendering PS2 Style
> Câmera, luzes, shaders e configuração de cena para look Tony Hawk PS2

---

## Setup Visual Alvo

```
✓ Cell-shading / Toon shading com 3 níveis de luz
✓ Outline preto (backface expansion)
✓ Cores saturadas e contrastadas
✓ Sem sombras suaves — sombras duras como PS2
✓ Iluminação 3-point simplificada
✓ Background sólido ou gradiente simples
```

---

## SceneSetup.js

```js
// SceneSetup.js
import * as THREE from 'three'

export function createScene(canvas) {
  // ── RENDERER ──────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,     // Desligado — pixelado como PS2
    alpha: true,          // Background transparente (CSS cuida disso)
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping   // Sem HDR — cores flat PS2

  // ── CÂMERA ────────────────────────────────────────────
  // FOV baixo (35°) = menos distorção, mais "rosto de personagem"
  // Como telas de seleção de personagem Tony Hawk
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.set(0, 0.2, 5.5)   // Levemente acima do centro
  camera.lookAt(0, 0.1, 0)

  // ── LUZES ─────────────────────────────────────────────
  const lights = setupLights()
  const scene = new THREE.Scene()
  lights.forEach(l => scene.add(l))

  return { renderer, camera, scene }
}

function setupLights() {
  const lights = []

  // Luz ambiente — base mínima, não estraga toon shading
  const ambient = new THREE.AmbientLight(0xffffff, 0.15)
  lights.push(ambient)

  // Key light — principal, frontal levemente acima e direita
  // Saturada levemente amarelada como luz de estúdio anos 2000
  const key = new THREE.DirectionalLight(0xFFFAE0, 1.8)
  key.position.set(2, 3, 4)
  key.castShadow = false    // Sem shadow maps — performance
  lights.push(key)

  // Fill light — esquerda, azulado suave (complementar)
  const fill = new THREE.DirectionalLight(0xC0D8FF, 0.6)
  fill.position.set(-3, 1, 2)
  lights.push(fill)

  // Rim light — atrás do personagem, cria silhueta
  // Característica de jogos PS2/PS3 para destacar personagem do fundo
  const rim = new THREE.DirectionalLight(0xFFFFFF, 0.8)
  rim.position.set(0, -1, -3)
  lights.push(rim)

  return lights
}
```

---

## Toon Material PS2

```js
// Usado em TODOS os meshes do personagem
export function createToonMaterial(hexColor, options = {}) {
  const {
    steps = 3,          // 3 steps = look PS2 clássico
    emissive = 0.05,    // Leve emissivo pra cores vibrantes
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

// Cache de gradient maps pra não recriar toda frame
const gradientCache = new Map()

function buildGradientMap(steps) {
  if (gradientCache.has(steps)) return gradientCache.get(steps)

  const width = steps * 4   // 4px por step
  const data = new Uint8Array(width)

  for (let i = 0; i < width; i++) {
    const step = Math.floor(i / 4)
    const t = step / (steps - 1)
    // Quantização dura — sem interpolação suave entre steps
    data[i] = Math.floor(t * 255)
  }

  const tex = new THREE.DataTexture(data, width, 1, THREE.RedFormat)
  tex.needsUpdate = true
  gradientCache.set(steps, tex)
  return tex
}
```

---

## Sistema de Outline (Estilo PS2)

```js
// PostProcessing.js
// Técnica: Second pass com BackSide + scale inflate
// Não precisa de EffectComposer — simples e performático

export function addOutlineToMesh(mesh, thickness = 0.025) {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    side: THREE.BackSide,
    transparent: false
  })

  const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat)
  outlineMesh.scale.setScalar(1 + thickness)
  outlineMesh.renderOrder = -1   // Renderiza antes do mesh principal
  mesh.add(outlineMesh)          // Filho do mesh original

  return outlineMesh
}

// Adicionar outline em todo o grupo de avatar
export function addOutlineToGroup(group, thickness = 0.025) {
  group.traverse(child => {
    if (child.isMesh && child.material.side !== THREE.BackSide) {
      addOutlineToMesh(child, thickness)
    }
  })
}
```

---

## Background — Visual PS2 Character Select

```js
// Opção 1: Gradient radial (simples, performático)
export function setupBackground(scene) {
  // Plane grande atrás do personagem com shader gradient
  const bgGeo = new THREE.PlaneGeometry(20, 20)
  const bgMat = new THREE.ShaderMaterial({
    uniforms: {
      colorCenter: { value: new THREE.Color(0x1a1a2e) },
      colorEdge:   { value: new THREE.Color(0x0a0a0f) },
      time:        { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorCenter;
      uniform vec3 colorEdge;
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec2 center = vUv - 0.5;
        float dist = length(center) * 1.8;
        // Pulsação sutil do fundo
        float pulse = sin(time * 0.5) * 0.05;
        vec3 color = mix(colorCenter + pulse, colorEdge, smoothstep(0.0, 1.0, dist));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.FrontSide,
    depthWrite: false
  })

  const bg = new THREE.Mesh(bgGeo, bgMat)
  bg.position.z = -3
  bg.renderOrder = -10
  scene.add(bg)

  // Retorna update function
  return (time) => { bgMat.uniforms.time.value = time }
}

// Opção 2: Linhas de scan horizontal (mais retro/PS2)
export function setupScanlineBackground(scene) {
  const bgMat = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(0x0d0d1a) },
      color2: { value: new THREE.Color(0x1a1a33) },
      lineFreq: { value: 40.0 }
    },
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float lineFreq;
      varying vec2 vUv;
      void main() {
        float line = step(0.5, fract(vUv.y * lineFreq));
        vec3 color = mix(color1, color2, line);
        gl_FragColor = vec4(color, 1.0);
      }
    `
    // ... vertex shader igual
  })
  // ...
}
```

---

## Configuração de Canvas CSS

```css
/* No componente React/CSS */
.avatar-canvas-wrapper {
  width: 320px;
  height: 380px;
  background: linear-gradient(135deg, #0d0d1a 0%, #1a1a33 50%, #0d0d1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 0 0 2px #333,
    0 8px 32px rgba(0,0,0,0.8),
    inset 0 0 60px rgba(0,0,100,0.1);
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
```

---

## Performance — Budget de Polígonos

```
Target: 60fps em mobile mid-range

Avatar completo:     ~1040 polígonos  ✓
Outline meshes:      ~1040 polígonos  ✓ (BackSide, mesmo geo)
Background:          2 polígonos      ✓
─────────────────────────────────────
TOTAL DRAW CALLS:    ~15-20
TOTAL POLÍGONOS:     ~2100
MATERIAIS:           ~12 (cacheados)

→ Seguro pra mobile, Vercel Edge, qualquer device
```

---

## Resize Handler

```js
// Importante pra canvas responsivo
export function handleResize(renderer, camera, container) {
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
  })
  observer.observe(container)
  return () => observer.disconnect()   // cleanup
}
```
