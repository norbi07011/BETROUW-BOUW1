import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ProjectItem {
  title: string;
  desc: string;
  mainImage: string;
  gallery: string[];
}

const Projects = () => {
  const { t } = useLanguage();
  useDocumentTitle(t.nav.projects);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Lock body scroll + Escape key when modal open
  useEffect(() => {
    if (!selectedProject) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [selectedProject]);

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
              {/* Image Section */}
              <div className="lg:w-3/5 h-64 lg:h-auto overflow-y-auto custom-scrollbar bg-black">
                <img 
                  src={selectedProject.mainImage} 
                  alt={selectedProject.title} 
                  className="w-full aspect-video lg:aspect-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="grid grid-cols-2 gap-2 p-2">
                  {selectedProject.gallery.map((img: string, i: number) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`${selectedProject.title} ${i}`} 
                      className="w-full aspect-square object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
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
