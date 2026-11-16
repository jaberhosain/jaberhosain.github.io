import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  detectSoftwareGl,
  disposeObjectHierarchy,
  getThemeThreePalette,
  prefersReducedMotion
} from './webglUtils';
import { useDesignOverrides } from '../../context/DesignOverridesContext';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { normalizeDirectImageUrl } from '../../lib/imageUrlResolver';

interface StudioBackdrop3DProps {
  activePage: string;
}

const PAGE_CAMERA_OFFSETS: Record<string, { x: number; y: number; z: number; pitch: number }> = {
  home: { x: 0, y: 0.35, z: 12.8, pitch: -0.04 },
  about: { x: -0.95, y: 0.15, z: 12.2, pitch: -0.02 },
  videos: { x: 1.1, y: 0.48, z: 11.9, pitch: -0.06 },
  design: { x: -0.75, y: 0.62, z: 12.1, pitch: -0.05 },
  skills: { x: 0.85, y: 0.05, z: 12.4, pitch: -0.03 },
  contact: { x: 0.15, y: -0.1, z: 12.6, pitch: -0.02 }
};

function createSoftBokehTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255, 250, 244, 0.95)');
    grad.addColorStop(0.28, 'rgba(255, 246, 236, 0.42)');
    grad.addColorStop(0.65, 'rgba(255, 240, 224, 0.09)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const StudioBackdrop3D: React.FC<StudioBackdrop3DProps> = ({ activePage }) => {
  const { studio3D } = useDesignOverrides();
  const mountRef = useRef<HTMLDivElement>(null);
  const pageTargetRef = useRef(PAGE_CAMERA_OFFSETS[activePage] || PAGE_CAMERA_OFFSETS.home);
  const studioRef = useRef(studio3D);

  useEffect(() => {
    pageTargetRef.current = PAGE_CAMERA_OFFSETS[activePage] || PAGE_CAMERA_OFFSETS.home;
  }, [activePage]);

  useEffect(() => {
    studioRef.current = studio3D;
  }, [studio3D]);

  const resolvedCustomBg = studio3D.customBgUrl
    ? resolveAssetUrl(normalizeDirectImageUrl(studio3D.customBgUrl))
    : '';
  const showBackdropParallax = Boolean(
    resolvedCustomBg && studio3D.customBgMode === 'backdrop-parallax'
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = prefersReducedMotion();
    const isSoftware = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftware,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isCompactViewport = width < 768;

    renderer.setPixelRatio(
      isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, isCompactViewport ? 1.5 : 2)
    );
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const palette = getThemeThreePalette();
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(palette.fog, 0.042);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 80);
    camera.position.set(0, 0.35, 12.8);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const hemiLight = new THREE.HemisphereLight(
      palette.rimLight,
      palette.bg,
      palette.isLight ? 1.15 : 0.65
    );
    scene.add(hemiLight);

    const grazingRimLight = new THREE.DirectionalLight(
      palette.secondary,
      palette.isLight ? 1.1 : 1.45
    );
    grazingRimLight.position.set(-7, 6.5, -11);
    scene.add(grazingRimLight);

    const warmAccentLight = new THREE.PointLight(palette.accent, 20, 36, 1.5);
    warmAccentLight.position.set(6.5, -0.5, -6.5);
    scene.add(warmAccentLight);

    // =========================================================================
    // 1. PRESET A: LIQUID OBSIDIAN SILK-WAVE
    // =========================================================================
    const waveUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: studioRef.current.waveIntensity ?? 1 }
    };

    const waveSegmentsX = isSoftware ? 56 : isCompactViewport ? 52 : 112;
    const waveSegmentsY = isSoftware ? 38 : isCompactViewport ? 34 : 74;
    const waveGeo = new THREE.PlaneGeometry(46, 30, waveSegmentsX, waveSegmentsY);

    const waveMat = new THREE.MeshPhysicalMaterial({
      color: palette.isLight ? 0xe7e1d5 : 0x14161c,
      metalness: palette.isLight ? 0.14 : 0.72,
      roughness: palette.isLight ? 0.52 : 0.34,
      clearcoat: palette.isLight ? 0.15 : 0.42,
      clearcoatRoughness: 0.28,
      envMapIntensity: palette.isLight ? 0.55 : 0.92
    });

    waveMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waveUniforms.uTime;
      shader.uniforms.uScroll = waveUniforms.uScroll;
      shader.uniforms.uPointer = waveUniforms.uPointer;
      shader.uniforms.uIntensity = waveUniforms.uIntensity;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uScroll;
        uniform vec2 uPointer;
        uniform float uIntensity;

        float obsidianWaveHeight(vec2 p, float t, float scr, vec2 ptr) {
          float h1 = sin(p.x * 0.21 + t * 0.38 + scr * 0.45) * cos(p.y * 0.19 - t * 0.29) * 0.88;
          float h2 = sin((p.x * 0.39 - p.y * 0.27) + t * 0.48) * 0.34;
          float h3 = cos((p.x * 0.14 + p.y * 0.36) - t * 0.24 + scr * 0.3) * 0.42;
          vec2 focus = vec2(ptr.x * 6.5, ptr.y * 4.0);
          float d = length(p - focus);
          float ptrWave = sin(d * 0.65 - t * 1.15) * exp(-d * 0.16) * 0.26;
          return (h1 + h2 + h3 + ptrWave) * uIntensity;
        }
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>
        float eps = 0.08;
        vec2 pBase = position.xy;
        float hC = obsidianWaveHeight(pBase, uTime, uScroll, uPointer);
        float hX = obsidianWaveHeight(pBase + vec2(eps, 0.0), uTime, uScroll, uPointer);
        float hY = obsidianWaveHeight(pBase + vec2(0.0, eps), uTime, uScroll, uPointer);
        objectNormal = normalize(vec3(-(hX - hC) / eps, -(hY - hC) / eps, 1.0));
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        transformed.z += obsidianWaveHeight(position.xy, uTime, uScroll, uPointer);
        `
      );
    };

    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, -3.2, -10.5);
    waveMesh.rotation.set(-Math.PI * 0.39, 0, -0.06);
    scene.add(waveMesh);

    // =========================================================================
    // 2. PRESET B: 3D ARCHITECTURAL PERSPECTIVE GRID
    // =========================================================================
    const gridGroup = new THREE.Group();
    const gridHelperMain = new THREE.GridHelper(52, 40, palette.accent, 0x2b303d);
    gridHelperMain.position.set(0, -3.4, -8);
    (gridHelperMain.material as THREE.Material).transparent = true;
    (gridHelperMain.material as THREE.Material).opacity = 0.45;
    gridGroup.add(gridHelperMain);
    gridGroup.visible = false;
    scene.add(gridGroup);

    // =========================================================================
    // 3. PRESET C: ORBITAL 3D CINEMA RINGS & GLASS PRISMS
    // =========================================================================
    const orbitalGroup = new THREE.Group();
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      metalness: 0.78,
      roughness: 0.22,
      clearcoat: 0.65,
      transparent: true,
      opacity: 0.75
    });
    const accentRingMat = new THREE.MeshPhysicalMaterial({
      color: palette.accent,
      metalness: 0.55,
      roughness: 0.25,
      emissive: new THREE.Color(palette.accent),
      emissiveIntensity: 0.22
    });

    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.055, 24, 120), ringMat);
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.04, 24, 100), accentRingMat);
    const torus3 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.035, 20, 120), ringMat);
    torus1.rotation.set(0.6, 0.25, 0);
    torus2.rotation.set(-0.5, 0.7, 0.3);
    torus3.rotation.set(0.3, -0.4, 0.5);
    orbitalGroup.add(torus1, torus2, torus3);
    orbitalGroup.position.set(0, 0.2, -9.5);
    orbitalGroup.visible = false;
    scene.add(orbitalGroup);

    // =========================================================================
    // 4. ANAMORPHIC LIGHT FILAMENTS
    // =========================================================================
    const arcPrimaryMat = new THREE.MeshBasicMaterial({
      color: palette.secondary,
      transparent: true,
      opacity: palette.isLight ? 0.14 : 0.12,
      depthWrite: false
    });
    const arcAccentMat = new THREE.MeshBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: palette.isLight ? 0.16 : 0.22,
      depthWrite: false
    });

    const filamentConfigs = [
      {
        points: [
          new THREE.Vector3(-18, 3.6, -12.5),
          new THREE.Vector3(-6, 1.4, -9.2),
          new THREE.Vector3(6.5, 2.3, -10.4),
          new THREE.Vector3(18, 0.5, -13.5)
        ],
        radius: 0.014,
        mat: arcPrimaryMat
      },
      {
        points: [
          new THREE.Vector3(-17, -1.6, -10.0),
          new THREE.Vector3(-5, -0.4, -7.8),
          new THREE.Vector3(5.8, -1.5, -8.8),
          new THREE.Vector3(17.5, 1.2, -11.5)
        ],
        radius: 0.011,
        mat: arcAccentMat
      }
    ];

    const filamentGroup = new THREE.Group();
    const filamentMeshes: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    filamentConfigs.forEach((cfg, idx) => {
      const curve = new THREE.CatmullRomCurve3(cfg.points);
      const tubeGeo = new THREE.TubeGeometry(curve, 96, cfg.radius, 8, false);
      const mesh = new THREE.Mesh(tubeGeo, cfg.mat);
      filamentGroup.add(mesh);
      filamentMeshes.push({ mesh, baseY: 0, phase: idx * 1.8 });
    });
    scene.add(filamentGroup);

    // =========================================================================
    // 5. LENS BOKEH & STARFIELD MOTES
    // =========================================================================
    const bokehCount = isSoftware ? 20 : isCompactViewport ? 24 : 48;
    const bokehGeo = new THREE.BufferGeometry();
    const bokehPositions = new Float32Array(bokehCount * 3);
    const bokehBasePositions: { x: number; y: number; z: number; phase: number; speed: number }[] = [];

    for (let i = 0; i < bokehCount; i++) {
      const goldenAngle = i * 2.39996;
      const spreadX = Math.cos(goldenAngle) * (3.6 + (i % 9) * 1.35);
      const spreadY = ((i * 1.73) % 10.5) - 4.2;
      const spreadZ = -5.0 - (i % 9) * 1.25;

      bokehBasePositions.push({
        x: spreadX,
        y: spreadY,
        z: spreadZ,
        phase: i * 1.15,
        speed: 0.18 + (i % 4) * 0.06
      });

      bokehPositions[i * 3] = spreadX;
      bokehPositions[i * 3 + 1] = spreadY;
      bokehPositions[i * 3 + 2] = spreadZ;
    }

    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
    const bokehTex = createSoftBokehTexture();
    const bokehMat = new THREE.PointsMaterial({
      size: 0.55,
      map: bokehTex,
      color: palette.secondary,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: palette.isLight ? THREE.NormalBlending : THREE.AdditiveBlending
    });

    const bokehPoints = new THREE.Points(bokehGeo, bokehMat);
    scene.add(bokehPoints);

    // =========================================================================
    // 6. USER-UPLOADED CUSTOM 3D CINEMA BACKGROUND PLANE (CURVED PARALLAX)
    // =========================================================================
    const bgPlaneGeo = new THREE.CylinderGeometry(24, 24, 18, 48, 1, true, Math.PI * 0.72, Math.PI * 0.56);
    bgPlaneGeo.scale(-1, 1, 1); // inward facing
    const bgPlaneMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const bgPlaneMesh = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
    bgPlaneMesh.position.set(0, 0.2, -2.5);
    bgPlaneMesh.visible = false;
    scene.add(bgPlaneMesh);

    let loadedCustomUrl = '';
    let activeTexture: THREE.Texture | null = null;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const syncCustomPlaneTexture = () => {
      const cfg = studioRef.current;
      const url = cfg.customBgUrl ? resolveAssetUrl(normalizeDirectImageUrl(cfg.customBgUrl)) : '';
      const shouldUse3DPlane = Boolean(url && (cfg.customBgMode || '3d-plane') === '3d-plane');

      if (!shouldUse3DPlane) {
        bgPlaneMesh.visible = false;
        loadedCustomUrl = '';
        return;
      }

      bgPlaneMesh.visible = true;
      bgPlaneMat.opacity = cfg.customBgOpacity ?? 0.55;
      const sc = cfg.customBgScale ?? 1;
      bgPlaneMesh.scale.set(sc, sc, sc);

      if (url !== loadedCustomUrl) {
        loadedCustomUrl = url;
        textureLoader.load(
          url,
          (tex) => {
            if (isDisposed) {
              tex.dispose();
              return;
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            if (activeTexture) activeTexture.dispose();
            activeTexture = tex;
            bgPlaneMat.map = tex;
            bgPlaneMat.needsUpdate = true;
          },
          undefined,
          () => {
            bgPlaneMesh.visible = false;
          }
        );
      }
    };

    if (!isSoftware) {
      renderer.compile(scene, camera);
    }

    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetScrollY = window.scrollY || 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let smoothScrollY = targetScrollY;
    let isContextLost = false;

    const onPointerMove = (e: PointerEvent) => {
      targetPointerX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      targetPointerY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    };

    const onScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2));
      renderer.setSize(w, h);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };

    const onContextRestored = () => {
      isContextLost = false;
    };

    const syncThemeColors = () => {
      const next = getThemeThreePalette();
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.setHex(next.fog);

      waveMat.color.setHex(next.isLight ? 0xe7e1d5 : next.bg === 0x121419 ? 0x14161c : next.metal);
      arcPrimaryMat.color.setHex(next.secondary);

      const customHex = studioRef.current.accentColor;
      if (customHex && customHex.startsWith('#')) {
        arcAccentMat.color.set(customHex);
        warmAccentLight.color.set(customHex);
        accentRingMat.color.set(customHex);
        accentRingMat.emissive.set(customHex);
      } else {
        arcAccentMat.color.setHex(next.accent);
        warmAccentLight.color.setHex(next.accent);
        accentRingMat.color.setHex(next.accent);
        accentRingMat.emissive.setHex(next.accent);
      }

      hemiLight.color.setHex(next.rimLight);
      hemiLight.groundColor.setHex(next.bg);
      grazingRimLight.color.setHex(next.secondary);
      bokehMat.color.setHex(next.secondary);
    };

    const themeObserver = new MutationObserver(() => {
      syncThemeColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let frameId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const afterDraw = (cb: () => void) => {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const tick = () => {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (isContextLost) {
        if (isSoftware) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
        return;
      }

      const cfg = studioRef.current;
      const preset = cfg.preset || 'liquid-wave';
      const speed = cfg.motionSpeed ?? 1;

      if (!reducedMotion) {
        elapsed += dt * speed;
      }

      // Apply live scene preset visibility
      waveMesh.visible = preset === 'liquid-wave';
      gridGroup.visible = preset === 'cyber-grid';
      orbitalGroup.visible = preset === 'orbital-rings';
      filamentGroup.visible = preset !== 'minimal-void';
      bokehPoints.visible = preset !== 'minimal-void';
      bokehMat.opacity = Math.min(0.85, (preset === 'starfield-nebula' ? 0.55 : 0.24) * (cfg.bokehDensity ?? 1));
      bokehMat.size = preset === 'starfield-nebula' ? 0.72 : 0.52;

      waveUniforms.uIntensity.value = cfg.waveIntensity ?? 1;
      syncCustomPlaneTexture();
      syncThemeColors();

      const dampFactor = reducedMotion ? 12 : 4.0;
      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, targetPointerX, dampFactor, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, targetPointerY, dampFactor, dt);
      smoothScrollY = THREE.MathUtils.damp(smoothScrollY, targetScrollY, 4.8, dt);

      const pageTarget = pageTargetRef.current;
      const scrollNorm = smoothScrollY * 0.0012;
      const scrollDollyZ = Math.min(2.6, scrollNorm * 1.15);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, pageTarget.x + smoothPointerX * 0.68, 3.4, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pageTarget.y + smoothPointerY * 0.42 - scrollNorm * 0.35, 3.4, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, pageTarget.z - scrollDollyZ, 3.4, dt);
      camera.lookAt(smoothPointerX * 0.22, pageTarget.pitch * 4 - scrollNorm * 0.25, -6.5);

      waveUniforms.uTime.value = elapsed;
      waveUniforms.uScroll.value = scrollNorm;
      waveUniforms.uPointer.value.set(smoothPointerX, smoothPointerY);

      if (gridGroup.visible) {
        gridGroup.rotation.y = smoothPointerX * 0.08 + elapsed * 0.03;
        gridGroup.position.z = ((elapsed * 1.2) % 2.6) - 8;
      }

      if (orbitalGroup.visible) {
        torus1.rotation.x = 0.6 + elapsed * 0.24;
        torus1.rotation.y = 0.25 + elapsed * 0.18;
        torus2.rotation.z = elapsed * -0.32;
        torus3.rotation.y = -0.4 + elapsed * 0.14;
        orbitalGroup.rotation.y = smoothPointerX * 0.18;
        orbitalGroup.rotation.x = -smoothPointerY * 0.12;
      }

      if (bgPlaneMesh.visible) {
        bgPlaneMesh.rotation.y = smoothPointerX * 0.07;
        bgPlaneMesh.rotation.x = -smoothPointerY * 0.04;
      }

      for (let i = 0; i < filamentMeshes.length; i++) {
        const f = filamentMeshes[i];
        f.mesh.position.y = f.baseY + Math.sin(elapsed * 0.35 + f.phase) * 0.18;
      }
      filamentGroup.rotation.z = smoothPointerX * 0.025;
      filamentGroup.position.y = -scrollNorm * 0.35;

      if (!reducedMotion) {
        const posAttr = bokehGeo.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < bokehCount; i++) {
          const b = bokehBasePositions[i];
          arr[i * 3] = b.x + Math.sin(elapsed * b.speed + b.phase) * 0.25;
          arr[i * 3 + 1] = b.y + Math.cos(elapsed * b.speed * 0.8 + b.phase) * 0.22;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (!reducedMotion) {
        if (isSoftware) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      }
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      themeObserver.disconnect();
      if (activeTexture) activeTexture.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      disposeObjectHierarchy(scene);
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {showBackdropParallax && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url("${resolvedCustomBg}")`,
            opacity: studio3D.customBgOpacity ?? 0.55,
            filter: (studio3D.customBgBlur ?? 0) > 0 ? `blur(${studio3D.customBgBlur}px)` : undefined,
            transform: `scale(${studio3D.customBgScale ?? 1})`
          }}
        />
      )}
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
};
