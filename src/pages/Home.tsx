import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';

const MontageStudio = lazy(() => import('../fx/MontageStudio').then((m) => ({ default: m.MontageStudio })));
import { ArrowRight, CheckCircle2, Star, Quote, ChevronLeft, ChevronRight, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fxText } from '../fx/fxText';
import { gsap, reducedMotion, isMobile, flyTo } from '../fx/core';
import { useTransitionNavigate } from '../fx/Engine';
import { ScrollSequence } from '../fx/ScrollSequence';
import { studioText } from '../fx/studioText';
import {
  SplitText, Reveal, Magnetic, CountUp, VelocityMarquee, Parallax,
} from '../fx/components';

type Service = { title: string; desc: string; image: string; video?: string; features: string[] };

/* ═════════════════════════════  MARQUEE  ═════════════════════════════ */

const ServicesMarquee = () => {
  const { t } = useLanguage();
  const titles = (t.services.items as Service[]).map((s) => s.title.split(' en ')[0]);
  return (
    <section className="relative py-10 md:py-12 border-y border-white/10">
      <VelocityMarquee items={titles} baseSpeed={0.5} itemClassName="font-display italic text-4xl md:text-6xl text-white/80" />
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
    <section className="relative py-20 md:py-28">
      <Reveal stagger={0.1} className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 border-y border-white/10">
        {stats.map((s, i) => (
          <div key={i} className={`py-10 md:py-14 px-4 md:px-8 ${i % 2 ? 'border-l border-white/10' : ''} ${i === 2 ? 'lg:border-l border-t lg:border-t-0 border-white/10' : ''} ${i === 3 ? 'border-t lg:border-t-0' : ''}`}>
            <div className="font-display text-6xl md:text-8xl bb-text-gold leading-none">
              <CountUp to={s.to} suffix={s.suffix} />
            </div>
            <div className="mt-5 text-white/55 text-[11px] md:text-xs uppercase tracking-[0.3em]">{s.label}</div>
          </div>
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
      <img ref={img} src="/foto/ai/uitzicht-polder.webp" alt="" className="absolute inset-0 w-full h-full object-cover will-change-transform" loading="lazy" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={hole}
          className="relative w-[70vw] h-[46vh] md:w-[30vw] md:h-[52vh] will-change-transform"
          style={{
            boxShadow: '0 0 0 220vmax rgba(5,5,5,0.97), inset 0 0 0 14px #27272a, inset 0 0 0 16px rgba(191, 159, 110,.55), inset 0 0 60px rgba(0,0,0,.6)',
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
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ setProgress: (p: number) => void; jump: (p: number) => void; dispose: () => void } | null>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [ready3d, setReady3d] = useState(false);

  // Load the Three.js scene lazily (keeps three out of the main bundle).
  useLayoutEffect(() => {
    let cancelled = false;
    import('../fx/processKozijn').then(({ createProcessScene }) => {
      if (cancelled || !host.current) return;
      const sc = createProcessScene(host.current);
      if (!sc) return;
      sceneRef.current = sc;
      sc.jump(reducedMotion() ? 1 : progressRef.current);
      setReady3d(true);
    });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: `+=${steps.length * 90}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            sceneRef.current?.setProgress(self.progress);
            setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
          },
        },
      }).to('.story-bar', { scaleY: 1, duration: 1 }, 0);
    }, section);
    return () => ctx.revert();
  }, [steps.length]);

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-center">
        <div className="relative h-[46svh] lg:h-[78vh]">
          <div className="absolute inset-[15%] rounded-full bg-amber-300/10 blur-[90px]" aria-hidden="true" />
          <div
            ref={host}
            className={`absolute inset-0 transition-opacity duration-1000 ${ready3d ? 'opacity-100' : 'opacity-0'}`}
            style={{ maskImage: 'radial-gradient(ellipse 56% 54% at 50% 50%, #000 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 56% 54% at 50% 50%, #000 50%, transparent 100%)' }}
            aria-hidden="true"
          />
          <div className={`absolute left-1/2 -translate-x-1/2 bottom-[4%] font-mono text-[10px] tracking-[0.35em] text-amber-200/70 transition-opacity duration-700 ${active === 0 ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
            1200 × 1500 MM
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
                    boxShadow: off === 0 ? '0 40px 120px -20px rgba(191, 159, 110,.45)' : 'none',
                    borderColor: off === 0 ? 'rgba(191, 159, 110,.6)' : undefined,
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
                onClick={() => go('/projects', { state: { openProject: s.title, serviceIndex: active } })}
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
    <section className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">
        <div>
          <p className="flex items-center gap-4 text-amber-300/90 text-[11px] font-medium uppercase tracking-[0.45em] mb-6">
            <span className="h-px w-10 bg-amber-400/60" />
            Betrouw Bouw
          </p>
          <SplitText key={`${lang}-why`} as="h2" mode="words" text={t.whyUs.title} className="font-display text-5xl md:text-7xl text-white leading-[1] mb-12" />
          <Reveal stagger={0.07} className="border-t border-white/10">
            {t.whyUs.items.map((item: string, index: number) => (
              <div key={index} className="group flex items-baseline gap-6 py-5 border-b border-white/10">
                <span className="font-display italic text-amber-300/80 text-xl w-8 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-white/85 text-lg font-light group-hover:text-white group-hover:translate-x-1 transition-all duration-500">{item}</span>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal variant="right" className="justify-self-center lg:justify-self-end w-full max-w-[400px]">
          <figure className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-amber-300/5 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/10 aspect-[9/16] bg-black">
              <video
                src="/wideo/team-aan-het-werk.mp4"
                poster="/wideo/team-aan-het-werk.jpg"
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="none"
              />
            </div>
            <figcaption className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
              <span>Ons team</span>
              <span className="font-display italic normal-case tracking-normal text-base text-amber-200/80">op locatie</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
};

/* ═════════════════════════════  TESTIMONIALS  ═════════════════════════════ */

const Testimonials = () => {
  const { t, lang } = useLanguage();
  const partners = (t.partners?.items ?? []) as { name: string; url: string }[];
  return (
    <section className="py-28 md:py-36 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <SplitText key={`${lang}-test`} as="h2" mode="words" text={t.testimonials.title} className="font-display text-5xl md:text-7xl text-white leading-[1]" />
          <span className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-300 fill-amber-300" />)}</span>
        </div>
        <Reveal stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-[2rem] overflow-hidden">
          {t.testimonials.items.map((item: { text: string; name: string }, index: number) => (
            <figure key={index} className="relative bg-black p-10 md:p-12 flex flex-col">
              <Quote className="w-8 h-8 text-amber-300/40 mb-8" />
              <blockquote className="font-display text-2xl md:text-[1.7rem] leading-snug text-white/90 flex-1">{item.text}</blockquote>
              <figcaption className="mt-10 pt-6 border-t border-white/10 flex items-center gap-4">
                <span className="w-10 h-10 rounded-full ring-1 ring-amber-300/40 flex items-center justify-center font-display italic text-amber-200">{item.name.charAt(0)}</span>
                <span>
                  <span className="block text-white text-sm font-medium">{item.name}</span>
                  <span className="block text-white/45 text-[11px] uppercase tracking-[0.3em] mt-1">{t.verifiedClient}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
        {partners.length > 0 && (
          <div className="mt-20 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <span className="text-[11px] uppercase tracking-[0.4em] text-white/45 shrink-0">{t.partners.title}</span>
            <span className="hidden md:block h-px flex-1 bg-white/10" />
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
              {partners.map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="font-display text-3xl text-white/60 hover:text-amber-200 transition-colors">{p.name}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ═════════════════════════════  CTA  ═════════════════════════════ */

const CTA = () => {
  const { t, lang } = useLanguage();
  return (
    <section className="relative py-36 md:py-48 overflow-hidden">
      <img src="/sequence/villa/f180.webp" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <p className="flex items-center justify-center gap-4 text-amber-300/90 text-[11px] font-medium uppercase tracking-[0.45em] mb-8">
          <span className="h-px w-10 bg-amber-400/60" />
          Betrouw Bouw
          <span className="h-px w-10 bg-amber-400/60" />
        </p>
        <SplitText key={`${lang}-cta`} as="h2" mode="words" text={t.cta.title} className="font-display text-5xl md:text-8xl text-white mb-8 leading-[0.98]" />
        <p className="text-white/70 font-light text-lg md:text-xl mb-12">{t.cta.subtitle}</p>
        <Magnetic strength={0.4}>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-4 pl-10 pr-3 py-3 bg-amber-200 text-black text-base font-semibold tracking-wide rounded-full hover:bg-white transition-colors"
          >
            {t.cta.button}
            <span className="w-11 h-11 rounded-full bg-black text-amber-200 flex items-center justify-center group-hover:rotate-[-45deg] transition-transform duration-500">
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
      <ScrollSequence />
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
