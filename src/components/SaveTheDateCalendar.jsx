import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function SaveTheDateCalendar({ className = '' }) {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  // Controlled purely by language:
  // Amharic -> Tikimt 28 (ጥቅምት 2019)
  // English -> Nov 07 (November 2026)
  const monthTitle = isAmharic ? 'ጥቅምት 2019' : 'November 2026';
  const saveTheDateText = isAmharic ? 'ቀኑን ያስቀምጡ' : 'Save the Date';

  const weekdays = isAmharic
    ? ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const targetDay = isAmharic ? 28 : 7;
  const totalDays = 30;
  // Starting day index: both Nov 1, 2026 and Tikimt 1, 2019 start on Sunday (index 0)
  const startDayOffset = 0;

  const days = [];
  for (let i = 0; i < startDayOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push(d);
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Glassmorphic Calendar Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-[32px] p-6 sm:p-8 text-center select-none overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(16px) saturate(190%)',
          WebkitBackdropFilter: 'blur(16px) saturate(190%)',
          border: 'none',
          outline: 'none',
          boxShadow:
            '0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(197, 160, 89, 0.2)'
        }}
      >
        {/* Subtle glass reflection gradient at top edge */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none rounded-t-[32px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.02) 85%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* Header: Month & Year */}
        <div className="relative z-10">
          <h3 className="font-display text-2xl sm:text-3xl text-[#1D1711] font-bold tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]">
            {monthTitle}
          </h3>
          <p className="mt-1 font-script text-2xl sm:text-3xl text-[#78480C] tracking-wide font-extrabold drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]">
            {saveTheDateText}
          </p>
        </div>

        {/* Weekday Labels */}
        <div className="relative z-10 grid grid-cols-7 gap-1 mt-6 sm:mt-7 text-center">
          {weekdays.map((day) => (
            <div
              key={day}
              className="font-sans text-[11px] sm:text-xs font-extrabold text-[#32271C] tracking-wider uppercase py-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="relative z-10 grid grid-cols-7 gap-y-2 gap-x-1 mt-2 text-center items-center">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;
            }

            const isWeddingDay = day === targetDay;

            if (isWeddingDay) {
              return (
                <div
                  key={`day-${day}`}
                  className="relative flex items-center justify-center h-10 sm:h-11"
                >
                  {/* Golden Love (Heart) highlight */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      filter: [
                        'drop-shadow(0 4px 10px rgba(212, 175, 55, 0.45))',
                        'drop-shadow(0 6px 14px rgba(212, 175, 55, 0.65))',
                        'drop-shadow(0 4px 10px rgba(212, 175, 55, 0.45))'
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.8,
                      ease: 'easeInOut'
                    }}
                    className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 cursor-pointer group"
                    title={isAmharic ? 'የሰርጋችን ቀን! 💍' : 'Our Wedding Day! 💍'}
                  >
                    {/* Golden Heart SVG */}
                    <svg
                      viewBox="0 0 44 40"
                      className="w-full h-full"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="goldHeartGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#FFF2BF" />
                          <stop offset="28%" stopColor="#E5C358" />
                          <stop offset="68%" stopColor="#C5A059" />
                          <stop offset="100%" stopColor="#8F6A1E" />
                        </linearGradient>

                        <radialGradient
                          id="goldHeartRadial"
                          cx="35%"
                          cy="30%"
                          r="60%"
                        >
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Main Golden Heart */}
                      <path
                        d="M22 36 C22 36 4.5 23 4.5 12 C4.5 6 9 2 14.5 2 C18 2 20.8 3.8 22 6.5 C23.2 3.8 26 2 29.5 2 C35 2 39.5 6 39.5 12 C39.5 23 22 36 22 36 Z"
                        fill="url(#goldHeartGrad)"
                        stroke="#ECC440"
                        strokeWidth="1"
                      />

                      {/* Gloss highlight arc on top left lobe */}
                      <path
                        d="M22 35 C22 35 6 22.5 6 12 C6 7.5 9.5 4 14.5 4"
                        fill="none"
                        stroke="url(#goldHeartRadial)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </svg>

                    {/* Date Number centered inside the Golden Heart */}
                    <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white text-base sm:text-lg drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] -mt-0.5">
                      {day}
                    </span>

                    {/* Cute Red Heart Accent Badge on top right, exactly like in the reference photo */}
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], rotate: [0, 6, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut'
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" className="w-full h-full text-[#E03B52] fill-current drop-shadow-sm">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>
              );
            }

            return (
              <div
                key={`day-${day}`}
                className="flex items-center justify-center h-10 sm:h-11 font-display text-sm sm:text-base font-bold text-[#1C160F] hover:text-[#9A7023] transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Golden bottom accent line */}
        <div className="relative z-10 mt-6 sm:mt-7 flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <span className="text-gold text-xs">✨ 💍 ✨</span>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
