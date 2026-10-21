import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';
import SaveTheDateCalendar from './SaveTheDateCalendar.jsx';

const WEDDING_DATE = new Date('2026-11-07T16:00:00');

function getTimeLeft() {
  const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const { t } = useTranslation();
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: t('countdown.days', 'DAYS') },
    { value: time.hours, label: t('countdown.hours', 'HOURS') },
    { value: time.minutes, label: t('countdown.minutes', 'MINUTES') },
    { value: time.seconds, label: t('countdown.seconds', 'SECONDS') },
  ];

  return (
    <>
      <style>{`
        @keyframes swing {
          0%, 100% {
            transform: rotate(-2.5deg);
          }
          50% {
            transform: rotate(2.5deg);
          }
        }

        @keyframes swing-left {
          0%, 100% {
            transform: rotate(2.5deg);
          }
          50% {
            transform: rotate(-2.5deg);
          }
        }

        .flower-swing-right {
          animation: swing 8s ease-in-out infinite;
          transform-origin: top right;
        }

        .flower-swing-left {
          animation: swing-left 8s ease-in-out infinite;
          transform-origin: bottom left;
        }

        .calendar-transparent-glass {
          position: relative;
          display: block;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          border-radius: 28px;
          overflow: hidden;
          isolation: isolate;

          background: linear-gradient(
            180deg,
            rgba(255, 236, 220, 0.35) 0%,
            rgba(255, 255, 255, 0.10) 50%,
            rgba(255, 236, 220, 0.35) 100%
          );

          backdrop-filter: blur(2px) saturate(115%);
          -webkit-backdrop-filter: blur(2px) saturate(115%);

          border: none;
          outline: none;
          box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      <section
        className="relative -my-[1px] min-h-[840px] sm:min-h-[880px] flex flex-col justify-center px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16 text-center overflow-hidden border-none outline-none"
        aria-label={t('countdown.title')}
      >
        {/* Transition from Welcome into Countdown (pulled 1px past top edge to prevent gap) */}
        <div className="absolute -top-[1px] inset-x-0 z-[48] pointer-events-none leading-[0]">
          <TornEdge flip color="#F8F9FA" />
        </div>

        {/* Background images */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/image7.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-105 blur-[6px] sm:blur-none select-none"
            style={{ objectPosition: '50% center' }}
          />

          <div
            className="absolute inset-x-0 top-[18%] bottom-[6%] sm:inset-0 overflow-hidden"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)',
            }}
          >
            <img
              src="/assets/image7.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover select-none"
              style={{ objectPosition: '50% 55%' }}
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,250,242,0.22) 0%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0.02) 72%, rgba(255,250,242,0.25) 100%)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Top-right flower neatly cornered below top torn edge */}
        <img
          src="/assets/Rightflower.webp"
          alt=""
          aria-hidden="true"
          className="absolute top-7 sm:top-2 right-0 w-[120px] sm:w-[145px] md:w-[165px] h-auto opacity-90 z-[50] flower-swing-right pointer-events-none"
        />

        {/* Bottom-left flower neatly cornered above bottom torn edge */}
        <img
          src="/assets/Leftflower.webp"
          alt=""
          aria-hidden="true"
          className="absolute bottom-6 sm:bottom-4 left-0 w-[120px] sm:w-[145px] md:w-[165px] h-auto opacity-90 z-[50] flower-swing-left pointer-events-none"
        />

        {/* Main content */}
        <div
          className="relative z-[40] mx-auto w-full"
          style={{ maxWidth: '420px' }}
        >
          {/* Countdown title */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mt-2 sm:mt-6 font-script text-3xl sm:text-4xl lg:text-5xl text-[#4A2606] relative z-[40] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
          >
            {t('countdown.title', 'The Celebration Begins In')}
          </motion.h2>

          {/* Countdown boxes */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 sm:mt-6 grid grid-cols-4 gap-2.5 sm:gap-3.5 relative z-[40] px-1"
            role="timer"
            aria-live="polite"
          >
            {units.map((u, idx) => (
              <motion.div
                key={u.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="relative flex flex-col items-center justify-center rounded-2xl py-3 sm:py-3.5 px-2 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(238, 228, 212, 0.78) 0%, rgba(198, 185, 166, 0.65) 100%)',
                  backdropFilter: 'blur(8px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(8px) saturate(140%)',
                  border: 'none',
                  outline: 'none',
                  boxShadow: '0 10px 24px -6px rgba(0, 0, 0, 0.22)',
                }}
              >
                <span className="relative z-10 font-display text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums text-[#4A2606] tracking-wide">
                  {String(u.value).padStart(2, '0')}
                </span>

                <span className="relative z-10 mt-1 text-[0.6rem] sm:text-[0.7rem] uppercase tracking-[0.14em] text-[#4A2606] font-extrabold">
                  {u.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Smaller calendar glass */}
          <div className="mt-4 sm:mt-6 relative z-[40] w-full flex justify-center">
            <div className="calendar-transparent-glass w-[88%] sm:w-[90%]">
              <SaveTheDateCalendar />
            </div>
          </div>

          {/* Wedding date pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 sm:mt-5 mx-auto block w-full max-w-[360px] rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 relative z-[40]"
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 252, 246, 0.94) 0%, rgba(247, 239, 226, 0.90) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: 'none',
              outline: 'none',
              boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.18)',
            }}
          >
            <p className="font-script text-[clamp(1.1rem,4.5vw,1.5rem)] leading-tight text-[#4A2606] font-extrabold tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
              {t('countdown.date', 'Saturday, November 07/2026')}
            </p>
          </motion.div>
        </div>

        {/* Torn edge into the schedule section (pulled 1px past bottom edge to prevent gap) */}
        <div className="absolute -bottom-[1px] inset-x-0 z-[48] pointer-events-none leading-[0]">
          <TornEdge color="#F8F9FA" />
        </div>
      </section>
    </>
  );
}