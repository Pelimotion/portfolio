# 01 — Face Generator
> Geração procedural de rosto via FACE_SEED no estilo PS2/Tony Hawk

---

## Filosofia de Design

O rosto usa **caricatura intencional** — exatamente como Tony Hawk PS2 fazia. Proporções exageradas são uma feature, não bug. Cada seed produz um personagem memorável com identidade clara.

### Referências visuais
- Tony Hawk Pro Skater 3 (PS2) — proporções de cabeça grande, olhos expressivos
- Jak & Daxter — deformações de rosto cartoon
- Sly Cooper — silhuetas limpas, low-poly expressivo

---

## Anatomia do Avatar (Polígonos)

```
HEAD MESH (base)        ~320 polígonos    ← subdivisão 2x do cubo esférico
EYES (L+R)              ~80 polígonos     ← spheres achatadas
EYEBROWS (L+R)          ~40 polígonos     ← box extrudado
NOSE                    ~60 polígonos     ← cone modificado
MOUTH + LIPS            ~80 polígonos     ← loop de vértices
EARS (L+R)              ~60 polígonos     ← bézier simplificado
HAIR                    ~200 polígonos    ← planos sobrepostos (billboard style)
NECK                    ~40 polígonos     ← cilindro
BUST/SHOULDERS          ~160 polígonos    ← box deformado
                        ─────────────────
TOTAL                   ~1040 polígonos   ← leve pra WebGL mobile
```

---

## SeedEngine — Extração de Parâmetros

```js
// SeedEngine.js
export class SeedEngine {
  constructor(seed) {
    this.seed = seed >>> 0  // uint32
  }

  // Mulberry32 — PRNG rápido e determinístico
  next() {
    this.seed |= 0
    this.seed = this.seed + 0x6D2B79F5 | 0
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Retorna float entre min e max
  range(min, max) { return min + this.next() * (max - min) }

  // Retorna inteiro entre min e max (inclusive)
  int(min, max) { return Math.floor(this.range(min, max + 1)) }

  // Escolhe item de array
  pick(arr) { return arr[this.int(0, arr.length - 1)] }

  // Boolean com probabilidade p (0-1)
  chance(p) { return this.next() < p }
}
```

---

## Parâmetros do Rosto (FaceParams)

```js
// FaceGenerator.js
export function generateFaceParams(seed) {
  const rng = new SeedEngine(seed)

  return {
    // ── FORMA DA CABEÇA ──────────────────────────────────
    headShape: {
      width:      rng.range(0.75, 1.25),   // fator de escala X
      height:     rng.range(0.90, 1.30),   // fator de escala Y
      depth:      rng.range(0.80, 1.10),   // fator de escala Z
      jawWidth:   rng.range(0.60, 1.00),   // queixo estreito a largo
      chinPoint:  rng.range(0.00, 0.40),   // queixo pontiagudo (0=redondo)
      cheekPuff:  rng.range(0.00, 0.50),   // bochechas infladas
      foreheadBulge: rng.range(0.00, 0.35) // testa proeminente
    },

    // ── PELE ─────────────────────────────────────────────
    skin: {
      tone: rng.pick([
        // Tons base — escala de Fitzpatrick adaptada pra cartoon
        '#FDDBB4', '#F5C89A', '#E8A87C',   // claro
        '#C68642', '#A0522D', '#8B3A0F',   // médio
        '#6B3A2A', '#4A2010', '#3B1A0A'    // escuro
      ]),
      saturation: rng.range(0.8, 1.3),     // boost de cor
      roughness:  rng.range(0.3, 0.7)      // brilho da pele
    },

    // ── OLHOS ─────────────────────────────────────────────
    eyes: {
      size:       rng.range(0.6, 1.6),     // pequeno a enorme
      spacing:    rng.range(0.7, 1.3),     // juntos a separados
      height:     rng.range(-0.15, 0.15),  // posição vertical
      tilt:       rng.range(-0.2, 0.2),    // inclinação (espirito raivoso/surpreso)
      shape: rng.pick([
        'round',      // círculo — inocente
        'almond',     // amendoa — neutro
        'squint',     // achatado — cool/descolado
        'wide',       // arregalado — surpreso
        'droopy'      // caído — cansado/relaxado
      ]),
      irisColor: rng.pick([
        '#3A7BD5', '#27AE60', '#8B4513', '#2C3E50',  // natural
        '#E74C3C', '#9B59B6', '#F39C12', '#1ABC9C'   // exótico (seed raro)
      ]),
      pupilSize:  rng.range(0.3, 0.7),
      // Anime-style highlight — marca PS2
      highlight:  rng.chance(0.8)          // 80% tem brilhinho no olho
    },

    // ── SOBRANCELHAS ──────────────────────────────────────
    eyebrows: {
      thickness:  rng.range(0.5, 2.0),     // fina a espessa
      arch:       rng.range(-0.3, 0.8),    // reta a arqueada
      tilt:       rng.range(-0.4, 0.4),    // furiosa a surpresa
      distance:   rng.range(0.5, 1.2),     // unidas a separadas
      color: rng.pick(['#1A0F00', '#3D1F00', '#6B3A1F', '#8B7355', '#D4AF37']),
      style: rng.pick(['normal', 'bushy', 'thin', 'arched-high'])
    },

    // ── NARIZ ─────────────────────────────────────────────
    nose: {
      size:       rng.range(0.5, 1.8),     // pequeno a enorme
      width:      rng.range(0.6, 1.5),     // afilado a largo
      height:     rng.range(-0.10, 0.15),  // posição vertical
      bridge:     rng.range(0.2, 1.0),     // achatado a pontiagudo
      style: rng.pick([
        'button',     // narizinho — cute
        'bulbous',    // boludo — cômico
        'pointy',     // pontiagudo — edgy
        'flat',       // achatado
        'hooked'      // aquilino — imponente
      ])
    },

    // ── BOCA ──────────────────────────────────────────────
    mouth: {
      width:      rng.range(0.6, 1.5),
      height:     rng.range(-0.15, 0.05),  // posição vertical
      lipThick:   rng.range(0.3, 1.2),
      expression: rng.pick([
        'smirk',      // canto levantado — Tony Hawk vibe
        'neutral',
        'slight-smile',
        'cocky',      // sorriso de lado
        'stoic'       // fechada, séria
      ]),
      teethShow:  rng.chance(0.4),         // mostrar dentes?
      lipColor: rng.pick(['natural', 'darker', 'glossy'])
    },

    // ── ORELHAS ───────────────────────────────────────────
    ears: {
      size:       rng.range(0.7, 1.4),
      protrusion: rng.range(0.0, 0.5),     // coladas a abas de porco
      position:   rng.range(-0.1, 0.1)     // mais alta ou baixa
    },

    // ── CABELO ────────────────────────────────────────────
    hair: {
      style: rng.pick([
        'buzz-cut',       // raspado — skater clássico
        'spiky',          // espetado — Tony Hawk original
        'shaggy',         // desgrenhado — anos 2000
        'mohawk',         // moicano — punk
        'curtains',       // franja dividida ao meio — anos 90/2000
        'fauxhawk',       // moicano falso — anos 2000
        'cornrows',       // tranças
        'afro',           // afro
        'dreadlocks',     // dreads — Bob Burnquist vibe
        'bald',           // careca
        'undercut',       // undercut — anos 2010s
        'beanie-covered'  // gorro (sem cabelo visível)
      ]),
      color: rng.pick([
        '#1A0A00', '#3D1F00', '#8B4513',   // castanhos/pretos
        '#D4AF37', '#F5F5DC',              // loiros
        '#CC0000', '#FF4500',              // ruivos/tinturado
        '#4169E1', '#32CD32', '#FF69B4',   // colorido punk
        '#808080', '#FFFFFF'              // cinza/branco (raro)
      ]),
      // Highlight de cor diferente (como nos jogos PS2)
      highlight: rng.chance(0.3) ? rng.pick(['#FFD700', '#FFFFFF', '#FF4500']) : null
    },

    // ── PELOS FACIAIS ────────────────────────────────────
    facialHair: {
      style: rng.pick([
        'none', 'none', 'none',            // sem pelo (mais comum)
        'stubble',                         // barba por fazer
        'goatee',                          // cavanhaque — clássico 2000s
        'soul-patch',                      // pincelinho abaixo do lábio
        'thin-mustache',                   // bigodinho fino
        'sideburns'                        // costeleta
      ]),
      color: null  // herda da cor do cabelo com leve variação
    },

    // ── MARCAS / DETALHES ────────────────────────────────
    details: {
      freckles:     rng.chance(0.25),
      scar:         rng.chance(0.15),      // cicatriz pequena
      scarLocation: rng.pick(['eyebrow', 'chin', 'cheek']),
      dimples:      rng.chance(0.20),
      bandaid:      rng.chance(0.10),      // band-aid — skater que cai
      tattooFace:   rng.chance(0.05)       // tatuagem no rosto (raro/extremo)
    }
  }
}
```

---

## Construção da Geometria (Three.js)

```js
// FaceGenerator.js — buildFaceMesh(params)
import * as THREE from 'three'

export function buildFaceMesh(params) {
  const group = new THREE.Group()

  // ── CABEÇA BASE ──────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(1, 12, 10)
  // Deformar vértices pra forma de cabeça humana
  deformHeadGeometry(headGeo, params.headShape)

  const headMat = new THREE.MeshToonMaterial({
    color: new THREE.Color(params.skin.tone),
    gradientMap: createToonRamp(3)  // 3-step toon shading PS2 style
  })
  const headMesh = new THREE.Mesh(headGeo, headMat)
  group.add(headMesh)

  // ── OLHOS ────────────────────────────────────────────
  const eyeGroup = buildEyes(params.eyes, params.skin.tone)
  eyeGroup.position.set(0, 0.15, 0.85)
  group.add(eyeGroup)

  // ── NARIZ ────────────────────────────────────────────
  const noseMesh = buildNose(params.nose, params.skin.tone)
  noseMesh.position.set(0, -0.05, 0.95)
  group.add(noseMesh)

  // ── BOCA ─────────────────────────────────────────────
  const mouthGroup = buildMouth(params.mouth, params.skin.tone)
  mouthGroup.position.set(0, -0.30, 0.90)
  group.add(mouthGroup)

  // ── SOBRANCELHAS ─────────────────────────────────────
  const browGroup = buildEyebrows(params.eyebrows)
  browGroup.position.set(0, 0.35, 0.88)
  group.add(browGroup)

  // ── ORELHAS ──────────────────────────────────────────
  const earL = buildEar(params.ears, params.skin.tone)
  const earR = earL.clone()
  earL.position.set(-1.0, 0.05, 0)
  earR.position.set( 1.0, 0.05, 0)
  earR.scale.x = -1
  group.add(earL, earR)

  // ── CABELO ───────────────────────────────────────────
  const hairGroup = buildHair(params.hair)
  hairGroup.position.set(0, 0.7, 0)
  group.add(hairGroup)

  // ── PESCOÇO + BUSTO ──────────────────────────────────
  const bustGroup = buildBust(params.skin.tone)
  bustGroup.position.set(0, -1.1, 0)
  group.add(bustGroup)

  return group
}
```

---

## Deformação da Cabeça

```js
function deformHeadGeometry(geo, shape) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    let z = pos.getZ(i)

    // Escala geral
    x *= shape.width
    y *= shape.height
    z *= shape.depth

    // Afinar o queixo
    if (y < -0.3) {
      const t = (-y - 0.3) / 0.7
      x *= 1 - t * (1 - shape.jawWidth)
      z *= 1 - t * 0.2
      // Ponta do queixo
      y -= t * t * shape.chinPoint * 0.3
    }

    // Bochechas infladas
    if (Math.abs(x) > 0.5 && Math.abs(y) < 0.2) {
      x += Math.sign(x) * shape.cheekPuff * 0.15
    }

    // Testa proeminente
    if (y > 0.5) {
      z += shape.foreheadBulge * 0.15
    }

    pos.setXYZ(i, x, y, z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}
```

---

## Toon Ramp Texture (PS2 Style)

```js
// Cria gradiente de 3 steps — visual icônico de cell shading PS2
function createToonRamp(steps = 3) {
  const size = 64
  const data = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    const t = i / size
    // Quantização — 3 níveis de sombra como PS2
    const level = Math.floor(t * steps) / (steps - 1)
    data[i] = Math.floor(level * 255)
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RedFormat)
  tex.needsUpdate = true
  return tex
}
```

---

## Outline Shader (Silhueta PS2)

```js
// Passa dois: backface inflado = outline preto
function addOutline(mesh, thickness = 0.03) {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
  })
  const outlineMesh = new THREE.Mesh(mesh.geometry.clone(), outlineMat)
  outlineMesh.scale.setScalar(1 + thickness)
  mesh.parent.add(outlineMesh)
}
```
