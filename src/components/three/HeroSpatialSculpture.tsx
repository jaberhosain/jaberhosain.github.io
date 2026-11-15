import React, { useEffect, useRef, useState } from 'react';
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

type RigPreset = 'wide' | 'optics' | 'orbit';

const RIG_CAMERA_PRESETS: Record<RigPreset, { x: number; y: number; z: number; yaw: number; pitch: number }> = {
  wide: { x: 0, y: 0.12, z: 6.1, yaw: 0, pitch: 0 },
  optics: { x: 0.25, y: 0.06, z: 4.55, yaw: 0.28, pitch: -0.06 },
  orbit: { x: -0.9, y: 0.72, z: 5.5, yaw: -0.45, pitch: 0.34 }
};

/**
 * Interactive Hero 3D Sculpture:
 * Multi-part procedural Cinema Anamorphic Lens + Dual Orbital Storyboard Frames (16:9 + 4:5)
 * with interactive pointer drag, exponential spring damping, and 3-angle camera presets.
 */
export const HeroSpatialSculpture: React.FC<HeroSpatialSculptureProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<RigPreset>('wide');
  const presetRef = useRef<RigPreset>('wide');

  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);

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
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const palette = getThemeThreePalette();
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 0.12, 6.1);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const hemi = new THREE.HemisphereLight(palette.rimLight, palette.metal, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.95);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(palette.accent, 20, 22, 1.4);
    rimLight.position.set(-4.2, -2.2, 2.5);
    scene.add(rimLight);

    // =========================================================================
    // COMPOSITE 12-PART CINEMA OPTICS & DUAL STORYBOARD ASSEMBLY (THREE.Group)
    // =========================================================================
    const assembly = new THREE.Group();
    scene.add(assembly);

    const dialTex = createStudioDialTexture('#E4583B');

    const anodizedBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e26,
      metalness: 0.8,
      roughness: 0.42
    });

    const brushedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0xc2b9aa,
      metalness: 0.92,
      roughness: 0.18
    });

    const dialCollarMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      metalness: 0.65,
      roughness: 0.34
    });

    const accentRingMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      metalness: 0.86,
      roughness: 0.22,
      emissive: palette.accent,
      emissiveIntensity: 0.28
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
      opacity: 0.26,
      reflectivity: 0.9
    });

    // Core Lens Group
    const lensGroup = new THREE.Group();
    lensGroup.rotation.set(0.24, -0.38, 0.08);
    assembly.add(lensGroup);

    const barrelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.02, 1.05, 48, 1, false),
      anodizedBodyMat
    );
    barrelMesh.rotation.x = Math.PI / 2;
    lensGroup.add(barrelMesh);

    const dialMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.11, 1.11, 0.34, 48, 1, true),
      dialCollarMat
    );
    dialMesh.rotation.x = Math.PI / 2;
    dialMesh.position.z = 0.06;
    lensGroup.add(dialMesh);

    const flangeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.16, 1.12, 0.14, 48),
      brushedTitaniumMat
    );
    flangeMesh.rotation.x = Math.PI / 2;
    flangeMesh.position.z = -0.52;
    lensGroup.add(flangeMesh);

    const hoodRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.065, 20, 64),
      anodizedBodyMat
    );
    hoodRing.position.z = 0.53;
    lensGroup.add(hoodRing);

    const accentTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.022, 16, 64),
      accentRingMat
    );
    accentTrim.position.z = 0.32;
    lensGroup.add(accentTrim);

    // 8 Radial Aperture Iris Blades
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

    // Front Convex Optical Glass Element
    const frontGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.38),
      opticalGlassMat
    );
    frontGlass.rotation.x = Math.PI / 2;
    frontGlass.position.z = 0.18;
    lensGroup.add(frontGlass);

    // 16:9 Cinema Storyboard Gate + Precision Viewfinder Corner Accents
    const wideGateGroup = new THREE.Group();
    const wideFrameBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.65, 1.5, 0.02)),
      new THREE.LineBasicMaterial({ color: palette.secondary, transparent: true, opacity: 0.48 })
    );
    const wideGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 1.47), prismGlassMat);
    const cornerBracketGeo = new THREE.BoxGeometry(0.24, 0.035, 0.04);
    const tlBracket = new THREE.Mesh(cornerBracketGeo, accentRingMat);
    tlBracket.position.set(-1.18, 0.75, 0.02);
    const brBracket = new THREE.Mesh(cornerBracketGeo, accentRingMat);
    brBracket.position.set(1.18, -0.75, 0.02);
    wideGateGroup.add(wideFrameBorder, wideGlass, tlBracket, brBracket);
    wideGateGroup.position.set(0.18, -0.05, -0.4);
    wideGateGroup.rotation.set(0.12, 0.25, -0.08);
    assembly.add(wideGateGroup);

    // 4:5 Poster Frame Monolith orbiting cleanly alongside the cinema gate
    const posterGateGroup = new THREE.Group();
    const posterBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12, 1.42, 0.02)),
      new THREE.LineBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.55 })
    );
    const posterGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.38), prismGlassMat);
    posterGateGroup.add(posterBorder, posterGlass);
    posterGateGroup.position.set(-0.98, 0.28, -0.82);
    posterGateGroup.rotation.set(-0.14, 0.42, 0.1);
    assembly.add(posterGateGroup);

    // Outer Gimbal Orbital Arc + Secondary Counter-Arc
    const gimbalArc = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.016, 14, 96, Math.PI * 1.45),
      brushedTitaniumMat
    );
    gimbalArc.rotation.set(0.65, 0.3, -0.4);
    assembly.add(gimbalArc);

    const counterArc = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.011, 12, 96, Math.PI * 0.9),
      accentRingMat
    );
    counterArc.rotation.set(-0.55, 0.45, 0.35);
    assembly.add(counterArc);

    // =========================================================================
    // INTERACTIVE POINTER DRAG + HOVER PARALLAX + PRESET DAMPING
    // =========================================================================
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let userYaw = 0;
    let userPitch = 0;
    let hoverNormX = 0;
    let hoverNormY = 0;
    let isContextLost = false;

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
      userYaw = THREE.MathUtils.clamp(userYaw + dx * 0.0085, -1.25, 1.25);
      userPitch = THREE.MathUtils.clamp(userPitch + dy * 0.0085, -0.85, 0.85);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      canvasEl.releasePointerCapture?.(e.pointerId);
    };

    const heightFallback = (val: number) => (val > 0 ? val : 420);

    const onResize = () => {
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 420;
      camera.aspect = w / heightFallback(h);
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

    canvasEl.addEventListener('webglcontextlost', onContextLost, false);
    canvasEl.addEventListener('webglcontextrestored', onContextRestored, false);
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

      if (!isDragging) {
        userYaw = THREE.MathUtils.damp(userYaw, 0, 1.8, dt);
        userPitch = THREE.MathUtils.damp(userPitch, 0, 1.8, dt);
      }

      const camTarget = RIG_CAMERA_PRESETS[presetRef.current] || RIG_CAMERA_PRESETS.wide;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, camTarget.x, 4.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camTarget.y, 4.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, camTarget.z, 4.5, dt);
      camera.lookAt(0, 0, 0);

      const targetRotY = camTarget.yaw + userYaw + hoverNormX * 0.28 + Math.sin(elapsed * 0.45) * 0.14;
      const targetRotX = camTarget.pitch + userPitch - hoverNormY * 0.2 + Math.cos(elapsed * 0.35) * 0.08;

      assembly.rotation.y = THREE.MathUtils.damp(assembly.rotation.y, targetRotY, 6, dt);
      assembly.rotation.x = THREE.MathUtils.damp(assembly.rotation.x, targetRotX, 6, dt);
      assembly.position.y = Math.sin(elapsed * 0.85) * 0.08;

      irisGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.2;
      dialMesh.rotation.y = Math.sin(elapsed * 0.4) * 0.25;
      gimbalArc.rotation.z = -0.4 + elapsed * 0.28;
      counterArc.rotation.z = 0.35 - elapsed * 0.22;
      wideGateGroup.rotation.z = -0.08 + Math.sin(elapsed * 0.5) * 0.04;
      posterGateGroup.position.y = 0.28 + Math.cos(elapsed * 0.65) * 0.07;

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
      canvasEl.removeEventListener('webglcontextlost', onContextLost);
      canvasEl.removeEventListener('webglcontextrestored', onContextRestored);
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
    <div className={`relative ${className}`}>
      <div
        ref={mountRef}
        data-cursor="drag"
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        aria-label="Interactive 3D Cinema Optics Sculpture"
      />
      {/* Compact Camera Angle Presets along bottom edge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 p-1 rounded-lg bg-[#121419]/92 border border-[#2B303D]">
        {(
          [
            { id: 'wide', label: 'Wide' },
            { id: 'optics', label: 'Optics' },
            { id: 'orbit', label: 'Top Orbit' }
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreset(item.id)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              preset === item.id
                ? 'bg-[#E4583B] text-white font-bold'
                : 'text-[#A7A298] hover:text-[#F4F0E8]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
