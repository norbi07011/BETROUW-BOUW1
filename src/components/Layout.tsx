import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500 transition-colors text-white text-sm font-medium"
      >
        <span>{languages.find(l => l.code === currentLang)?.flag}</span>
        <span>{currentLang}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50"
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

const Navbar = () => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.about, href: '/about' },
    { name: t.nav.services, href: '/services' },
    { name: t.nav.projects, href: '/projects' },
    { name: t.nav.contact, href: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || location.pathname !== '/' ? 'bg-black/90 backdrop-blur-md py-4 border-b border-zinc-800' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/foto/logo.jpeg" alt="Betrouw Bouw B.V. Logo" className="w-10 h-10 rounded-lg object-cover shadow-lg shadow-amber-500/20" />
          <span className="text-xl font-bold tracking-tighter text-white">
            BETROUW <span className="text-amber-500">BOUW</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              aria-current={location.pathname === link.href ? 'page' : undefined}
              className={`text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <LanguageSwitcher />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <LanguageSwitcher />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-zinc-800 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-medium transition-colors ${location.pathname === link.href ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-500'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-black py-20 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/foto/logo.jpeg" alt="Betrouw Bouw B.V. Logo" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-bold tracking-tighter text-white">
                BETROUW <span className="text-amber-500">BOUW</span>
              </span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">{t.footer.menu}</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/about" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/services" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.nav.services}</Link></li>
              <li><Link to="/projects" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.nav.projects}</Link></li>
              <li><Link to="/contact" className="text-zinc-500 hover:text-amber-500 transition-colors">{t.nav.contact}</Link></li>
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
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} BETROUW BOUW B.V. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-black text-white font-sans selection:bg-amber-500 selection:text-black min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:font-bold">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
