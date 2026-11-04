import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIntroReady } from './components';
import type { Language } from '../translations';
import { gsap, ScrollTrigger, reducedMotion, isMobile } from './core';

/* ═════════════════════════════  IMMERSIVE SCROLL FILM  ═════════════════════════════
 * Full-screen, pinned, scroll-scrubbed image sequence (the "Apple product
 * page" technique): the crew installs the glass facade, the villa is
 * finished, then the camera flies through the window into the living room.
 * Frames are drawn onto a canvas so scrubbing is instant in both directions.
 *
 * Source: two Higgsfield clips (Seedance 1.5) joined in media-src/combined.mp4.
 * Re-export frames with:
 *   ffmpeg -i combined.mp4 -vf "fps=24,scale=1280:-2" -c:v libwebp -quality 72 public/sequence/villa/f%03d.webp
 *   ffmpeg -i combined.mp4 -vf "fps=24,scale=720:-2"  -c:v libwebp -quality 66 public/sequence/villa-m/f%03d.webp */

const FRAME_COUNT = 180;
/** Progress (0–1) where the crossfade from construction to finished house sits. */
const REVEAL_AT = 0.315;

const frameSrc = (dir: string, i: number) => `${dir}/f${String(i + 1).padStart(3, '0')}.webp`;

type Chapter = { label: string; title: string; text: string };
type Copy = { kicker: string; headline: string; title: string; sub: string; chapters: Chapter[] };

/** Chapter i is shown while progress is in [STARTS[i], STARTS[i+1]). */
const STARTS = [0, 0.36, 0.55, 0.8];

const seqText: Record<Language, Copy> = {
  NL: {
    kicker: 'Betrouw Bouw',
    headline: 'Kozijnen die uw huis afmaken.',
    title: 'Van ruwbouw tot thuis',
    sub: 'Scroll en zie het gebeuren',
    chapters: [
      { label: 'Montage', title: 'Glas op maat geplaatst', text: 'Ons team zet elk paneel millimeterprecies in het kozijn.' },
      { label: 'Gevel', title: 'De gevel is dicht', text: 'Strakke lijnen, slanke profielen, één geheel.' },
      { label: 'Licht', title: 'Licht stroomt naar binnen', text: 'Grote glasvlakken die buiten en binnen verbinden.' },
      { label: 'Thuis', title: 'Welkom thuis', text: 'Opgeleverd zoals beloofd: schoon, af en op tijd.' },
    ],
  },
  EN: {
    kicker: 'Betrouw Bouw',
    headline: 'Frames that complete your home.',
    title: 'From shell to home',
    sub: 'Scroll and watch it happen',
    chapters: [
      { label: 'Install', title: 'Glass set to measure', text: 'Our crew places every pane in its frame to the millimetre.' },
      { label: 'Facade', title: 'The facade is closed', text: 'Clean lines, slim profiles, one seamless whole.' },
      { label: 'Light', title: 'Light pours inside', text: 'Large glazing that connects outside and in.' },
      { label: 'Home', title: 'Welcome home', text: 'Delivered as promised: clean, finished and on time.' },
    ],
  },
  PL: {
    kicker: 'Betrouw Bouw',
    headline: 'Okna, które dopełniają Twój dom.',
    title: 'Od stanu surowego do domu',
    sub: 'Przewiń i zobacz',
    chapters: [
      { label: 'Montaż', title: 'Szkło osadzone na wymiar', text: 'Nasza ekipa osadza każdą taflę co do milimetra.' },
      { label: 'Elewacja', title: 'Elewacja zamknięta', text: 'Czyste linie, smukłe profile, jedna całość.' },
      { label: 'Światło', title: 'Światło wpada do środka', text: 'Wielkie przeszklenia łączą wnętrze z otoczeniem.' },
      { label: 'Dom', title: 'Witaj w domu', text: 'Oddane tak, jak obiecaliśmy: czysto, kompletnie i na czas.' },
    ],
  },
  DE: {
    kicker: 'Betrouw Bouw',
    headline: 'Fenster, die Ihr Zuhause vollenden.',
    title: 'Vom Rohbau zum Zuhause',
    sub: 'Scrollen und zusehen',
    chapters: [
      { label: 'Montage', title: 'Glas nach Maß gesetzt', text: 'Unser Team setzt jede Scheibe millimetergenau in den Rahmen.' },
      { label: 'Fassade', title: 'Die Fassade ist zu', text: 'Klare Linien, schlanke Profile, ein Ganzes.' },
      { label: 'Licht', title: 'Licht strömt hinein', text: 'Große Glasflächen verbinden innen und außen.' },
      { label: 'Zuhause', title: 'Willkommen zu Hause', text: 'Übergeben wie versprochen: sauber, fertig und pünktlich.' },
    ],
  },
  TR: {
    kicker: 'Betrouw Bouw',
    headline: 'Evinizi tamamlayan doğramalar.',
    title: 'Kaba inşaattan yuvaya',
    sub: 'Kaydırın ve izleyin',
    chapters: [
      { label: 'Montaj', title: 'Ölçüye göre cam', text: 'Ekibimiz her camı milimetrik olarak çerçeveye yerleştirir.' },
      { label: 'Cephe', title: 'Cephe tamamlandı', text: 'Net çizgiler, ince profiller, tek bir bütün.' },
      { label: 'Işık', title: 'Işık içeri doluyor', text: 'İçeriyi ve dışarıyı birleştiren geniş camlar.' },
      { label: 'Yuva', title: 'Evinize hoş geldiniz', text: 'Söz verildiği gibi: temiz, eksiksiz ve zamanında.' },
    ],
  },
};

/** -1 while the title card is still on screen. */
const chapterAt = (p: number) => {
  if (p < 0.07) return -1;
  let i = 0;
  for (let k = 0; k < STARTS.length; k++) if (p >= STARTS[k]) i = k;
  return i;
};

export const ScrollSequence = () => {
  const { lang, t } = useLanguage();
  const tx = seqText[lang];
  const ready = useIntroReady();
  const head = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useLayoutEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dir = isMobile() ? '/sequence/villa-m' : '/sequence/villa';
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let current = 0;
    let disposed = false;

    /** Nearest frame that has finished loading, so fast scrolling never shows a blank. */
    const nearestLoaded = (i: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (loaded[i - d]) return i - d;
        if (loaded[i + d]) return i + d;
      }
      return -1;
    };

    const render = () => {
      const idx = nearestLoaded(current);
      if (idx < 0) return;
      const img = images[idx];
      const w = cv.width;
      const h = cv.height;
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
      cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
      ctx.imageSmoothingQuality = 'high';
      render();
    };

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!disposed) {
            images[i] = img;
            loaded[i] = true;
            if (Math.abs(i - current) < 3) render();
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(dir, i);
      });

    // First frame immediately, then the rest in order with a few parallel workers.
    let queue = 1;
    const worker = async () => {
      while (!disposed && queue < FRAME_COUNT) await load(queue++);
    };
    load(0).then(() => {
      for (let k = 0; k < 6; k++) worker();
    });

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion()) {
      current = FRAME_COUNT - 1;
      setActive(STARTS.length - 1);
      return () => {
        disposed = true;
        window.removeEventListener('resize', resize);
      };
    }

    const gctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: `+=${isMobile() ? 350 : 450}%`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const next = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
            if (next !== current) {
              current = next;
              render();
            }
            setActive(chapterAt(p));
            if (head.current) head.current.style.pointerEvents = p > 0.05 ? 'none' : 'auto';
          },
          onRefresh: resize,
        },
      });

      tl.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        // Title card fades away as the film starts.
        .fromTo('.seq-head', { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -60, filter: 'blur(12px)', duration: 0.08 }, 0.02)
        .fromTo('.seq-hint', { opacity: 1 }, { opacity: 0, duration: 0.04 }, 0.01)
        .fromTo('.seq-dim', { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0.02)
        // Golden light burst masks the construction → finished transition.
        .fromTo(flash.current, { opacity: 0 }, { opacity: 0.85, duration: 0.035, ease: 'power2.in' }, REVEAL_AT - 0.035)
        .to(flash.current, { opacity: 0, duration: 0.06, ease: 'power2.out' }, REVEAL_AT)
        // Slow cinematic drift so even held frames feel alive.
        .fromTo(cv, { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
        // Vignette opens up once we're inside.
        .fromTo('.seq-vignette', { opacity: 1 }, { opacity: 0.55, duration: 0.2 }, 0.75);
    }, section);

    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      gctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  // Entrance of the title card (after the particle intro, if any).
  useLayoutEffect(() => {
    if (!ready || reducedMotion() || !head.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.seq-in', { y: 40, opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.2, clearProps: 'filter' });
    }, head);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden bg-black">
      <canvas ref={canvas} className="absolute inset-0 w-full h-full will-change-transform" />

      {/* Grading layers */}
      <div className="seq-vignette absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,.75)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none bg-gradient-to-b from-black/70 to-transparent" />
      <div ref={flash} className="absolute inset-0 pointer-events-none opacity-0 mix-blend-screen bg-[radial-gradient(ellipse_at_60%_55%,rgba(255,214,150,1)_0%,rgba(191, 159, 110,.6)_35%,transparent_75%)]" />

      <div className="seq-dim absolute inset-0 pointer-events-none bg-black/45" />

      {/* Title card */}
      <div ref={head} className="seq-head absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <p className="seq-in flex items-center gap-4 text-amber-300/90 text-[11px] font-medium uppercase tracking-[0.45em] mb-8">
          <span className="h-px w-10 bg-amber-400/60" />
          {tx.title}
          <span className="h-px w-10 bg-amber-400/60" />
        </p>
        <h1 className="seq-in font-display text-[15vw] sm:text-7xl md:text-8xl xl:text-[8.75rem] text-white leading-[0.92] max-w-6xl drop-shadow-[0_8px_40px_rgba(0,0,0,.55)]">{tx.headline}</h1>
        <p className="seq-in mt-7 text-base md:text-xl font-light tracking-wide text-white/80 max-w-2xl">{t.hero.subtitle}</p>
        <div className="seq-in mt-9 flex flex-col sm:flex-row gap-3 sm:gap-5">
          <Link
            to="/contact"
            className="group relative overflow-hidden px-8 py-4 bg-amber-200 text-black text-sm font-semibold tracking-wide rounded-full flex items-center justify-center gap-2"
          >
            <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative">{t.hero.cta1}</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white text-sm font-semibold tracking-wide rounded-full border border-white/20 hover:border-amber-200/60 transition-all flex items-center justify-center"
          >
            {t.hero.cta2}
          </Link>
        </div>
      </div>
      <div className="seq-hint absolute bottom-24 inset-x-0 flex flex-col items-center gap-3 text-white/70 pointer-events-none">
        <span className="text-[11px] uppercase tracking-[0.4em]">{tx.sub}</span>
        <span className="w-px h-10 bg-gradient-to-b from-amber-400 to-transparent animate-pulse" />
      </div>

      {/* Chapter copy */}
      <div className="absolute left-0 right-0 bottom-20 md:bottom-24 px-5 md:px-12 lg:px-20 pointer-events-none">
        <div className="relative h-[170px] md:h-[210px] max-w-xl">
          {tx.chapters.map((c, i) => (
            <div
              key={i}
              className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
              style={{
                opacity: active === i ? 1 : 0,
                transform: `translateY(${(i - active) * 30}px)`,
                filter: active === i ? 'none' : 'blur(10px)',
              }}
              aria-hidden={active !== i}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display italic text-amber-300 text-xl">0{i + 1}</span>
                <span className="h-px w-10 bg-amber-300/50" />
                <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/70">{c.label}</span>
              </div>
              <h3 className="font-display text-4xl md:text-6xl text-white leading-[1] mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,.6)]">{c.title}</h3>
              <p className="text-white/70 font-light text-base md:text-lg max-w-md">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stage rail (desktop) */}
      <div className={`hidden md:flex absolute right-8 lg:right-14 top-1/2 -translate-y-1/2 flex-col gap-5 pointer-events-none transition-opacity duration-700 ${active < 0 ? 'opacity-0' : 'opacity-100'}`}>
        {tx.chapters.map((c, i) => (
          <div key={i} className={`flex items-center justify-end gap-4 transition-all duration-500 ${i === active ? 'text-amber-200' : i < active ? 'text-white/60' : 'text-white/35'}`}>
            <span className="text-[11px] font-medium uppercase tracking-[0.35em] drop-shadow-[0_2px_8px_rgba(0,0,0,.8)]">{c.label}</span>
            <span className={`h-px transition-all duration-500 ${i === active ? 'w-12 bg-amber-200' : 'w-5 bg-current'}`} />
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="absolute bottom-8 left-5 right-5 md:left-12 md:right-12 lg:left-20 lg:right-14 pointer-events-none">
        <div className="h-px bg-white/15 overflow-hidden">
          <div ref={bar} className="h-full bg-gradient-to-r from-amber-500 to-amber-200 origin-left" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
};
