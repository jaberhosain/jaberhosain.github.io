import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createStudioDialTexture,
  detectSoftwareGl,
  disposeObjectHierarchy,
  getThemeThreePalette,
  prefersReducedMotion
} from './webglUtils';

interface HeroSpatialSculptureProps {
  className?: string;
}

/**
 * Interactive Hero 3D Sculpture:
 * A multi-part procedural Cinema Anamorphic Lens + Orbital Storyboard Gate Assembly
 * built with PBR metallic/glass material contrast and interactive drag/hover rotation.
 */
export const HeroSpatialSculpture: React.FC<HeroSpatialSculptureProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

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

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const palette = getThemeThreePalette();
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 0.1, 6.1);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    // Three-point studio lighting
    const hemi = new THREE.HemisphereLight(palette.rimLight, palette.metal, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.9);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(palette.accent, 18, 20, 1.4);
    rimLight.position.set(-4.2, -2.2, 2.5);
    scene.add(rimLight);

    // =========================================================================
    // COMPOSITE 10-PART CINEMA OPTICS & DESIGN PRISM ASSEMBLY (THREE.Group)
    // =========================================================================
    const assembly = new THREE.Group();
    scene.add(assembly);

    const dialTex = createStudioDialTexture('#E4583B');

    // Materials (roughness/metalness separation >= 0.25)
    const anodizedBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e26,
      metalness: 0.78,
      roughness: 0.44
    });

    const brushedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0xc2b9aa,
      metalness: 0.92,
      roughness: 0.18
    });

    const dialCollarMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      metalness: 0.65,
      roughness: 0.36
    });

    const accentRingMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      metalness: 0.85,
      roughness: 0.22,
      emissive: palette.accent,
      emissiveIntensity: 0.25
    });

    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf2ff,
      metalness: 0.02,
      roughness: 0.05,
      transmission: isSoftware ? 0 : 0.88,
      transparent: true,
      opacity: isSoftware ? 0.42 : 1,
      ior: 1.52,
      thickness: 0.55,
      reflectivity: 0.95
    });

    const prismGlassMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      metalness: 0.08,
      roughness: 0.12,
      transparent: true,
      opacity: 0.28,
      reflectivity: 0.9
    });

    // Core Lens Group rotated toward viewer
    const lensGroup = new THREE.Group();
    lensGroup.rotation.set(0.24, -0.38, 0.08);
    assembly.add(lensGroup);

    // Part 1: Main anodized barrel cylinder
    const barrelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.02, 1.05, 48, 1, false),
      anodizedBodyMat
    );
    barrelMesh.rotation.x = Math.PI / 2;
    lensGroup.add(barrelMesh);

    // Part 2: Engraved optical focal collar
    const dialMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.11, 1.11, 0.34, 48, 1, true),
      dialCollarMat
    );
    dialMesh.rotation.x = Math.PI / 2;
    dialMesh.position.z = 0.06;
    lensGroup.add(dialMesh);

    // Part 3: Brushed titanium rear bayonet flange
    const flangeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.16, 1.12, 0.14, 48),
      brushedTitaniumMat
    );
    flangeMesh.rotation.x = Math.PI / 2;
    flangeMesh.position.z = -0.52;
    lensGroup.add(flangeMesh);

    // Part 4: Recessed anodized front lens hood lip
    const hoodRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.065, 20, 64),
      anodizedBodyMat
    );
    hoodRing.position.z = 0.53;
    lensGroup.add(hoodRing);

    // Part 5: Copper/vermilion studio signature accent trim ring
    const accentTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.022, 16, 64),
      accentRingMat
    );
    accentTrim.position.z = 0.32;
    lensGroup.add(accentTrim);

    // Part 6: 8 Radial Aperture Iris Blades inside the barrel
    const irisGroup = new THREE.Group();
    irisGroup.position.z = 0.22;
    const bladeGeo = new THREE.BoxGeometry(0.42, 0.22, 0.015);
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeGeo, anodizedBodyMat);
      const theta = (i / 8) * Math.PI * 2;
      blade.position.set(Math.cos(theta) * 0.58, Math.sin(theta) * 0.58, (i % 2) * 0.008);
      blade.rotation.z = theta + 0.55;
      irisGroup.add(blade);
    }
    lensGroup.add(irisGroup);

    // Part 7: Front Convex Optical Glass Element
    const frontGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.38),
      opticalGlassMat
    );
    frontGlass.rotation.x = Math.PI / 2;
    frontGlass.position.z = 0.18;
    lensGroup.add(frontGlass);

    // Part 8 & 9: Orbital Architectural Aspect-Ratio Storyboard Frames (16:9 + 4:5)
    const wideGateGroup = new THREE.Group();
    const wideFrameBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.65, 1.5, 0.02)),
      new THREE.LineBasicMaterial({ color: palette.secondary, transparent: true, opacity: 0.45 })
    );
    const wideGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 1.47), prismGlassMat);
    wideGateGroup.add(wideFrameBorder, wideGlass);
    wideGateGroup.position.set(0.15, -0.05, -0.35);
    wideGateGroup.rotation.set(0.12, 0.25, -0.08);
    assembly.add(wideGateGroup);

    // Part 10: Outer Gimbal Orbital Arc
    const gimbalArc = new THREE.Mesh(
      new THREE.TorusGeometry(1.78, 0.016, 14, 96, Math.PI * 1.45),
      brushedTitaniumMat
    );
    gimbalArc.rotation.set(0.65, 0.3, -0.4);
    assembly.add(gimbalArc);

    // =========================================================================
    // INTERACTIVE POINTER DRAG + HOVER PARALLAX
    // =========================================================================
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let userYaw = 0;
    let userPitch = 0;
    let hoverNormX = 0;
    let hoverNormY = 0;

    const canvasEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      canvasEl.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        hoverNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        hoverNormY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
      if (!isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      userYaw = THREE.MathUtils.clamp(userYaw + dx * 0.0085, -1.1, 1.1);
      userPitch = THREE.MathUtils.clamp(userPitch + dy * 0.0085, -0.75, 0.75);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      canvasEl.releasePointerCapture?.(e.pointerId);
    };

    const onResize = () => {
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 420;
      camera.aspect = w / heightFallback(h);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
    };

    const heightFallback = (val: number) => (val > 0 ? val : 420);

    const syncTheme = () => {
      const next = getThemeThreePalette();
      accentRingMat.color.setHex(next.accent);
      accentRingMat.emissive.setHex(next.accent);
      rimLight.color.setHex(next.accent);
      prismGlassMat.color.setHex(next.secondary);
    };

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });

    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

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

      // Gently spring user drag rotation back when released
      if (!isDragging) {
        userYaw = THREE.MathUtils.damp(userYaw, 0, 1.8, dt);
        userPitch = THREE.MathUtils.damp(userPitch, 0, 1.8, dt);
      }

      const targetRotY = userYaw + hoverNormX * 0.28 + Math.sin(elapsed * 0.45) * 0.14;
      const targetRotX = userPitch - hoverNormY * 0.2 + Math.cos(elapsed * 0.35) * 0.08;

      assembly.rotation.y = THREE.MathUtils.damp(assembly.rotation.y, targetRotY, 6, dt);
      assembly.rotation.x = THREE.MathUtils.damp(assembly.rotation.x, targetRotX, 6, dt);
      assembly.position.y = Math.sin(elapsed * 0.85) * 0.08;

      // Subtle mechanical iris & dial micro-motion
      irisGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.18;
      dialMesh.rotation.y = Math.sin(elapsed * 0.4) * 0.25;
      gimbalArc.rotation.z = -0.4 + elapsed * 0.28;
      wideGateGroup.rotation.z = -0.08 + Math.sin(elapsed * 0.5) * 0.04;

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
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      disposeObjectHierarchy(scene);
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`cursor-grab active:cursor-grabbing touch-none ${className}`}
      aria-label="Interactive 3D Cinema Optics Sculpture"
    />
  );
};
