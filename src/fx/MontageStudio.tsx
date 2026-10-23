import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createKozijnStudio } from './kozijnStudio';
import { studioText } from './studioText';
import { reducedMotion } from './core';
import './studio.css';

/* Interactive 3D montage studio (Three.js): 10 installation steps of a
 * PVC window frame in a Dutch cavity wall, with before/after, cutaway,
 * drag-to-rotate, zoom and labelled parts. */

const PLAY = <svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" /></svg>;
const PAUSE = <svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" /></svg>;

type Api = {
  start(): void; stop(): void; play(): void; pause(): void; isPlaying(): boolean;
  go(ch: number): void; voorNa(w: 'voor' | 'na'): void; explode(on: boolean): void; isExploded(): boolean;
  zoom(f: number): void; reset(): void; destroy(): void;
};

export function MontageStudio() {
  const { lang } = useLanguage();
  const tx = studioText[lang];
  const host = useRef<HTMLDivElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  const api = useRef<Api | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [vn, setVn] = useState<'' | 'voor' | 'na'>('');
  const [hintOff, setHintOff] = useState(false);

  useEffect(() => {
    if (!host.current || !tags.current) return;
    let studio: Api | null = null;
    try {
      studio = createKozijnStudio(host.current, {
        tags: tags.current,
        reduce: reducedMotion(),
        labels: studioText[lang].labels,
        onReady: () => setReady(true),
        onChapter: (ch: number) => setChapter(ch),
        onFrame: (ch: number, within: number, t: number) => {
          const items = rail.current?.querySelectorAll<HTMLElement>('li i');
          items?.forEach((el, j) => {
            el.style.setProperty('--p', String(j < ch ? 1 : j === ch ? (t >= 10 ? 1 : within).toFixed(3) : 0));
          });
        },
        onInteract: () => setHintOff(true),
      });
    } catch {
      studio = null;
    }
    if (!studio) {
      setFailed(true);
      return;
    }
    api.current = studio;
    setPlaying(studio.isPlaying());

    // only render while on screen
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) studio!.start();
      else studio!.stop();
    }, { rootMargin: '100px 0px' });
    io.observe(host.current);
    const onVis = () => {
      if (document.hidden) studio!.stop();
      else if (visible) studio!.start();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      studio!.destroy();
      api.current = null;
      setReady(false);
    };
  }, [lang]);

  // keep the active chapter centred in the rail on small screens
  useEffect(() => {
    const r = rail.current;
    const cur = r?.children[chapter] as HTMLElement | undefined;
    if (r && cur && r.scrollWidth > r.clientWidth) {
      r.scrollTo({ left: cur.offsetLeft - r.clientWidth / 2 + cur.clientWidth / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }, [chapter]);

  const sync = () => setPlaying(!!api.current?.isPlaying());

  const togglePlay = () => {
    const s = api.current;
    if (!s) return;
    if (s.isPlaying()) s.pause();
    else {
      s.explode(false);
      setExploded(false);
      setVn('');
      s.play();
    }
    sync();
  };

  const goChapter = (i: number) => {
    api.current?.go(i);
    setExploded(false);
    setVn('');
    sync();
  };

  const voorNa = (w: 'voor' | 'na') => {
    api.current?.voorNa(w);
    setExploded(false);
    setVn(w);
    sync();
  };

  const toggleExplode = () => {
    const s = api.current;
    if (!s) return;
    const on = !s.isExploded();
    s.explode(on);
    setExploded(on);
    sync();
  };

  const [title, text] = tx.chapters[chapter];

  return (
    <figure className="bb-studio" aria-label={tx.aria}>
      <div className="st-canvas" ref={host} onPointerDown={() => setHintOff(true)} data-lenis-prevent-touch>
        {!ready && <img className="poster" src="/foto/Deuren%20Montage.jpeg" alt="" />}
        <div className="w3d-tags" ref={tags} aria-hidden="true" />
        {!failed && (
          <>
            <div className="st-tools">
              <div className="seg" role="group" aria-label={`${tx.before} / ${tx.after}`}>
                <button type="button" aria-pressed={vn === 'voor'} onClick={() => voorNa('voor')}>{tx.before}</button>
                <button type="button" aria-pressed={vn === 'na'} onClick={() => voorNa('na')}>{tx.after}</button>
              </div>
              <button type="button" className="st-btn" aria-pressed={exploded} onClick={toggleExplode}>
                <svg viewBox="0 0 24 24"><path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z" /><path d="M4 6.5l8 4.5 8-4.5M12 11v9" /></svg>
                {tx.explode}
              </button>
            </div>
            <div className="st-view">
              <button type="button" aria-label={tx.zoomIn} onClick={() => api.current?.zoom(0.85)}>+</button>
              <button type="button" aria-label={tx.zoomOut} onClick={() => api.current?.zoom(1.18)}>−</button>
              <button type="button" aria-label={tx.reset} onClick={() => api.current?.reset()}>
                <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></svg>
              </button>
            </div>
            <div className={`st-hint ${hintOff ? 'off' : ''}`}>
              <svg viewBox="0 0 24 24"><path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" /></svg>
              {tx.hint}
            </div>
          </>
        )}
      </div>

      <div className="st-info swap" key={`${lang}-${chapter}`} aria-live="polite">
        <span className="st-num">{String(chapter + 1).padStart(2, '0')} / 10</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      {!failed && (
        <div className="st-rail">
          <button type="button" className="st-play" aria-label={playing ? tx.pause : tx.play} onClick={togglePlay}>
            {playing ? PAUSE : PLAY}
          </button>
          <ol className="st-chapters" ref={rail}>
            {tx.chapters.map(([name], i) => (
              <li key={i} className={i === chapter ? 'cur' : i < chapter ? 'done' : ''}>
                <button type="button" onClick={() => goChapter(i)}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  {name}
                  <i />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </figure>
  );
}
