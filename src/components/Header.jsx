import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      );
      setScrolled(scrollTop > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('wedding_language', lng);
    } catch {
      // ignore storage errors
    }
  };

  const isAm = i18n.language === 'am';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-5 md:px-8 transition-all duration-300 ${
        scrolled ? 'py-1.5 sm:py-2 bg-white/90 backdrop-blur-md shadow-sm border-b border-gold/20' : 'py-2.5 sm:py-4 bg-transparent'
      }`}
    >
      <span className="font-display text-base sm:text-xl md:text-2xl tracking-wide text-royal truncate max-w-[55%]">
        {t('header.brand')}
      </span>

      <div
        role="group"
        aria-label="Language selection"
        className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-gold/40 bg-white/90 p-0.5 sm:p-1 shadow-sm flex-shrink-0"
      >
        <button
          type="button"
          onClick={() => switchLang('en')}
          aria-pressed={!isAm}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            !isAm ? 'bg-royal text-white' : 'text-royal hover:bg-royal/10'
          }`}
        >
          {t('langToggle.en')}
        </button>
        <button
          type="button"
          onClick={() => switchLang('am')}
          aria-pressed={isAm}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium font-ethiopic transition-colors ${
            isAm ? 'bg-royal text-white' : 'text-royal hover:bg-royal/10'
          }`}
        >
          {t('langToggle.am')}
        </button>
      </div>
    </header>
  );
}
