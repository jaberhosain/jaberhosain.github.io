import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  detectSoftwareGl,
  disposeObjectHierarchy,
  getThemeThreePalette,
  prefersReducedMotion
} from './webglUtils';

interface StudioBackdrop3DProps {
  activePage: string;
}

// Pre-allocated scratch math objects (zero allocations in RAF loop)
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

const PAGE_CAMERA_OFFSETS: Record<string, { x: number; y: number; rotZ: number }> = {
  home: { x: 0, y: 0.15, rotZ: 0 },
  about: { x: -1.1, y: -0.25, rotZ: 0.08 },
  videos: { x: 1.25, y: 0.3, rotZ: -0.09 },
  design: { x: -0.8, y: 0.6, rotZ: 0.12 },
  skills: { x: 0.9, y: -0.4, rotZ: -0.06 },
  contact: { x: 0.2, y: -0.65, rotZ: 0.04 }
};

export const StudioBackdrop3D: React.FC<StudioBackdrop3DProps> = ({ activePage }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pageTargetRef = useRef(PAGE_CAMERA_OFFSETS[activePage] || PAGE_CAMERA_OFFSETS.home);

  useEffect(() => {
    pageTargetRef.current = PAGE_CAMERA_OFFSETS[activePage] || PAGE_CAMERA_OFFSETS.home;
  }, [activePage]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = prefersReducedMotion();
    const isSoftware = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftware,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      // Fallback silently to CSS surface if WebGL is disabled
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const palette = getThemeThreePalette();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.bg);
    scene.fog = new THREE.FogExp2(palette.fog, 0.042);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 0.15, 13.5);

    // Studio IBL reflections via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    // Calibrated studio three-point lighting
    const hemiLight = new THREE.HemisphereLight(palette.rimLight, palette.metal, palette.isLight ? 1.15 : 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(palette.rimLight, palette.isLight ? 1.35 : 1.55);
    keyLight.position.set(8, 10, 9);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(palette.accent, 22, 34, 1.5);
    accentLight.position.set(-6, 3, 5);
    scene.add(accentLight);

    // =========================================================================
    // COMPOSITE ARCHITECTURAL 3D WORLD
    // =========================================================================
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Shared PBR materials with clear roughness/metalness contrast
    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: palette.metal,
      metalness: 0.84,
      roughness: 0.28
    });

    const accentMetalMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      metalness: 0.78,
      roughness: 0.24,
      emissive: palette.accent,
      emissiveIntensity: palette.isLight ? 0.08 : 0.22
    });

    const studioGlassMat = new THREE.MeshPhysicalMaterial({
      color: palette.glass,
      metalness: 0.05,
      roughness: 0.14,
      transparent: true,
      opacity: palette.isLight ? 0.34 : 0.22,
      reflectivity: 0.9
    });

    const fineLineMat = new THREE.LineBasicMaterial({
      color: palette.secondary,
      transparent: true,
      opacity: palette.isLight ? 0.22 : 0.14
    });

    // 1. Orbital Architectural Meridians (deep studio framing rings)
    const ringOuter = new THREE.Mesh(
      new THREE.TorusGeometry(6.4, 0.022, 16, 120),
      brushedMetalMat
    );
    ringOuter.rotation.set(0.55, 0.35, 0.1);
    ringOuter.position.set(2.4, -0.5, -5.5);
    worldGroup.add(ringOuter);

    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.018, 16, 96),
      accentMetalMat
    );
    ringInner.rotation.set(-0.45, 0.2, 0.5);
    ringInner.position.set(-2.8, 0.8, -6.5);
    worldGroup.add(ringInner);

    // 2. Sculptural Aspect-Ratio Frame Monoliths (3 composite groups floating in Z depth)
    const monolithSpecs = [
      { pos: [-5.8, 2.2, -4.5], rot: [0.22, 0.48, -0.1], w: 2.2, h: 2.9, scale: 1.0 },
      { pos: [5.9, -1.8, -3.8], rot: [-0.18, -0.52, 0.08], w: 3.1, h: 1.85, scale: 0.95 },
      { pos: [-4.6, -2.9, -7.2], rot: [0.3, 0.32, 0.15], w: 2.4, h: 1.5, scale: 1.1 }
    ];

    const monoliths: THREE.Group[] = [];
    monolithSpecs.forEach((spec) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      mGroup.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
      mGroup.scale.setScalar(spec.scale);

      // Matte dark chamfered backing plate
      const backGeo = new THREE.BoxGeometry(spec.w, spec.h, 0.06);
      const backMesh = new THREE.Mesh(backGeo, brushedMetalMat);
      mGroup.add(backMesh);

      // Glossy optical front glass pane separated along Z
      const glassGeo = new THREE.BoxGeometry(spec.w * 0.92, spec.h * 0.92, 0.02);
      const glassMesh = new THREE.Mesh(glassGeo, studioGlassMat);
      glassMesh.position.z = 0.09;
      mGroup.add(glassMesh);

      // Fine wireframe architectural rim
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(spec.w * 1.06, spec.h * 1.06, 0.12));
      const edgeLines = new THREE.LineSegments(edgeGeo, fineLineMat);
      mGroup.add(edgeLines);

      // Small copper calibration corner bar
      const cornerBar = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w * 0.28, 0.045, 0.11),
        accentMetalMat
      );
      cornerBar.position.set(-spec.w * 0.3, spec.h * 0.48, 0.05);
      mGroup.add(cornerBar);

      worldGroup.add(mGroup);
      monoliths.push(mGroup);
    });

    // 3. Instanced Spatial Micro-Prisms (depth parallax field)
    const particleCount = isSoftware ? 32 : 95;
    const prismGeo = new THREE.OctahedronGeometry(0.085, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.72,
      roughness: 0.22
    });
    const instancedPrisms = new THREE.InstancedMesh(prismGeo, prismMat, particleCount);

    interface ParticleSeed {
      x: number;
      y: number;
      z: number;
      rx: number;
      ry: number;
      scale: number;
      speed: number;
      phase: number;
    }
    const seeds: ParticleSeed[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Pseudo-deterministic spread across foreground/midground/background
      const angle = i * 2.39996;
      const radius = 3.2 + (i % 11) * 0.92;
      const x = Math.cos(angle) * radius;
      const y = ((i * 1.618) % 14) - 7;
      const z = -12 + (i % 9) * 1.5;

      const seed: ParticleSeed = {
        x,
        y,
        z,
        rx: (i % 7) * 0.4,
        ry: (i % 5) * 0.5,
        scale: 0.45 + (i % 6) * 0.22,
        speed: 0.15 + (i % 4) * 0.07,
        phase: i * 0.75
      };
      seeds.push(seed);

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(seed.rx, seed.ry, 0);
      _dummy.scale.setScalar(seed.scale);
      _dummy.updateMatrix();
      instancedPrisms.setMatrixAt(i, _dummy.matrix);

      // Subtle graded color palette across instances
      if (i % 7 === 0) {
        _color.setHex(palette.accent);
      } else if (i % 3 === 0) {
        _color.setHex(palette.secondary);
      } else {
        _color.setHex(palette.glass);
      }
      instancedPrisms.setColorAt(i, _color);
    }
    instancedPrisms.instanceMatrix.needsUpdate = true;
    if (instancedPrisms.instanceColor) instancedPrisms.instanceColor.needsUpdate = true;
    worldGroup.add(instancedPrisms);

    // =========================================================================
    // POINTER + SCROLL + THEME SYNC LISTENERS
    // =========================================================================
    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetScrollY = window.scrollY || 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let smoothScrollY = targetScrollY;

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
      renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
    };

    const syncThemeColors = () => {
      const next = getThemeThreePalette();
      if (scene.background instanceof THREE.Color) scene.background.setHex(next.bg);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.setHex(next.fog);
      brushedMetalMat.color.setHex(next.metal);
      accentMetalMat.color.setHex(next.accent);
      accentMetalMat.emissive.setHex(next.accent);
      accentMetalMat.emissiveIntensity = next.isLight ? 0.08 : 0.22;
      studioGlassMat.color.setHex(next.glass);
      studioGlassMat.opacity = next.isLight ? 0.34 : 0.22;
      fineLineMat.color.setHex(next.secondary);
      fineLineMat.opacity = next.isLight ? 0.22 : 0.14;
      hemiLight.color.setHex(next.rimLight);
      hemiLight.groundColor.setHex(next.metal);
      hemiLight.intensity = next.isLight ? 1.15 : 0.72;
      keyLight.color.setHex(next.rimLight);
      accentLight.color.setHex(next.accent);

      for (let i = 0; i < particleCount; i++) {
        if (i % 7 === 0) _color.setHex(next.accent);
        else if (i % 3 === 0) _color.setHex(next.secondary);
        else _color.setHex(next.glass);
        instancedPrisms.setColorAt(i, _color);
      }
      if (instancedPrisms.instanceColor) instancedPrisms.instanceColor.needsUpdate = true;
    };

    const themeObserver = new MutationObserver(() => {
      syncThemeColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // =========================================================================
    // ANIMATION LOOP (Zero allocations, adaptive software-GL pacing)
    // =========================================================================
    let rafId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const afterDraw = (fn: FrameRequestCallback) => {
      if (isDisposed) return;
      if (isSoftware) {
        setTimeout(() => {
          if (!isDisposed) rafId = requestAnimationFrame(fn);
        }, 16);
      } else {
        rafId = requestAnimationFrame(fn);
      }
    };

    const tick = (now: number) => {
      if (isDisposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!reducedMotion) {
        elapsed += dt;
      }

      const dampFactor = reducedMotion ? 12 : 4.2;
      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, targetPointerX, dampFactor, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, targetPointerY, dampFactor, dt);
      smoothScrollY = THREE.MathUtils.damp(smoothScrollY, targetScrollY, 5.0, dt);

      const pageTarget = pageTargetRef.current;
      const scrollNorm = smoothScrollY * 0.0014;

      // Subtle camera spatial choreography across scroll & navigation
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        pageTarget.x + smoothPointerX * 0.85,
        3.5,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        pageTarget.y + smoothPointerY * 0.55 - scrollNorm * 1.15,
        3.5,
        dt
      );
      camera.lookAt(smoothPointerX * 0.25, -scrollNorm * 0.45, -2.5);

      // Gentle orbital ring rotation
      ringOuter.rotation.z = 0.1 + elapsed * 0.055 + scrollNorm * 0.35 + pageTarget.rotZ;
      ringOuter.rotation.y = 0.35 + smoothPointerX * 0.18;
      ringInner.rotation.z = 0.5 - elapsed * 0.07 - scrollNorm * 0.28;
      ringInner.rotation.x = -0.45 + smoothPointerY * 0.16;

      // Floating monolith breathing & cursor parallax
      for (let i = 0; i < monoliths.length; i++) {
        const m = monoliths[i];
        const base = monolithSpecs[i];
        m.position.y = base.pos[1] + Math.sin(elapsed * 0.55 + i * 2.1) * 0.18;
        m.rotation.y = base.rot[1] + smoothPointerX * (0.12 + i * 0.03);
        m.rotation.x = base.rot[0] - smoothPointerY * (0.09 + i * 0.02);
      }

      // Instanced spatial prisms drift without new heap objects
      if (!reducedMotion) {
        for (let i = 0; i < particleCount; i++) {
          const s = seeds[i];
          const driftY = ((s.y + elapsed * s.speed * 0.45 + scrollNorm * 1.8 + 7) % 14) - 7;
          _dummy.position.set(
            s.x + Math.sin(elapsed * 0.3 + s.phase) * 0.22,
            driftY,
            s.z
          );
          _dummy.rotation.set(s.rx + elapsed * 0.25, s.ry + elapsed * 0.32, 0);
          _dummy.scale.setScalar(s.scale);
          _dummy.updateMatrix();
          instancedPrisms.setMatrixAt(i, _dummy.matrix);
        }
        instancedPrisms.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (!reducedMotion) {
        afterDraw(tick);
      }
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
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
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};
