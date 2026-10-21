import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

export default function Location({
  selectedHome: selectedHomeProp,
  onHomeSelect,
} = {}) {
  const { t } = useTranslation();
  const [internalSelectedHome, setInternalSelectedHome] = useState('bride');

  const homeLocations = {
    bride: {
      label: t('location.bridesHome'),
      mapUrl: 'https://www.google.com/maps?q=9.0387160,38.8754350&output=embed&z=16',
      externalUrl: 'https://maps.google.com/?q=9.0387160,38.8754350',
    },
    groom: {
      label: t('location.groomsHome'),
      mapUrl: 'https://www.google.com/maps?q=9.009731,38.8779169&output=embed&z=16',
      externalUrl: 'https://maps.app.goo.gl/8jN3NZ9zf2YPjwxL7?g_st=atm',
    },
  };
  const selectedHome = selectedHomeProp ?? internalSelectedHome;
  const selectHome = onHomeSelect ?? setInternalSelectedHome;
  const { label: selectedHomeLabel, mapUrl, externalUrl } = homeLocations[selectedHome];

  return (
    <section
      id="location"
      className="relative bg-white px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16 text-center overflow-visible z-[20]"
    >
      <div className="relative z-[40] mx-auto w-full max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="font-script text-2xl sm:text-3xl lg:text-4xl text-gold relative z-[40]"
        >
          {t('location.title')}
        </motion.h2>

        <div
          className="mt-4 flex flex-wrap justify-center gap-3"
          role="group"
          aria-label={t('location.homeLocations')}
        >
          {Object.entries(homeLocations).map(([home, { label }]) => (
            <button
              key={home}
              type="button"
              aria-pressed={selectedHome === home}
              onClick={() => selectHome(home)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 font-body text-sm transition-colors ${selectedHome === home
                  ? 'border-gold bg-gold text-white'
                  : 'border-gold/60 bg-white text-ink hover:bg-gold/10'
                }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v12h14V9M9 21v-7h6v7" />
              </svg>
              {label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 flex items-center justify-center gap-2 text-gold"
          aria-live="polite"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-[#EA4335] shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-display text-base leading-snug sm:text-lg">
            {selectedHomeLabel}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <iframe
            title={selectedHomeLabel}
            src={mapUrl}
            className="relative z-[30] mx-auto mt-4 h-64 w-full max-w-md rounded-2xl border-2 border-gold/60 shadow-md sm:h-72"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="mt-4">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-gold bg-gold/10 hover:bg-gold hover:text-white text-gold font-body text-sm font-medium transition-all duration-300 shadow-sm relative z-[35]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-[#EA4335] shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t('location.openInMaps')}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom TornEdge hanging downward over the next section ── */}
      {/* ── Bottom TornEdge hanging downward over the next section ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 translate-y-[95%] z-[48] pointer-events-none
             shadow-none [filter:none] [&_*]:!shadow-none [&_*]:![filter:none]"
        style={{ filter: 'none', boxShadow: 'none' }}
      >
        <TornEdge color="#ffffff" inset={false} />
      </div>
    </section>
  );
}