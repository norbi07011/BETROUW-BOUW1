import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import CandidateForm from '../components/CandidateForm';

const Register = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.register);

  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <CandidateForm />
      </div>
    </div>
  );
};

export default Register;
