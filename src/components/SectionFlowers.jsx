import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

export default function Schedule() {
  const { t } = useTranslation();
  const items = t('schedule.items', { returnObjects: true }) || [];

  const olRef = useRef(null);
  const firstDiamondRef = useRef(null);
  const lastDiamondRef = useRef(null);

  // startY / endY are the rose's top offset inside the <ol>
  const [startY, setStartY] = useState(0);
  const [endY, setEndY] = useState(0);

  const ROSE_SIZE = 52; // px

  const measure = useCallback(() => {
    if (!olRef.current || !firstDiamondRef.current || !lastDiamondRef.current) return;

    // Calculate exact vertical center relative to ol, immune to any CSS transforms
    const getMarkerCenter = (elem) => {
      let top = 0;
      let curr = elem;
      let foundOl = false;
      while (curr) {
        if (curr === olRef.current) {
          foundOl = true;
          break;
        }
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }

      if (foundOl) {
        return top + elem.offsetHeight / 2;
      }

      // Fallback in case offsetParent hierarchy differs
      const elemRect = elem.getBoundingClientRect();
      const olRect = olRef.current.getBoundingClientRect();
      return elemRect.top + elemRect.height / 2 - olRect.top;
    };

    const firstCenter = getMarkerCenter(firstDiamondRef.current);
    const lastCenter = getMarkerCenter(lastDiamondRef.current);

    // Offset so the rose image centre aligns precisely with the diamond centre
    setStartY(firstCenter - ROSE_SIZE / 2);
    setEndY(lastCenter - ROSE_SIZE / 2);
  }, []);

  useLayoutEffect(() => {
    measure();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    let ro;
    if (typeof ResizeObserver !== 'undefined' && olRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(olRef.current);
    }

    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [items, measure]);

  // Track scroll progress as the timeline list moves through the viewport
  const { scrollYProgress } = useScroll({
    target: olRef,
    offset: ['start 0.7', 'end 0.5'],
  });

  // Smooth out raw scroll steps into a fluid glide
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  // Rose Y goes from first diamond centre -> last diamond centre, clamped so it never passes the diamond
  const roseY = useTransform(smoothProgress, [0, 1], [startY, endY], {
    clamp: true,
  });

  // Vertical line connecting diamond 1 to diamond 3
  const lineTop = startY > 0 ? `${startY + ROSE_SIZE / 2}px` : '0px';
  const lineBottom =
    endY > 0 && olRef.current
      ? `${Math.max(0, olRef.current.offsetHeight - (endY + ROSE_SIZE / 2))}px`
      : '0px';

  return (
    <section
      className="relative bg-[#F8F9FA] px-4 sm:px-6 pt-10 sm:pt-12 pb-28 sm:pb-32 text-center"
    >
      {/* ── Title ── */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="mt-2 font-script text-3xl sm:text-4xl lg:text-5xl relative z-[40]"
        style={{ color: '#C5A059', textShadow: '0 1px 2px rgba(197,160,89,0.15)' }}
      >
        <span aria-hidden="true" style={{ color: '#C5A059' }}>❧&nbsp;</span>
        {t('schedule.title')}
        <span aria-hidden="true" style={{ color: '#C5A059' }}>&nbsp;❧</span>
      </motion.h2>

      {/* ── Timeline wrapper ── */}
      <div className="relative z-[40] mx-auto mt-6 sm:mt-8 w-full" style={{ maxWidth: 'clamp(320px, 55vw, 520px)' }}>

        {/* Vertical line (runs cleanly between first and last diamond) */}
        <div
          className="absolute"
          aria-hidden="true"
          style={{
            left: 'calc(35% + 0.75rem + 8px)',
            transform: 'translateX(-50%)',
            top: lineTop,
            bottom: lineBottom,
            width: '1px',
            background:
              startY > 0
                ? 'rgba(197,160,89,0.55)'
                : 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.55) 8%, rgba(197,160,89,0.55) 92%, transparent)',
          }}
        />

        {/* ── List — rose lives inside here so offsets are correct ── */}
        <ol ref={olRef} style={{ position: 'relative', listStyle: 'none', margin: 0, padding: 0 }}>

          {/* Scrolling rose — absolutely inside <ol> */}
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 'calc(35% + 0.75rem + 8px)',
              top: 0,
              x: '-50%',
              y: roseY,
              width: `${ROSE_SIZE}px`,
              height: `${ROSE_SIZE}px`,
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <img
              src="/assets/schedule-rose.webp"
              alt=""
              draggable="false"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                filter: 'drop-shadow(0 4px 10px rgba(120,60,60,0.22))',
              }}
            />
          </motion.div>

          {items.map((item, idx) => (
            <li
              key={item.label}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '35% auto 1fr',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem 0',
              }}
            >
              {/* Time — right-aligned */}
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="font-display text-right whitespace-pre-line"
                style={{
                  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                  color: '#2D2D2D',
                  fontWeight: 500,
                  whiteSpace: 'pre-line',
                  lineHeight: 1.25,
                }}
              >
                {typeof item.time === 'string' && !item.time.includes('\n')
                  ? item.time.replace(/^(\d{1,2}:\d{2})\s+(.+)$/, '$1\n$2')
                  : item.time}
              </motion.span>

              {/* Diamond marker */}
              <motion.span
                ref={idx === 0 ? firstDiamondRef : idx === items.length - 1 ? lastDiamondRef : null}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                aria-hidden="true"
                style={{
                  position: 'relative',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: '9px',
                    height: '9px',
                    background: '#C5A059',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 0 0 2px rgba(197,160,89,0.3)',
                  }}
                />
              </motion.span>

              {/* Label — left-aligned */}
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="font-body text-left"
                style={{
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.5rem)',
                  color: '#2D2D2D',
                  lineHeight: 1.35,
                }}
              >
                {item.label}
              </motion.span>
            </li>
          ))}
        </ol>
      </div>
      <TornEdge color="#FFFFFF" height="4.5rem" className="!-bottom-" />  
    </section>
  );
}
