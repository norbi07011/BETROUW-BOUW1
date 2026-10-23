import { UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import CandidateForm from '../components/CandidateForm';
import { PageHero, Badge } from '../fx/PageHero';
import { Reveal } from '../fx/components';

const Register = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.register);

  return (
    <div>
      <PageHero
        image="/foto/Schilderwerken.jpeg"
        minH="min-h-[58svh]"
        badge={<Badge icon={<UserPlus className="w-3.5 h-3.5" />}>{t.nav.register}</Badge>}
        title={t.candidate.title}
        subtitle={t.candidate.subtitle}
      />
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal variant="flip">
            <CandidateForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Register;
