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

const PAGE_CAMERA_OFFSETS: Record<string, { x: number; y: number; z: number; rotZ: number }> = {
  home: { x: 0, y: 0.2, z: 13.4, rotZ: 0 },
  about: { x: -1.15, y: -0.2, z: 12.6, rotZ: 0.08 },
  videos: { x: 1.3, y: 0.32, z: 12.1, rotZ: -0.09 },
  design: { x: -0.85, y: 0.58, z: 12.4, rotZ: 0.12 },
  skills: { x: 0.95, y: -0.35, z: 12.8, rotZ: -0.06 },
  contact: { x: 0.2, y: -0.55, z: 13.0, rotZ: 0.04 }
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
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const palette = getThemeThreePalette();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.bg);
    scene.fog = new THREE.FogExp2(palette.fog, 0.038);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 90);
    camera.position.set(0, 0.2, 13.4);

    // Studio IBL reflections via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    // Calibrated studio three-point lighting
    const hemiLight = new THREE.HemisphereLight(
      palette.rimLight,
      palette.metal,
      palette.isLight ? 1.15 : 0.78
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(palette.rimLight, palette.isLight ? 1.35 : 1.6);
    keyLight.position.set(8, 10, 9);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(palette.accent, 24, 36, 1.45);
    accentLight.position.set(-6, 3, 5);
    scene.add(accentLight);

    // =========================================================================
    // COMPOSITE ARCHITECTURAL 3D WORLD (Equinox Depth + Studio Horizon)
    // =========================================================================
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: palette.metal,
      metalness: 0.86,
      roughness: 0.26
    });

    const accentMetalMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      metalness: 0.8,
      roughness: 0.22,
      emissive: palette.accent,
      emissiveIntensity: palette.isLight ? 0.08 : 0.24
    });

    const studioGlassMat = new THREE.MeshPhysicalMaterial({
      color: palette.glass,
      metalness: 0.05,
      roughness: 0.12,
      transparent: true,
      opacity: palette.isLight ? 0.34 : 0.22,
      reflectivity: 0.92
    });

    const fineLineMat = new THREE.LineBasicMaterial({
      color: palette.secondary,
      transparent: true,
      opacity: palette.isLight ? 0.22 : 0.14
    });

    // 1. Subtle 3D Architectural Floor Perspective Grid + Horizon Ring (fades into FogExp2)
    const floorGridMat = new THREE.LineBasicMaterial({
      color: palette.metal,
      transparent: true,
      opacity: palette.isLight ? 0.28 : 0.36
    });
    const gridHelper = new THREE.GridHelper(54, 36, palette.accent, palette.metal);
    gridHelper.position.set(0, -4.4, -8);
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach((m) => {
        m.transparent = true;
        m.opacity = palette.isLight ? 0.2 : 0.26;
      });
    } else if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = palette.isLight ? 0.2 : 0.26;
    }
    worldGroup.add(gridHelper);

    const horizonArc = new THREE.Mesh(
      new THREE.TorusGeometry(9.6, 0.016, 14, 140),
      floorGridMat
    );
    horizonArc.rotation.x = Math.PI / 2;
    horizonArc.position.set(0, -4.35, -7.5);
    worldGroup.add(horizonArc);

    // 2. Orbital Architectural Meridians (deep studio framing rings)
    const ringOuter = new THREE.Mesh(
      new THREE.TorusGeometry(6.6, 0.022, 16, 120),
      brushedMetalMat
    );
    ringOuter.rotation.set(0.55, 0.35, 0.1);
    ringOuter.position.set(2.4, -0.5, -5.5);
    worldGroup.add(ringOuter);

    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(4.9, 0.018, 16, 96),
      accentMetalMat
    );
    ringInner.rotation.set(-0.45, 0.2, 0.5);
    ringInner.position.set(-2.8, 0.8, -6.5);
    worldGroup.add(ringInner);

    const ringDeep = new THREE.Mesh(
      new THREE.TorusGeometry(8.2, 0.014, 14, 128),
      fineLineMat
    );
    ringDeep.rotation.set(0.28, -0.35, -0.2);
    ringDeep.position.set(0.4, 0.1, -10.5);
    worldGroup.add(ringDeep);

    // Subtle Atmospheric Studio Light Shafts (calibrated low opacity, zero overexposure)
    const lightShaftMat = new THREE.MeshBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: palette.isLight ? 0.025 : 0.042,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const shaftGeo = new THREE.CylinderGeometry(0.14, 2.35, 22, 24, 1, true);
    const leftShaft = new THREE.Mesh(shaftGeo, lightShaftMat);
    leftShaft.position.set(-5.8, 3.8, -8.8);
    leftShaft.rotation.set(0.18, 0, -0.34);
    worldGroup.add(leftShaft);

    const rightShaft = new THREE.Mesh(shaftGeo, lightShaftMat);
    rightShaft.position.set(6.4, 4.2, -10.4);
    rightShaft.rotation.set(-0.14, 0, 0.28);
    worldGroup.add(rightShaft);

    // 3. Sculptural Aspect-Ratio Display Monoliths (5 composite frames across Z depth)
    const monolithSpecs = [
      { pos: [-5.9, 2.2, -4.2], rot: [0.22, 0.48, -0.1], w: 2.2, h: 2.9, scale: 1.0 },
      { pos: [6.0, -1.7, -3.5], rot: [-0.18, -0.52, 0.08], w: 3.1, h: 1.85, scale: 0.95 },
      { pos: [-4.8, -2.8, -7.5], rot: [0.3, 0.32, 0.15], w: 2.4, h: 1.5, scale: 1.08 },
      { pos: [5.4, 2.7, -9.2], rot: [0.15, -0.38, -0.09], w: 2.1, h: 2.75, scale: 0.92 },
      { pos: [0.2, -3.2, -11.4], rot: [-0.14, 0.12, 0.05], w: 3.4, h: 2.0, scale: 1.05 }
    ];

    const monoliths: THREE.Group[] = [];
    monolithSpecs.forEach((spec) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      mGroup.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
      mGroup.scale.setScalar(spec.scale);

      const backGeo = new THREE.BoxGeometry(spec.w, spec.h, 0.06);
      const backMesh = new THREE.Mesh(backGeo, brushedMetalMat);
      mGroup.add(backMesh);

      const glassGeo = new THREE.BoxGeometry(spec.w * 0.92, spec.h * 0.92, 0.02);
      const glassMesh = new THREE.Mesh(glassGeo, studioGlassMat);
      glassMesh.position.z = 0.09;
      mGroup.add(glassMesh);

      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(spec.w * 1.06, spec.h * 1.06, 0.12));
      const edgeLines = new THREE.LineSegments(edgeGeo, fineLineMat);
      mGroup.add(edgeLines);

      const cornerBar = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w * 0.28, 0.045, 0.11),
        accentMetalMat
      );
      cornerBar.position.set(-spec.w * 0.3, spec.h * 0.48, 0.05);
      mGroup.add(cornerBar);

      worldGroup.add(mGroup);
      monoliths.push(mGroup);
    });

    // 4. Instanced Spatial Micro-Prisms (depth parallax field)
    const particleCount = isSoftware ? 32 : 105;
    const prismGeo = new THREE.OctahedronGeometry(0.085, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.75,
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
      const angle = i * 2.39996;
      const radius = 3.2 + (i % 12) * 0.92;
      const x = Math.cos(angle) * radius;
      const y = ((i * 1.618) % 14) - 7;
      const z = -14 + (i % 11) * 1.45;

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

      if (i % 7 === 0) _color.setHex(palette.accent);
      else if (i % 3 === 0) _color.setHex(palette.secondary);
      else _color.setHex(palette.glass);
      instancedPrisms.setColorAt(i, _color);
    }
    instancedPrisms.instanceMatrix.needsUpdate = true;
    if (instancedPrisms.instanceColor) instancedPrisms.instanceColor.needsUpdate = true;
    worldGroup.add(instancedPrisms);

    // =========================================================================
    // POINTER + SCROLL + THEME SYNC + CONTEXT RECOVERY
    // =========================================================================
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
      renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
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
      if (scene.background instanceof THREE.Color) scene.background.setHex(next.bg);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.setHex(next.fog);
      brushedMetalMat.color.setHex(next.metal);
      accentMetalMat.color.setHex(next.accent);
      accentMetalMat.emissive.setHex(next.accent);
      accentMetalMat.emissiveIntensity = next.isLight ? 0.08 : 0.24;
      studioGlassMat.color.setHex(next.glass);
      studioGlassMat.opacity = next.isLight ? 0.34 : 0.22;
      fineLineMat.color.setHex(next.secondary);
      fineLineMat.opacity = next.isLight ? 0.22 : 0.14;
      floorGridMat.color.setHex(next.metal);
      lightShaftMat.color.setHex(next.accent);
      lightShaftMat.opacity = next.isLight ? 0.025 : 0.042;
      hemiLight.color.setHex(next.rimLight);
      hemiLight.groundColor.setHex(next.metal);
      hemiLight.intensity = next.isLight ? 1.15 : 0.78;
      keyLight.color.setHex(next.rimLight);
      accentLight.color.setHex(next.accent);

      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach((m) => {
          m.opacity = next.isLight ? 0.2 : 0.26;
        });
      }

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

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // =========================================================================
    // ANIMATION LOOP (Scroll-Coupled 3D Camera Dolly + Smooth Damping)
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
        }, 40);
      } else {
        rafId = requestAnimationFrame(fn);
      }
    };

    const tick = (now: number) => {
      if (isDisposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (isContextLost) {
        afterDraw(tick);
        return;
      }

      if (!reducedMotion) {
        elapsed += dt;
      }

      const dampFactor = reducedMotion ? 12 : 4.2;
      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, targetPointerX, dampFactor, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, targetPointerY, dampFactor, dt);
      smoothScrollY = THREE.MathUtils.damp(smoothScrollY, targetScrollY, 5.2, dt);

      const pageTarget = pageTargetRef.current;
      const scrollNorm = smoothScrollY * 0.0014;
      // Scroll-driven Z dolly travel (gently moves deeper through the 3D corridor as user scrolls)
      const scrollDollyZ = Math.min(3.4, scrollNorm * 1.45);

      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        pageTarget.x + smoothPointerX * 0.9 + Math.sin(scrollNorm * 0.8) * 0.45,
        3.5,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        pageTarget.y + smoothPointerY * 0.58 - scrollNorm * 0.95,
        3.5,
        dt
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        pageTarget.z - scrollDollyZ,
        3.5,
        dt
      );
      camera.lookAt(smoothPointerX * 0.25, -scrollNorm * 0.4, -3.2);

      // Gentle orbital ring rotation + scroll torque
      ringOuter.rotation.z = 0.1 + elapsed * 0.055 + scrollNorm * 0.42 + pageTarget.rotZ;
      ringOuter.rotation.y = 0.35 + smoothPointerX * 0.2;
      ringInner.rotation.z = 0.5 - elapsed * 0.07 - scrollNorm * 0.34;
      ringInner.rotation.x = -0.45 + smoothPointerY * 0.18;
      ringDeep.rotation.z = -0.2 + elapsed * 0.032 + scrollNorm * 0.22;
      ringDeep.rotation.y = -0.35 - smoothPointerX * 0.12;

      // Floating monolith breathing & cursor parallax
      for (let i = 0; i < monoliths.length; i++) {
        const m = monoliths[i];
        const base = monolithSpecs[i];
        m.position.y = base.pos[1] + Math.sin(elapsed * 0.55 + i * 2.1) * 0.2;
        m.rotation.y = base.rot[1] + smoothPointerX * (0.14 + i * 0.025) + scrollNorm * 0.12;
        m.rotation.x = base.rot[0] - smoothPointerY * (0.1 + i * 0.02);
      }

      // Instanced spatial prisms drift without allocations
      if (!reducedMotion) {
        for (let i = 0; i < particleCount; i++) {
          const s = seeds[i];
          const driftY = ((s.y + elapsed * s.speed * 0.45 + scrollNorm * 1.9 + 7) % 14) - 7;
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
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};
