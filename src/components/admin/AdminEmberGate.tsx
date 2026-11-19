import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AdminEmberGateProps {
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  authLoading: boolean;
  authError: string | null;
  currentUser: FirebaseUser | null;
  isAdmin: boolean;
  projectCount: number;
  videoCount: number;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
  onSignOut: () => void;
  onBackToSite: () => void;
}

type GatePhase = 'light' | 'burning-in' | 'dark' | 'restoring';

interface AmbientEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  warmth: number; // 0 = cool white starlight, 1 = warm gold ember
}

interface BurnSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  isAsh: boolean;
  rotation: number;
  vRot: number;
}

/**
 * Computes an organic jagged radial contour for the burning paper edge.
 */
function sampleBurnRadius(angle: number, baseR: number, timeSec: number, seedOffset: number): number {
  const n1 = Math.sin(angle * 3 + timeSec * 1.4 + seedOffset) * 0.085;
  const n2 = Math.sin(angle * 7 - timeSec * 1.9 + seedOffset * 1.7) * 0.052;
  const n3 = Math.cos(angle * 13 + timeSec * 2.3 - seedOffset) * 0.028;
  const n4 = Math.sin(angle * 23 - timeSec * 3.1 + seedOffset * 0.5) * 0.015;
  return Math.max(0, baseR * (1 + n1 + n2 + n3 + n4));
}

function traceBurnPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  timeSec: number,
  seedOffset: number,
  segments = 148
) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = sampleBurnRadius(angle, baseR, timeSec, seedOffset);
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}

/**
 * Full-screen interactive Admin Gate modeled on a burning-paper fire-ring dissolve:
 * 1. Pristine Light Paper Gate with molten "Hold to unlock" pill button
 * 2. Organic plasma-fire burn-through canvas with rising ash & gold embers
 * 3. Pitch-black starry ash-ember minimalist Sign In screen with reverse restore transition
 */
export const AdminEmberGate: React.FC<AdminEmberGateProps> = ({
  usernameInput,
  setUsernameInput,
  password,
  setPassword,
  authLoading,
  authError,
  currentUser,
  isAdmin,
  projectCount,
  videoCount,
  onSubmit,
  onGoogleLogin,
  onSignOut,
  onBackToSite
}) => {
  // If an auth error or non-admin user is already present, open directly on the dark Sign In screen
  const [phase, setPhase] = useState<GatePhase>(() =>
    authError || (currentUser && !isAdmin) ? 'dark' : 'light'
  );
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burnCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const phaseRef = useRef<GatePhase>(phase);
  const burnProgressRef = useRef<number>(phase === 'dark' ? 1 : 0);
  const sparksRef = useRef<BurnSpark[]>([]);
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Automatically jump to dark sign-in if an auth error occurs
  useEffect(() => {
    if (authError && phaseRef.current === 'light') {
      burnProgressRef.current = 1;
      setPhase('dark');
    }
  }, [authError]);

  const triggerBurnIn = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    if (reducedMotionRef.current) {
      burnProgressRef.current = 1;
      setPhase('dark');
      return;
    }
    burnProgressRef.current = 0.02;
    setPhase('burning-in');
  }, []);

  const triggerRestoreLight = useCallback(() => {
    if (reducedMotionRef.current) {
      burnProgressRef.current = 0;
      setPhase('light');
      return;
    }
    burnProgressRef.current = 0.98;
    setPhase('restoring');
  }, []);

  // Hold-to-unlock interaction (smooth 780ms molten fill)
  const startHold = useCallback(() => {
    if (phaseRef.current !== 'light') return;
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const DURATION = 780;
    const step = (now: number) => {
      const elapsed = now - holdStartRef.current;
      const pct = Math.min(1, elapsed / DURATION);
      setHoldProgress(pct);
      if (pct >= 1) {
        holdRafRef.current = null;
        triggerBurnIn();
        return;
      }
      holdRafRef.current = requestAnimationFrame(step);
    };

    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    holdRafRef.current = requestAnimationFrame(step);
  }, [triggerBurnIn]);

  const cancelHold = useCallback(() => {
    setIsHolding(false);
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, []);

  // 1. Background Ambient Ash / Starlight Ember Particle Canvas (always lives on the pitch-black Sign In void)
  useEffect(() => {
    const canvas = ambientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = width < 640 ? 95 : 155;
    const particles: AmbientEmber[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(0.12 + Math.random() * 0.42),
      size: 0.7 + Math.random() * 1.9,
      alpha: 0.25 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.8 + Math.random() * 1.8,
      warmth: Math.random() < 0.28 ? 1 : 0
    }));

    const render = (now: number) => {
      const t = now * 0.001;
      ctx.clearRect(0, 0, width, height);

      // Subtle deep cosmic radial vignette
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        10,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#0B0B0F');
      bgGrad.addColorStop(0.55, '#040406');
      bgGrad.addColorStop(1, '#010102');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (!reducedMotionRef.current) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx + Math.sin(t * 0.6 + p.twinklePhase) * 0.14;
          p.y += p.vy;

          if (p.y < -12) {
            p.y = height + 12;
            p.x = Math.random() * width;
          }
          if (p.x < -12) p.x = width + 12;
          if (p.x > width + 12) p.x = -12;

          const pulse = 0.55 + 0.45 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
          const a = p.alpha * pulse;

          if (p.warmth > 0.5) {
            ctx.fillStyle = `rgba(255, 206, 146, ${a.toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(235, 238, 245, ${(a * 0.85).toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 2. Foreground Burning-Paper Fire-Ring Dissolve + Flying Ash & Spark Canvas
  useEffect(() => {
    const canvas = burnCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastTime = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now * 0.001;
      const currentPhase = phaseRef.current;

      // Advance burn progress cleanly with organic acceleration curve
      if (currentPhase === 'burning-in') {
        const speed = 0.56 + burnProgressRef.current * 0.65;
        burnProgressRef.current = Math.min(1, burnProgressRef.current + dt * speed);
        if (burnProgressRef.current >= 1) {
          setPhase('dark');
        }
      } else if (currentPhase === 'restoring') {
        const speed = 0.62 + (1 - burnProgressRef.current) * 0.55;
        burnProgressRef.current = Math.max(0, burnProgressRef.current - dt * speed);
        if (burnProgressRef.current <= 0) {
          setPhase('light');
        }
      }

      const progress = burnProgressRef.current;
      const hasSparks = sparksRef.current.length > 0;
      const isTransitioning = currentPhase === 'burning-in' || currentPhase === 'restoring';

      ctx.clearRect(0, 0, width, height);

      if (isTransitioning || hasSparks) {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const maxR = Math.hypot(cx, cy) * 1.18;

        // Smooth ease curve so ignition starts focused around button then sweeps cleanly across screen
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const baseR = eased * maxR;

        if (isTransitioning && progress < 0.995) {
          // A. Pristine white paper sheet
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Subtle paper warmth around the ignition zone
          if (baseR > 6) {
            // B. Punch jagged organic burned hole revealing the dark Sign-In canvas beneath
            ctx.globalCompositeOperation = 'destination-out';
            traceBurnPath(ctx, cx, cy, baseR, t, 1.3);
            ctx.fill();
            ctx.restore();

            // C. Multi-layered plasma-fire burning rim (magenta-violet corona -> fiery red-orange -> incandescent gold-white)
            ctx.save();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // Layer 1: Outer plasma magenta-pink halo (exact signature glow from video)
            ctx.shadowColor = 'rgba(210, 92, 255, 0.72)';
            ctx.shadowBlur = 36;
            ctx.strokeStyle = 'rgba(224, 118, 255, 0.42)';
            ctx.lineWidth = 28;
            traceBurnPath(ctx, cx, cy, baseR + 5, t, 1.3);
            ctx.stroke();

            // Layer 2: Blazing vermilion-orange flame edge
            ctx.shadowColor = 'rgba(255, 82, 22, 0.95)';
            ctx.shadowBlur = 26;
            ctx.strokeStyle = 'rgba(255, 84, 24, 0.92)';
            ctx.lineWidth = 17;
            traceBurnPath(ctx, cx, cy, baseR + 2, t, 1.3);
            ctx.stroke();

            // Layer 3: Inner charred dark rim tucked slightly inside the flame
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(18, 6, 4, 0.85)';
            ctx.strokeStyle = 'rgba(28, 12, 8, 0.72)';
            ctx.lineWidth = 7;
            traceBurnPath(ctx, cx, cy, Math.max(0, baseR - 4), t, 1.3);
            ctx.stroke();

            // Layer 4: Glowing amber-gold molten border
            ctx.shadowColor = 'rgba(255, 198, 88, 0.98)';
            ctx.shadowBlur = 14;
            ctx.strokeStyle = 'rgba(255, 200, 92, 0.96)';
            ctx.lineWidth = 7;
            traceBurnPath(ctx, cx, cy, baseR + 1, t, 1.3);
            ctx.stroke();

            // Layer 5: Hot white core filament
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#FFFFFF';
            ctx.strokeStyle = 'rgba(255, 253, 246, 0.98)';
            ctx.lineWidth = 2.6;
            traceBurnPath(ctx, cx, cy, baseR + 2, t, 1.3);
            ctx.stroke();
            ctx.restore();

            // D. Spawn fresh dark charred ash flakes + bright golden sparks right along the burning perimeter
            const spawnCount = width < 640 ? 14 : 26;
            for (let s = 0; s < spawnCount; s++) {
              const angle = Math.random() * Math.PI * 2;
              const edgeR = sampleBurnRadius(angle, baseR, t, 1.3);
              const px = cx + Math.cos(angle) * edgeR + (Math.random() - 0.5) * 14;
              const py = cy + Math.sin(angle) * edgeR + (Math.random() - 0.5) * 14;
              const isAsh = Math.random() < 0.52;
              sparksRef.current.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * (12 + Math.random() * 34) + (Math.random() - 0.5) * 26,
                vy: -(28 + Math.random() * 95),
                size: isAsh ? 1.8 + Math.random() * 3.6 : 1.1 + Math.random() * 2.4,
                life: 0,
                maxLife: 0.75 + Math.random() * 1.15,
                isAsh,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 6
              });
            }
          } else {
            ctx.restore();
          }
        }

        // E. Update & draw floating ash flakes and golden sparks
        const nextSparks: BurnSpark[] = [];
        for (let i = 0; i < sparksRef.current.length; i++) {
          const sp = sparksRef.current[i];
          sp.life += dt;
          if (sp.life >= sp.maxLife) continue;

          sp.x += sp.vx * dt + Math.sin(t * 4 + sp.rotation) * 14 * dt;
          sp.y += sp.vy * dt;
          sp.vx *= 0.985;
          sp.rotation += sp.vRot * dt;

          const remain = 1 - sp.life / sp.maxLife;
          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.rotate(sp.rotation);
          if (sp.isAsh) {
            ctx.fillStyle = `rgba(18, 15, 14, ${(remain * 0.92).toFixed(3)})`;
            ctx.fillRect(-sp.size * 0.6, -sp.size * 0.4, sp.size * 1.2, sp.size * 0.8);
          } else {
            ctx.shadowColor = 'rgba(255, 140, 48, 0.9)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = `rgba(255, 224, 154, ${remain.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(0, 0, sp.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          nextSparks.push(sp);
        }
        // Cap max particle buffer for steady 60fps
        sparksRef.current = nextSparks.slice(-420);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isLightVisible = phase === 'light';
  const isDarkInteractive = phase === 'dark';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030305] font-sans select-none">
      {/* ========================================================================
          LAYER 1: DEEP COSMIC ASH-EMBER DARK SIGN-IN VOID (Underneath Paper)
          ======================================================================== */}
      <canvas
        ref={ambientCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      <div
        className={`relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-5 py-10 transition-opacity duration-500 ${
          phase === 'light' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isDarkInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Top subtle return link */}
        <button
          type="button"
          onClick={onBackToSite}
          className="fixed top-5 left-5 sm:top-7 sm:left-7 z-20 inline-flex items-center gap-1.5 text-xs font-medium text-white/45 hover:text-white/90 transition-colors cursor-pointer min-h-[40px] px-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Website</span>
        </button>

        {/* Centered Minimalist Sign In (Direct floating typography & sleek pills, matching video 00:05–00:10) */}
        <div className="w-full max-w-[360px] mx-auto text-center space-y-6 select-text">
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-[38px] font-semibold tracking-tight text-white">
              Sign in
            </h1>
            <p className="text-xs sm:text-[13px] text-white/45">
              Md. Jaber Hosain &middot; Studio Admin Console
            </p>
          </div>

          {/* Unauthorized Signed-in User Notice */}
          {currentUser && !isAdmin && (
            <div className="p-4 rounded-2xl bg-amber-950/55 border border-amber-500/35 text-amber-200 text-xs text-left space-y-2 backdrop-blur-md">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unauthorized Account</span>
              </div>
              <p className="text-amber-200/85 leading-relaxed">
                Signed in as <span className="font-mono text-white">{currentUser.email}</span>. Only the owner account has admin permissions.
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="text-xs font-medium text-white underline hover:text-amber-300 cursor-pointer"
              >
                Sign out and switch account
              </button>
            </div>
          )}

          {/* Error Notice */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-left flex items-start gap-2.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Clean Pill Input Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="text"
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username or Email"
              aria-label="Username or Email"
              className="w-full min-h-[46px] px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.11] focus:bg-white/[0.13] border border-white/[0.12] focus:border-white/40 text-sm text-white placeholder-white/40 text-center focus:outline-none transition-all backdrop-blur-md"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full min-h-[46px] px-11 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.11] focus:bg-white/[0.13] border border-white/[0.12] focus:border-white/40 text-sm text-white placeholder-white/40 text-center focus:outline-none transition-all backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Pure White Pill Primary CTA ("Continue" — identical to video 00:07) */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full min-h-[46px] px-6 py-3 rounded-full bg-white text-[#0A0A0C] hover:bg-white/92 active:scale-[0.99] font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_10px_30px_-8px_rgba(255,255,255,0.28)]"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Backup Google Sign-In */}
          <div className="pt-1 space-y-4">
            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={authLoading}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-medium text-white/85 hover:text-white transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Reverse Burn Trigger (matches "Restore my account" link in video 00:08 -> 00:14) */}
            <div>
              <button
                type="button"
                onClick={triggerRestoreLight}
                className="text-xs text-white/45 hover:text-white/90 transition-colors cursor-pointer py-1 px-2"
              >
                Return to light gate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          LAYER 2: PRISTINE LIGHT PAPER GATE (Frame 00:00 — Hold-to-Ignite Pill)
          ======================================================================== */}
      {isLightVisible && (
        <div className="fixed inset-0 z-20 bg-[#FFFFFF] text-[#141416] flex flex-col items-center justify-center px-6">
          {/* Subtle top-left back button */}
          <button
            type="button"
            onClick={onBackToSite}
            className="fixed top-5 left-5 sm:top-7 sm:left-7 inline-flex items-center gap-1.5 text-xs font-medium text-[#76767C] hover:text-[#111113] transition-colors cursor-pointer min-h-[40px] px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>

          <div className="w-full max-w-md mx-auto text-center space-y-5">
            {/* Quiet Top Identity Meta (matching "Keshav, @kshvbgde") */}
            <p className="text-xs sm:text-[13px] font-medium text-[#8C8C92] tracking-normal">
              Md. Jaber Hosain, @jabirbd
            </p>

            {/* Bold Crisp Headline */}
            <h1 className="font-display text-3xl sm:text-[42px] font-bold tracking-tight text-[#111113] leading-[1.12]">
              Unlock Admin Studio?
            </h1>

            {/* Real Live Portfolio Count Subtitle */}
            <p className="text-sm sm:text-[15px] text-[#6E6E74] leading-relaxed">
              Your <span className="tabular-nums font-medium text-[#3A3A3F]">{projectCount}</span>{' '}
              projects and{' '}
              <span className="tabular-nums font-medium text-[#3A3A3F]">{videoCount}</span>{' '}
              videos are synced inside.
            </p>

            {/* Signature Molten "Hold to enter" Pill Button (Frame 00:00) */}
            <div className="pt-3 flex flex-col items-center gap-4">
              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isHolding) {
                    e.preventDefault();
                    startHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cancelHold();
                  }
                }}
                style={{
                  boxShadow:
                    holdProgress > 0
                      ? `0 0 ${18 + holdProgress * 38}px rgba(249, 107, 39, ${(0.35 + holdProgress * 0.5).toFixed(2)}), 0 0 ${8 + holdProgress * 18}px rgba(255, 198, 112, ${(0.25 + holdProgress * 0.45).toFixed(2)})`
                      : '0 10px 26px -10px rgba(0, 0, 0, 0.35)'
                }}
                className="relative overflow-hidden min-w-[204px] min-h-[50px] px-8 py-3 rounded-full bg-[#161618] text-white font-medium text-sm tracking-tight transition-transform duration-150 active:scale-[0.98] touch-none select-none cursor-pointer"
              >
                {/* Molten Ember Horizontal Progress Fill */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 pointer-events-none transition-[opacity] duration-150"
                  style={{
                    width: `${Math.max(0, holdProgress * 100)}%`,
                    opacity: holdProgress > 0 ? 1 : 0,
                    background:
                      'linear-gradient(90deg, #7C190B 0%, #D9461A 42%, #FA8C32 78%, #FFF1D0 100%)'
                  }}
                />
                {/* Glowing leading burn tip */}
                {holdProgress > 0.02 && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-4 pointer-events-none blur-[4px]"
                    style={{
                      left: `calc(${holdProgress * 100}% - 8px)`,
                      background: 'rgba(255, 246, 224, 0.95)'
                    }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center justify-center">
                  {isHolding ? 'Igniting...' : 'Hold to enter'}
                </span>
              </button>

              {/* Accessible 1-click quick ignite option */}
              <button
                type="button"
                onClick={triggerBurnIn}
                className="text-xs text-[#8E8E94] hover:text-[#141416] transition-colors cursor-pointer py-1 px-2"
              >
                Or tap once to sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          LAYER 3: PROCEDURAL BURNING-PAPER FIRE-RING & FLYING ASH OVERLAY CANVAS
          ======================================================================== */}
      <canvas
        ref={burnCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-30"
      />
    </div>
  );
};
