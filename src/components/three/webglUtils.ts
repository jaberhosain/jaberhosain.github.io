import * as THREE from 'three';

export interface ThemeThreePalette {
  bg: number;
  fog: number;
  accent: number;
  secondary: number;
  metal: number;
  glass: number;
  rimLight: number;
  isLight: boolean;
}

/**
 * Detects software WebGL rasterizers (SwiftShader, llvmpipe, softpipe)
 * so we can automatically cap DPR and disable heavy transmission passes.
 */
export function detectSoftwareGl(gl?: WebGLRenderingContext | WebGL2RenderingContext | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    let ctx = gl;
    if (!ctx) {
      const testCanvas = document.createElement('canvas');
      ctx = (testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')) as WebGLRenderingContext | null;
    }
    if (!ctx) return true;
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const rendererStr = String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getThemeThreePalette(): ThemeThreePalette {
  if (typeof document === 'undefined') {
    return {
      bg: 0x121419,
      fog: 0x121419,
      accent: 0xe4583b,
      secondary: 0xddd1be,
      metal: 0x2b303d,
      glass: 0x8f9ab0,
      rimLight: 0xf4f0e8,
      isLight: false
    };
  }

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  switch (theme) {
    case 'light':
      return {
        bg: 0xf5f2eb,
        fog: 0xf5f2eb,
        accent: 0xc94426,
        secondary: 0x57534e,
        metal: 0xd6cfc2,
        glass: 0xffffff,
        rimLight: 0xffffff,
        isLight: true
      };
    case 'blue':
      return {
        bg: 0x0e1522,
        fog: 0x0e1522,
        accent: 0x38bdf8,
        secondary: 0xbae6fd,
        metal: 0x243451,
        glass: 0x7dd3fc,
        rimLight: 0xe0f2fe,
        isLight: false
      };
    case 'green':
      return {
        bg: 0x0d1712,
        fog: 0x0d1712,
        accent: 0x34d399,
        secondary: 0xd1fae5,
        metal: 0x1f362b,
        glass: 0x6ee7b7,
        rimLight: 0xecfdf5,
        isLight: false
      };
    case 'purple':
      return {
        bg: 0x13101d,
        fog: 0x13101d,
        accent: 0xc084fc,
        secondary: 0xede9fe,
        metal: 0x2f2747,
        glass: 0xd8b4fe,
        rimLight: 0xf5f3ff,
        isLight: false
      };
    case 'warm':
      return {
        bg: 0x17130e,
        fog: 0x17130e,
        accent: 0xe6a23c,
        secondary: 0xfde68a,
        metal: 0x382d20,
        glass: 0xf3c26b,
        rimLight: 0xfffbeb,
        isLight: false
      };
    case 'custom': {
      const customCss = getComputedStyle(document.documentElement)
        .getPropertyValue('--custom-accent')
        .trim();
      let accentHex = 0xe4583b;
      try {
        accentHex = new THREE.Color(customCss || '#E4583B').getHex();
      } catch {
        accentHex = 0xe4583b;
      }
      return {
        bg: 0x121419,
        fog: 0x121419,
        accent: accentHex,
        secondary: 0xddd1be,
        metal: 0x2b303d,
        glass: 0x8f9ab0,
        rimLight: 0xf4f0e8,
        isLight: false
      };
    }
    case 'dark':
    default:
      return {
        bg: 0x121419,
        fog: 0x121419,
        accent: 0xe4583b,
        secondary: 0xddd1be,
        metal: 0x2b303d,
        glass: 0x9aa4b8,
        rimLight: 0xf4f0e8,
        isLight: false
      };
  }
}

/**
 * Generates an anodized cinema lens ring engraving texture (SRGBColorSpace)
 * purely in memory with zero external image assets.
 */
export function createStudioDialTexture(accentCss = '#E4583B'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#191D26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle brushed grain horizontal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Precision tick marks along the collar
    const ticks = 96;
    for (let i = 0; i < ticks; i++) {
      const x = (i / ticks) * canvas.width;
      const isMajor = i % 8 === 0;
      const isMid = i % 4 === 0;
      ctx.strokeStyle = isMajor ? accentCss : isMid ? 'rgba(244,240,232,0.55)' : 'rgba(244,240,232,0.22)';
      ctx.lineWidth = isMajor ? 3 : 1.5;
      const h = isMajor ? 48 : isMid ? 30 : 18;
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - h - 18);
      ctx.lineTo(x, canvas.height - 18);
      ctx.stroke();
    }

    // Minimal optical aperture focal labels
    const labels = ['f/1.4', '24mm', '35mm', '50mm', '85mm', '∞'];
    ctx.fillStyle = '#DDD1BE';
    ctx.font = '600 22px monospace';
    labels.forEach((lbl, idx) => {
      const x = 64 + idx * 170;
      ctx.fillText(lbl, x, 58);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function disposeObjectHierarchy(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (!mat) return;
        for (const val of Object.values(mat)) {
          if (val && typeof val === 'object' && 'isTexture' in val) {
            (val as THREE.Texture).dispose();
          }
        }
        mat.dispose();
      });
    }
  });
}
