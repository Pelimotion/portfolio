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

export function generateRandomSeed() {
  return Math.floor(Math.random() * 2147483647)
}
