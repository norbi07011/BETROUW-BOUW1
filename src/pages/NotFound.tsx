import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="pt-32 pb-20 bg-zinc-950 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg mx-auto px-6"
      >
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-8">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-zinc-300 mb-4">{t.notFound.title}</h2>
        <p className="text-zinc-500 text-lg mb-10 leading-relaxed">{t.notFound.description}</p>
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-amber-500/20"
        >
          <Home className="w-5 h-5" />
          <span>{t.notFound.button}</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
