import { useEffect, useRef, useState } from 'react';
import { gsap, confettiBurst, screenShake, reducedMotion, isMobile } from './core';
import { Window3D } from './Window3D';
import { useLanguage } from '../context/LanguageContext';
import { fxText } from './fxText';

/* Success celebration ("victory scene"): after a form is sent, a finished
 * window frame drops from the sky, slams into place with a shockwave and
 * screen shake, the glass catches the light and gold confetti erupts. */

export function VictoryLayer() {
  const { lang } = useLanguage();
  const [active, setActive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const on = () => setActive(true);
    window.addEventListener('bb:celebrate', on);
    return () => window.removeEventListener('bb:celebrate', on);
  }, []);

  useEffect(() => {
    if (!active || !root.current) return;
    const el = root.current;
    const q = gsap.utils.selector(el);
    const W = window.innerWidth, H = window.innerHeight;

    if (reducedMotion()) {
      const id = window.setTimeout(() => setActive(false), 1800);
      return () => window.clearTimeout(id);
    }

    const tl = gsap.timeline({ onComplete: () => setActive(false) });
    tlRef.current = tl;
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .fromTo(q('.v-window'),
        { y: -H, rotateX: 70, rotateZ: -12, scale: 0.7 },
        { y: 0, rotateX: 8, rotateZ: 0, scale: 1, duration: 0.7, ease: 'power4.in' })
      .add(() => {
        screenShake(18, 0.55, el.querySelector('.v-stage')!);
        screenShake(10, 0.45);
        confettiBurst(W * 0.15, H * 0.9, { angle: -Math.PI / 3, spread: 0.9, power: 22, count: 110 });
        confettiBurst(W * 0.85, H * 0.9, { angle: (-2 * Math.PI) / 3, spread: 0.9, power: 22, count: 110 });
        confettiBurst(W / 2, H * 0.5, { count: 90, power: 12 });
      })
      .fromTo(q('.v-wave'), { scale: 0.2, opacity: 0.9 }, { scale: 4.5, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, '<')
      .fromTo(q('.v-flash'), { opacity: 0.7 }, { opacity: 0, duration: 0.6 }, '<')
      .to(q('.v-window'), { rotateX: 0, rotateY: 18, duration: 1.2, ease: 'elastic.out(1, 0.4)' }, '<')
      .fromTo(q('.bb-glass-shine'), { xPercent: -120 }, { xPercent: 220, duration: 0.9, ease: 'power2.inOut' }, '-=0.9')
      .fromTo(q('.v-title'), { y: 40, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=1')
      .to(q('.v-window'), { rotateY: -14, duration: 1.4, ease: 'sine.inOut' })
      .to(el, { opacity: 0, duration: 0.45 }, '+=0.2');

    return () => { tl.kill(); };
  }, [active]);

  if (!active) return null;
  const size = isMobile() ? 0.62 : 1;
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={() => tlRef.current?.progress(1)}
      role="status"
      aria-live="polite"
    >
      <div className="v-flash absolute inset-0 bg-amber-200 pointer-events-none" style={{ opacity: 0 }} />
      <div className="v-stage relative flex flex-col items-center" style={{ perspective: 1100 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="v-wave absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-56 h-24 rounded-[50%] border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,.6)]" />
        ))}
        <div className="v-window" style={{ transformStyle: 'preserve-3d', transform: `scale(${size})` }}>
          <Window3D
            width={220}
            height={290}
            profile={18}
            depth={56}
            showMeasure={false}
            className="[--bb-glass:1] [--bb-solid:1]"
            view={<img src="/foto/Schuifpuien.jpeg" alt="" className="w-full h-full object-cover opacity-80" />}
          />
        </div>
        <div className="v-title mt-16 text-center px-6">
          <div className="text-4xl md:text-6xl font-black bb-text-gold tracking-tight">{fxText[lang].installed}</div>
        </div>
      </div>
    </div>
  );
}
