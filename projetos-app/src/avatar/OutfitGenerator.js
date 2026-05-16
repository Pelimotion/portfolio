// OutfitGenerator.js
import * as THREE from 'three'
import { SeedEngine } from './SeedEngine'
import { OUTFIT_PALETTES } from './MaterialPalette'
import { createToonMaterial } from './SceneSetup'

export function generateOutfitParams(seed) {
  const rng = new SeedEngine(seed)
  const palette = rng.pick(OUTFIT_PALETTES)

  return {
    top: {
      style: rng.pick(['tshirt-graphic', 'tshirt-plain', 'longsleeve', 'polo', 'sleeveless', 'jersey']),
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      graphic: rng.pick(['brand-logo', 'skull', 'flame', 'checker', 'stripe', 'abstract', 'number', 'none']),
      fitStyle: rng.pick(['oversized', 'normal', 'slightly-baggy'])
    },
    outerLayer: {
      present: rng.chance(0.70),
      style: rng.pick(['hoodie-pullover', 'hoodie-zip', 'flannel-open', 'denim-jacket', 'bomber', 'windbreaker', 'vest-denim']),
      primaryColor: rng.pick([palette.dark, palette.primary, '#1A1A1A', '#2C2C2C']),
      open: rng.chance(0.5)
    },
    neck: {
      present: rng.chance(0.45),
      style: rng.pick(['chain-thick', 'chain-thin', 'dog-tags', 'bandana-neck', 'necklace-pendant', 'hemp-necklace']),
      color: rng.pick(['#FFD700', '#C0C0C0', '#8B4513', '#000000'])
    },
    headwear: {
      present: rng.chance(0.55),
      style: rng.pick(['snapback-forward', 'snapback-backward', 'beanie-rolled', 'beanie-slouchy', 'fitted-flat', 'trucker', 'bandana-head', 'none']),
      primaryColor: rng.pick([palette.primary, palette.dark, '#000000', '#FFFFFF', '#CC0000', '#003087', '#FF4500']),
      logo: rng.chance(0.7),
      logoStyle: rng.pick(['brand', 'skull', 'star', 'number', 'checker'])
    },
    glasses: {
      present: rng.chance(0.30),
      style: rng.pick(['oakley-wraparound', 'aviator', 'wayfarer', 'shield', 'square-thin', 'round-small']),
      frameColor: rng.pick(['#000000', '#FFFFFF', '#C0C0C0', '#FFD700', '#CC0000']),
      lensColor: rng.pick(['dark-tint', 'blue-mirror', 'orange-tint', 'clear', 'red-tint'])
    },
    piercings: {
      present: rng.chance(0.35),
      locations: (() => {
        const locs = []
        if (rng.chance(0.5)) locs.push('ear-left')
        if (rng.chance(0.4)) locs.push('ear-right')
        if (rng.chance(0.2)) locs.push('nose-ring')
        if (rng.chance(0.15)) locs.push('eyebrow')
        if (rng.chance(0.1)) locs.push('lip')
        return locs.length ? locs : ['ear-left']
      })(),
      style: rng.pick(['ring', 'stud', 'barbell', 'hoop']),
      color: rng.pick(['#C0C0C0', '#FFD700', '#000000'])
    }
  }
}

export function buildOutfitMesh(params, skinTone) {
  const group = new THREE.Group()

  const topMesh = buildTop(params.top)
  topMesh.position.set(0, -1.15, 0)
  group.add(topMesh)

  if (params.outerLayer.present) {
    const outerMesh = buildOuterLayer(params.outerLayer)
    outerMesh.position.set(0, -1.15, 0.05)
    group.add(outerMesh)
  }

  if (params.neck.present) {
    const neckAcc = buildNeckAccessory(params.neck)
    neckAcc.position.set(0, -0.85, 0.3)
    group.add(neckAcc)
  }

  if (params.headwear.present && params.headwear.style !== 'none') {
    const hat = buildHeadwear(params.headwear)
    hat.position.set(0, 0.75, 0)
    group.add(hat)
  }

  if (params.glasses.present) {
    const glasses = buildGlasses(params.glasses)
    glasses.position.set(0, 0.15, 0.96)
    group.add(glasses)
  }

  if (params.piercings.present) {
    const piercings = buildPiercings(params.piercings)
    group.add(piercings)
  }

  return group
}

function buildTop(params) {
    const geo = new THREE.BoxGeometry(1.25, 0.85, 0.65)
    const mat = createToonMaterial(params.primaryColor)
    const mesh = new THREE.Mesh(geo, mat)
    return mesh
}

function buildOuterLayer(params) {
    const geo = new THREE.BoxGeometry(1.3, 0.9, 0.7)
    const mat = createToonMaterial(params.primaryColor)
    const mesh = new THREE.Mesh(geo, mat)
    return mesh
}

function buildNeckAccessory(params) {
    const geo = new THREE.TorusGeometry(0.25, 0.02, 8, 16)
    const mat = new THREE.MeshStandardMaterial({ 
        color: params.color,
        metalness: 0.8,
        roughness: 0.2
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = Math.PI * 0.4
    return mesh
}

function buildHeadwear(params) {
    const group = new THREE.Group()
    const mat = createToonMaterial(params.primaryColor)
    
    if (params.style.includes('snapback') || params.style.includes('fitted')) {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.5, 12), mat)
        const brim = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.6), mat)
        brim.position.z = 0.6
        if (params.style.includes('backward')) brim.position.z = -0.6
        group.add(crown, brim)
    } else {
        const beanie = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mat)
        group.add(beanie)
    }
    
    return group
}

function buildGlasses(params) {
    const group = new THREE.Group()
    const frameMat = new THREE.MeshBasicMaterial({ color: params.frameColor })
    const lensMat = new THREE.MeshBasicMaterial({ color: getLensColor(params.lensColor), transparent: true, opacity: 0.7 })
    
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.05), frameMat)
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.02), lensMat)
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.02), lensMat)
    
    lensL.position.x = -0.2
    lensR.position.x = 0.2
    
    group.add(frame, lensL, lensR)
    return group
}

function buildPiercings(params) {
    const group = new THREE.Group()
    const geo = new THREE.TorusGeometry(0.02, 0.005, 4, 8)
    const mat = new THREE.MeshStandardMaterial({ color: params.color, metalness: 1 })
    
    params.locations.forEach(loc => {
        const p = new THREE.Mesh(geo, mat)
        if (loc === 'ear-left') p.position.set(-1, 0, 0)
        if (loc === 'ear-right') p.position.set(1, 0, 0)
        if (loc === 'nose-ring') p.position.set(0.1, -0.1, 1)
        group.add(p)
    })
    
    return group
}

function getLensColor(name) {
    const colors = {
        'dark-tint': '#111111',
        'blue-mirror': '#3366ff',
        'orange-tint': '#ffaa00',
        'clear': '#ffffff',
        'red-tint': '#ff0000'
    }
    return colors[name] || '#000000'
}
