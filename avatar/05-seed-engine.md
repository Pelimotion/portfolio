# 05 — Seed Engine
> PRNG determinístico, geração de valores, exemplos de seeds

---

## Por que PRNG determinístico?

Com o mesmo `seed`, o avatar sempre gera **exatamente o mesmo visual**. Isso permite:
- Salvar apenas um número inteiro no Supabase
- Compartilhar avatares por URL (`?face=42&outfit=7`)
- Reproduzir o visual em qualquer dispositivo
- Versionar avatares sem precisar serializar geometria

---

## SeedEngine.js (Completo)

```js
// SeedEngine.js
// Algoritmo: Mulberry32 — rápido, sem dependências, boa distribuição

export class SeedEngine {
  constructor(seed) {
    // Garante uint32 — aceita strings também (hash simples)
    if (typeof seed === 'string') {
      seed = hashString(seed)
    }
    this.originalSeed = seed >>> 0
    this.seed = seed >>> 0
  }

  // Reinicia o PRNG (pra usar o mesmo seed novamente)
  reset() {
    this.seed = this.originalSeed
  }

  // Próximo float [0, 1)
  next() {
    this.seed |= 0
    this.seed = (this.seed + 0x6D2B79F5) | 0
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Float [min, max)
  range(min, max) {
    return min + this.next() * (max - min)
  }

  // Integer [min, max] inclusive
  int(min, max) {
    return Math.floor(this.range(min, max + 0.9999))
  }

  // Item aleatório de array
  pick(array) {
    if (!array || array.length === 0) return undefined
    return array[this.int(0, array.length - 1)]
  }

  // Boolean com probabilidade p
  chance(p) {
    return this.next() < p
  }

  // Embaralha array (Fisher-Yates) — retorna nova array
  shuffle(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Gera cor hex aleatória dentro de um range HSL
  colorInRange(hMin, hMax, sMin, sMax, lMin, lMax) {
    const h = this.range(hMin, hMax)
    const s = this.range(sMin, sMax)
    const l = this.range(lMin, lMax)
    return hslToHex(h, s, l)
  }

  // Valor com distribuição normal aproximada (Box-Muller simplificado)
  // Útil pra variações orgânicas (maioria perto do centro)
  gaussian(mean = 0, stdDev = 1) {
    const u1 = this.next()
    const u2 = this.next()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + z * stdDev
  }

  // Gera um sub-seed derivado (pra sub-sistemas com seed próprio)
  derive(key) {
    const combined = this.seed ^ hashString(String(key))
    return new SeedEngine(combined)
  }
}

// Hash simples de string pra uint32
function hashString(str) {
  let h = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (Math.imul(h, 0x01000193)) >>> 0
  }
  return h
}

// HSL → Hex
function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
```

---

## Geração de Seeds

```js
// Gerar seed aleatório pra novos usuários
export function generateRandomSeed() {
  return Math.floor(Math.random() * 2147483647)   // max int32
}

// Seed de usuário — derivado do user_id pra seed inicial única
export function deriveUserSeed(userId) {
  return hashString(userId)
}

// Seeds de debug conhecidos (ótimos pra testar extremos)
export const DEBUG_SEEDS = {
  face: {
    tiny_features: 12345,    // nariz, olhos, boca pequenos
    huge_features: 99999,    // tudo exagerado
    classic_tony:  42,       // cara clássico de skate
    punk:          666,      // visual punk
    cute:          777,      // rosto cute/arredondado
  },
  outfit: {
    full_skate:    1001,     // outfit skate completo
    hip_hop:       2002,     // hip-hop 2000s
    emo:           3003,     // emo/punk 2005
    minimal:       4004,     // simples, poucos acessórios
    maximal:       5005,     // tudo equipado
  }
}
```

---

## URL Sharing de Avatares

```js
// Encode seeds na URL
export function encodeAvatarToURL(faceSeed, outfitSeed) {
  const params = new URLSearchParams({
    f: faceSeed.toString(36),    // base36 = mais curto
    o: outfitSeed.toString(36)
  })
  return `${window.location.origin}/avatar?${params}`
}

// Decode da URL
export function decodeAvatarFromURL() {
  const params = new URLSearchParams(window.location.search)
  return {
    faceSeed:   parseInt(params.get('f') || '42',  36),
    outfitSeed: parseInt(params.get('o') || '7',   36)
  }
}

// Exemplo de URLs resultantes:
// face=42,  outfit=7   → /avatar?f=16&o=7
// face=999, outfit=500 → /avatar?f=rr&o=dw
```

---

## Exemplos de Outputs por Seed

### FACE_SEED = 42 (Tony Hawk classic)
```
headShape:  width=0.98, height=1.05, jawWidth=0.78, cheekPuff=0.12
skin:       #E8A87C (bronzeado)
eyes:       size=0.95, shape='squint', irisColor='#3A7BD5'
eyebrows:   thickness=1.1, arch=0.4, style='normal'
nose:       size=0.9, style='button'
mouth:      expression='smirk', width=1.1
hair:       style='spiky', color='#D4AF37' (loiro)
```

### FACE_SEED = 666 (Punk)
```
headShape:  width=0.88, height=1.15, jawWidth=0.65, chinPoint=0.35
skin:       #F5C89A (claro)
eyes:       size=1.4, shape='almond', irisColor='#E74C3C' (vermelho)
eyebrows:   thickness=1.8, tilt=-0.3 (raivoso), style='bushy'
nose:       size=1.2, style='pointy'
mouth:      expression='stoic'
hair:       style='mohawk', color='#CC0000'
details:    scar=true (sobrancelha), piercing=true (múltiplos)
```

### OUTFIT_SEED = 1001 (Full Skate)
```
top:        'tshirt-graphic', DC Shoes colors, flame graphic
outer:      'hoodie-zip' aberto, #111111
neck:       'dog-tags'
headwear:   'snapback-backward', #CC0000, skull logo
glasses:    Oakley wraparound, dark tint
piercings:  ear-left
wrist:      rubber-band stacked x3, yellow+red+black
extras:     pins=true (4 pins), bandana pocket
```

---

## Supabase — Salvar e Carregar Seeds

```js
// hooks/useAvatarSeeds.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateRandomSeed } from '../avatar/SeedEngine'

export function useAvatarSeeds(userId) {
  const [faceSeed,   setFaceSeed]   = useState(null)
  const [outfitSeed, setOutfitSeed] = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    loadSeeds()
  }, [userId])

  async function loadSeeds() {
    setLoading(true)
    const { data, error } = await supabase
      .from('avatar_seeds')
      .select('face_seed, outfit_seed')
      .eq('user_id', userId)
      .single()

    if (data) {
      setFaceSeed(data.face_seed)
      setOutfitSeed(data.outfit_seed)
    } else {
      // Novo usuário: seeds aleatórios
      const f = generateRandomSeed()
      const o = generateRandomSeed()
      setFaceSeed(f)
      setOutfitSeed(o)
      await saveSeeds(userId, f, o)
    }
    setLoading(false)
  }

  async function randomizeFace() {
    const newSeed = generateRandomSeed()
    setFaceSeed(newSeed)
    await saveSeeds(userId, newSeed, outfitSeed)
    return newSeed
  }

  async function randomizeOutfit() {
    const newSeed = generateRandomSeed()
    setOutfitSeed(newSeed)
    await saveSeeds(userId, faceSeed, newSeed)
    return newSeed
  }

  return { faceSeed, outfitSeed, loading, randomizeFace, randomizeOutfit }
}

async function saveSeeds(userId, faceSeed, outfitSeed) {
  await supabase.from('avatar_seeds').upsert({
    user_id:    userId,
    face_seed:  faceSeed,
    outfit_seed: outfitSeed,
    updated_at: new Date().toISOString()
  })
}
```
