import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Square as WindowIcon, 
  DoorOpen, 
  Hammer, 
  Construction, 
  RefreshCw,
  Layout as LayoutIcon,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Star,
  Quote,
  ChevronDown,
  Sparkles,
  Clock,
  Users,
  Award,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';

const serviceIcons = [
  <WindowIcon className="w-7 h-7" />,
  <LayoutIcon className="w-7 h-7" />,
  <Hammer className="w-7 h-7" />,
  <DoorOpen className="w-7 h-7" />,
  <ArrowRight className="w-7 h-7" />,
  <Building2 className="w-7 h-7" />,
  <RefreshCw className="w-7 h-7" />,
];

const Services = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.services);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <div className="bg-zinc-950">
      {/* ═══════════════════════════════════════════ */}
      {/*  HERO                                      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/foto/foto-10.jpeg"
            alt="Betrouw Bouw B.V. - Professional services"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-8">
              <Construction className="w-3.5 h-3.5" />
              <span>{t.services.heroBadge}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              {t.services.title}
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mb-10">
              {t.services.subtitle}
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25 group"
            >
              <Phone className="w-5 h-5" />
              {t.cta.button}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-4"
        >
          {[
            { icon: <Clock className="w-5 h-5" />, value: '15+', label: t.aboutStats.yearsLabel },
            { icon: <Users className="w-5 h-5" />, value: '500+', label: 'Projects' },
            { icon: <Award className="w-5 h-5" />, value: '100%', label: t.aboutStats.quality },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
              className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-4 text-center min-w-[160px]"
            >
              <div className="text-amber-500 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*  SERVICES GRID — alternating layout        */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[200px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-sm font-semibold tracking-wide uppercase">
                {t.services.heroBadge}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.services.title}</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.services.subtitle}</p>
          </motion.div>

          {/* Service cards — large alternating rows */}
          <div className="space-y-8">
            {t.services.items.map((service: { title: string; desc: string; image: string; features: string[] }, index: number) => {
              const isExpanded = expandedCard === index;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: 0.1 }}
                  className="group"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-zinc-800 hover:border-amber-500/30 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5 ${isEven ? '' : 'lg:direction-rtl'}`}>
                    {/* Image */}
                    <div className={`relative aspect-[16/10] lg:aspect-auto overflow-hidden ${isEven ? '' : 'lg:order-2'}`}>
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-zinc-900/20" />
                      
                      {/* Number badge */}
                      <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold text-lg shadow-lg">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${isEven ? '' : 'lg:order-1'}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-300">
                          {serviceIcons[index % serviceIcons.length]}
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {service.title}
                        </h3>
                      </div>

                      <p className="text-zinc-400 text-base lg:text-lg leading-relaxed mb-6">
                        {service.desc}
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {service.features.map((feature: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-zinc-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Expand toggle on mobile */}
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : index)}
                        className="lg:hidden flex items-center gap-2 text-amber-500 text-sm font-semibold mt-2"
                      >
                        {t.services.learnMore}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden overflow-hidden"
                          >
                            <Link
                              to="/contact"
                              className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                            >
                              {t.cta.button}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Desktop CTA */}
                      <div className="hidden lg:block mt-2">
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 text-amber-500 font-semibold hover:gap-3 transition-all group/link"
                        >
                          {t.cta.button}
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*  WHY CHOOSE US                             */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                {t.whyUs.title}
              </h2>

              <div className="space-y-5">
                {t.whyUs.items.map((item: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-zinc-300 text-lg font-medium group-hover:text-white transition-colors">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: guarantee card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-zinc-800 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-8">
                    <Shield className="w-8 h-8 text-black" />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">{t.services.guarantee.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">{t.services.guarantee.desc}</p>

                  <div className="space-y-4">
                    {t.services.guarantee.items.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="text-zinc-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*  PROCESS TIMELINE                          */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.process.title}</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t.processSubtitle}</p>
          </motion.div>

          {/* Desktop timeline */}
          <div className="hidden lg:block relative">
            {/* Connection line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            <div className="grid grid-cols-4 gap-8">
              {t.process.steps.map((step: { title: string; desc: string }, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className="flex justify-center mb-10">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-700 group-hover:border-amber-500 flex items-center justify-center text-amber-500 text-2xl font-bold transition-all duration-300 relative z-10 group-hover:shadow-lg group-hover:shadow-amber-500/20">
                        {index + 1}
                      </div>
                      <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 group-hover:border-amber-500/30 transition-all">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{step.title}</h3>
                    <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="lg:hidden space-y-6">
            {t.process.steps.map((step: { title: string; desc: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border-2 border-zinc-700 group-hover:border-amber-500 flex items-center justify-center text-amber-500 text-lg font-bold transition-all shrink-0">
                    {index + 1}
                  </div>
                  {index < t.process.steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-zinc-800 mt-3" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*  TESTIMONIALS                              */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/3 blur-[200px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.testimonials.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.items.map((review: { name: string; text: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all group"
              >
                {/* Quote icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Quote className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-zinc-300 leading-relaxed mb-8 italic">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold">{review.name}</div>
                    <div className="text-zinc-500 text-sm">{t.verifiedClient}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*  CTA                                       */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src="/foto/foto-01.jpeg"
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70" />
            </div>

            <div className="relative z-10 py-20 px-8 md:px-16 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {t.cta.title}
                </h2>
                <p className="text-zinc-300 text-lg">
                  {t.cta.subtitle}
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-5 rounded-2xl transition-all hover:shadow-xl hover:shadow-amber-500/25 text-lg whitespace-nowrap group shrink-0"
              >
                {t.cta.button}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
