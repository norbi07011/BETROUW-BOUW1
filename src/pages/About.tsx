import { motion } from 'motion/react';
import { CheckCircle2, ExternalLink, Handshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const About = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.about);
  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
              <img 
                src="/foto/foto-06.jpeg" 
                alt="Betrouw Bouw B.V. - Our team at work" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-amber-500 p-8 rounded-3xl shadow-2xl hidden md:block">
              <div className="text-black">
                <div className="text-4xl font-bold mb-1">{t.aboutStats.years}</div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-80">{t.aboutStats.yearsLabel}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              {t.about.title}
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t.aboutStats.quality}</h4>
                  <p className="text-zinc-500 text-sm">{t.aboutStats.qualityDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t.aboutStats.craftsmanship}</h4>
                  <p className="text-zinc-500 text-sm">{t.aboutStats.craftsmanshipDesc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partners Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-6">
              <Handshake className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-sm font-semibold tracking-wide uppercase">
                {t.partners.title}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.partners.title}
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t.partners.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.partners.items.map((partner, index) => (
              <motion.a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group relative bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                {/* Partner Image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                </div>

                {/* Partner Info */}
                <div className="relative p-6 -mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {partner.name}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    {partner.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    {t.partners.visitSite}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
