import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

// Soft gold bokeh particles matching the overlay in the reference design
const BOKEH_PARTICLES = [
  { top: '6%', left: '42%', size: 20, opacity: 0.22, delay: 0 },
  { top: '8%', left: '78%', size: 15, opacity: 0.25, delay: 1.1 },
  { top: '13%', left: '52%', size: 16, opacity: 0.28, delay: 0.3 },
  { top: '16%', left: '36%', size: 20, opacity: 0.34, delay: 0.8 },
  { top: '19%', left: '86%', size: 19, opacity: 0.28, delay: 0.2 },
  { top: '21%', left: '16%', size: 22, opacity: 0.35, delay: 1.5 },
  { top: '22%', left: '46%', size: 14, opacity: 0.3, delay: 0.5 },
  { top: '24%', left: '89%', size: 16, opacity: 0.3, delay: 0.9 },
  { top: '39%', left: '14%', size: 18, opacity: 0.32, delay: 1.3 },
  { top: '43%', left: '41%', size: 21, opacity: 0.25, delay: 0.4 },
  { top: '55%', left: '14%', size: 19, opacity: 0.18, delay: 0.7 },
  { top: '55%', left: '84%', size: 20, opacity: 0.18, delay: 1.2 },
  { top: '61%', left: '24%', size: 14, opacity: 0.2, delay: 0.2 },
  { top: '64%', left: '54%', size: 24, opacity: 0.16, delay: 0.9 },
  { top: '65%', left: '21%', size: 14, opacity: 0.18, delay: 1.6 },
  { top: '66%', left: '86%', size: 15, opacity: 0.18, delay: 0.4 },
  { top: '80%', left: '38%', size: 19, opacity: 0.15, delay: 1.1 },
  { top: '82%', left: '81%', size: 15, opacity: 0.15, delay: 0.6 },
  { top: '84%', left: '21%', size: 16, opacity: 0.14, delay: 1.4 },
  { top: '85%', left: '51%', size: 18, opacity: 0.15, delay: 0.3 },
];

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      aria-label={t('hero.eyebrow')}
      className="relative flex flex-col justify-end items-center min-h-screen px-4 sm:px-6 pb-16 sm:pb-20 bg-white overflow-hidden select-none"
    >
      {/* ── Background Hero Image ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        {/* Ambient blurred backdrop for widescreen/PC displays */}
        <img
          src="/assets/image1.webp"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-60 brightness-75 select-none"
        />

        {/* Main sharp couple photo fills the hero on both mobile and desktop */}
        <img
          src="/assets/image1.webp"
          alt="Ermias & Bethelhem"
          className="w-full h-full object-cover object-[50%_12%] md:object-center select-none relative z-[1]"
        />

        {/* Top vignette to keep status bar / header clean while faces stay bright */}
        <div
          className="absolute inset-x-0 top-0 h-28 z-[2]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Lower vignette: darkens the lower half behind clasped hands so typography pops without any card */}
        <div
          className="absolute inset-x-0 bottom-0 top-[40%] z-[2]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 25%, rgba(0,0,0,0.62) 65%, rgba(0,0,0,0.85) 100%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* ── Floating gold bokeh particles ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[20] overflow-visible"
      >
        {BOKEH_PARTICLES.map((p, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: p.opacity, y: 0 }}
            animate={{
              opacity: [p.opacity * 0.75, p.opacity * 1.15, p.opacity * 0.75],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 4.5,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                'radial-gradient(circle, rgba(206,168,97,0.85) 0%, rgba(196,154,78,0.45) 60%, rgba(196,154,78,0) 100%)',
            }}
          />
        ))}
      </div>

      {/* ── Typography sitting cleanly in lower area (No rectangle box, faces completely uncovered) ── */}
      <div
        className="relative z-[30] w-full flex flex-col items-center text-center max-w-lg mt-auto"
      >
        {/* WEDDING DAY */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-xs sm:text-[13px] font-bold tracking-[0.3em] uppercase text-[#F3E5C8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {t('hero.eyebrow')}
        </motion.p>

        {/* DATE */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-1 font-display italic text-sm sm:text-base tracking-[0.08em] text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {t('hero.date')}
        </motion.p>

        {/* COUPLE NAMES - Radiant Gold, No Background */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-2 sm:mt-3 font-script text-[46px] sm:text-6xl md:text-7xl leading-[1.14] text-[#FDE3A2] whitespace-pre-line"
          style={{
            textShadow:
              '0 2px 10px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.85), 0 0 35px rgba(212,175,55,0.4)',
          }}
        >
          {t('hero.names')}
        </motion.h1>

        {/* SCROLL DOWN BUTTON */}
        <motion.button
          type="button"
          onClick={() =>
            document
              .getElementById('welcome')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className="mt-3 sm:mt-4 inline-flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span className="font-script text-lg sm:text-xl text-[#F5ECD7]">
            {t('hero.scrollDown')}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#F5ECD7]"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </motion.button>

        {/* ── BIBLE VERSE - Highly Visible, No Background ── */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-4 sm:mt-5 max-w-md text-center font-body italic text-[14px] sm:text-[15.5px] leading-relaxed text-white/95 whitespace-pre-line px-2 font-medium"
          style={{
            textShadow:
              '0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95), 0 0 15px rgba(0,0,0,0.8)',
          }}
        >
          {t('hero.verse')}
        </motion.p>
      </div>

      {/* ── Transition into Welcome with TornEdge ── */}
      <TornEdge color="#F8F9FA" />
    </section>
  );
}