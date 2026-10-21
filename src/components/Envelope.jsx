import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Self-contained translation hook fallback so the component compiles cleanly in standalone environments
function useTranslation() {
  return {
    t: (key, defaultText) => {
      const dictionary = {
        'envelope.tapToOpen': 'Tap to open',
      };
      return dictionary[key] || defaultText || key;
    },
  };
}

const WEDDING_DATE = '26 . 07 . 2026';

export default function Envelope({ onOpening, onOpen }) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);

  useEffect(() => {
    if (!opening) {
      setFlapBehind(false);
      return;
    }

    // Keep the flap layer in sync as it moves behind the letter.
    const flapTimer = window.setTimeout(() => {
      setFlapBehind(true);
    }, 750);

    // Match the overlay fade so the hero appears as the envelope finishes opening.
    const openTimer = window.setTimeout(() => {
      if (onOpen) {
        onOpen();
      } else {
        window.setTimeout(() => {
          setOpening(false);
        }, 1500);
      }
    }, 2000);

    return () => {
      window.clearTimeout(flapTimer);
      window.clearTimeout(openTimer);
    };
  }, [opening, onOpen]);

  const handleOpen = () => {
    if (opening) return;
    if (onOpening) onOpening();
    setOpening(true);
  };

  const tapToOpenText = t ? t('envelope.tapToOpen', 'Tap to open') : 'Tap to open';

  return (
    <AnimatePresence>
      <motion.main
        key="wedding-envelope-overlay"
        initial={{ opacity: 1 }}
        animate={
          opening
            ? { opacity: [1, 1, 0], scale: [1, 1.01, 1.03] }
            : { opacity: 1, scale: 1 }
        }
        transition={
          opening
            ? { duration: 2, times: [0, 0.72, 1], ease: [0.42, 0, 0.58, 1] }
            : undefined
        }
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-3 py-5 sm:px-6 sm:py-8"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, #FAF7F2 0%, #F4EFE6 62%, #E8DFD1 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
          }}
        />

        <motion.button
          type="button"
          onClick={handleOpen}
          disabled={opening}
          aria-label={tapToOpenText}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="wedding-envelope-button group relative block cursor-pointer rounded-[22px] text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-4 disabled:cursor-default"
          style={{
            width: 'min(88vw, 900px)',
            maxHeight: '82svh',
            aspectRatio: '1.52 / 1',
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Desktop / tablet 3D envelope */}
          <EnvelopeScene
            id="desktop"
            mobile={false}
            opening={opening}
            flapBehind={flapBehind}
            onFlapCrossHalfway={() => setFlapBehind(true)}
            formattedDate={WEDDING_DATE}
            tapLabel={tapToOpenText}
          />

          {/* Mobile 3D envelope */}
          <EnvelopeScene
            id="mobile"
            mobile={true}
            opening={opening}
            flapBehind={flapBehind}
            onFlapCrossHalfway={() => setFlapBehind(true)}
            formattedDate={WEDDING_DATE}
            tapLabel={tapToOpenText}
          />

          <style>{`
            @media (max-width: 639px) {
              .wedding-envelope-button {
                width: min(86vw, 390px) !important;
                height: min(74svh, 660px) !important;
                max-height: 74svh !important;
                aspect-ratio: auto !important;
              }
            }
          `}</style>
        </motion.button>
      </motion.main>
    </AnimatePresence>
  );
}

function EnvelopeScene({
  id,
  mobile,
  opening,
  flapBehind,
  onFlapCrossHalfway,
  formattedDate,
  tapLabel,
}) {
  const flapZIndex = flapBehind ? 5 : 30;

  return (
    <div
      className={
        mobile
          ? 'absolute inset-0 block rounded-[22px] sm:hidden'
          : 'absolute inset-0 hidden rounded-[24px] sm:block'
      }
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* =====================================================================
          LEVEL 0 (z-0): Back Envelope Inner Wall & Background Pocket
      ===================================================================== */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          background: 'linear-gradient(160deg, #F5EFE6 0%, #EBE3D5 55%, #E3D9C6 100%)',
          boxShadow: mobile
            ? '0 28px 68px rgba(70,52,29,0.20), 0 9px 24px rgba(177,139,68,0.13), inset 0 2px 18px rgba(70,52,29,0.12)'
            : '0 34px 80px rgba(70,52,29,0.18), 0 10px 28px rgba(177,139,68,0.12), inset 0 2px 22px rgba(70,52,29,0.12)',
        }}
      >
        <PaperGrain id={`${id}-back`} opacity="0.18" />
        <div
          className="absolute inset-x-3 top-3 bottom-3 rounded-[18px]"
          style={{
            boxShadow: 'inset 0 10px 28px rgba(65, 45, 20, 0.14)',
            border: '1px solid rgba(184, 146, 70, 0.25)',
          }}
        />
      </div>

      {/* =====================================================================
          LEVEL 10 (z-10): Invitation Card / Letter (Tucked Inside Pocket)
      ===================================================================== */}
      <motion.div
        initial={{ y: '0%' }}
        animate={
          opening
            ? { y: mobile ? '-72%' : '-78%' }
            : { y: '0%' }
        }
        transition={{
          delay: opening ? 0.3 : 0,
          duration: 1.4,
          ease: [0.42, 0, 0.58, 1],
        }}
        className="pointer-events-none absolute inset-x-[6%] top-[8%] bottom-[6%] z-10 flex flex-col items-center justify-between overflow-hidden rounded-[18px] px-5 py-6 sm:inset-x-[7%] sm:top-[9%] sm:bottom-[6%] sm:px-10 sm:py-8"
        style={{
          background: 'linear-gradient(135deg, #FAF7F2 0%, #F4EFE6 58%, #FAF7F2 100%)',
          boxShadow:
            '0 -8px 28px rgba(62, 43, 19, 0.12), 0 12px 32px rgba(62, 43, 19, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(226, 200, 137, 0.55)',
        }}
      >
        <PaperGrain id={`${id}-card`} opacity="0.15" />
        <CardGoldBorders id={`${id}-card-border`} mobile={mobile} />

        <div className="relative z-10 flex flex-col items-center pt-1 sm:pt-2">
          <div className="flex items-center gap-2 text-[#B89246]">
            <span
              className="h-px w-8 sm:w-14"
              style={{ background: 'linear-gradient(90deg, transparent, #B89246)' }}
            />
            <span className="text-[10px] text-[#B89246]">✦</span>
            <span
              className="h-px w-8 sm:w-14"
              style={{ background: 'linear-gradient(90deg, #B89246, transparent)' }}
            />
          </div>
          <span
            className="mt-2 text-[9px] uppercase tracking-[0.32em] text-[#9E7A36] sm:text-[11px]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Wedding Invitation
          </span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center text-center">
          <div
            className="text-[36px] font-normal tracking-[0.22em] text-[#8F6824] sm:text-[54px]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.95)',
            }}
          >
            E &amp; B
          </div>

          <div className="my-2 flex items-center gap-2.5 sm:my-3">
            <span
              className="h-px w-10 sm:w-16"
              style={{ background: 'linear-gradient(90deg, transparent, #E2C889, #B89246)' }}
            />
            <span className="text-[11px] text-[#B89246]">❧</span>
            <span
              className="h-px w-10 sm:w-16"
              style={{ background: 'linear-gradient(90deg, #B89246, #E2C889, transparent)' }}
            />
          </div>

          <div
            className="whitespace-nowrap text-[13px] tracking-[0.22em] text-[#9D762E] sm:text-[18px] sm:tracking-[0.26em]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.95)',
            }}
          >
            {formattedDate}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 pb-1 text-[#B89246]">
          <span
            className="h-px w-8 sm:w-14"
            style={{ background: 'linear-gradient(90deg, transparent, #B89246)' }}
          />
          <span className="text-[10px]">✦</span>
          <span
            className="h-px w-8 sm:w-14"
            style={{ background: 'linear-gradient(90deg, #B89246, transparent)' }}
          />
        </div>
      </motion.div>

      {/* =====================================================================
          LEVEL 20 (z-20): Front Bottom Envelope Pocket
      ===================================================================== */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
        style={{
          boxShadow:
            'inset 0 12px 24px -8px rgba(58, 40, 16, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.92)',
        }}
      >
        <FrontPocketArtwork id={id} mobile={mobile} />
        <CornerLeaves id={id} mobile={mobile} />
        <InvitationText formattedDate={formattedDate} mobile={mobile} />
        <TapLabel>{tapLabel}</TapLabel>
      </div>

      {/* =====================================================================
          LEVEL 30 -> 5 (z-30 initially, switches to z-5 at -90deg): Top Flap
      ===================================================================== */}
      <motion.div
        initial={{ rotateX: 0 }}
        animate={opening ? { rotateX: -180 } : { rotateX: 0 }}
        transition={{
          delay: opening ? 0.15 : 0,
          duration: 1.25,
          ease: [0.42, 0, 0.58, 1],
        }}
        onUpdate={(latest) => {
          if (typeof latest.rotateX === 'number' && latest.rotateX <= -90 && !flapBehind) {
            onFlapCrossHalfway();
          }
        }}
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: flapZIndex,
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08))',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <Flap id={id} mobile={mobile} />
          <Monogram id={id} mobile={mobile} />
        </div>

        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <FlapBackside id={id} mobile={mobile} />
        </div>
      </motion.div>

      {/* =====================================================================
          LEVEL 40 (z-40): Wax Seal / Monogram Button
      ===================================================================== */}
      <WaxSeal
        opening={opening}
        mobile={mobile}
        size={mobile ? 'clamp(70px, 20vw, 94px)' : 'clamp(76px, 10vw, 112px)'}
      />
    </div>
  );
}

function PaperGrain({ id, opacity = '0.18' }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
      aria-hidden="true"
    >
      <filter id={`${id}-paper-grain`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="4"
          seed="12"
        />
        <feColorMatrix type="saturate" values="0.05" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id}-paper-grain)`} />
    </svg>
  );
}

function CardGoldBorders({ id, mobile }) {
  return (
    <svg
      viewBox={mobile ? '0 0 340 560' : '0 0 780 480'}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C889" />
          <stop offset="50%" stopColor="#C9A55A" />
          <stop offset="100%" stopColor="#B89246" />
        </linearGradient>
      </defs>
      {mobile ? (
        <>
          <rect
            x="10"
            y="10"
            width="320"
            height="540"
            rx="12"
            fill="none"
            stroke={`url(#${id}-foil)`}
            strokeWidth="1.2"
            opacity="0.85"
          />
          <rect
            x="15"
            y="15"
            width="310"
            height="530"
            rx="9"
            fill="none"
            stroke={`url(#${id}-foil)`}
            strokeWidth="0.7"
            opacity="0.65"
          />
        </>
      ) : (
        <>
          <rect
            x="14"
            y="14"
            width="752"
            height="452"
            rx="14"
            fill="none"
            stroke={`url(#${id}-foil)`}
            strokeWidth="1.3"
            opacity="0.85"
          />
          <rect
            x="20"
            y="20"
            width="740"
            height="440"
            rx="10"
            fill="none"
            stroke={`url(#${id}-foil)`}
            strokeWidth="0.75"
            opacity="0.65"
          />
        </>
      )}
    </svg>
  );
}

function FrontPocketArtwork({ id, mobile }) {
  return (
    <svg
      viewBox={mobile ? '0 0 390 700' : '0 0 900 592'}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-pocket-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="52%" stopColor="#F4EFE6" />
          <stop offset="100%" stopColor="#FAF7F2" />
        </linearGradient>
        <linearGradient id={`${id}-side-paper`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F7F3EB" />
          <stop offset="50%" stopColor="#F4EFE6" />
          <stop offset="100%" stopColor="#F7F3EB" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C889" />
          <stop offset="50%" stopColor="#CCA862" />
          <stop offset="100%" stopColor="#B89246" />
        </linearGradient>
        <filter
          id={`${id}-pocket-inset`}
          x="-10%"
          y="-15%"
          width="120%"
          height="130%"
        >
          <feDropShadow
            dx="0"
            dy="-4"
            stdDeviation="6"
            floodColor="#3e2b13"
            floodOpacity="0.10"
          />
        </filter>
      </defs>

      {mobile ? (
        <>
          <path
            d="M0 150 L195 360 L0 700 Z"
            fill={`url(#${id}-side-paper)`}
            stroke="#E7DECD"
            strokeWidth="1"
          />
          <path
            d="M390 150 L195 360 L390 700 Z"
            fill={`url(#${id}-side-paper)`}
            stroke="#E7DECD"
            strokeWidth="1"
          />
          <g filter={`url(#${id}-pocket-inset)`}>
            <path
              d="M0 700 L195 342 L390 700 Z"
              fill={`url(#${id}-pocket-paper)`}
              stroke="#E7DECD"
              strokeWidth="1.1"
            />
            <path
              d="M0 205 L195 352 L390 205 L390 700 L0 700 Z"
              fill={`url(#${id}-pocket-paper)`}
            />
          </g>
          <PaperGrain id={`${id}-mob-pocket`} opacity="0.14" />
          <rect
            x="12"
            y="12"
            width="366"
            height="676"
            rx="18"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="1.4"
            opacity="0.78"
          />
          <rect
            x="18"
            y="18"
            width="354"
            height="664"
            rx="15"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="0.8"
            opacity="0.62"
          />
          <path
            d="M16 682 L195 352 L374 682"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="1.2"
            opacity="0.52"
          />
          <path
            d="M20 679 L195 357 L370 679"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            opacity="0.85"
          />
        </>
      ) : (
        <>
          <path
            d="M0 118 L450 350 L0 592 Z"
            fill={`url(#${id}-side-paper)`}
            stroke="#E7DECD"
            strokeWidth="1"
          />
          <path
            d="M900 118 L450 350 L900 592 Z"
            fill={`url(#${id}-side-paper)`}
            stroke="#E7DECD"
            strokeWidth="1"
          />
          <g filter={`url(#${id}-pocket-inset)`}>
            <path
              d="M0 142 L450 356 L900 142 L900 592 L0 592 Z"
              fill={`url(#${id}-pocket-paper)`}
              stroke="#E7DECD"
              strokeWidth="1.1"
            />
          </g>
          <PaperGrain id={`${id}-desk-pocket`} opacity="0.14" />
          <rect
            x="18"
            y="18"
            width="864"
            height="556"
            rx="24"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="1.5"
            opacity="0.78"
          />
          <rect
            x="24"
            y="24"
            width="852"
            height="544"
            rx="20"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="0.8"
            opacity="0.62"
          />
          <path
            d="M24 568 L450 300 L876 568"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="1.2"
            opacity="0.52"
          />
          <path
            d="M29 564 L450 305 L871 564"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            opacity="0.85"
          />
        </>
      )}
    </svg>
  );
}

function Flap({ id, mobile = false }) {
  return (
    <svg
      viewBox={mobile ? '0 0 390 700' : '0 0 900 592'}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-flap-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#F4EFE6" />
        </linearGradient>
        <linearGradient id={`${id}-flap-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C889" />
          <stop offset="55%" stopColor="#C7A15C" />
          <stop offset="100%" stopColor="#B89246" />
        </linearGradient>
        <filter
          id={`${id}-flap-shadow`}
          x="-15%"
          y="-10%"
          width="130%"
          height="135%"
        >
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="7.5"
            floodColor="#000000"
            floodOpacity="0.08"
          />
        </filter>
      </defs>
      {mobile ? (
        <g filter={`url(#${id}-flap-shadow)`}>
          <path
            d="M12 12 H378 V172 Q378 194 358 211 L195 355 L32 211 Q12 194 12 172 Z"
            fill={`url(#${id}-flap-paper)`}
            stroke="#E7DECD"
            strokeWidth="1.1"
          />
          <path
            d="M18 18 H372 V171 Q372 190 353 206 L195 346 L37 206 Q18 190 18 171 Z"
            fill="none"
            stroke={`url(#${id}-flap-gold)`}
            strokeWidth="1.5"
            opacity="0.82"
          />
          <path
            d="M24 24 H366 V169 Q366 187 349 201 L195 338 L41 201 Q24 187 24 169 Z"
            fill="none"
            stroke={`url(#${id}-flap-gold)`}
            strokeWidth="0.8"
            opacity="0.75"
          />
        </g>
      ) : (
        <g filter={`url(#${id}-flap-shadow)`}>
          <path
            d="M18 18 H882 V118 Q882 139 863 153 L450 366 L37 153 Q18 139 18 118 Z"
            fill={`url(#${id}-flap-paper)`}
            stroke="#E7DECD"
            strokeWidth="1.1"
          />
          <path
            d="M24 24 H876 V117 Q876 135 858 148 L450 357 L42 148 Q24 135 24 117 Z"
            fill="none"
            stroke={`url(#${id}-flap-gold)`}
            strokeWidth="1.5"
            opacity="0.82"
          />
          <path
            d="M30 30 H870 V115 Q870 131 853 143 L450 350 L47 143 Q30 131 30 115 Z"
            fill="none"
            stroke={`url(#${id}-flap-gold)`}
            strokeWidth="0.8"
            opacity="0.75"
          />
        </g>
      )}
    </svg>
  );
}

function FlapBackside({ id, mobile = false }) {
  return (
    <svg
      viewBox={mobile ? '0 0 390 700' : '0 0 900 592'}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-flap-back-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4EFE6" />
          <stop offset="100%" stopColor="#EAE1D3" />
        </linearGradient>
        <linearGradient id={`${id}-flap-back-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C889" />
          <stop offset="100%" stopColor="#B89246" />
        </linearGradient>
      </defs>
      {mobile ? (
        <g>
          <path
            d="M12 12 H378 V172 Q378 194 358 211 L195 355 L32 211 Q12 194 12 172 Z"
            fill={`url(#${id}-flap-back-paper)`}
            stroke="#DFD5C3"
            strokeWidth="1.1"
          />
          <path
            d="M20 20 H370 V170 Q370 188 351 204 L195 342 L39 204 Q20 188 20 170 Z"
            fill="none"
            stroke={`url(#${id}-flap-back-gold)`}
            strokeWidth="1.1"
            opacity="0.55"
          />
        </g>
      ) : (
        <g>
          <path
            d="M18 18 H882 V118 Q882 139 863 153 L450 366 L37 153 Q18 139 18 118 Z"
            fill={`url(#${id}-flap-back-paper)`}
            stroke="#DFD5C3"
            strokeWidth="1.1"
          />
          <path
            d="M26 26 H874 V116 Q874 133 856 146 L450 353 L44 146 Q26 133 26 116 Z"
            fill="none"
            stroke={`url(#${id}-flap-back-gold)`}
            strokeWidth="1.2"
            opacity="0.55"
          />
        </g>
      )}
    </svg>
  );
}

function Monogram({ id, mobile = false }) {
  return (
    <div
      className="pointer-events-none absolute flex flex-col items-center justify-center"
      style={
        mobile
          ? { top: '17%', left: '50%', transform: 'translate(-50%, -50%)' }
          : { top: '24%', left: '50%', transform: 'translate(-50%, -50%)' }
      }
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: mobile ? 'clamp(76px, 22vw, 94px)' : 'clamp(90px, 11vw, 122px)',
          height: mobile ? 'clamp(104px, 29vw, 126px)' : 'clamp(116px, 13vw, 142px)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}
      >
        <svg
          viewBox="0 0 120 144"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${id}-monogram-gold`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E2C889" />
              <stop offset="50%" stopColor="#C8A25A" />
              <stop offset="100%" stopColor="#B89246" />
            </linearGradient>
          </defs>
          <ellipse
            cx="60"
            cy="72"
            rx="56"
            ry="68"
            fill="none"
            stroke={`url(#${id}-monogram-gold)`}
            strokeWidth="1.4"
          />
          <ellipse
            cx="60"
            cy="72"
            rx="52"
            ry="64"
            fill="none"
            stroke={`url(#${id}-monogram-gold)`}
            strokeWidth="0.6"
            opacity="0.65"
          />
        </svg>

        <span className="absolute -top-[9px] text-[12px] text-[#B89246]">✦</span>
        <span className="absolute -bottom-[9px] text-[12px] text-[#B89246]">✦</span>

        {/* Enhanced solid monogram styling with clean metallic gradient and distinct text shadow */}
        <div
          className="flex flex-col items-center font-normal tracking-[0.06em]"
          style={{
            fontSize: mobile ? '38px' : '46px',
            lineHeight: '0.95',
            background: 'linear-gradient(180deg, #FDF3D8 0%, #D8B56D 45%, #9E742B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 1px 1px rgba(62, 43, 19, 0.45))',
          }}
        >
          <span>E</span>
          <span>B</span>
        </div>

        <span className="absolute left-[9px] top-[24%] text-[10px] text-[#B89246]">❧</span>
        <span className="absolute right-[9px] top-[24%] -scale-x-100 text-[10px] text-[#B89246]">
          ❧
        </span>
      </div>
    </div>
  );
}

function CornerLeaves({ id, mobile = false }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 900 592"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-corner-leaf-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C889" />
          <stop offset="55%" stopColor="#C8A25B" />
          <stop offset="100%" stopColor="#B89246" />
        </linearGradient>
      </defs>
      <g
        fill={`url(#${id}-corner-leaf-gold)`}
        stroke="#B89246"
        strokeWidth="0.45"
        opacity={mobile ? '0.88' : '0.92'}
      >
        <g transform="translate(54 535) rotate(-35)">
          <path d="M0 0 Q18 -28 34 -55" fill="none" stroke="#B89246" strokeWidth="1.2" />
          <ellipse cx="10" cy="-17" rx="4" ry="10" transform="rotate(-48 10 -17)" />
          <ellipse cx="21" cy="-31" rx="4" ry="10" transform="rotate(38 21 -31)" />
          <ellipse cx="23" cy="-39" rx="3.5" ry="8" transform="rotate(-48 23 -39)" />
          <ellipse cx="31" cy="-52" rx="3.5" ry="8" transform="rotate(38 31 -52)" />
          <ellipse cx="2" cy="-7" rx="3.5" ry="8" transform="rotate(38 2 -7)" />
        </g>
        <g transform="translate(846 535) scale(-1 1) rotate(-35)">
          <path d="M0 0 Q18 -28 34 -55" fill="none" stroke="#B89246" strokeWidth="1.2" />
          <ellipse cx="10" cy="-17" rx="4" ry="10" transform="rotate(-48 10 -17)" />
          <ellipse cx="21" cy="-31" rx="4" ry="10" transform="rotate(38 21 -31)" />
          <ellipse cx="23" cy="-39" rx="3.5" ry="8" transform="rotate(-48 23 -39)" />
          <ellipse cx="31" cy="-52" rx="3.5" ry="8" transform="rotate(38 31 -52)" />
          <ellipse cx="2" cy="-7" rx="3.5" ry="8" transform="rotate(38 2 -7)" />
        </g>
      </g>
    </svg>
  );
}

function InvitationText({ formattedDate, mobile = false }) {
  return (
    <div
      className="pointer-events-none absolute flex flex-col items-center text-center"
      style={
        mobile
          ? { left: '50%', top: '76%', transform: 'translate(-50%, -50%)', width: '88%' }
          : { left: '50%', top: '82%', transform: 'translate(-50%, -50%)', width: '70%' }
      }
    >
      <div className="mb-2 flex items-center gap-2 text-[#B89246]">
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: 'linear-gradient(90deg, transparent, #E2C889, #B89246)' }}
        />
        <span className="text-[10px]">✦</span>
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: 'linear-gradient(90deg, #B89246, #E2C889, transparent)' }}
        />
      </div>
      <div
        className="text-[26px] tracking-[0.22em] text-[#9D762E] sm:text-[32px]"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          textShadow: '0 1px 0 #FFFFFF',
        }}
      >
        E &amp; B
      </div>
      <div
        className="mt-1 whitespace-nowrap text-[11px] tracking-[0.18em] text-[#A78037] sm:text-[15px] sm:tracking-[0.22em]"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          textShadow: '0 1px 0 #FFFFFF',
        }}
      >
        {formattedDate}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[#B89246]">
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: 'linear-gradient(90deg, transparent, #E2C889, #B89246)' }}
        />
        <span className="text-[10px]">✦</span>
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: 'linear-gradient(90deg, #B89246, #E2C889, transparent)' }}
        />
      </div>
    </div>
  );
}

function WaxSeal({ opening, size, mobile = false }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: mobile ? '51%' : '62%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        className="relative h-full w-full rounded-full"
        initial={{ opacity: 1, scale: 1 }}
        animate={
          opening
            ? {
                opacity: [1, 1, 0.9, 0],
                scale: [1, 0.78, 1.12, 0.72],
                rotate: [0, -5, 3, 0],
              }
            : { opacity: 1, scale: [1, 1.08, 1], y: [0, -3, 0] }
        }
        transition={
          opening
            ? {
                duration: 1.05,
                times: [0, 0.16, 0.42, 1],
                ease: ['easeIn', 'easeOut', 'easeInOut'],
              }
            : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
        }
        style={{
          filter: 'drop-shadow(0 9px 12px rgba(65, 42, 12, 0.28))',
        }}
      >
        {!imgError ? (
          <img
            src="/assets/wax-seal.webp"
            alt=""
            draggable="false"
            onError={() => setImgError(true)}
            className="h-full w-full rounded-full select-none"
            style={{
              display: 'block',
              objectFit: 'cover',
              objectPosition: 'center',
              userSelect: 'none',
            }}
          />
        ) : (
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full rounded-full select-none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="wax-seal-grad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#EAD29C" />
                <stop offset="48%" stopColor="#C89F53" />
                <stop offset="85%" stopColor="#9C732B" />
                <stop offset="100%" stopColor="#7C581B" />
              </radialGradient>
              <linearGradient id="wax-rim-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2C889" />
                <stop offset="100%" stopColor="#B89246" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#wax-seal-grad)" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="url(#wax-rim-grad)"
              strokeWidth="1.6"
              opacity="0.85"
            />
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#FFF6E0"
              strokeWidth="0.7"
              strokeDasharray="2 3"
              opacity="0.6"
            />
            <g
              fill="none"
              stroke="#FFF3D6"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.85"
            >
              <path d="M60 84 C60 66 60 46 60 34" />
              <path d="M60 70 C50 64 44 56 46 46 C54 48 58 56 60 66" />
              <path d="M60 70 C70 64 76 56 74 46 C66 48 62 56 60 66" />
              <path d="M60 54 C52 48 48 41 50 34 C56 36 59 43 60 50" />
              <path d="M60 54 C68 48 72 41 70 34 C64 36 61 43 60 50" />
            </g>
          </svg>
        )}
      </motion.div>
    </div>
  );
}

function TapLabel({ children }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
      <span className="text-[8px] uppercase tracking-[0.28em] text-[#8C806D]/75 transition-colors group-hover:text-[#B89246] sm:text-[9px]">
        {children}
      </span>
    </div>
  );
}