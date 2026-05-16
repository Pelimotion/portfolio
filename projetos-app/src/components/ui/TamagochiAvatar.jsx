// TamagochiAvatar.jsx (v2.0 - PS2 Engine)
import React, { useEffect, useRef } from 'react'
import { AvatarController } from '../../avatar/AvatarController'
import { generateFaceParams, buildFaceMesh } from '../../avatar/FaceGenerator'
import { generateOutfitParams, buildOutfitMesh } from '../../avatar/OutfitGenerator'
import { addOutlineToGroup } from '../../avatar/PostProcessing'
import { useAvatarSeeds } from '../../hooks/useAvatarSeeds'

export function TamagochiAvatar({ userId, size = 36, faceSeed: pFaceSeed, outfitSeed: pOutfitSeed }) {
  const canvasRef = useRef(null)
  const controllerRef = useRef(null)
  
  // Se não vierem via props, tenta carregar pelo userId
  const { faceSeed: hFaceSeed, outfitSeed: hOutfitSeed, loading } = useAvatarSeeds(userId && !pFaceSeed ? userId : null)
  
  const faceSeed = pFaceSeed ?? hFaceSeed
  const outfitSeed = pOutfitSeed ?? hOutfitSeed

  useEffect(() => {
    if (!canvasRef.current) return
    const controller = new AvatarController(canvasRef.current)
    controllerRef.current = controller
    
    // Configuração "mini" - câmera um pouco mais próxima ou focada no rosto
    controller.camera.position.set(0, 0, 3.5) 
    
    return () => controller.dispose()
  }, [])

  useEffect(() => {
    if (!controllerRef.current || faceSeed === null || outfitSeed === null) return

    const faceParams = generateFaceParams(faceSeed)
    const outfitParams = generateOutfitParams(outfitSeed)

    const { group: faceGroup, refs: faceRefs } = buildFaceMesh(faceParams)
    const outfitGroup = buildOutfitMesh(outfitParams, faceParams.skin.tone)

    addOutlineToGroup(faceGroup)
    addOutlineToGroup(outfitGroup)

    controllerRef.current.mountAvatar(faceGroup, outfitGroup, faceRefs)
  }, [faceSeed, outfitSeed])

  return (
    <div style={{ width: size, height: size, borderRadius: '25%', overflow: 'hidden', background: '#000' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }} 
      />
    </div>
  )
}
