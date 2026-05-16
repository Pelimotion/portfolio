# 02 — Outfit Generator
> Sistema de roupas e acessórios anos 2000s/2010s via OUTFIT_SEED

---

## Referências de Estilo

### Skate / Street 2000-2010
- **Marcas**: DC Shoes, Vans, Zoo York, Volcom, Emerica, Osiris, Etnies
- **Peças**: hoodies oversized, camisetas gráficas, zip-up hoodies, flanelas, bonés snapback, gorros, mochilas de lado
- **Acessórios**: correntes grossas (rapcore), pulseiras de borracha, piercings, óculos de sol Oakley wrap-around

### Hip-Hop Crossover 2000s
- Correntes douradas, brincos grandes, bonés fitted com aba reta

### Emo/Punk 2005-2010
- Bandanas, wristbands chequerboard, pins no moletom, Vans slip-on xadrez

---

## Camadas de Roupa (Layer System)

O sistema monta o outfit em camadas da interna para externa:

```
LAYER 0: Pele/base (vem do FaceGenerator)
LAYER 1: Camisa/top (sempre presente)
LAYER 2: Camada externa (moletom/jaqueta) — 70% chance
LAYER 3: Acessórios de pescoço (corrente, bandana) — 40% chance
LAYER 4: Chapéu/cabeça (boné, gorro, bandana na cabeça) — 55% chance
LAYER 5: Óculos — 30% chance
LAYER 6: Piercings — 35% chance
LAYER 7: Extras (headphones, pins, patches) — 25% chance
```

---

## Parâmetros de Outfit (OutfitParams)

```js
// OutfitGenerator.js
export function generateOutfitParams(seed) {
  const rng = new SeedEngine(seed)

  // ── Paleta de cores do outfit ────────────────────────
  // Escolhe um esquema de cor pra outfit ser coesa
  const palette = rng.pick(OUTFIT_PALETTES)

  return {
    // ── CAMISA / TOP ─────────────────────────────────────
    top: {
      style: rng.pick([
        'tshirt-graphic',     // camiseta com logo/art — mais comum
        'tshirt-plain',       // lisa
        'longsleeve',         // manga longa
        'polo',               // polo — mais prep/skate
        'sleeveless',         // regata
        'jersey'              // camisa de basquete (hip-hop crossover)
      ]),
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      // Gráfico na camiseta
      graphic: rng.pick([
        'brand-logo',         // logo de marca de skate genérico
        'skull',              // caveira — clássico
        'flame',              // chamas
        'checker',            // xadrez
        'stripe',             // listras
        'abstract',           // arte abstrata
        'number',             // número (estilo jersey)
        'none'
      ]),
      // Tamanho — PS2 characters sempre exagerado
      fitStyle: rng.pick(['oversized', 'normal', 'slightly-baggy'])
    },

    // ── CAMADA EXTERNA ────────────────────────────────────
    outerLayer: {
      present: rng.chance(0.70),
      style: rng.pick([
        'hoodie-pullover',    // moletom — ÍCONE do skate 2000s
        'hoodie-zip',         // zip-up aberto
        'flannel-open',       // flanela aberta
        'denim-jacket',       // jaqueta jeans
        'bomber',             // bomber jacket — 2010s
        'windbreaker',        // corta-vento — colorido
        'vest-denim'          // colete jeans com patches
      ]),
      primaryColor: rng.pick([palette.dark, palette.primary, '#1A1A1A', '#2C2C2C']),
      open: rng.chance(0.5),  // aberto mostrando camisa?
      // Detalhes
      stripes: rng.chance(0.3),
      hood: rng.chance(0.6),
      pockets: true
    },

    // ── ACESSÓRIOS DE PESCOÇO ─────────────────────────────
    neck: {
      present: rng.chance(0.45),
      style: rng.pick([
        'chain-thick',        // corrente grossa — hip-hop
        'chain-thin',         // corrente fina
        'dog-tags',           // plaquinha militar
        'bandana-neck',       // bandana no pescoço
        'necklace-pendant',   // pingente
        'hemp-necklace'       // colar de cânhamo — surf/skate
      ]),
      color: rng.pick(['#FFD700', '#C0C0C0', '#8B4513', '#000000'])
    },

    // ── CHAPÉU / CABEÇA ───────────────────────────────────
    headwear: {
      present: rng.chance(0.55),
      style: rng.pick([
        'snapback-forward',   // boné aba pra frente
        'snapback-backward',  // boné virado — SKATE CLÁSSICO
        'beanie-rolled',      // gorro enrolado
        'beanie-slouchy',     // gorro caído
        'fitted-flat',        // boné fitted aba reta — hip-hop
        'trucker',            // boné telinha
        'bandana-head',       // bandana na cabeça
        'none'
      ]),
      primaryColor: rng.pick([
        palette.primary, palette.dark,
        '#000000', '#FFFFFF', '#CC0000',
        '#003087', '#FF4500'            // cores clássicas de skate
      ]),
      logo: rng.chance(0.7),           // logo ou patch no boné
      logoStyle: rng.pick(['brand', 'skull', 'star', 'number', 'checker'])
    },

    // ── ÓCULOS ────────────────────────────────────────────
    glasses: {
      present: rng.chance(0.30),
      style: rng.pick([
        'oakley-wraparound',  // Oakley — skate/MX anos 2000
        'aviator',            // aviador
        'wayfarer',           // Wayfarer
        'shield',             // óculos escudo — hip-hop 2010s
        'square-thin',        // armação fina quadrada
        'round-small'         // redondo pequeno — vintage
      ]),
      frameColor: rng.pick(['#000000', '#FFFFFF', '#C0C0C0', '#FFD700', '#CC0000']),
      lensColor: rng.pick([
        'dark-tint',          // escuro clássico
        'blue-mirror',        // espelho azul
        'orange-tint',        // laranja
        'clear',              // transparente
        'red-tint'
      ])
    },

    // ── PIERCINGS ─────────────────────────────────────────
    piercings: {
      present: rng.chance(0.35),
      // Múltiplos piercings possíveis
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
    },

    // ── PULSEIRAS / PULSO ─────────────────────────────────
    wristAccessory: {
      present: rng.chance(0.50),
      style: rng.pick([
        'rubber-band',        // pulseira de borracha — LIVESTRONG vibe
        'wristband',          // wristband de tecido
        'sweatband',          // sweatband esportivo
        'watch-digital',      // relógio digital
        'chain-bracelet',     // pulseira de corrente
        'leather-band'        // tira de couro
      ]),
      color: rng.pick(['#FFD700', '#FF0000', '#000000', '#FFFFFF', '#00AA00', '#3333CC']),
      multiple: rng.chance(0.4)  // empilhados — estilo 2000s
    },

    // ── EXTRAS / DETALHES ─────────────────────────────────
    extras: {
      // Fones de ouvido ao redor do pescoço — anos 2000 iPod era
      headphones: rng.chance(0.20),
      headphoneStyle: rng.pick(['earbud-around-neck', 'over-ear-around-neck']),

      // Pins e patches no moletom/jaqueta
      pins: rng.chance(0.30),
      pinCount: rng.int(2, 6),

      // Patch nas costas (visível de frente como detalhe de ombro)
      shoulderPatch: rng.chance(0.20),

      // Bandana no bolso
      bandanaPocket: rng.chance(0.25),
      bandanaColor: rng.pick(['#CC0000', '#000000', '#FFFFFF', '#003087'])
    },

    // ── PALETA USADA ──────────────────────────────────────
    palette
  }
}
```

---

## Paletas de Outfit

```js
// MaterialPalette.js
export const OUTFIT_PALETTES = [
  // Skate clássico
  { name: 'dc-classic',   primary: '#CC0000', secondary: '#FFFFFF', dark: '#111111', accent: '#FFD700' },
  { name: 'vans-black',   primary: '#111111', secondary: '#FFFFFF', dark: '#000000', accent: '#CC0000' },
  { name: 'zoo-york',     primary: '#1A1A2E', secondary: '#E94560', dark: '#0F3460', accent: '#FFFFFF' },

  // Hip-hop crossover
  { name: 'gold-chain',   primary: '#1C1C1C', secondary: '#FFD700', dark: '#0A0A0A', accent: '#CC0000' },
  { name: 'du-rag-blue',  primary: '#003087', secondary: '#FFFFFF', dark: '#001A4A', accent: '#C0C0C0' },

  // Punk/Emo
  { name: 'checker-punk', primary: '#000000', secondary: '#FFFFFF', dark: '#1A1A1A', accent: '#CC0000' },
  { name: 'warped-tour',  primary: '#2D0B00', secondary: '#CC4400', dark: '#1A0000', accent: '#FF6B00' },

  // Colorido skate
  { name: 'volcom-surf',  primary: '#00AA88', secondary: '#FF6B00', dark: '#004433', accent: '#FFFFFF' },
  { name: 'etnies-pop',   primary: '#FF4400', secondary: '#222222', dark: '#1A0000', accent: '#FFCC00' },

  // Tons neutros 2010s
  { name: 'hypebeast',    primary: '#2C2C2C', secondary: '#F5F5F5', dark: '#111111', accent: '#FF4500' },
  { name: 'supreme-red',  primary: '#CC0000', secondary: '#FFFFFF', dark: '#880000', accent: '#000000' }
]
```

---

## Construção dos Meshes de Outfit

```js
// OutfitGenerator.js — buildOutfitMesh(params, skinTone)
export function buildOutfitMesh(params, skinTone) {
  const group = new THREE.Group()

  // ── TOP ────────────────────────────────────────────────
  const topMesh = buildTop(params.top)
  topMesh.position.set(0, -1.15, 0)
  group.add(topMesh)

  // ── CAMADA EXTERNA ────────────────────────────────────
  if (params.outerLayer.present) {
    const outerMesh = buildOuterLayer(params.outerLayer)
    outerMesh.position.set(0, -1.15, 0)
    group.add(outerMesh)
  }

  // ── PESCOÇO ───────────────────────────────────────────
  if (params.neck.present) {
    const neckAcc = buildNeckAccessory(params.neck)
    neckAcc.position.set(0, -0.85, 0.3)
    group.add(neckAcc)
  }

  // ── CHAPÉU ────────────────────────────────────────────
  if (params.headwear.present) {
    const hat = buildHeadwear(params.headwear)
    hat.position.set(0, 0.75, 0)
    group.add(hat)
  }

  // ── ÓCULOS ────────────────────────────────────────────
  if (params.glasses.present) {
    const glasses = buildGlasses(params.glasses)
    glasses.position.set(0, 0.15, 0.96)
    group.add(glasses)
  }

  // ── PIERCINGS ─────────────────────────────────────────
  if (params.piercings.present) {
    const piercingGroup = buildPiercings(params.piercings)
    group.add(piercingGroup)
  }

  return group
}
```

---

## Exemplo: buildHeadwear (Boné)

```js
function buildSnapback(params) {
  const group = new THREE.Group()
  const mat = new THREE.MeshToonMaterial({ color: new THREE.Color(params.primaryColor) })

  // Corpo do boné (cylinder achatado)
  const brimGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.08, 12)
  const crownGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.55, 12)

  const brim = new THREE.Mesh(brimGeo, mat)
  const crown = new THREE.Mesh(crownGeo, mat)

  // Aba
  const abaGeo = new THREE.BoxGeometry(0.9, 0.06, 0.55)
  const aba = new THREE.Mesh(abaGeo, mat)
  aba.position.z = 0.75

  // Curvatura da aba com morph targets ou simples rotação
  if (params.style === 'snapback-forward') {
    aba.rotation.x = -0.15
  } else if (params.style === 'snapback-backward') {
    aba.rotation.y = Math.PI  // virado
  }

  // Logo/patch
  if (params.logo) {
    const logoGeo = new THREE.PlaneGeometry(0.25, 0.18)
    const logoMat = new THREE.MeshBasicMaterial({
      color: getLogoColor(params.logoStyle),
      transparent: true
    })
    const logo = new THREE.Mesh(logoGeo, logoMat)
    logo.position.set(0, 0.28, 0.92)
    group.add(logo)
  }

  group.add(brim, crown, aba)
  return group
}
```

---

## Catálogo de Acessórios por Raridade

```
COMUM (>50% chance):
  ✓ Boné snapback
  ✓ Camiseta gráfica
  ✓ Moletom/hoodie

INCOMUM (20-50%):
  ✓ Corrente grossa
  ✓ Óculos de sol
  ✓ Pulseira de borracha
  ✓ Gorro beanie

RARO (<20%):
  ✓ Fones ao redor do pescoço
  ✓ Piercing no nariz/sobrancelha
  ✓ Jaqueta com patches
  ✓ Bandana na cabeça

ÉPICO (<5%):
  ✓ Outfit completo todo-matching (paleta únic)
  ✓ Multiple chains stacked
  ✓ Full punk outfit (mohawk + correntes + patches)
```
