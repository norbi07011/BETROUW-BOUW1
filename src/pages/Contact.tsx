import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, MessageSquare, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocation } from 'react-router-dom';
import { celebrate } from '../fx/core';
import { PageHero, Badge } from '../fx/PageHero';
import { Reveal, Magnetic, TiltCard, Float } from '../fx/components';

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
  const location = useLocation();

  // Pre-fill message from Services page navigation state
  const initialMessage = (location.state as { serviceMessage?: string } | null)?.serviceMessage || '';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    message: initialMessage,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(0);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t.contact.errors.name;
        if (value.trim().length < 2) return t.contact.errors.nameMin;
        return undefined;
      case 'email': {
        if (!value.trim()) return t.contact.errors.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t.contact.errors.emailInvalid;
        return undefined;
      }
      case 'phone': {
        if (!value.trim()) return t.contact.errors.phone;
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return t.contact.errors.phoneInvalid;
        return undefined;
      }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const buildMessageText = (): string => {
    return `${t.contact.name}: ${formData.name}\n${t.contact.phone}: ${formData.phone}\n${t.contact.email}: ${formData.email}\n\n${t.contact.message}:\n${formData.message}`;
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (hasErrors) setShake((s) => s + 1); // shake the form on invalid submit
    return !hasErrors;
  };

  const onSent = () => {
    setIsSuccess(true);
    setFormData({ name: '', phone: '', email: '', message: '' });
    setTouched({});
    celebrate();
  };

  const sendViaEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    const subject = encodeURIComponent(`Offerte aanvraag - ${formData.name}`);
    const body = encodeURIComponent(buildMessageText());
    window.open(`mailto:tomasz_jaskiewicz@hotmail.com?subject=${subject}&body=${body}`, '_self');
    onSent();
  };

  const sendViaWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    const text = encodeURIComponent(`Offerte aanvraag\n\n${buildMessageText()}`);
    window.open(`https://wa.me/31684111366?text=${text}`, '_blank');
    onSent();
  };

  const field = (name: keyof FormData) =>
    `peer w-full px-6 py-4 bg-black/60 border ${errors[name] && touched[name] ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,.12),0_0_30px_rgba(245,158,11,.15)] transition-all duration-300`;

  const contactCards = [
    { icon: <Phone className="w-6 h-6" />, label: t.contactLabels.callUs, value: '+31 (0)6-84111366', href: 'tel:+31684111366' },
    { icon: <Mail className="w-6 h-6" />, label: t.contactLabels.emailUs, value: 'tomasz_jaskiewicz@hotmail.com', href: 'mailto:tomasz_jaskiewicz@hotmail.com' },
    { icon: <MapPin className="w-6 h-6" />, label: t.contactLabels.visitUs, value: 'Kanaalweg 13', sub: "2584 CD 's-Gravenhage" },
  ];

  const ErrorMark = ({ name }: { name: keyof FormData }) =>
    errors[name] && touched[name] ? (
      <div className="absolute right-4 top-4 text-red-500">
        <AlertCircle className="w-5 h-5" />
      </div>
    ) : null;

  const ErrorText = ({ name }: { name: keyof FormData }) =>
    errors[name] && touched[name] ? (
      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs ml-1">{errors[name]}</motion.p>
    ) : null;

  return (
    <div>
      <PageHero
        image="/foto/Deuren%20Montage.jpeg"
        minH="min-h-[58svh]"
        badge={<Badge icon={<Send className="w-3.5 h-3.5" />}>{t.contact.submit}</Badge>}
        title={t.contact.title}
        subtitle={t.contactIntro}
      />

      <section className="pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
            <div>
              <Reveal variant="zoom" className="mb-12 flex justify-center lg:justify-start">
                <Float amp={12} duration={4.2}>
                  <TiltCard max={16} className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 w-48 h-48">
                    <img src="/foto/logo-md.jpg" alt="Betrouw Bouw B.V. Logo" className="w-full h-full object-cover" />
                  </TiltCard>
                </Float>
              </Reveal>

              <Reveal stagger={0.1} variant="left" className="space-y-4">
                {contactCards.map((c) => {
                  const inner = (
                    <TiltCard max={8} className="bb-glass-card rounded-2xl p-5 flex items-center space-x-5 hover:border-amber-500/40 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0" style={{ transform: 'translateZ(30px)' }}>
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">{c.label}</p>
                        <p className="text-white text-lg md:text-xl font-bold break-all">{c.value}</p>
                        {c.sub && <p className="text-zinc-500 text-sm">{c.sub}</p>}
                      </div>
                    </TiltCard>
                  );
                  return c.href ? <a key={c.label} href={c.href} className="block">{inner}</a> : <div key={c.label}>{inner}</div>;
                })}
              </Reveal>

              <Reveal className="mt-10">
                <Magnetic>
                  <a
                    href="https://wa.me/31684111366"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full transition-colors shadow-lg shadow-green-500/20"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>{t.contact.whatsapp}</span>
                  </a>
                </Magnetic>
              </Reveal>
            </div>

            <Reveal variant="right">
              <motion.div
                key={shake}
                animate={shake ? { x: [0, -14, 12, -10, 8, -4, 0] } : undefined}
                transition={{ duration: 0.5 }}
                className="bb-glass-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur rounded-[2.5rem] p-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-6"
                      >
                        <CheckCircle className="w-10 h-10" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">{t.contact.errors.success}</h3>
                      <p className="text-zinc-400">{t.contact.errors.successDesc}</p>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
                      >
                        {t.contact.errors.new}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form className="relative space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.name}</label>
                      <div className="relative">
                        <input id="contact-name" type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={field('name')} placeholder={t.contact.placeholders?.name || 'Jan Jansen'} />
                        <ErrorMark name="name" />
                      </div>
                      <ErrorText name="name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-phone" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.phone}</label>
                      <div className="relative">
                        <input id="contact-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={field('phone')} placeholder={t.contact.placeholders?.phone || '+31 6 ...'} />
                        <ErrorMark name="phone" />
                      </div>
                      <ErrorText name="phone" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.email}</label>
                    <div className="relative">
                      <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={field('email')} placeholder={t.contact.placeholders?.email || 'uw@email.nl'} />
                      <ErrorMark name="email" />
                    </div>
                    <ErrorText name="email" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-zinc-400 text-sm font-medium ml-1">{t.contact.message}</label>
                    <div className="relative">
                      <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} onBlur={handleBlur} rows={5} className={`${field('message')} resize-none`} placeholder={t.contact.placeholders?.message || 'Vertel ons over uw project...'} />
                      <ErrorMark name="message" />
                    </div>
                    <ErrorText name="message" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Magnetic strength={0.25} className="w-full">
                      <button type="button" onClick={sendViaEmail} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-colors shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>{t.contact.sendEmail || 'E-mail'}</span>
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.25} className="w-full">
                      <button type="button" onClick={sendViaWhatsApp} className="w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full transition-colors shadow-xl shadow-green-500/20 flex items-center justify-center space-x-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>{t.contact.sendWhatsApp || 'WhatsApp'}</span>
                      </button>
                    </Magnetic>
                  </div>
                </form>
              </motion.div>
            </Reveal>
          </div>

          <Reveal variant="flip" className="mt-20">
            <div className="rounded-[2rem] border border-zinc-800 overflow-hidden shadow-2xl">
              <iframe
                title={t.contactLabels?.mapTitle || 'Betrouw Bouw B.V. - Location'}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2456.123!2d4.2884!3d52.0905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b72d5b2a7a3d%3A0x0!2sKanaalweg+13%2C+2584+CD+Den+Haag!5e0!3m2!1snl!2snl!4v1710000000000"
                width="100%"
                height="420"
                style={{ border: 0, filter: 'grayscale(0.6) invert(0.92) hue-rotate(180deg) contrast(0.9)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
