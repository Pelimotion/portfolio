import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../core/store';
import { STRATA_CATALOG } from '../../data/artworks';
import { Artwork } from '../../types/art';
import { TOKENS } from '../../tokens';

export const OceanicScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectArtwork = useAppStore((s) => s.selectArtwork);
  const setHoveredArtwork = useAppStore((s) => s.setHoveredArtwork);
  const setCameraTargetY = useAppStore((s) => s.setCameraTargetY);
  const isStillWaterMode = useAppStore((s) => s.isStillWaterMode);

  useEffect(() => {
    if (!containerRef.current || isStillWaterMode) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(TOKENS.colors.depthAbyss.hex, 0.038);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 10, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Iluminação Subaquática Fisiológica
    const ambientLight = new THREE.AmbientLight(TOKENS.colors.depthMid.hex, 1.2);
    scene.add(ambientLight);

    // Luz Solar Refletida (God Rays rasantes do topo)
    const sunLight = new THREE.DirectionalLight(TOKENS.colors.lightCaustic.hex, 2.8);
    sunLight.position.set(5, 25, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Holofote do Explorador (Segue a câmera)
    const explorerLight = new THREE.PointLight(TOKENS.colors.surfaceGlass.hex, 1.5, 20);
    scene.add(explorerLight);

    // 3. Teto de Água (Superfície Refrativa em Y: +16)
    const ceilingGeo = new THREE.PlaneGeometry(80, 80, 48, 48);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x3d544b,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 16;
    scene.add(ceiling);

    // 4. Assoalho Basáltico / Leito de Sedimento (Y: -26)
    const floorGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    floorGeo.rotateX(-Math.PI / 2);
    // Cria ondulações de relevo basáltico
    const pos = floorGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const wave = Math.sin(vx * 0.15) * Math.cos(vz * 0.15) * 1.5 + Math.sin(vx * 0.3) * 0.5;
      pos.setY(i, wave);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a100d,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -26;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. Partículas Coloidais em Suspensão ("Neve Marinha")
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 1] = Math.random() * 40 - 25; // Y: -25 a +15
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      particleVelocities.push(0.005 + Math.random() * 0.015);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xdde3dc,
      size: 0.08,
      transparent: true,
      opacity: 0.55
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Monólitos e Pedestais 3D das Obras Reais
    const textureLoader = new THREE.TextureLoader();
    const pedestals: { mesh: THREE.Group; artwork: Artwork; planeMesh: THREE.Mesh }[] = [];

    // Distribuição espacial tridimensional das 9 obras
    const spatialCoordinates: { x: number; y: number; z: number; rotY: number }[] = [
      // Epipelágico (Luz)
      { x: -3.5, y: 11.5, z: 2.0, rotY: 0.15 },
      { x: 3.2, y: 9.0, z: -1.5, rotY: -0.2 },
      { x: -1.0, y: 6.5, z: 0.5, rotY: 0.05 },
      // Mesopelágico (Penumbra)
      { x: -3.0, y: -0.5, z: 1.5, rotY: 0.18 },
      { x: 2.8, y: -3.2, z: -0.5, rotY: -0.15 },
      { x: -0.8, y: -6.5, z: 2.5, rotY: 0.08 },
      // Batipelágico (Abismo)
      { x: 3.5, y: -13.5, z: 0.0, rotY: -0.22 },
      { x: -2.5, y: -17.5, z: -1.0, rotY: 0.14 },
      { x: 0.5, y: -21.8, z: 1.0, rotY: 0.0 }
    ];

    let coordIndex = 0;
    STRATA_CATALOG.forEach((stratum) => {
      stratum.artworks.forEach((art) => {
        if (coordIndex >= spatialCoordinates.length) return;
        const coords = spatialCoordinates[coordIndex++];

        const group = new THREE.Group();
        group.position.set(coords.x, coords.y, coords.z);
        group.rotation.y = coords.rotY;

        // Moldura Monolítica de Vidro e Titânio
        const frameGeo = new THREE.BoxGeometry(4.2, 5.8, 0.28);
        const frameMat = new THREE.MeshPhysicalMaterial({
          color: 0x182420,
          metalness: 0.6,
          roughness: 0.2,
          transmission: 0.35,
          thickness: 0.5,
          transparent: true,
          opacity: 0.95
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.castShadow = true;
        frameMesh.receiveShadow = true;
        group.add(frameMesh);

        // Arestas Wireframe Arquiteturais Brutalistas
        const edgeGeo = new THREE.EdgesGeometry(frameGeo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xe8c77e,
          transparent: true,
          opacity: 0.38
        });
        const wireframeEdges = new THREE.LineSegments(edgeGeo, edgeMat);
        group.add(wireframeEdges);

        // Plano da Obra de Arte com Textura Real
        const texture = textureLoader.load(art.imageSrc);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        const artGeo = new THREE.PlaneGeometry(3.6, 5.0);
        const artMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.FrontSide
        });
        const planeMesh = new THREE.Mesh(artGeo, artMat);
        planeMesh.position.z = 0.15;
        // Metadados para raycasting
        (planeMesh as any).artworkData = art;
        group.add(planeMesh);

        // Base de ancoragem basáltica inferior
        const baseGeo = new THREE.CylinderGeometry(0.8, 1.2, 0.4, 16);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x0e1613,
          roughness: 0.8
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = -3.1;
        baseMesh.castShadow = true;
        group.add(baseMesh);

        scene.add(group);
        pedestals.push({ mesh: group, artwork: art, planeMesh });
      });
    });

    // 7. Raycasting para Interação com as Obras
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Raycast para hover
      raycaster.setFromCamera(mouseCoord, camera);
      const hitCandidates = pedestals.map((p) => p.planeMesh);
      const intersects = raycaster.intersectObjects(hitCandidates);

      if (intersects.length > 0) {
        const art = (intersects[0].object as any).artworkData as Artwork;
        setHoveredArtwork(art);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredArtwork(null);
        document.body.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      // Ignora clique se for no HUD flutuante
      if ((e.target as HTMLElement).closest('.floating-hud-dock')) return;

      raycaster.setFromCamera(mouseCoord, camera);
      const hitCandidates = pedestals.map((p) => p.planeMesh);
      const intersects = raycaster.intersectObjects(hitCandidates);

      if (intersects.length > 0) {
        const art = (intersects[0].object as any).artworkData as Artwork;
        // Desliza a câmera para a altura da obra e abre a transição de erosão
        setCameraTargetY(intersects[0].point.y);
        selectArtwork(art);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick);

    // 8. Navegação da Câmera por Wheel e Touch
    let isDragging = false;
    let startY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentTarget = useAppStore.getState().cameraTargetY;
      // Scroll para baixo reduz Y (desce no oceano)
      const delta = e.deltaY * 0.012;
      setCameraTargetY(currentTarget - delta);
    };

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.floating-hud-dock')) return;
      isDragging = true;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const dy = (currentY - startY) * 0.04;
      startY = currentY;
      const currentTarget = useAppStore.getState().cameraTargetY;
      setCameraTargetY(currentTarget + dy);
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Loop de Renderização a 60 FPS
    let rafId: number;
    let clock = new THREE.Clock();
    let prevCamY = camera.position.y;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Interpolação suave de profundidade da Câmera (Inércia fluida)
      const targetY = useAppStore.getState().cameraTargetY;
      camera.position.y += (targetY - camera.position.y) * 0.06;

      // Parallax sutil do mouse
      camera.position.x += (mouseCoord.x * 1.5 - camera.position.x) * 0.04;
      camera.rotation.y = -mouseCoord.x * 0.05;

      // Calcula velocidade para retroalimentar a física de areia
      const velocity = camera.position.y - prevCamY;
      prevCamY = camera.position.y;
      useAppStore.getState().updateCameraPosition(camera.position.y, velocity);

      // Atualiza luz do explorador
      explorerLight.position.set(camera.position.x, camera.position.y, camera.position.z - 2);

      // Anima teto de água (ondulações de refração)
      const cPos = ceilingGeo.attributes.position;
      for (let i = 0; i < cPos.count; i++) {
        const cx = cPos.getX(i);
        const cz = cPos.getZ(i);
        cPos.setY(i, Math.sin(cx * 0.4 + time * 1.2) * Math.cos(cz * 0.4 + time * 0.8) * 0.35);
      }
      ceilingGeo.computeVertexNormals();
      ceilingGeo.attributes.position.needsUpdate = true;

      // Anima partículas de neve marinha (deriva lenta descendente)
      const pArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pArray[i * 3 + 1] -= particleVelocities[i];
        pArray[i * 3] += Math.sin(time * 0.5 + i) * 0.003;
        // Respawna no topo se passar do fundo
        if (pArray[i * 3 + 1] < -25) {
          pArray[i * 3 + 1] = 15;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Micro-oscilação de flutuação hidrostática nos pedestais
      pedestals.forEach((p, idx) => {
        p.mesh.position.y += Math.sin(time * 0.8 + idx) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);

      // Limpeza de recursos Three.js
      renderer.dispose();
      ceilingGeo.dispose();
      ceilingMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isStillWaterMode]);

  return (
    <div
      ref={containerRef}
      id="oceanic-3d-viewport"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2,
        overflow: 'hidden',
        background: TOKENS.colors.depthAbyss.hex
      }}
      aria-label="Espaço Subaquático 3D — Navegue pela profundidade arrastando ou rolando"
    />
  );
};
