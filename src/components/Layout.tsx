import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Menu, X, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { SmoothScroll, ScrollProgress, PageTransitions } from '../fx/Engine';
import { SmokeBackground } from '../fx/Backdrop';
import { ParticleIntro } from '../fx/ParticleIntro';
import { VictoryLayer } from '../fx/VictoryLayer';
import { Magnetic, TextFill, Reveal } from '../fx/components';
import { scrollState, lockScroll } from '../fx/core';

const LanguageSwitcher = () => {
  const { lang: currentLang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'NL', label: 'NL', flag: '🇳🇱' },
    { code: 'EN', label: 'EN', flag: '🇬🇧' },
    { code: 'PL', label: 'PL', flag: '🇵🇱' },
    { code: 'DE', label: 'DE', flag: '🇩🇪' },
    { code: 'TR', label: 'TR', flag: '🇹🇷' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/70 backdrop-blur border border-zinc-800 hover:border-amber-500 transition-colors text-white text-sm font-medium"
      >
        <span>{languages.find((l) => l.code === currentLang)?.flag}</span>
        <span>{currentLang}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, rotateX: -30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 10, rotateX: -30 }}
            style={{ transformOrigin: 'top' }}
            className="absolute right-0 mt-2 w-32 bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLang(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800 ${currentLang === lang.code ? 'text-amber-500 bg-zinc-800/50' : 'text-zinc-400'}`}
              >
                <span>{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Smart sticky header: hides when scrolling down, returns when scrolling up. */
const Navbar = () => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let raf = 0;
    let last = window.scrollY;
    const loop = () => {
      const y = scrollState.lenis ? scrollState.lenis.scroll : window.scrollY;
      setIsScrolled(y > 50);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    lockScroll(isMobileMenuOpen);
    return () => lockScroll(false);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.about, href: '/about' },
    { name: t.nav.services, href: '/services' },
    { name: t.nav.projects, href: '/projects' },
    { name: t.nav.contact, href: '/contact' },
    { name: t.nav.register, href: '/register' },
  ];

  const solid = isScrolled || location.pathname !== '/';

  return (
    <>
      <nav
        style={{ viewTransitionName: 'site-header' } as React.CSSProperties}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${hidden && !isMobileMenuOpen ? '-translate-y-full' : 'translate-y-0'} ${solid ? 'bg-black/70 backdrop-blur-xl py-3 border-b border-zinc-800/80' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/foto/logo-sm.png"
              alt="Betrouw Bouw B.V. Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-lg shadow-amber-500/20 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
            />
            <span className="text-base sm:text-xl font-bold tracking-tighter text-white font-display whitespace-nowrap">
              BETROUW <span className="text-amber-500">BOUW</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-fly-target={link.href === '/contact' ? '' : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`relative text-sm font-medium transition-colors group py-1 ${active ? 'text-amber-500' : 'text-zinc-300 hover:text-white'}`}
                >
                  {link.name}
                  <span className={`absolute left-0 -bottom-0.5 h-px bg-amber-500 transition-all duration-500 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
            <LanguageSwitcher />
            <Magnetic strength={0.35}>
              <a
                href="tel:+31684111366"
                className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full bg-amber-500 text-black text-sm font-bold shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>06-84111366</span>
              </a>
            </Magnetic>
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-[60] w-11 h-11 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-white"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.3, 1] }}
            className="lg:hidden fixed inset-0 z-[45] bg-black/95 backdrop-blur-xl flex flex-col justify-center px-8"
            data-lenis-prevent
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 60, opacity: 0, rotateX: -60 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-baseline gap-4 text-4xl font-bold font-display tracking-tight ${location.pathname === link.href ? 'text-amber-500' : 'text-white'}`}
                  >
                    <span className="text-xs font-mono text-zinc-600">0{i + 1}</span>
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              href="tel:+31684111366"
              className="mt-12 inline-flex items-center gap-2 text-amber-500 font-bold"
            >
              <Phone className="w-5 h-5" /> +31 (0)6-84111366
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="relative bg-black/80 backdrop-blur-sm pt-24 border-t border-zinc-900 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal stagger={0.12} className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img src="/foto/logo-sm.png" alt="Betrouw Bouw B.V. Logo" className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
              <span className="text-2xl font-bold tracking-tighter text-white font-display">
                BETROUW <span className="text-amber-500">BOUW</span>
              </span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed mb-8">{t.footer.description}</p>
            <div className="space-y-3 text-sm">
              <a href="tel:+31684111366" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors">
                <Phone className="w-4 h-4 text-amber-500" /> +31 (0)6-84111366
              </a>
              <a href="mailto:tomasz_jaskiewicz@hotmail.com" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors">
                <Mail className="w-4 h-4 text-amber-500" /> tomasz_jaskiewicz@hotmail.com
              </a>
              <p className="flex items-center gap-3 text-zinc-400">
                <MapPin className="w-4 h-4 text-amber-500" /> Kanaalweg 13, 2584 CD &apos;s-Gravenhage
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">{t.footer.menu}</h4>
            <ul className="space-y-4">
              {[
                ['/', t.nav.home], ['/about', t.nav.about], ['/services', t.nav.services],
                ['/projects', t.nav.projects], ['/contact', t.nav.contact],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="group inline-flex items-center gap-1 text-zinc-500 hover:text-amber-500 transition-colors">
                    {label}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">{t.footer.legal}</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.footer.privacy}</Link></li>
              <li><Link to="/terms" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.footer.terms}</Link></li>
              <li><Link to="/cookies" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.footer.cookies}</Link></li>
            </ul>
          </div>
        </Reveal>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} BETROUW BOUW B.V. {t.footer.rights}
          </p>
        </div>
      </div>

      {/* Giant scroll-filled wordmark */}
      <div className="relative mt-10 pb-6 flex justify-center">
        <TextFill text="Betrouw Bouw" className="text-[11vw] font-display" />
      </div>
    </footer>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative text-white font-sans selection:bg-amber-500 selection:text-black min-h-screen flex flex-col">
      <SmoothScroll />
      <PageTransitions />
      <SmokeBackground />
      <ScrollProgress />
      <ParticleIntro />
      <VictoryLayer />
      <a
        href="#main-content"
        onClick={(e) => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:font-bold"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="relative z-10 flex-grow outline-none">
        {children}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
