import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';

const MontageStudio = lazy(() => import('../fx/MontageStudio').then((m) => ({ default: m.MontageStudio })));
import { ArrowRight, Construction, CheckCircle2, Star, Quote, ChevronLeft, ChevronRight, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fxText } from '../fx/fxText';
import { gsap, scrollState, reducedMotion, isTouch, isMobile, flyTo, follow } from '../fx/core';
import { useTransitionNavigate } from '../fx/Engine';
import { Spotlights, Dust } from '../fx/Backdrop';
import { Window3D } from '../fx/Window3D';
import { studioText } from '../fx/studioText';
import {
  SplitText, Reveal, Magnetic, TiltCard, CountUp, VelocityMarquee, Parallax, Float, useIntroReady, WindowGlyph,
} from '../fx/components';

type Service = { title: string; desc: string; image: string; video?: string; features: string[] };

/* ═════════════════════════════  HERO  ═════════════════════════════
 * Smoke + volumetric spotlights + dust, kinetic headline, magnetic CTAs,
 * and a CSS-3D kozijn levitating at the centre of an orbit of services
 * (3D orbit carousel). The scene tilts after the cursor (mouse parallax). */

const OrbitScene = ({ images }: { images: string[] }) => {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let a = 0;
    let raf = 0;
    const loop = () => {
      a += 0.18 + Math.min(3, Math.abs(scrollState.velocity) * 0.08);
      if (ring.current) ring.current.style.transform = `rotateX(-10deg) rotateY(${a}deg)`;
      raf = requestAnimationFrame(loop);
    };
    if (!reducedMotion()) raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const R = 330;
  return (
    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
      <Float amp={16} duration={3.6}>
        <div style={{ transformStyle: 'preserve-3d' }}>
          <Window3D
            width={280}
            height={380}
            profile={22}
            depth={74}
            className="[--bb-measure:0]"
            view={<img src="/foto/Schuifpuien4.jpeg" alt="" className="w-full h-full object-cover opacity-80 scale-110" />}
          />
        </div>
      </Float>
      {/* floor shadow */}
      <div className="absolute left-1/2 -bottom-24 -translate-x-1/2 w-72 h-10 rounded-[50%] bg-amber-500/25 blur-2xl" style={{ transform: 'rotateX(80deg)' }} />
      <div
        ref={ring}
        className="absolute left-1/2 top-1/2 w-0 h-0"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-10deg)' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute -left-[62px] -top-[44px] w-[124px] h-[88px] rounded-xl overflow-hidden border border-amber-500/50 shadow-[0_10px_40px_rgba(245,158,11,.25)]"
            style={{ transform: `rotateY(${(i * 360) / images.length}deg) translateZ(${R}px) translateY(${(i % 2 ? 1 : -1) * 70}px)` }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
};

const Hero = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  const ready = useIntroReady();
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const sceneWrap = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const services = t.services.items as Service[];

  // mouse parallax – the whole scene leans toward the cursor
  useEffect(() => {
    const el = scene.current;
    const sec = section.current;
    if (!el || !sec || isTouch() || reducedMotion()) return;
    const rx = follow(el, 'rotateX', { duration: 1.2, ease: 'power3.out' });
    const ry = follow(el, 'rotateY', { duration: 1.2, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      ry(px * 34);
      rx(-py * 20);
    };
    sec.addEventListener('pointermove', onMove);
    return () => sec.removeEventListener('pointermove', onMove);
  }, []);

  // scroll-linked exit: scene sinks & spins away, copy drifts up
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to(sceneWrap.current, { yPercent: 35, scale: 0.75, rotateZ: -6, opacity: 0.2, ease: 'none', scrollTrigger: st });
      gsap.to(copy.current, { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
    });
    return () => ctx.revert();
  }, []);

  // entrance for non-split elements
  useLayoutEffect(() => {
    if (!ready || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-fade', { y: 40, opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.5, clearProps: 'filter' });
      gsap.from(sceneWrap.current, { scale: 0.4, rotateY: -120, opacity: 0, duration: 2, ease: 'expo.out', delay: 0.2 });
    }, section);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={section} className="relative min-h-[100svh] flex items-center pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/foto/foto-01.jpeg"
          alt=""
          className="w-full h-full object-cover opacity-[0.12] mix-blend-luminosity scale-110"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>
      <Spotlights className="z-[1]" />
      <Dust className="z-[2]" count={110} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        <div ref={copy} className="relative">
          <div className="hero-fade inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur">
            <Construction className="w-3 h-3" />
            <span>{t.heroBadge}</span>
          </div>

          {ready ? (
            <SplitText
              key={`${lang}-title`}
              as="h1"
              text={t.hero.title}
              trigger="load"
              className="font-display text-[13vw] sm:text-7xl xl:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-6"
            />
          ) : (
            <h1 className="font-display text-[13vw] sm:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight mb-6 opacity-0">{t.hero.title}</h1>
          )}
          {ready && (
            <SplitText
              key={`${lang}-sub`}
              as="p"
              mode="words"
              text={t.hero.subtitle}
              trigger="load"
              delay={0.45}
              className="text-2xl md:text-4xl font-semibold leading-tight mb-6"
              charClassName="bb-text-gold"
            />
          )}

          <p className="hero-fade text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl">{t.hero.description}</p>

          <div className="hero-fade flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Magnetic>
              <Link
                to="/contact"
                className="group relative overflow-hidden px-8 py-4 bg-amber-500 text-black font-bold rounded-full flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/30"
              >
                <span className="absolute inset-0 bg-amber-300 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative">{t.hero.cta1}</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.3}>
              <Link
                to="/about"
                className="px-8 py-4 bg-zinc-900/60 backdrop-blur hover:bg-zinc-800 text-white font-bold rounded-full border border-zinc-700 hover:border-amber-500/60 transition-all flex items-center justify-center"
              >
                {t.hero.cta2}
              </Link>
            </Magnetic>
          </div>
        </div>

        <div ref={sceneWrap} className="relative h-[420px] sm:h-[520px] lg:h-[620px] flex items-center justify-center" style={{ perspective: 1400 }}>
          <div className="scale-[0.62] sm:scale-[0.8] lg:scale-100">
            <div ref={scene} style={{ transformStyle: 'preserve-3d' }}>
              <OrbitScene images={services.map((s) => s.image)} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-zinc-500">
        <span className="text-[10px] uppercase tracking-[0.4em]">{fx.scroll}</span>
        <div className="relative w-px h-14 bg-zinc-800 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-amber-500 animate-[bb-scrollcue_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
      <style>{`@keyframes bb-scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(220%)}}`}</style>
    </section>
  );
};

/* ═════════════════════════════  MARQUEE  ═════════════════════════════ */

const ServicesMarquee = () => {
  const { t } = useLanguage();
  const titles = (t.services.items as Service[]).map((s) => s.title.split(' en ')[0]);
  return (
    <section className="relative py-10 md:py-14 border-y border-zinc-900 bg-black/60 backdrop-blur-sm -rotate-[1.5deg] scale-[1.03] my-6">
      <VelocityMarquee items={titles} itemClassName="font-display text-5xl md:text-7xl font-bold text-white uppercase tracking-tight" />
      <VelocityMarquee items={titles} reverse baseSpeed={0.9} className="mt-4" itemClassName="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight bb-text-outline" />
    </section>
  );
};

/* ═════════════════════════════  STATS (count-up)  ═════════════════════════════ */

const Stats = () => {
  const { lang } = useLanguage();
  const fx = fxText[lang];
  const stats = [
    { to: 500, suffix: '+', label: fx.statProjects },
    { to: 18, suffix: '+', label: fx.statYears },
    { to: 100, suffix: '%', label: fx.statClients },
    { to: 10, suffix: '', label: fx.statGuarantee },
  ];
  return (
    <section className="relative py-24">
      <Reveal stagger={0.1} className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <TiltCard key={i} className="bb-glass-card rounded-3xl p-6 md:p-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="font-display text-4xl sm:text-5xl md:text-7xl font-bold bb-text-gold leading-none" style={{ transform: 'translateZ(40px)' }}>
              <CountUp to={s.to} suffix={s.suffix} />
            </div>
            <div className="mt-4 text-zinc-400 text-sm md:text-base font-medium" style={{ transform: 'translateZ(20px)' }}>{s.label}</div>
          </TiltCard>
        ))}
      </Reveal>
    </section>
  );
};

/* ═════════════════════════════  3D MONTAGE STUDIO (Three.js)  ═════════════════════════════ */

const Studio = () => {
  const { lang } = useLanguage();
  const tx = studioText[lang];
  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {tx.kicker}
            </span>
          </Reveal>
          <SplitText key={`${lang}-studio`} as="h2" mode="words" text={tx.title} className="font-display text-4xl md:text-6xl font-bold text-white mb-6" />
          <Reveal><p className="text-zinc-400 text-lg leading-relaxed">{tx.intro}</p></Reveal>
        </div>
        <Reveal variant="zoom">
          <Suspense fallback={<div className="aspect-[4/5] md:aspect-video rounded-[28px] border border-zinc-800 bg-zinc-900 overflow-hidden"><img src="/foto/Deuren%20Montage.jpeg" alt="" className="w-full h-full object-cover opacity-60" /></div>}>
            <MontageStudio />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
};

/* ═════════════════════════════  CAMERA ZOOM THROUGH THE WINDOW  ═════════════════════════════
 * Pinned section: the camera dollies through a window opening into a
 * finished project while the photo counter-zooms (dolly-zoom feel). */

const ZoomThrough = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  const section = useRef<HTMLElement>(null);
  const hole = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const outro = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section.current, start: 'top top', end: '+=170%', scrub: 1, pin: true, anticipatePin: 1 },
      });
      tl.fromTo(hole.current, { scale: 1 }, { scale: 10, ease: 'power2.in', duration: 1 }, 0)
        .fromTo(img.current, { scale: 1.8 }, { scale: 1, ease: 'power1.out', duration: 1 }, 0)
        .fromTo('.zoom-mullion', { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.45)
        .fromTo(intro.current, { opacity: 1, y: 0 }, { opacity: 0, y: -120, duration: 0.35 }, 0)
        .fromTo(outro.current, { opacity: 0, y: 80, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.35 }, 0.7);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden">
      <img ref={img} src="/foto/aalsmeer-06.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover will-change-transform" loading="lazy" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={hole}
          className="relative w-[70vw] h-[46vh] md:w-[30vw] md:h-[52vh] will-change-transform"
          style={{
            boxShadow: '0 0 0 220vmax rgba(5,5,5,0.97), inset 0 0 0 14px #27272a, inset 0 0 0 16px rgba(245,158,11,.55), inset 0 0 60px rgba(0,0,0,.6)',
          }}
        >
          <div className="zoom-mullion absolute left-1/2 top-0 bottom-0 w-[10px] -translate-x-1/2 bg-zinc-800 border-x border-amber-500/40" />
          <div className="zoom-mullion absolute top-[36%] left-0 right-0 h-[10px] bg-zinc-800 border-y border-amber-500/40" />
          <div className="zoom-mullion absolute left-[54%] top-[55%] w-[6px] h-9 rounded bg-gradient-to-b from-amber-200 to-amber-600" />
        </div>
      </div>
      <div ref={intro} className="absolute inset-x-0 top-[9%] md:top-[12%] text-center px-6 pointer-events-none">
        <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-3">Betrouw Bouw</p>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-white">{fx.zoomTitle}</h2>
      </div>
      <div ref={outro} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <p className="relative text-amber-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">{fx.zoomSub}</p>
        <h3 className="relative font-display text-4xl md:text-7xl font-bold text-white max-w-4xl leading-[1.05]">{t.hero.subtitle}</h3>
      </div>
    </section>
  );
};

/* ═════════════════════════════  SCROLLYTELLING – PROCESS  ═════════════════════════════
 * Pinned scene: the kozijn rotates as you scroll and evolves with each
 * step – wireframe (quote) → measuring (advice) → mounted with glass
 * (installation) → light sweep (delivery). Copy swaps per step. */

const ProcessStory = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  const steps = t.process.steps as { title: string; desc: string }[];
  const section = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = win.current;
    if (!el) return;
    if (reducedMotion()) {
      el.style.setProperty('--bb-solid', '1');
      el.style.setProperty('--bb-glass', '1');
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(el, { '--bb-solid': 0, '--bb-glass': 0, '--bb-measure': 0, rotateY: -40, rotateX: 8 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: `+=${steps.length * 90}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999))),
        },
      });
      tl.to(el, { rotateY: 395, duration: 4 }, 0)
        .to(el, { '--bb-measure': 1, duration: 0.5 }, 0.8)
        .to(el, { '--bb-measure': 0, duration: 0.4 }, 1.9)
        .to(el, { '--bb-solid': 1, duration: 0.7 }, 2)
        .to(el, { '--bb-glass': 1, duration: 0.6 }, 2.3)
        .to('.story-glow', { opacity: 1, scale: 1.2, duration: 0.8 }, 3)
        .to('.story-bar', { scaleY: 1, duration: 4 }, 0);
    }, section);
    return () => ctx.revert();
  }, [steps.length]);

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
        <div className="relative h-[46svh] lg:h-[70vh] flex items-center justify-center" style={{ perspective: 1200 }}>
          <div className="story-glow absolute w-80 h-80 rounded-full bg-amber-500/25 blur-[90px] opacity-0" />
          <div className="scale-[0.55] sm:scale-75 lg:scale-100">
            <div ref={win} style={{ transformStyle: 'preserve-3d' }}>
              <Window3D width={300} height={400} profile={24} depth={80} />
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">{fx.storyKicker}</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-8 lg:mb-12">{t.process.title}</h2>
          <div className="flex gap-6">
            <div className="relative w-px bg-zinc-800 shrink-0">
              <div className="story-bar absolute inset-0 bg-amber-500 origin-top" style={{ transform: 'scaleY(0)' }} />
            </div>
            <div className="relative flex-1 min-h-[180px] md:min-h-[220px]">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-all duration-700 ease-out"
                  style={{
                    opacity: active === i ? 1 : 0,
                    transform: `translateY(${(i - active) * 40}px) rotateX(${(active - i) * 25}deg)`,
                    filter: active === i ? 'none' : 'blur(8px)',
                  }}
                  aria-hidden={active !== i}
                >
                  <div className="font-display text-7xl md:text-8xl font-bold bb-text-outline leading-none mb-4">0{i + 1}</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-zinc-400 text-lg max-w-md">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-8 lg:mt-10">
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-10 bg-amber-500' : 'w-4 bg-zinc-700'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════  3D COVERFLOW – SERVICES  ═════════════════════════════
 * Rotating carousel with "selector chips" (like a colour picker) and a
 * fly-to-quote animation: the photo flies into the Contact link. */

const ServiceCarousel = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  const items = t.services.items as Service[];
  const n = items.length;
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const go = useTransitionNavigate();
  const mobile = isMobile();
  const step = mobile ? 150 : 250;

  const move = (d: number) => setActive((a) => (a + d + n) % n);
  const s = items[active];

  const requestQuote = async () => {
    const img = imgRefs.current[active];
    if (img) await flyTo(img);
    go('/contact', { state: { serviceMessage: t.contact.serviceMessageTemplate?.replace('{service}', s.title) || s.title } });
  };

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">{fx.carouselKicker}</p>
          <SplitText key={`${lang}-svc`} as="h2" text={t.services.title} className="font-display text-4xl md:text-6xl font-bold text-white" />
        </div>

        <div
          className="relative h-[340px] md:h-[440px] select-none touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ perspective: 1400 }}
          onPointerDown={(e) => { drag.current = { x: e.clientX, id: e.pointerId }; }}
          onPointerUp={(e) => {
            if (!drag.current) return;
            const dx = e.clientX - drag.current.x;
            drag.current = null;
            if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
          }}
          onPointerLeave={() => { drag.current = null; }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {items.map((it, i) => {
              let off = i - active;
              if (off > n / 2) off -= n;
              if (off < -n / 2) off += n;
              const abs = Math.abs(off);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => (off === 0 ? undefined : setActive(i))}
                  aria-label={it.title}
                  className="absolute w-[220px] h-[290px] md:w-[300px] md:h-[390px] rounded-3xl overflow-hidden border border-zinc-800 transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    transform: `translateX(${off * step}px) translateZ(${-abs * 190}px) rotateY(${-off * 40}deg)`,
                    zIndex: 20 - abs,
                    opacity: abs > 2 ? 0 : 1 - abs * 0.18,
                    pointerEvents: abs > 2 ? 'none' : 'auto',
                    boxShadow: off === 0 ? '0 40px 120px -20px rgba(245,158,11,.45)' : 'none',
                    borderColor: off === 0 ? 'rgba(245,158,11,.6)' : undefined,
                  }}
                >
                  <img ref={(el) => { imgRefs.current[i] = el; }} src={it.image} alt="" className="w-full h-full object-cover" draggable={false} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                    <div className="text-amber-500 font-mono text-xs mb-1">{String(i + 1).padStart(2, '0')}</div>
                    <div className="text-white font-bold text-lg leading-tight">{it.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => move(-1)} aria-label="Previous" className="absolute left-0 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bb-glass-card flex items-center justify-center hover:border-amber-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => move(1)} aria-label="Next" className="absolute right-0 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bb-glass-card flex items-center justify-center hover:border-amber-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-zinc-600 text-xs uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2">
          <MousePointer2 className="w-3.5 h-3.5" /> {fx.drag}
        </p>

        {/* selector chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-4xl mx-auto">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${i === active ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/30 scale-105' : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-amber-500/50 hover:text-white'}`}
            >
              {it.title.split(' en ')[0]}
            </button>
          ))}
        </div>

        {/* detail panel */}
        <div key={active} className="mt-12 max-w-3xl mx-auto text-center animate-[bb-panel_.7s_cubic-bezier(.16,1,.3,1)]">
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">{s.desc}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
            {s.features.map((f, i) => (
              <span key={i} className="flex items-center gap-2 text-zinc-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-500" /> {f}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Magnetic>
              <button onClick={requestQuote} className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full inline-flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-colors">
                {t.cta.button} <ArrowRight className="w-5 h-5" />
              </button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button
                onClick={() => go('/projects', { state: { openProject: s.title } })}
                className="px-8 py-4 rounded-full border border-zinc-700 hover:border-amber-500 text-white font-bold inline-flex items-center gap-2 transition-colors"
              >
                {t.projectDetails.view} <ArrowUpRight className="w-5 h-5" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
      <style>{`@keyframes bb-panel{from{opacity:0;transform:translateY(24px);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}`}</style>
    </section>
  );
};

/* ═════════════════════════════  PARALLAX GALLERY  ═════════════════════════════ */

const ParallaxGallery = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  const imgs = (t.projectDetails.items as { mainImage: string; title: string }[]).map((p) => p);
  const cols = [imgs.filter((_, i) => i % 3 === 0), imgs.filter((_, i) => i % 3 === 1), imgs.filter((_, i) => i % 3 === 2)];
  const speeds = [-0.12, 0.14, -0.2];
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">{fx.galleryKicker}</p>
            <SplitText key={`${lang}-gal`} as="h2" text={t.nav.projects} className="font-display text-5xl md:text-7xl font-bold text-white" />
            <p className="text-zinc-500 text-lg mt-4 max-w-lg">{t.projectsSubtitle}</p>
          </div>
          <Magnetic>
            <Link to="/projects" className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-zinc-700 hover:border-amber-500 hover:text-amber-400 font-bold transition-colors">
              {fx.allProjects} <ArrowUpRight className="w-5 h-5" />
            </Link>
          </Magnetic>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 h-[110vh] md:h-[140vh] overflow-hidden">
          {cols.map((col, ci) => (
            <div key={ci} className={`relative ${ci === 2 ? 'hidden md:block' : ''}`}>
              <Parallax speed={speeds[ci]}>
                <div className="flex flex-col gap-4 md:gap-6">
                  {col.map((p, i) => (
                    <Link to="/projects" key={i} className="group relative block rounded-3xl overflow-hidden aspect-[3/4]">
                      <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 right-4 text-white font-bold leading-tight translate-y-2 group-hover:translate-y-0 transition-transform">{p.title}</div>
                    </Link>
                  ))}
                </div>
              </Parallax>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════  WHY US  ═════════════════════════════ */

const WhyUs = () => {
  const { t, lang } = useLanguage();
  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bb-glass-card rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 opacity-10">
            <WindowGlyph className="w-80 h-80 text-amber-500" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <SplitText key={`${lang}-why`} as="h2" mode="words" text={t.whyUs.title} className="font-display text-4xl md:text-5xl font-bold text-white mb-10" />
              <Reveal stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {t.whyUs.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:rotate-12 transition-all duration-500">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-zinc-300 font-medium">{item}</span>
                  </div>
                ))}
              </Reveal>
            </div>
            <Reveal variant="right">
              <TiltCard max={8} className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-amber-500/10">
                <video
                  src="/wideo/WhatsApp%20Video%202026-03-15%20at%209.17.54%20PM.mp4"
                  className="w-full h-full object-cover"
                  controls
                  loop
                  playsInline
                  preload="metadata"
                />
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════  TESTIMONIALS  ═════════════════════════════ */

const Testimonials = () => {
  const { t, lang } = useLanguage();
  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <SplitText key={`${lang}-test`} as="h2" mode="words" text={t.testimonials.title} className="font-display text-4xl md:text-6xl font-bold text-white mb-6" />
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />)}
          </div>
        </div>
        <Reveal stagger={0.15} variant="flip" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item: { text: string; name: string }, index: number) => (
            <TiltCard key={index} className="p-10 rounded-[2rem] bb-glass-card">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-amber-500/15" />
              <div className="flex gap-1 mb-6" style={{ transform: 'translateZ(30px)' }}>
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
              </div>
              <p className="text-zinc-200 text-lg italic leading-relaxed mb-8" style={{ transform: 'translateZ(40px)' }}>&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center space-x-4" style={{ transform: 'translateZ(25px)' }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-bold">{item.name.charAt(0)}</div>
                <div>
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{t.verifiedClient}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

/* ═════════════════════════════  CTA  ═════════════════════════════ */

const CTA = () => {
  const { t, lang } = useLanguage();
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-500 to-amber-700" />
      <div className="absolute inset-0 opacity-20">
        <VelocityMarquee items={[t.cta.title]} baseSpeed={0.6} className="absolute top-6" itemClassName="font-display text-8xl font-bold text-black/40 uppercase" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <SplitText key={`${lang}-cta`} as="h2" mode="words" text={t.cta.title} className="font-display text-4xl md:text-7xl font-bold text-black mb-6 leading-[1.02]" />
        <p className="text-black/75 text-xl mb-12 font-medium">{t.cta.subtitle}</p>
        <Magnetic strength={0.5}>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-black text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-black/50 transition-shadow"
          >
            {t.cta.button}
            <span className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center group-hover:rotate-[-45deg] transition-transform duration-500">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
};

const Home = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.home);
  return (
    <>
      <Hero />
      <ServicesMarquee />
      <Stats />
      <Studio />
      <ZoomThrough />
      <ProcessStory />
      <ServiceCarousel />
      <ParallaxGallery />
      <WhyUs />
      <Testimonials />
      <CTA />
    </>
  );
};

export default Home;
