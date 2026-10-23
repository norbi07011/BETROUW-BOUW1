import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gsap, reducedMotion } from './core';
import { Spotlights, Dust } from './Backdrop';
import { SplitText, useIntroReady } from './components';

/* Shared sub-page hero: parallax photo, spotlights + dust, kinetic title. */
export function PageHero({
  image, badge, title, subtitle, children, aside, minH = 'min-h-[78svh]',
}: {
  image: string;
  badge?: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  aside?: ReactNode;
  minH?: string;
}) {
  const { lang } = useLanguage();
  const ready = useIntroReady();
  const sec = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: sec.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.fromTo(bg.current, { yPercent: 0, scale: 1.15 }, { yPercent: 25, scale: 1.3, ease: 'none', scrollTrigger: st });
      gsap.to(copy.current, { yPercent: -25, opacity: 0.2, ease: 'none', scrollTrigger: st });
    }, sec);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!ready || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.ph-fade', { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.35, clearProps: 'filter' });
    }, sec);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={sec} className={`relative ${minH} flex items-center pt-28 pb-16 overflow-hidden`}>
      <div ref={bg} className="absolute inset-0 z-0 will-change-transform">
        <img src={image} alt="" className="w-full h-full object-cover" loading="eager" />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <Spotlights className="z-[1] opacity-80" />
      <Dust className="z-[2]" count={70} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
        <div ref={copy} className="max-w-3xl">
          {badge && <div className="ph-fade mb-8">{badge}</div>}
          {ready ? (
            <SplitText
              key={`${lang}-${title}`}
              as="h1"
              text={title}
              mode={title.length > 22 ? 'words' : 'chars'}
              trigger="load"
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8"
            />
          ) : (
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 opacity-0">{title}</h1>
          )}
          {subtitle && <p className="ph-fade text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mb-10">{subtitle}</p>}
          {children && <div className="ph-fade">{children}</div>}
        </div>
        {aside && <div className="ph-fade hidden lg:block">{aside}</div>}
      </div>
    </section>
  );
}

export const Badge = ({ icon, children }: { icon?: ReactNode; children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest backdrop-blur">
    {icon}
    {children}
  </span>
);
