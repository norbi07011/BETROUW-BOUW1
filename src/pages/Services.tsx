import { motion, AnimatePresence } from 'motion/react';
import {
  Square as WindowIcon, DoorOpen, Hammer, Construction, RefreshCw, Layout as LayoutIcon, Building2,
  CheckCircle2, ArrowRight, Shield, Star, Quote, Clock, Users, Award, Phone, Play, X, Layers,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { gsap, reducedMotion, lockScroll, flyTo } from '../fx/core';
import { useTransitionNavigate } from '../fx/Engine';
import { PageHero, Badge } from '../fx/PageHero';
import { SplitText, Reveal, Magnetic, TiltCard, CountUp, Float, VelocityMarquee, Parallax } from '../fx/components';

type Service = { title: string; desc: string; image: string; video?: string; features: string[] };

const serviceIcons = [
  <WindowIcon className="w-7 h-7" />,
  <LayoutIcon className="w-7 h-7" />,
  <Hammer className="w-7 h-7" />,
  <DoorOpen className="w-7 h-7" />,
  <ArrowRight className="w-7 h-7" />,
  <Building2 className="w-7 h-7" />,
  <RefreshCw className="w-7 h-7" />,
  <Layers className="w-7 h-7" />,
];

/* Process timeline whose connecting line is drawn by scrolling (scrubbing). */
const ProcessTimeline = () => {
  const { t, lang } = useLanguage();
  const sec = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.proc-line', { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.proc-grid', start: 'top 75%', end: 'bottom 45%', scrub: 0.8 },
      });
      gsap.fromTo('.proc-line-v', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.proc-list', start: 'top 75%', end: 'bottom 60%', scrub: 0.8 },
      });
      gsap.utils.toArray<HTMLElement>('.proc-dot').forEach((d) => {
        gsap.fromTo(d, { scale: 0.6, borderColor: '#3f3f46' }, {
          scale: 1, borderColor: '#f59e0b', boxShadow: '0 0 30px rgba(245,158,11,.45)', ease: 'back.out(3)', duration: 0.6,
          scrollTrigger: { trigger: d, start: 'top 70%', toggleActions: 'play none none reverse' },
        });
      });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sec} className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <SplitText key={`${lang}-proc`} as="h2" mode="words" text={t.process.title} className="font-display text-4xl md:text-6xl font-bold text-white mb-6" />
          <Reveal><p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.processSubtitle}</p></Reveal>
        </div>

        <div className="proc-grid hidden lg:block relative">
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-zinc-800" />
          <div className="proc-line absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-200 origin-left shadow-[0_0_12px_rgba(245,158,11,.8)]" />
          <Reveal stagger={0.15} className="grid grid-cols-4 gap-8">
            {t.process.steps.map((step: { title: string; desc: string }, index: number) => (
              <div key={index} className="relative group">
                <div className="flex justify-center mb-10">
                  <div className="proc-dot w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-amber-500 text-2xl font-bold relative z-10 font-display">
                    {index + 1}
                  </div>
                </div>
                <TiltCard className="text-center bb-glass-card rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-3" style={{ transform: 'translateZ(30px)' }}>{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed" style={{ transform: 'translateZ(20px)' }}>{step.desc}</p>
                </TiltCard>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="proc-list lg:hidden relative space-y-8 pl-16">
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-zinc-800" />
          <div className="proc-line-v absolute left-6 top-2 bottom-2 w-0.5 bg-amber-500 origin-top" />
          {t.process.steps.map((step: { title: string; desc: string }, index: number) => (
            <Reveal key={index} variant="left" className="relative">
              <div className="proc-dot absolute -left-16 top-0 w-12 h-12 rounded-xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-amber-500 text-lg font-bold">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const { t, lang } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  useDocumentTitle(t.nav.services);
  const go = useTransitionNavigate();
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const items = t.services.items as Service[];

  useEffect(() => {
    lockScroll(!!activeVideo);
    return () => lockScroll(false);
  }, [activeVideo]);

  const requestQuote = async (index: number, service: Service) => {
    const img = imgRefs.current[index];
    if (img) await flyTo(img);
    go('/contact', { state: { serviceMessage: t.contact.serviceMessageTemplate?.replace('{service}', service.title) || service.title } });
  };

  return (
    <div>
      <PageHero
        image="/foto/foto-10.jpeg"
        badge={<Badge icon={<Construction className="w-3.5 h-3.5" />}>{t.services.heroBadge}</Badge>}
        title={t.services.title}
        subtitle={t.services.subtitle}
        aside={
          <div className="flex flex-col gap-4" style={{ perspective: 900 }}>
            {[
              { icon: <Clock className="w-5 h-5" />, to: 18, suffix: '+', label: t.aboutStats.yearsLabel },
              { icon: <Users className="w-5 h-5" />, to: 500, suffix: '+', label: t.nav.projects },
              { icon: <Award className="w-5 h-5" />, to: 100, suffix: '%', label: t.aboutStats.quality },
            ].map((stat, i) => (
              <Float key={i} amp={10} duration={3 + i * 0.6} delay={i * 0.4}>
                <div className="bb-glass-card rounded-2xl px-6 py-4 text-center min-w-[170px]">
                  <div className="text-amber-500 flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white font-display"><CountUp to={stat.to} suffix={stat.suffix} /></div>
                  <div className="text-xs text-zinc-400 font-medium">{stat.label}</div>
                </div>
              </Float>
            ))}
          </div>
        }
      >
        <Magnetic>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-full transition-colors shadow-xl shadow-amber-500/25 group"
          >
            <Phone className="w-5 h-5" />
            {t.cta.button}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Magnetic>
      </PageHero>

      <section className="py-8 border-y border-zinc-900 bg-black/50 backdrop-blur-sm">
        <VelocityMarquee items={items.map((s) => s.title)} itemClassName="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight bb-text-outline" />
      </section>

      {/* SERVICES – alternating rows */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16 md:space-y-24">
          {items.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <Reveal variant={isEven ? 'left' : 'right'} className={isEven ? '' : 'lg:order-2'}>
                  <TiltCard max={7} className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl shadow-black/60">
                    <div className="absolute -inset-[12%]">
                      <Parallax speed={0.08} className="w-full h-full">
                        <img
                          ref={(el) => { imgRefs.current[index] = el; }}
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </Parallax>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-lg shadow-lg font-display" style={{ transform: 'translateZ(50px)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {service.video && (
                      <button
                        onClick={() => setActiveVideo(service.video!)}
                        aria-label="Play video"
                        className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                      >
                        <span className="absolute w-24 h-24 rounded-full bg-amber-500/30 animate-ping" />
                        <span className="relative w-20 h-20 rounded-full bg-amber-500 group-hover/play:bg-amber-400 flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-all duration-300" style={{ transform: 'translateZ(60px)' }}>
                          <Play className="w-8 h-8 text-black fill-black ml-1" />
                        </span>
                      </button>
                    )}
                  </TiltCard>
                </Reveal>

                <Reveal stagger={0.08} className={isEven ? '' : 'lg:order-1'}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      {serviceIcons[index % serviceIcons.length]}
                    </div>
                    <span className="font-display text-6xl font-bold bb-text-outline leading-none">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <button
                    onClick={() => go('/projects', { state: { openProject: service.title } })}
                    className="group/title text-left font-display text-3xl md:text-5xl font-bold text-white hover:text-amber-400 transition-colors mb-6 leading-tight flex items-start gap-3"
                  >
                    {service.title}
                    <ArrowRight className="w-7 h-7 mt-2 shrink-0 text-amber-500 -rotate-45 group-hover/title:rotate-0 transition-transform duration-500" />
                  </button>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">{service.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature, fi) => (
                      <div key={fi} className="flex items-center gap-3 bb-glass-card rounded-xl px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-zinc-200 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Magnetic>
                      <button
                        onClick={() => requestQuote(index, service)}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/25 transition-colors"
                      >
                        {t.cta.button} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.3}>
                      <button
                        onClick={() => go('/projects', { state: { openProject: service.title } })}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-zinc-700 hover:border-amber-500 text-white font-bold transition-colors"
                      >
                        {t.projectDetails.view}
                      </button>
                    </Magnetic>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
            data-lenis-prevent
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotateX: 30 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 160 }}
              className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-amber-500/10 border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-amber-500 text-white hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <video src={activeVideo} className="w-full max-h-[85vh] object-contain" controls autoPlay playsInline />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WHY + GUARANTEE */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SplitText key={`${lang}-why`} as="h2" mode="words" text={t.whyUs.title} className="font-display text-4xl md:text-5xl font-bold text-white mb-10" />
              <Reveal stagger={0.08} className="space-y-5">
                {t.whyUs.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black group-hover:rotate-12 transition-all duration-500 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-zinc-300 text-lg font-medium group-hover:text-white group-hover:translate-x-1 transition-all">{item}</span>
                  </div>
                ))}
              </Reveal>
            </div>

            <Reveal variant="zoom">
              <Float amp={12} duration={4.5}>
                <TiltCard max={10} className="bb-glass-card rounded-[2rem] p-10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 blur-[80px] rounded-full" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-8 shadow-lg shadow-amber-500/40" style={{ transform: 'translateZ(60px)' }}>
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white mb-4" style={{ transform: 'translateZ(40px)' }}>{t.services.guarantee.title}</h3>
                    <p className="text-zinc-400 text-lg leading-relaxed mb-8">{t.services.guarantee.desc}</p>
                    <div className="space-y-4">
                      {t.services.guarantee.items.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="text-zinc-200 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Float>
            </Reveal>
          </div>
        </div>
      </section>

      <ProcessTimeline />

      {/* TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SplitText key={`${lang}-rev`} as="h2" mode="words" text={t.testimonials.title} className="font-display text-4xl md:text-5xl font-bold text-white" />
          </div>
          <Reveal stagger={0.15} variant="flip" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.items.map((review: { name: string; text: string }, index: number) => (
              <TiltCard key={index} className="bb-glass-card rounded-2xl p-8">
                <div className="absolute -top-4 left-8 w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center" style={{ transform: 'translateZ(40px)' }}>
                  <Quote className="w-4 h-4 text-black" />
                </div>
                <div className="flex gap-1 mb-6 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                </div>
                <p className="text-zinc-200 leading-relaxed mb-8 italic" style={{ transform: 'translateZ(30px)' }}>&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold">{review.name}</div>
                    <div className="text-zinc-500 text-sm">{t.verifiedClient}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal variant="zoom">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-800">
              <div className="absolute inset-0 -inset-y-[20%]">
                <Parallax speed={0.12} className="w-full h-full">
                  <img src="/foto/foto-01.jpeg" alt="" className="w-full h-full object-cover" loading="lazy" />
                </Parallax>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
              <div className="relative z-10 py-20 px-8 md:px-16 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <SplitText key={`${lang}-cta`} as="h2" mode="words" text={t.cta.title} className="font-display text-4xl md:text-5xl font-bold text-white mb-4" />
                  <p className="text-zinc-300 text-lg">{t.cta.subtitle}</p>
                </div>
                <Magnetic strength={0.5}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-5 rounded-full shadow-xl shadow-amber-500/25 text-lg whitespace-nowrap group transition-colors"
                  >
                    {t.cta.button}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Services;
