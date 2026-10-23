import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

// Default curated wedding gallery images with reliable fallback
const DEFAULT_IMAGES = [
  {
    id: 11,
    src: '/assets/image11.webp',
    alt: 'Ermias and Bethelhem cherished moment 11',
    fit: true,
  },
  {
    id: 12,
    src: '/assets/image12.webp',
    alt: 'Ermias and Bethelhem cherished moment 12',
    fit: true,
  },
  {
    id: 2,
    src: '/assets/image2.webp',
    alt: 'Ermias and Bethelhem cherished moment 2',
  },
  {
    id: 3,
    src: '/assets/image3.webp',
    alt: 'Ermias and Bethelhem cherished moment 3',
  },
  {
    id: 5,
    src: '/assets/image5.webp',
    alt: 'Ermias and Bethelhem cherished moment 5',
  },
  {
    id: 6,
    src: '/assets/image6.webp',
    alt: 'Ermias and Bethelhem cherished moment 6',
  },
  {
    id: 7,
    src: '/assets/image7.webp',
    alt: 'Ermias and Bethelhem cherished moment 7',
  },
  {
    id: 8,
    src: '/assets/image8.webp',
    alt: 'Ermias and Bethelhem cherished moment 8',
  },
  {
    id: 9,
    src: '/assets/image9 (2).webp',
    alt: 'Ermias and Bethelhem cherished moment 9',
  },
  {
    id: 10,
    src: '/assets/image10.webp',
    alt: 'Ermias and Bethelhem cherished moment 10',
  },
];

const AUTOPLAY_INTERVAL = 5500; // Time per slide in ms
const IDLE_RESUME_DELAY = 4000; // Time to wait after user interaction before resuming autoplay

// Framer Motion slide variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 30 },
      opacity: { duration: 0.45 },
      scale: { duration: 0.45 },
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 30 },
      opacity: { duration: 0.35 },
    },
  }),
};

export default function PhotoGallery({ images = DEFAULT_IMAGES }) {
  const { t } = useTranslation();
  // Start on the first image in the gallery.
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null);

  const idleTimerRef = useRef(null);

  const total = images.length;
  const wrappedIndex = ((currentIndex % total) + total) % total;
  const currentImage = images[wrappedIndex];

  // Slide navigation
  const paginate = useCallback((newDirection) => {
    setPage(([prev]) => [prev + newDirection, newDirection]);
  }, []);

  const goToSlide = useCallback((targetIndex) => {
    setPage(([prev]) => {
      const currentWrapped = ((prev % total) + total) % total;
      if (targetIndex === currentWrapped) return [prev, 0];
      const dir = targetIndex > currentWrapped ? 1 : -1;
      return [prev + (targetIndex - currentWrapped), dir];
    });
  }, [total]);

  // Handle user interaction: temporarily pause autoplay and reset idle countdown
  const registerUserInteraction = useCallback(() => {
    setIsInteracting(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, IDLE_RESUME_DELAY);
  }, []);

  // Is autoplay currently actively ticking?
  const isAutoplayActive = !isHovered && !isInteracting && !activeLightbox;

  // Autoplay ticker
  useEffect(() => {
    if (!isAutoplayActive) return;

    const interval = setInterval(() => {
      paginate(1);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoplayActive, paginate]);

  // Pause on document hidden / tab switch
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsInteracting(true);
      } else {
        registerUserInteraction();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [registerUserInteraction]);

  // Clean up idle timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      registerUserInteraction();
      paginate(-1);
    } else if (e.key === 'ArrowRight') {
      registerUserInteraction();
      paginate(1);
    } else if (e.key === 'Escape' && activeLightbox) {
      setActiveLightbox(null);
    }
  };

  // Drag end gesture handler
  const handleDragEnd = (e, { offset, velocity }) => {
    registerUserInteraction();
    const swipeThreshold = 45;
    const swipeConfidence = Math.abs(offset.x) * velocity.x;

    if (offset.x < -swipeThreshold || swipeConfidence < -200) {
      paginate(1);
    } else if (offset.x > swipeThreshold || swipeConfidence > 200) {
      paginate(-1);
    }
  };

  return (
    <section
      id="gallery"
      aria-label={t('gallery.title', 'Our Cherished Moments')}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative bg-[#F8F9FA] px-4 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-28 text-center outline-none select-none overflow-hidden"
    >
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(220, 226, 235, 0.35) 45%, rgba(248, 249, 250, 0) 75%)',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      <div className="relative z-[40] mx-auto w-full max-w-4xl">
        {/* Section Title & Subtitle with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-script text-3xl sm:text-4xl lg:text-5xl text-gold tracking-wide"
            style={{ textShadow: '0 1px 2px rgba(197, 160, 89, 0.15)' }}
          >
            <span aria-hidden="true" className="text-gold opacity-80">❧&nbsp;</span>
            {t('gallery.title', 'Our Cherished Moments')}
            <span aria-hidden="true" className="text-gold opacity-80">&nbsp;❧</span>
          </h2>

          <p className="mt-2 font-body italic text-sm sm:text-base text-ink/75 max-w-md mx-auto">
            {t('gallery.subtitle', 'A glimpse into our journey of love and devotion')}
          </p>
        </motion.div>

        {/* Main Carousel Viewport with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mt-8 sm:mt-10 mx-auto w-full max-w-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            registerUserInteraction();
          }}
          onTouchStart={() => registerUserInteraction()}
        >
          {/* Main Carousel Viewport Frame */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gold/40">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-neutral-100">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={wrappedIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragStart={() => registerUserInteraction()}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
                >
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt}
                    loading="lazy"
                    onError={(e) => {
                      // Graceful fallback to couple's local wedding photo
                      if (e.target.src !== window.location.origin + '/assets/wedding.avif') {
                        e.target.src = '/assets/wedding.avif';
                      }
                    }}
                    className={`h-full w-full select-none pointer-events-none ${
                      currentImage.fit ? 'object-contain' : 'object-cover'
                    }`}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Fullscreen Magnify Button */}
              <button
                type="button"
                onClick={() => setActiveLightbox(currentImage)}
                aria-label={t('gallery.viewFullscreen', 'View photo in fullscreen')}
                className="absolute top-3 left-3 z-10 p-2 rounded-full bg-parchment/80 hover:bg-parchment text-gold shadow border border-gold/40 hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M3.75 3.75v4.5a.75.75 0 01-1.5 0v-5.25a.75.75 0 01.75-.75h5.25a.75.75 0 010 1.5h-4.5zM16.25 3.75h-4.5a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0v-4.5zM3.75 16.25h4.5a.75.75 0 010 1.5h-5.25a.75.75 0 01-.75-.75v-5.25a.75.75 0 011.5 0v4.5zM16.25 16.25v-4.5a.75.75 0 011.5 0v5.25a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5h4.5z" />
                </svg>
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={() => {
                  registerUserInteraction();
                  paginate(-1);
                }}
                aria-label={t('gallery.prev', 'Previous photo')}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-parchment/85 hover:bg-parchment text-gold shadow-lg border border-gold/50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => {
                  registerUserInteraction();
                  paginate(1);
                }}
                aria-label={t('gallery.next', 'Next photo')}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-parchment/85 hover:bg-parchment text-gold shadow-lg border border-gold/50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls Bar: Centered Dot Navigation */}
          <div className="mt-4 flex items-center justify-center">
            {/* Pill/Dot Indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2" role="tablist">
              {images.map((_, idx) => {
                const isActive = idx === wrappedIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={t('gallery.goToSlide', { index: idx + 1, defaultValue: `Go to photo ${idx + 1}` })}
                    onClick={() => {
                      registerUserInteraction();
                      goToSlide(idx);
                    }}
                    className={`relative transition-all duration-300 rounded-full ${isActive
                      ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-gold border border-goldLight'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gold/40 hover:bg-gold/70'
                      }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="mt-5 flex justify-center items-center gap-2 sm:gap-3 overflow-x-auto py-1 px-2 no-scrollbar">
            {images.map((img, idx) => {
              const isActive = idx === wrappedIndex;
              const isFeatured = !!img.featured;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => {
                    registerUserInteraction();
                    goToSlide(idx);
                  }}
                  aria-label={t('gallery.goToSlide', { index: idx + 1, defaultValue: `Go to photo ${idx + 1}` })}
                  className={`relative rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'w-14 sm:w-16 h-10 sm:h-12 ring-2 ring-gold scale-105 shadow-md'
                      : isFeatured
                      ? 'w-14 sm:w-16 h-10 sm:h-12 ring-2 ring-gold/60 shadow opacity-90 hover:opacity-100 hover:scale-105'
                      : 'w-12 sm:w-14 h-9 sm:h-10 opacity-60 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  <img
                    src={img.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + '/assets/wedding.avif') {
                        e.target.src = '/assets/wedding.avif';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gold/15 border border-gold" />
                  )}
                  {/* Sticky/featured pin badge on image1 */}
                  {isFeatured && !isActive && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-full h-full fill-gold drop-shadow" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border-2 border-gold/60 shadow-2xl bg-white cursor-default"
            >
              <img
                src={activeLightbox.src}
                alt={activeLightbox.alt}
                onError={(e) => {
                  if (e.target.src !== window.location.origin + '/assets/wedding.avif') {
                    e.target.src = '/assets/wedding.avif';
                  }
                }}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                aria-label={t('gallery.closeFullscreen', 'Close fullscreen')}
                className="absolute top-4 right-4 p-2 rounded-full bg-gold text-white hover:bg-goldLight hover:text-royal border border-gold/50 shadow-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Realistic Torn Edge transitioning into Wishes below */}
      <TornEdge color="#FAF8F5" />
    </section>
  );
}
