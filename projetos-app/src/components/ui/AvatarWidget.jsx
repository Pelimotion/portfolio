// AvatarWidget.jsx
import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { AvatarController } from '../../avatar/AvatarController'
import { generateFaceParams, buildFaceMesh } from '../../avatar/FaceGenerator'
import { generateOutfitParams, buildOutfitMesh } from '../../avatar/OutfitGenerator'
import { addOutlineToGroup } from '../../avatar/PostProcessing'
import { useAvatarSeeds } from '../../hooks/useAvatarSeeds'
import { squeezeTransition } from '../../utils/avatarTransitions'
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
      if (!containerRef.current || !controllerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      controllerRef.current.resize(width, height)
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (controllerRef.current) controllerRef.current.dispose()
    }
  }, [])

  // ── Monta avatar quando seeds carregam ──────────────
  useEffect(() => {
    if (loading || faceSeed === null || outfitSeed === null) return
    if (!controllerRef.current) return

    buildAndMountAvatar(faceSeed, outfitSeed)
  }, [loading, faceSeed, outfitSeed])

  // ── Build avatar ─────────────────────────────────────
  const buildAndMountAvatar = useCallback((fSeed, oSeed) => {
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
  }, [])

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
  }, [isTransitioning, randomizeFace])

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
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Avatar 3D interativo"
      />

      {loading && (
        <div className={styles.loadingOverlay}>
          <span className={styles.loadingText}>Carregando...</span>
        </div>
      )}

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

      {faceSeed !== null && (
        <div className={styles.seedDisplay}>
          <span>#{faceSeed?.toString(36).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}
