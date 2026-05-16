// FaceGenerator.js
import * as THREE from 'three'
import { SeedEngine } from './SeedEngine'
import { createToonMaterial } from './SceneSetup'

export function generateFaceParams(seed) {
  const rng = new SeedEngine(seed)

  return {
    headShape: {
      width:      rng.range(0.75, 1.25),
      height:     rng.range(0.90, 1.30),
      depth:      rng.range(0.80, 1.10),
      jawWidth:   rng.range(0.60, 1.00),
      chinPoint:  rng.range(0.00, 0.40),
      cheekPuff:  rng.range(0.00, 0.50),
      foreheadBulge: rng.range(0.00, 0.35)
    },
    skin: {
      tone: rng.pick([
        '#FDDBB4', '#F5C89A', '#E8A87C',
        '#C68642', '#A0522D', '#8B3A0F',
        '#6B3A2A', '#4A2010', '#3B1A0A'
      ]),
      saturation: rng.range(0.8, 1.3),
      roughness:  rng.range(0.3, 0.7)
    },
    eyes: {
      size:       rng.range(0.6, 1.6),
      spacing:    rng.range(0.7, 1.3),
      height:     rng.range(-0.15, 0.15),
      tilt:       rng.range(-0.2, 0.2),
      shape: rng.pick(['round', 'almond', 'squint', 'wide', 'droopy']),
      irisColor: rng.pick([
        '#3A7BD5', '#27AE60', '#8B4513', '#2C3E50',
        '#E74C3C', '#9B59B6', '#F39C12', '#1ABC9C'
      ]),
      pupilSize:  rng.range(0.3, 0.7),
      highlight:  rng.chance(0.8)
    },
    eyebrows: {
      thickness:  rng.range(0.5, 2.0),
      arch:       rng.range(-0.3, 0.8),
      tilt:       rng.range(-0.4, 0.4),
      distance:   rng.range(0.5, 1.2),
      color: rng.pick(['#1A0F00', '#3D1F00', '#6B3A1F', '#8B7355', '#D4AF37']),
      style: rng.pick(['normal', 'bushy', 'thin', 'arched-high'])
    },
    nose: {
      size:       rng.range(0.5, 1.8),
      width:      rng.range(0.6, 1.5),
      height:     rng.range(-0.10, 0.15),
      bridge:     rng.range(0.2, 1.0),
      style: rng.pick(['button', 'bulbous', 'pointy', 'flat', 'hooked'])
    },
    mouth: {
      width:      rng.range(0.6, 1.5),
      height:     rng.range(-0.15, 0.05),
      lipThick:   rng.range(0.3, 1.2),
      expression: rng.pick(['smirk', 'neutral', 'slight-smile', 'cocky', 'stoic']),
      teethShow:  rng.chance(0.4),
      lipColor: rng.pick(['natural', 'darker', 'glossy'])
    },
    ears: {
      size:       rng.range(0.7, 1.4),
      protrusion: rng.range(0.0, 0.5),
      position:   rng.range(-0.1, 0.1)
    },
    hair: {
      style: rng.pick([
        'buzz-cut', 'spiky', 'shaggy', 'mohawk', 'curtains',
        'fauxhawk', 'cornrows', 'afro', 'dreadlocks', 'bald',
        'undercut', 'beanie-covered'
      ]),
      color: rng.pick([
        '#1A0A00', '#3D1F00', '#8B4513',
        '#D4AF37', '#F5F5DC',
        '#CC0000', '#FF4500',
        '#4169E1', '#32CD32', '#FF69B4',
        '#808080', '#FFFFFF'
      ]),
      highlight: rng.chance(0.3) ? rng.pick(['#FFD700', '#FFFFFF', '#FF4500']) : null
    }
  }
}

export function buildFaceMesh(params) {
  const group = new THREE.Group()
  const refs = {}

  // ── CABEÇA BASE ──────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(1, 12, 10)
  deformHeadGeometry(headGeo, params.headShape)
  const headMat = createToonMaterial(params.skin.tone)
  const headMesh = new THREE.Mesh(headGeo, headMat)
  group.add(headMesh)
  refs.head = headMesh

  // ── OLHOS ────────────────────────────────────────────
  const { group: eyeGroup, refs: eyeRefs } = buildEyes(params.eyes)
  eyeGroup.position.set(0, 0.15 + params.eyes.height, 0.85)
  group.add(eyeGroup)
  refs.eyeL = eyeRefs.left
  refs.eyeR = eyeRefs.right

  // ── NARIZ ────────────────────────────────────────────
  const noseMesh = buildNose(params.nose, params.skin.tone)
  noseMesh.position.set(0, -0.05 + params.nose.height, 0.95)
  group.add(noseMesh)

  // ── BOCA ─────────────────────────────────────────────
  const mouthGroup = buildMouth(params.mouth, params.skin.tone)
  mouthGroup.position.set(0, -0.35 + params.mouth.height, 0.90)
  group.add(mouthGroup)

  // ── SOBRANCELHAS ─────────────────────────────────────
  const browGroup = buildEyebrows(params.eyebrows)
  browGroup.position.set(0, 0.35, 0.88)
  group.add(browGroup)
  refs.eyebrowL = browGroup.children[0]
  refs.eyebrowR = browGroup.children[1]

  // ── ORELHAS ──────────────────────────────────────────
  const earL = buildEar(params.ears, params.skin.tone)
  const earR = earL.clone()
  earL.position.set(-1.0 * params.headShape.width, 0.05 + params.ears.position, 0)
  earR.position.set( 1.0 * params.headShape.width, 0.05 + params.ears.position, 0)
  earR.scale.x = -1
  group.add(earL, earR)

  // ── CABELO ───────────────────────────────────────────
  const hairGroup = buildHair(params.hair)
  hairGroup.position.set(0, 0.7 * params.headShape.height, 0)
  group.add(hairGroup)

  // ── PESCOÇO + BUSTO ──────────────────────────────────
  const bustGroup = buildBust(params.skin.tone)
  bustGroup.position.set(0, -1.1, 0)
  group.add(bustGroup)

  return { group, refs }
}

function deformHeadGeometry(geo, shape) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    let z = pos.getZ(i)

    x *= shape.width
    y *= shape.height
    z *= shape.depth

    if (y < -0.3) {
      const t = (-y - 0.3) / 0.7
      x *= 1 - t * (1 - shape.jawWidth)
      z *= 1 - t * 0.2
      y -= t * t * shape.chinPoint * 0.3
    }
    if (Math.abs(x) > 0.5 && Math.abs(y) < 0.2) {
      x += Math.sign(x) * shape.cheekPuff * 0.15
    }
    if (y > 0.5) {
      z += shape.foreheadBulge * 0.15
    }
    pos.setXYZ(i, x, y, z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

function buildEyes(params) {
  const group = new THREE.Group()
  const geo = new THREE.SphereGeometry(0.12, 8, 8)
  geo.scale(params.size, params.size * 0.8, 0.5)
  
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const irisMat = new THREE.MeshBasicMaterial({ color: params.irisColor })
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 })

  const createEye = (side) => {
    const eye = new THREE.Group()
    const white = new THREE.Mesh(geo, whiteMat)
    eye.add(white)

    const irisGeo = new THREE.SphereGeometry(0.06, 8, 8)
    irisGeo.scale(params.size, params.size, 0.2)
    const iris = new THREE.Mesh(irisGeo, irisMat)
    iris.position.z = 0.08
    eye.add(iris)

    const pupilGeo = new THREE.SphereGeometry(0.03, 8, 8)
    pupilGeo.scale(params.pupilSize, params.pupilSize, 0.1)
    const pupil = new THREE.Mesh(pupilGeo, pupilMat)
    pupil.position.z = 0.12
    eye.add(pupil)

    if (params.highlight) {
        const highGeo = new THREE.SphereGeometry(0.015, 4, 4)
        const high = new THREE.Mesh(highGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }))
        high.position.set(0.03, 0.03, 0.14)
        eye.add(high)
    }

    eye.rotation.z = side === 'left' ? params.tilt : -params.tilt
    return eye
  }

  const left = createEye('left')
  left.position.x = -0.25 * params.spacing
  const right = createEye('right')
  right.position.x = 0.25 * params.spacing

  group.add(left, right)
  return { group, refs: { left, right } }
}

function buildNose(params, skinTone) {
    const geo = new THREE.ConeGeometry(0.1, 0.2, 4)
    geo.scale(params.width, params.size, params.bridge)
    const mat = createToonMaterial(skinTone)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = Math.PI * 0.5
    return mesh
}

function buildMouth(params, skinTone) {
    const group = new THREE.Group()
    const width = 0.2 * params.width
    const height = 0.05 * params.lipThick
    const geo = new THREE.BoxGeometry(width, height, 0.05)
    
    let lipColor = skinTone
    if (params.lipColor === 'darker') lipColor = new THREE.Color(skinTone).multiplyScalar(0.8)
    if (params.lipColor === 'glossy') lipColor = 0xff9999

    const mat = createToonMaterial(lipColor)
    const topLip = new THREE.Mesh(geo, mat)
    const botLip = new THREE.Mesh(geo, mat)
    
    topLip.position.y = height * 0.5
    botLip.position.y = -height * 0.5
    
    group.add(topLip, botLip)

    if (params.expression === 'smirk') group.rotation.z = 0.1
    if (params.expression === 'cocky') group.rotation.z = -0.1
    
    return group
}

function buildEyebrows(params) {
    const group = new THREE.Group()
    const geo = new THREE.BoxGeometry(0.2, 0.03 * params.thickness, 0.02)
    const mat = new THREE.MeshBasicMaterial({ color: params.color })
    
    const left = new THREE.Mesh(geo, mat)
    left.position.x = -0.25 * params.distance
    left.rotation.z = params.tilt + params.arch * 0.2
    
    const right = new THREE.Mesh(geo, mat)
    right.position.x = 0.25 * params.distance
    right.rotation.z = -params.tilt - params.arch * 0.2
    
    group.add(left, right)
    return group
}

function buildEar(params, skinTone) {
    const geo = new THREE.SphereGeometry(0.15, 6, 6)
    geo.scale(0.5 * params.size, 1 * params.size, 0.3)
    const mat = createToonMaterial(skinTone)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.y = params.protrusion
    return mesh
}

function buildHair(params) {
    const group = new THREE.Group()
    const mat = createToonMaterial(params.color)
    
    if (params.style === 'spiky') {
        for (let i = 0; i < 8; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 4), mat)
            spike.position.set(Math.sin(i) * 0.4, 0.2, Math.cos(i) * 0.4)
            spike.rotation.set(Math.random(), Math.random(), Math.random())
            group.add(spike)
        }
    } else if (params.style === 'mohawk') {
        const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.8), mat)
        mohawk.position.y = 0.3
        group.add(mohawk)
    } else {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat)
        group.add(cap)
    }
    
    return group
}

function buildBust(skinTone) {
    const group = new THREE.Group()
    const mat = createToonMaterial(skinTone)
    
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4), mat)
    neck.position.y = 0.4
    group.add(neck)
    
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.6), mat)
    group.add(torso)
    
    return group
}
