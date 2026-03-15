import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();
  const tp = t.termsPage;
  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{t.footer.terms}</h1>
          <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-400 leading-relaxed">
            <p className="text-lg">
              <strong className="text-white">Betrouw Bouw B.V.</strong> — {tp.intro}
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art1Title}</h2>
            <ul className="list-disc pl-6 space-y-2">
              {tp.art1Items?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art2Title}</h2>
            <p>{tp.art2Desc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art3Title}</h2>
            <p>{tp.art3Desc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art4Title}</h2>
            <p>{tp.art4Desc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art5Title}</h2>
            <p>{tp.art5Desc}</p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">{tp.art6Title}</h2>
            <p>{tp.art6Desc}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
