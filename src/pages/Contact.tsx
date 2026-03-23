import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import CandidateForm from '../components/CandidateForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

const Contact = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.contact);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t.contact.errors.name;
        if (value.trim().length < 2) return t.contact.errors.nameMin;
        return undefined;
      case 'email':
        if (!value.trim()) return t.contact.errors.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t.contact.errors.emailInvalid;
        return undefined;
      case 'phone':
        if (!value.trim()) return t.contact.errors.phone;
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return t.contact.errors.phoneInvalid;
        return undefined;
      case 'message':
        if (!value.trim()) return t.contact.errors.message;
        if (value.trim().length < 10) return t.contact.errors.messageMin;
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    let hasErrors = false;
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      message: true,
    });

    if (!hasErrors) {
      setIsSubmitting(true);
      try {
        setSubmitError(null);
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to send');
        setIsSuccess(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
        setTouched({});
      } catch (err) {
        setSubmitError(t.contact.errors?.sendFailed || 'Could not send message. Please try again or contact us directly.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="pt-32 pb-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{t.contact.title}</h2>
            <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
              {t.contactIntro}
            </p>

            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10">
                  <img 
                    src="/foto/logo.jpeg" 
                    alt="Betrouw Bouw B.V. Logo" 
                    className="w-48 h-48 object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mb-1">{t.contactLabels.callUs}</p>
                  <p className="text-white text-xl font-bold">+31 (0)6-84111366</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mb-1">{t.contactLabels.emailUs}</p>
                  <p className="text-white text-xl font-bold">tomasz_jaskiewicz@hotmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mb-1">{t.contactLabels.visitUs}</p>
                  <p className="text-white text-xl font-bold">Kanaalweg 13</p>
                  <p className="text-zinc-500 text-sm">2584 CD 's-Gravenhage</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <a 
                href="https://wa.me/31684111366" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
              >
                <MessageSquare className="w-6 h-6" />
                <span>{t.contact.whatsapp}</span>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 p-10 md:p-12 rounded-[3rem] border border-zinc-800 shadow-2xl relative"
          >
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900 rounded-[3rem] p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t.contact.errors.success}</h3>
                  <p className="text-zinc-400">{t.contact.errors.successDesc}</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    {t.contact.errors.new}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {submitError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{submitError}</p>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.name}</label>
                  <div className="relative">
                    <input 
                      id="contact-name"
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-6 py-4 bg-zinc-950 border ${errors.name && touched.name ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder={t.contact.placeholders?.name || 'Jan Jansen'}
                    />
                    {errors.name && touched.name && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs ml-1">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.phone}</label>
                  <div className="relative">
                    <input 
                      id="contact-phone"
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-6 py-4 bg-zinc-950 border ${errors.phone && touched.phone ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder={t.contact.placeholders?.phone || '+31 6 ...'}
                    />
                    {errors.phone && touched.phone && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs ml-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.email}</label>
                <div className="relative">
                  <input 
                    id="contact-email"
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-4 bg-zinc-950 border ${errors.email && touched.email ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`}
                    placeholder={t.contact.placeholders?.email || 'uw@email.nl'}
                  />
                  {errors.email && touched.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs ml-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.message}</label>
                <div className="relative">
                  <textarea 
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`w-full px-6 py-4 bg-zinc-950 border ${errors.message && touched.message ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors resize-none`}
                    placeholder={t.contact.placeholders?.message || 'Vertel ons over uw project...'}
                  ></textarea>
                  {errors.message && touched.message && (
                    <div className="absolute right-4 top-4 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.message && touched.message && (
                  <p className="text-red-500 text-xs ml-1">{errors.message}</p>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>{t.contact.errors.sending}</span>
                  </>
                ) : (
                  <span>{t.contact.submit}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Google Maps */}
        <div className="mt-20">
          <div className="bg-zinc-900 rounded-[2rem] border border-zinc-800 overflow-hidden shadow-2xl">
            <iframe
              title={t.contactLabels?.mapTitle || 'Betrouw Bouw B.V. - Location'}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2456.123!2d4.2884!3d52.0905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b72d5b2a7a3d%3A0x0!2sKanaalweg+13%2C+2584+CD+Den+Haag!5e0!3m2!1snl!2snl!4v1710000000000"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </div>

        {/* New Candidate Registration Section */}
        <CandidateForm />
      </div>
    </div>
  );
};

export default Contact;
