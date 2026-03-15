import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const Cookies = () => {
  const { t } = useLanguage();
  const c = t.cookiesPage;
  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{t.footer.cookies}</h1>
          <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-400 leading-relaxed">
            <p className="text-lg">
              <strong className="text-white">Betrouw Bouw B.V.</strong> — {c.intro}
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{c.whatTitle}</h2>
            <p>{c.whatDesc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{c.whichTitle}</h2>
            <ul className="list-disc pl-6 space-y-2">
              {c.whichItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{c.langTitle}</h2>
            <p>{c.langDesc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{c.manageTitle}</h2>
            <p>{c.manageDesc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{c.contactTitle}</h2>
            <p>
              {c.contactDesc}{' '}
              <a href="mailto:tomasz_jaskiewicz@hotmail.com" className="text-amber-500 hover:text-amber-400 transition-colors">
                tomasz_jaskiewicz@hotmail.com
              </a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cookies;
