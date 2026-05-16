// PostProcessing.js
import * as THREE from 'three'

export function addOutlineToMesh(mesh, thickness = 0.025) {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    side: THREE.BackSide,
    transparent: false
  })

  const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat)
  outlineMesh.scale.setScalar(1 + thickness)
  outlineMesh.renderOrder = -1
  mesh.add(outlineMesh)

  return outlineMesh
}

export function addOutlineToGroup(group, thickness = 0.025) {
  group.traverse(child => {
    if (child.isMesh && child.material.side !== THREE.BackSide) {
      addOutlineToMesh(child, thickness)
    }
  })
}
