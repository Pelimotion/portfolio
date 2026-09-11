import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Color } from 'ogl';
import { useAppStore } from '../../core/store';
import { TOKENS } from '../../tokens';
import vertexShader from '../../shaders/caustics.vert.glsl';
import fragmentShader from '../../shaders/caustics.frag.glsl';

export const CausticAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const depthProgress = useAppStore((s) => s.depthProgress);
  const isStillWaterMode = useAppStore((s) => s.isStillWaterMode);

  // Armazenamento de estado mutável para loop a 60fps sem re-render do React
  const stateRef = useRef({
    mouse: { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 },
    depth: 0.0,
    time: 0,
    rafId: 0,
    fpsHistory: [] as number[],
    lastFrameTime: performance.now(),
    isDegraded: false
  });

  // Sincroniza depthProgress com o ref
  useEffect(() => {
    stateRef.current.depth = depthProgress;
  }, [depthProgress]);

  useEffect(() => {
    if (!canvasRef.current || isStillWaterMode) return;

    const canvas = canvasRef.current;
    let renderer: Renderer | null = null;

    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio, 1.5),
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      console.warn('WebGL não suportado ou restrito. Ativando modo estático.');
      useAppStore.getState().toggleStillWaterMode();
      return;
    }

    const gl = renderer.gl;

    // Quad de tela cheia (-1 a +1)
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [canvas.width, canvas.height] },
        uMouse: { value: [0.5, 0.5] },
        uDepth: { value: 0.0 },
        uDepthAbyss: { value: TOKENS.colors.depthAbyss.glsl },
        uDepthMid: { value: TOKENS.colors.depthMid.glsl },
        uLightCaustic: { value: TOKENS.colors.lightCaustic.glsl }
      },
      depthTest: false,
      depthWrite: false
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Resize Handler
    const handleResize = () => {
      if (!renderer || !canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Move Handler com inércia
    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouse.targetX = e.clientX / window.innerWidth;
      stateRef.current.mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render Loop
    let lastTime = performance.now();
    const render = (now: number) => {
      stateRef.current.rafId = requestAnimationFrame(render);

      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      // Monitor de FPS (Fase 8 QA)
      const currentFps = 1 / Math.max(delta, 0.001);
      stateRef.current.fpsHistory.push(currentFps);
      if (stateRef.current.fpsHistory.length > 60) {
        stateRef.current.fpsHistory.shift();
        const avgFps = stateRef.current.fpsHistory.reduce((a, b) => a + b, 0) / 60;
        // Se a GPU for muito fraca (< 25fps constante), reduz resolução
        if (avgFps < 25 && !stateRef.current.isDegraded) {
          stateRef.current.isDegraded = true;
          renderer?.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
        }
      }

      stateRef.current.time += delta;

      // Interpolação suave do mouse (amortecimento hidrodinâmico)
      const m = stateRef.current.mouse;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      // Atualiza uniforms
      program.uniforms.uTime.value = stateRef.current.time;
      program.uniforms.uMouse.value = [m.x, m.y];
      program.uniforms.uDepth.value = stateRef.current.depth;

      renderer?.render({ scene: mesh });
    };

    stateRef.current.rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(stateRef.current.rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (e) {
        // Ignora se não suportado
      }
    };
  }, [isStillWaterMode]);

  return <canvas ref={canvasRef} id="canvas-caustics-layer" aria-hidden="true" />;
};
