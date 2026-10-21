import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';
import SectionFlowers from './SectionFlowers.jsx';

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <section id="welcome" className="relative bg-[#F8F9FA] px-4 sm:px-6 md:px-16 lg:px-24 pt-10 sm:pt-14 pb-6 sm:pb-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-xl relative z-[40]"
      >
        <h2 className="mt-2 font-script text-3xl sm:text-4xl text-gold leading-snug">
          {t('welcome.titleLine1')}
          <br />
          {t('welcome.titleLine2')}
          <br />
          {t('welcome.titleLine3')}
        </h2>

        <p className="mt-4 sm:mt-5 font-display text-base sm:text-lg text-ink/90">{t('welcome.greeting')}</p>
        <p className="mt-2 font-body text-sm sm:text-base text-ink/80">{t('welcome.body')}</p>

        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 sm:mt-7 mx-auto max-w-sm rounded-xl border border-gold/40 bg-white/95 px-5 sm:px-6 py-3.5 sm:py-4 shadow-sm"
        >
          <p className="font-body italic text-sm sm:text-base text-ink/90">"{t('welcome.verseText')}"</p>
          <cite className="mt-2.5 block font-display text-xs sm:text-sm tracking-wide text-royal/80 not-italic">
            — {t('welcome.verseRef')}
          </cite>
        </motion.blockquote>
      </motion.div>
      {/* <SectionFlowers size={200} opacity={0.9} zIndex={20} customLayout={{ topRight: true }} topOffset="1.9rem" pull={26} /> */}

      {/* Countdown section handles the top torn edge with flip */}
    </section>
  );
}
