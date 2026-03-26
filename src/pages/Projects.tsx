import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocation } from 'react-router-dom';

interface ProjectItem {
  title: string;
  desc: string;
  mainImage: string;
  gallery: string[];
}

const Projects = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.projects);
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-open project from navigation state (e.g. from Services page)
  useEffect(() => {
    const state = location.state as { openProject?: string } | null;
    if (state?.openProject) {
      const serviceTitle = state.openProject.toLowerCase();
      const items = t.projectDetails.items as ProjectItem[];
      const match = items.find((p) => {
        const pt = p.title.toLowerCase();
        // Match if project title contains key words from service title or vice versa
        return pt.includes(serviceTitle) || serviceTitle.includes(pt) ||
          serviceTitle.split(/\s+/).some((w: string) => w.length > 3 && pt.includes(w));
      });
      if (match) {
        setSelectedProject(match);
      }
      // Clear state so it doesn't re-trigger on re-render
      window.history.replaceState({}, '');
    }
  }, [location.state, t.projectDetails.items]);

  // All images: mainImage + gallery
  const allImages = selectedProject
    ? [selectedProject.mainImage, ...selectedProject.gallery]
    : [];

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goToPrev = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProject]);

  // Lock body scroll + keyboard navigation
  useEffect(() => {
    if (!selectedProject) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [selectedProject, goToNext, goToPrev]);

  return (
    <div className="pt-32 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.nav.projects}</h2>
            <p className="text-zinc-500 text-lg">{t.projectsSubtitle}</p>
          </div>
          <div className="h-px flex-grow bg-zinc-800 mx-8 hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.projectDetails.items.map((project: ProjectItem, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img 
                src={project.mainImage} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <h4 className="text-white text-xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {project.title}
                </h4>
                <p className="text-amber-500 text-sm font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  {t.projectDetails.view}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Gallery Section */}
              <div className="lg:w-3/5 flex flex-col bg-black">
                {/* Main image with navigation */}
                <div className="relative aspect-video lg:aspect-[4/3] flex-shrink-0 group/gallery select-none">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentImageIndex}
                      src={allImages[currentImageIndex]} 
                      alt={`${selectedProject.title} ${currentImageIndex + 1}`} 
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-amber-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-amber-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 backdrop-blur-sm"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium tracking-wide">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-1.5 p-3 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          i === currentImageIndex 
                            ? 'border-amber-500 opacity-100 scale-105' 
                            : 'border-transparent opacity-40 hover:opacity-75'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${selectedProject.title} thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="mb-8 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                    {t.projectModal.badge}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
                    {selectedProject.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    {selectedProject.desc}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      <span>{t.projectModal.quality}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      <span>{t.projectModal.materials}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      <span>{t.projectModal.installation}</span>
                    </div>
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
