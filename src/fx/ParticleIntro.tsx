import { useEffect, useRef, useState } from 'react';
import { gsap, lockScroll, reducedMotion, isMobile, introState, finishIntro } from './core';
import { useLanguage } from '../context/LanguageContext';
import { fxText } from './fxText';

/* Particle logo intro – thousands of gold particles fly in from a storm
 * and assemble into the Betrouw Bouw logo, hold, then burst outward to
 * reveal the site. Shown once per browser session. */

const SESSION_KEY = 'bb-intro-seen';

type P = { x: number; y: number; sx: number; sy: number; tx: number; ty: number; ex: number; ey: number; c: string; d: number; s: number };

export function ParticleIntro() {
  const { lang } = useLanguage();
  const [show, setShow] = useState(() => {
    let s = false;
    try {
      s = !sessionStorage.getItem(SESSION_KEY) && !reducedMotion();
    } catch {
      s = false;
    }
    introState.pending = s;
    return s;
  });
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    lockScroll(true);
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      lockScroll(false);
      setShow(false);
      finishIntro();
    };

    const img = new Image();
    img.src = '/foto/logo-sm.png';
    img.onerror = end;
    img.onload = () => {
      // Fit logo into ~60% of the short side
      const targetH = Math.min(H * 0.55, W * 0.62, 460);
      const scale = targetH / img.height;
      const lw = img.width * scale, lh = img.height * scale;
      const off = document.createElement('canvas');
      off.width = Math.round(lw); off.height = Math.round(lh);
      const octx = off.getContext('2d')!;
      octx.drawImage(img, 0, 0, off.width, off.height);
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const gap = isMobile() ? 4 : 3;
      const ox = (W - lw) / 2, oy = (H - lh) / 2;
      const ps: P[] = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          const i = (y * off.width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r + g + b < 160) continue; // skip the black background
          const a = Math.random() * Math.PI * 2;
          const rad = Math.max(W, H) * (0.6 + Math.random() * 0.5);
          const ea = Math.atan2(oy + y - H / 2, ox + x - W / 2) + (Math.random() - 0.5) * 0.6;
          const er = Math.max(W, H) * (0.7 + Math.random() * 0.6);
          ps.push({
            x: 0, y: 0,
            sx: W / 2 + Math.cos(a) * rad, sy: H / 2 + Math.sin(a) * rad,
            tx: ox + x, ty: oy + y,
            ex: W / 2 + Math.cos(ea) * er, ey: H / 2 + Math.sin(ea) * er,
            c: `rgb(${r},${g},${b})`,
            d: Math.random() * 0.35,
            s: gap * 0.62,
          });
        }
      }

      const state = { gather: 0, burst: 0, glow: 0 };
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeIn = (t: number) => t * t * t;

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of ps) {
          const g = ease(Math.min(1, Math.max(0, (state.gather - p.d) / (1 - p.d))));
          const swirl = (1 - g) * 0.9;
          const cx = p.sx + (p.tx - p.sx) * g;
          const cy = p.sy + (p.ty - p.sy) * g;
          const ang = swirl * 2.2;
          const dx = cx - W / 2, dy = cy - H / 2;
          let x = W / 2 + dx * Math.cos(ang) - dy * Math.sin(ang);
          let y = H / 2 + dx * Math.sin(ang) + dy * Math.cos(ang);
          const b = easeIn(state.burst);
          x += (p.ex - x) * b;
          y += (p.ey - y) * b;
          ctx.globalAlpha = 1 - b * 0.9;
          ctx.fillStyle = p.c;
          ctx.fillRect(x, y, p.s, p.s);
        }
        if (state.glow > 0) {
          const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.45);
          grd.addColorStop(0, `rgba(245,158,11,${0.22 * state.glow})`);
          grd.addColorStop(1, 'rgba(245,158,11,0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, W, H);
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);

      const tl = gsap.timeline({ onComplete: end });
      tl.to(state, { gather: 1, duration: 2.0, ease: 'none' })
        .to(state, { glow: 1, duration: 0.35, ease: 'power2.out' }, '-=0.25')
        .to(state, { glow: 0, duration: 0.6 }, '+=0.3')
        .to(state, { burst: 1, duration: 0.9, ease: 'power2.in' }, '<')
        .to(wrap.current, { opacity: 0, duration: 0.55, ease: 'power2.out' }, '-=0.45');
      finish.current = () => tl.progress(1);
    };

    return () => {
      cancelAnimationFrame(raf);
      lockScroll(false);
    };
  }, [show]);

  if (!show) return null;
  return (
    <div ref={wrap} className="fixed inset-0 z-[300] bg-black" onClick={() => finish.current()} role="presentation">
      <canvas ref={canvas} className="absolute inset-0 w-full h-full" />
      <button
        onClick={(e) => { e.stopPropagation(); finish.current(); }}
        className="absolute bottom-8 right-8 text-xs uppercase tracking-[0.3em] text-zinc-500 hover:text-amber-400 transition-colors"
      >
        {fxText[lang].skip}
      </button>
    </div>
  );
}
