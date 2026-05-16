# 06 — React Component
> AvatarWidget.jsx — componente completo pronto para Next.js/Vercel

---

## AvatarWidget.jsx

```jsx
// components/AvatarWidget.jsx
'use client'   // Next.js App Router

import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { AvatarController } from '../avatar/AvatarController'
import { generateFaceParams, buildFaceMesh } from '../avatar/FaceGenerator'
import { generateOutfitParams, buildOutfitMesh } from '../avatar/OutfitGenerator'
import { addOutlineToGroup } from '../avatar/PostProcessing'
import { useAvatarSeeds } from '../hooks/useAvatarSeeds'
import styles from './AvatarWidget.module.css'

export default function AvatarWidget({ userId, className = '' }) {
  const canvasRef      = useRef(null)
  const controllerRef  = useRef(null)
  const containerRef   = useRef(null)

  const {
    faceSeed, outfitSeed, loading,
    randomizeFace, randomizeOutfit
  } = useAvatarSeeds(userId)

  const [isTransitioning, setIsTransitioning] = useState(false)

  // ── Inicializa Three.js ──────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return

    const controller = new AvatarController(canvasRef.current)
    controllerRef.current = controller

    // Resize responsivo
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = containerRef.current.getBoundingClientRect()
      controller.resize(width, height)
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      controller.dispose()
    }
  }, [])

  // ── Monta avatar quando seeds carregam ──────────────
  useEffect(() => {
    if (loading || faceSeed === null || outfitSeed === null) return
    if (!controllerRef.current) return

    buildAndMountAvatar(faceSeed, outfitSeed)
  }, [loading, faceSeed, outfitSeed])

  // ── Build avatar ─────────────────────────────────────
  function buildAndMountAvatar(fSeed, oSeed) {
    const controller = controllerRef.current
    if (!controller) return

    // Gera params
    const faceParams   = generateFaceParams(fSeed)
    const outfitParams = generateOutfitParams(oSeed)

    // Cria meshes
    const { group: faceGroup, refs: faceRefs } = buildFaceMesh(faceParams)
    const outfitGroup = buildOutfitMesh(outfitParams, faceParams.skin.tone)

    // Outline PS2 style
    addOutlineToGroup(faceGroup)
    addOutlineToGroup(outfitGroup)

    // Monta na cena
    controller.mountAvatar(faceGroup, outfitGroup, faceRefs)
  }

  // ── Randomize Handlers ───────────────────────────────
  const handleRandomizeFace = useCallback(async () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    const newSeed = await randomizeFace()

    // Transition animation
    await squeezeTransition(controllerRef.current?.avatarGroup)

    // Rebuild apenas face
    const faceParams  = generateFaceParams(newSeed)
    const { group, refs } = buildFaceMesh(faceParams)
    addOutlineToGroup(group)
    controllerRef.current?.swapFace(group, refs)

    setIsTransitioning(false)
  }, [isTransitioning, randomizeFace, outfitSeed])

  const handleRandomizeOutfit = useCallback(async () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    const newSeed = await randomizeOutfit()
    const faceParams   = generateFaceParams(faceSeed)
    const outfitParams = generateOutfitParams(newSeed)

    await squeezeTransition(controllerRef.current?.avatarGroup)

    const outfitGroup = buildOutfitMesh(outfitParams, faceParams.skin.tone)
    addOutlineToGroup(outfitGroup)
    controllerRef.current?.swapOutfit(outfitGroup)

    setIsTransitioning(false)
  }, [isTransitioning, randomizeOutfit, faceSeed])

  // ── Share URL ────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}?f=${faceSeed?.toString(36)}&o=${outfitSeed?.toString(36)}`
    navigator.clipboard.writeText(url)
      .then(() => alert('Link copiado! 🛹'))
      .catch(() => prompt('Copie o link:', url))
  }, [faceSeed, outfitSeed])

  return (
    <div className={`${styles.wrapper} ${className}`} ref={containerRef}>
      {/* Canvas WebGL */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Avatar 3D interativo"
      />

      {/* Loading overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <span className={styles.loadingText}>Carregando...</span>
        </div>
      )}

      {/* Buttons */}
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={handleRandomizeFace}
          disabled={isTransitioning || loading}
          title="Randomizar rosto"
        >
          🎲 Rosto
        </button>

        <button
          className={styles.btn}
          onClick={handleRandomizeOutfit}
          disabled={isTransitioning || loading}
          title="Randomizar outfit"
        >
          👕 Outfit
        </button>

        <button
          className={`${styles.btn} ${styles.btnShare}`}
          onClick={handleShare}
          disabled={loading}
          title="Compartilhar avatar"
        >
          🔗
        </button>
      </div>

      {/* Seed display (debug/UX) */}
      {faceSeed !== null && (
        <div className={styles.seedDisplay}>
          <span>#{faceSeed?.toString(36).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}
```

---

## AvatarWidget.module.css

```css
/* AvatarWidget.module.css */
.wrapper {
  position: relative;
  width: 320px;
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #0d0d1a 0%, #151528 50%, #0d0d1a 100%);
  box-shadow:
    0 0 0 2px rgba(255,255,255,0.08),
    0 12px 40px rgba(0,0,0,0.7),
    inset 0 0 80px rgba(50,50,150,0.08);
  user-select: none;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Loading */
.loadingOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
}

.loadingText {
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 2px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Controls */
.controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.4);
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  background: rgba(255,255,255,0.15);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btnShare {
  padding: 6px 10px;
  font-size: 14px;
}

/* Seed display */
.seedDisplay {
  position: absolute;
  top: 10px;
  right: 10px;
  color: rgba(255,255,255,0.3);
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 1px;
}
```

---

## Uso no Next.js (sem SSR)

```jsx
// app/profile/page.jsx
import dynamic from 'next/dynamic'
import { createClient } from '../../lib/supabase/server'

// Sem SSR — Three.js é browser-only
const AvatarWidget = dynamic(
  () => import('../../components/AvatarWidget'),
  { ssr: false, loading: () => <div className="avatar-placeholder" /> }
)

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main>
      <AvatarWidget userId={user?.id} />
    </main>
  )
}
```

---

## Transição Squish (Helper)

```js
// utils/avatarTransitions.js
export function squeezeTransition(group) {
  if (!group) return Promise.resolve()

  return new Promise(resolve => {
    const FRAMES = 12   // ~200ms a 60fps
    let frame = 0

    const animate = () => {
      frame++
      const t = frame / FRAMES

      if (t <= 0.5) {
        // Squish in
        const s = 1 - easeIn(t * 2) * 0.98
        group.scale.setScalar(Math.max(0.02, s))
      } else {
        // Pop out — com overshoot
        const s = easeOutBack((t - 0.5) * 2)
        group.scale.setScalar(s)
      }

      if (frame >= FRAMES) {
        group.scale.setScalar(1)
        resolve()
        return
      }
      requestAnimationFrame(animate)
    }
    animate()
  })
}

function easeIn(t) { return t * t * t }
function easeOutBack(t) {
  const c = 1.70158 + 1
  return 1 + c * Math.pow(t - 1, 3) + (c - 1) * Math.pow(t - 1, 2)
}
```

---

## Dependências (package.json)

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@supabase/supabase-js": "^2.39.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```
