import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Construction, 
  CheckCircle2,
  Star,
  Quote
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="/foto/foto-01.jpeg" 
          alt="Betrouw Bouw B.V. - Professional window and door installation" 
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Construction className="w-3 h-3" />
            <span>{t.heroBadge}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            {t.hero.title}<br />
            <span className="text-amber-500">{t.hero.subtitle}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
            {t.hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20"
            >
              <span>{t.hero.cta1}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700 transition-all flex items-center justify-center"
            >
              {t.hero.cta2}
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 flex flex-col items-center space-y-2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-amber-500 to-transparent"></div>
      </motion.div>
    </section>
  );
};

const WhyUs = () => {
  const { t } = useLanguage();
  return (
    <section className="py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Construction className="w-64 h-64 text-amber-500" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{t.whyUs.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {t.whyUs.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-zinc-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden">
              <video
                src="/wideo/WhatsApp%20Video%202026-03-15%20at%209.17.54%20PM.mp4"
                className="w-full h-full object-cover rounded-2xl"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const { t } = useLanguage();
  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.testimonials.title}</h2>
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.testimonials.items.map((item: { text: string; name: string }, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 relative"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-amber-500/10" />
              <p className="text-zinc-300 text-lg italic leading-relaxed mb-8 relative z-10">
                "{item.text}"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800"></div>
                <div>
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{t.verifiedClient}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
      <WhyUs />
      <Testimonials />
      <section className="py-24 bg-amber-500">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">{t.cta.title}</h2>
          <p className="text-black/80 text-xl mb-10 font-medium">{t.cta.subtitle}</p>
          <Link 
            to="/contact" 
            className="inline-block px-10 py-5 bg-black text-white font-bold rounded-2xl hover:bg-zinc-900 transition-all transform hover:scale-105 shadow-2xl"
          >
            {t.cta.button}
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
