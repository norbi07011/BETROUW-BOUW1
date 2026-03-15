import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const Privacy = () => {
  const { t } = useLanguage();
  const p = t.privacyPage;
  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{t.footer.privacy}</h1>
          <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-400 leading-relaxed">
            <p className="text-lg">
              <strong className="text-white">Betrouw Bouw B.V.</strong> — {p.intro}
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{p.dataTitle}</h2>
            <p>{p.dataDesc}</p>
            <ul className="list-disc pl-6 space-y-2">
              {p.dataItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{p.purposeTitle}</h2>
            <p>{p.purposeDesc}</p>
            <ul className="list-disc pl-6 space-y-2">
              {p.purposeItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{p.retentionTitle}</h2>
            <p>{p.retentionDesc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{p.sharingTitle}</h2>
            <p>{p.sharingDesc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{p.contactTitle}</h2>
            <p>
              {p.contactDesc}{' '}
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

export default Privacy;
