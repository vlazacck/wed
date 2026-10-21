import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';
import SectionFlowers from './SectionFlowers.jsx';

export default function Schedule({ selectedHome = 'bride' }) {
  const { t } = useTranslation();
  const items = t(`schedule.${selectedHome}Items`, { returnObjects: true });

  const sectionRef = useRef(null);
  const olRef = useRef(null);
  const itemRefs = useRef([]);

  // startY / endY are the rose's top offset inside the <ol>
  const [startY, setStartY] = useState(0);
  const [endY, setEndY] = useState(300);

  const ROSE_SIZE = 52; // px

  useEffect(() => {
    const measure = () => {
      if (!olRef.current || itemRefs.current.length === 0) return;
      const olRect = olRef.current.getBoundingClientRect();
      const firstLi = itemRefs.current[0];
      const lastLi = itemRefs.current[itemRefs.current.length - 1];
      if (!firstLi || !lastLi) return;

      // vertical centre of first & last row, relative to ol
      const firstCenter =
        firstLi.getBoundingClientRect().top +
        firstLi.getBoundingClientRect().height / 2 -
        olRect.top;
      const lastCenter =
        lastLi.getBoundingClientRect().top +
        lastLi.getBoundingClientRect().height / 2 -
        olRect.top;

      // offset so the rose image centre aligns with the row centre
      setStartY(firstCenter - ROSE_SIZE / 2);
      setEndY(lastCenter - ROSE_SIZE / 2);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Track scroll progress as the section moves through the viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.65', 'end 0.65'],
  });

  // Rose Y goes from first-item centre → last-item centre
  const roseY = useTransform(scrollYProgress, [0, 1], [startY, endY]);

  return (
    <section
      ref={sectionRef}
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

        {/* Vertical line (behind everything) */}
        <div
          className="absolute"
          aria-hidden="true"
          style={{
            left: 'calc(35% + 0.75rem + 8px)',
            transform: 'translateX(-50%)',
            top: 0,
            bottom: 0,
            width: '1px',
            background:
              'linear-gradient(to bottom, transparent, rgba(197,160,89,0.55) 8%, rgba(197,160,89,0.55) 92%, transparent)',
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
            <motion.li
              key={item.label}
              ref={(el) => (itemRefs.current[idx] = el)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
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
              <span
                className="font-display text-right"
                style={{
                  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                  color: '#2D2D2D',
                  fontWeight: 500,
                  whiteSpace: 'pre-line',
                  display: 'inline-block',
                  lineHeight: 1.2,
                }}
              >
                {item.time}
              </span>

              {/* Diamond marker */}
              <span
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
              </span>

              {/* Label — left-aligned */}
              <span
                className="font-body text-left"
                style={{
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.5rem)',
                  color: '#2D2D2D',
                  lineHeight: 1.35,
                }}
              >
                {item.label}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
      <TornEdge color="#FFFFFF" height="4.5rem" className="!-bottom-" />  
    </section>
  );
}
