import { CheckCircle2, ExternalLink, Handshake, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fxText } from '../fx/fxText';
import { PageHero, Badge } from '../fx/PageHero';
import { SplitText, Reveal, TiltCard, CountUp, Float, Parallax } from '../fx/components';

const About = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  useDocumentTitle(t.nav.about);

  return (
    <div>
      <PageHero
        image="/foto/Houten%20kozijnen%20met%20gevel%20bekleding6.jpeg"
        minH="min-h-[70svh]"
        badge={<Badge icon={<Building2 className="w-3.5 h-3.5" />}>Betrouw Bouw B.V.</Badge>}
        title={t.about.title}
        subtitle={t.about.p1}
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <Reveal variant="zoom" className="relative">
            <Float amp={14} duration={5}>
              <TiltCard max={14} className="aspect-square rounded-[2.5rem] overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-500/15 bg-black">
                <img src="/foto/logo-md.jpg" alt="Betrouw Bouw B.V. Logo" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-amber-500/10" />
              </TiltCard>
            </Float>
            <Float amp={10} duration={3.4} delay={0.6} className="absolute -bottom-10 -right-4 md:-right-10 z-10">
              <div className="bg-amber-500 p-7 md:p-8 rounded-3xl shadow-2xl shadow-amber-500/30 text-black">
                <div className="font-display text-5xl font-bold mb-1"><CountUp to={18} suffix="+" /></div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-80">{t.aboutStats.yearsLabel}</div>
              </div>
            </Float>
          </Reveal>

          <div>
            <SplitText key={`${lang}-about`} as="h2" mode="words" text={t.about.title} className="font-display text-4xl md:text-5xl font-bold text-white mb-8" />
            <Reveal stagger={0.12} className="space-y-6 text-zinc-400 text-lg leading-relaxed">
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </Reveal>
            <Reveal stagger={0.12} className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                [t.aboutStats.quality, t.aboutStats.qualityDesc],
                [t.aboutStats.craftsmanship, t.aboutStats.craftsmanshipDesc],
              ].map(([title, desc]) => (
                <TiltCard key={title} className="bb-glass-card rounded-2xl p-6 flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0" style={{ transform: 'translateZ(30px)' }}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{title}</h4>
                    <p className="text-zinc-500 text-sm">{desc}</p>
                  </div>
                </TiltCard>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Count-up band */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -inset-y-[30%] opacity-20">
          <Parallax speed={0.15} className="w-full h-full">
            <img src="/foto/aalsmeer-06.jpeg" alt="" className="w-full h-full object-cover" loading="lazy" />
          </Parallax>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <Reveal stagger={0.1} className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { to: 500, s: '+', l: fx.statProjects },
            { to: 18, s: '+', l: fx.statYears },
            { to: 100, s: '%', l: fx.statClients },
            { to: 10, s: '', l: fx.statGuarantee },
          ].map((x) => (
            <div key={x.l}>
              <div className="font-display text-5xl md:text-7xl font-bold bb-text-gold"><CountUp to={x.to} suffix={x.s} /></div>
              <div className="text-zinc-400 mt-2">{x.l}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Partners */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Reveal className="mb-6"><Badge icon={<Handshake className="w-4 h-4" />}>{t.partners.title}</Badge></Reveal>
            <SplitText key={`${lang}-partners`} as="h3" mode="words" text={t.partners.title} className="font-display text-3xl md:text-5xl font-bold text-white mb-4" />
            <Reveal><p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.partners.subtitle}</p></Reveal>
          </div>

          <Reveal stagger={0.12} variant="flip" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.partners.items.map((partner) => (
              <TiltCard key={partner.name} className="rounded-2xl overflow-hidden bb-glass-card hover:border-amber-500/50 transition-colors">
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={partner.image} alt={partner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  </div>
                  <div className="relative p-6 -mt-8" style={{ transform: 'translateZ(40px)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{partner.name}</h4>
                      <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">{partner.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      {t.partners.visitSite}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              </TiltCard>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default About;
