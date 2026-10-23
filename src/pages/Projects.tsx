import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronLeft, ChevronRight, ZoomIn, ArrowUpRight, Images } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocation } from 'react-router-dom';
import { lockScroll, isTouch } from '../fx/core';
import { fxText } from '../fx/fxText';
import { PageHero, Badge } from '../fx/PageHero';
import { Reveal, TiltCard, VelocityMarquee } from '../fx/components';

interface GalleryImage {
  src: string;
  label?: string;
}

interface ProjectItem {
  title: string;
  desc: string;
  mainImage: string;
  gallery: (string | GalleryImage)[];
}

const normalizeImage = (img: string | GalleryImage): GalleryImage =>
  typeof img === 'string' ? { src: img } : img;

/* Image zoom lens / magnifier */
const LensImage = ({ src, alt }: { src: string; alt: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const ZOOM = 2.6;
  const SIZE = 190;
  const touch = isTouch();

  const onMove = (e: React.PointerEvent) => {
    if (touch || !box.current || !lens.current) return;
    const r = box.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const l = lens.current;
    l.style.opacity = '1';
    l.style.transform = `translate(${x - SIZE / 2}px, ${y - SIZE / 2}px) scale(1)`;
    l.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
    l.style.backgroundPosition = `${-(x * ZOOM - SIZE / 2)}px ${-(y * ZOOM - SIZE / 2)}px`;
  };
  const onLeave = () => {
    if (lens.current) {
      lens.current.style.opacity = '0';
      lens.current.style.transform += ' scale(0.6)';
    }
  };

  return (
    <div ref={box} className="absolute inset-0 cursor-none overflow-hidden" onPointerMove={onMove} onPointerLeave={onLeave}>
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt={alt}
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          draggable={false}
        />
      </AnimatePresence>
      {!touch && (
        <div
          ref={lens}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-amber-400 shadow-[0_0_0_6px_rgba(0,0,0,.35),0_20px_60px_rgba(0,0,0,.6)] opacity-0 transition-opacity duration-200 bg-no-repeat"
          style={{ width: SIZE, height: SIZE, backgroundImage: `url("${src}")` }}
        />
      )}
    </div>
  );
};

const Projects = () => {
  const { t, lang } = useLanguage();
  const fx = fxText[lang];
  useDocumentTitle(t.nav.projects);
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const items = t.projectDetails.items as ProjectItem[];

  useEffect(() => {
    const state = location.state as { openProject?: string } | null;
    if (state?.openProject) {
      const serviceTitle = state.openProject.toLowerCase();
      const match = items.find((p) => {
        const pt = p.title.toLowerCase();
        return pt.includes(serviceTitle) || serviceTitle.includes(pt) ||
          serviceTitle.split(/\s+/).some((w: string) => w.length > 3 && pt.includes(w));
      });
      if (match) setSelectedProject(match);
      window.history.replaceState({ ...window.history.state, usr: undefined }, '');
    }
  }, [location.state, items]);

  const allImages: GalleryImage[] = selectedProject
    ? [normalizeImage(selectedProject.mainImage), ...selectedProject.gallery.map(normalizeImage)]
    : [];

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goToPrev = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    lockScroll(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      lockScroll(false);
      document.removeEventListener('keydown', handleKey);
    };
  }, [selectedProject, goToNext, goToPrev]);

  return (
    <div>
      <PageHero
        image="/foto/Schuifpuien4.jpeg"
        minH="min-h-[64svh]"
        badge={<Badge icon={<Images className="w-3.5 h-3.5" />}>{fx.galleryKicker}</Badge>}
        title={t.nav.projects}
        subtitle={t.projectsSubtitle}
      />

      <section className="py-6 border-y border-zinc-900 bg-black/50 backdrop-blur-sm">
        <VelocityMarquee items={items.map((p) => p.title)} baseSpeed={0.8} itemClassName="font-display text-3xl md:text-5xl font-bold text-white/90 uppercase tracking-tight" />
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal stagger={0.08} variant="flip" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((project, index) => {
              const count = 1 + project.gallery.length;
              const big = index % 5 === 0;
              return (
                <div key={index} className={big ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}>
                  <TiltCard className="group rounded-3xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-amber-500/50 transition-colors">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className={`relative block w-full text-left ${big ? 'aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[640px]' : 'aspect-[4/3]'}`}
                    >
                      <img
                        src={project.mainImage}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-5 left-5 font-mono text-xs text-amber-400 bg-black/60 backdrop-blur px-3 py-1 rounded-full" style={{ transform: 'translateZ(30px)' }}>
                        {String(index + 1).padStart(2, '0')} · {count} foto
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8" style={{ transform: 'translateZ(50px)' }}>
                        <h4 className="text-white text-xl md:text-2xl font-bold mb-2 font-display">{project.title}</h4>
                        <p className="text-amber-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          {t.projectDetails.view} <ArrowUpRight className="w-4 h-4" />
                        </p>
                      </div>
                    </button>
                  </TiltCard>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
            data-lenis-prevent
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotateX: 25, y: 60 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 170 }}
              style={{ transformPerspective: 1200 }}
              className="bg-zinc-950 w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl shadow-amber-500/10 flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lg:w-3/5 flex flex-col bg-black">
                <div className="relative aspect-video lg:aspect-[4/3] flex-shrink-0 group/gallery select-none">
                  <LensImage src={allImages[currentImageIndex]?.src} alt={`${selectedProject.title} ${currentImageIndex + 1}`} />

                  {allImages[currentImageIndex]?.label && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg pointer-events-none">
                      {allImages[currentImageIndex].label}
                    </div>
                  )}

                  {!isTouch() && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur text-zinc-300 text-[11px] rounded-full flex items-center gap-1.5 pointer-events-none">
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> {fx.lensHint}
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-amber-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm z-10"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-amber-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm z-10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium tracking-wide pointer-events-none tabular-nums">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-1.5 p-3 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        title={img.label}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          i === currentImageIndex ? 'border-amber-500 opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <img src={img.src} alt={`${selectedProject.title} thumbnail ${i + 1}`} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                        {img.label && (
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-black text-[8px] font-bold uppercase text-center leading-tight py-0.5">
                            {img.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    aria-label={t.projectDetails.close}
                    className="mb-8 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-black hover:bg-amber-500 hover:rotate-90 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                    {t.projectModal.badge}
                  </div>
                  <h3 className="font-display text-3xl font-bold text-white mb-6 leading-tight">{selectedProject.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">{selectedProject.desc}</p>
                  <div className="space-y-4">
                    {[t.projectModal.quality, t.projectModal.materials, t.projectModal.installation].map((txt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.08 }}
                        className="flex items-center space-x-3 text-zinc-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-amber-500" />
                        <span>{txt}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-12">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                  >
                    {t.projectDetails.close}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
