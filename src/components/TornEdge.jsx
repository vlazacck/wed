import React, { useId } from 'react';

/**
 * TornEdge — realistic torn/ripped deckled paper divider between sections.
 *
 * Props:
 * flip      – if true, pins to the top of the section
 * reverse   – if true, mirrors the tear independently of its position
 * className – extra CSS classes (e.g., custom z-index or colors)
 * color     – fill color, defaults to pure white (#FFFFFF)
 */
export default function TornEdge({
  flip = false,
  reverse = flip,
  className = '',
  color = '#FFFFFF',
  height = '4.5rem',
  shadow = true,
  inset = true,
}) {
  const uniqueId = useId().replace(/:/g, '');
  const maskId = `torn-edge-mask-${uniqueId}`;
  const gradId = `torn-edge-grad-${uniqueId}`;

  return (
    <div
      className={`torn-edge pointer-events-none absolute inset-x-0 w-full z-[40] leading-[0] select-none ${
        flip ? '-top-[2px]' : '-bottom-[2px]'
      } ${className}`}
      aria-hidden="true"
      style={{
        height: `calc(${height} + 2px)`,
        transform: inset
          ? reverse
            ? 'scaleY(-1)'
            : 'none'
          : flip
          ? 'translateY(-25%)'
          : 'translateY(calc(100% - 4px)) scaleY(-1)',
      }}
    >
      {/* Layer 1: main torn paper silhouette */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block"
        style={{
          position: 'absolute',
          inset: 0,
          width: 'calc(100% + 2px)',
          marginLeft: '-1px',
          height: '100%',
          filter: shadow
            ? 'drop-shadow(0 -3px 5px rgba(0, 0, 0, 0.07))'
            : 'none',
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill={`url(#${gradId})`} />
          </mask>
        </defs>
        <path
          d={`M0 28 C20 14, 38 32, 60 22 C82 12, 98 36, 120 28 C142 20, 160 38, 180 26
              C200 14, 220 34, 240 24 C262 14, 278 40, 300 30 C322 20, 340 42, 360 28
              C380 14, 400 36, 420 22 C440 8, 462 38, 480 26 C498 14, 520 36, 540 24
              C560 12, 580 38, 600 28 C620 18, 640 40, 660 26 C680 12, 700 34, 720 24
              C740 14, 760 36, 780 22 C800 8, 822 38, 840 28 C858 18, 880 40, 900 26
              C920 12, 940 36, 960 24 C980 12, 1000 38, 1020 28 C1040 18, 1060 40, 1080 26
              C1100 12, 1120 34, 1140 22 C1160 10, 1180 36, 1200 28 C1220 20, 1240 38, 1260 24
              C1280 10, 1300 34, 1320 22 C1340 10, 1360 32, 1380 26 C1400 20, 1420 30, 1440 24
              L1440 84 L0 84 Z`}
          fill={color}
        />
      </svg>

      {/* Layer 2: slightly offset secondary deckle tear */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block"
        style={{
          position: 'absolute',
          inset: 0,
          width: 'calc(100% + 2px)',
          marginLeft: '-1px',
          height: '100%',
          opacity: 0.55,
        }}
      >
        <path
          d={`M0 34 C25 20, 45 38, 70 28 C95 18, 110 42, 135 30 C160 18, 175 44, 200 32
              C225 20, 245 42, 270 28 C295 14, 320 40, 345 30 C370 20, 390 44, 415 28
              C440 12, 465 38, 490 30 C515 22, 535 44, 560 30 C585 16, 610 40, 635 28
              C660 16, 685 38, 710 28 C735 18, 755 42, 780 28 C805 14, 830 40, 855 30
              C880 20, 900 44, 925 28 C950 12, 975 38, 1000 30 C1025 22, 1045 44, 1070 30
              C1095 16, 1120 40, 1145 28 C1170 16, 1195 36, 1220 26 C1245 16, 1265 38, 1290 28
              C1315 18, 1335 40, 1360 30 C1385 20, 1410 34, 1440 28
              L1440 84 L0 84 Z`}
          fill={color}
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Layer 3: fine fibrous edge detail */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block"
        style={{
          position: 'absolute',
          inset: 0,
          width: 'calc(100% + 2px)',
          marginLeft: '-1px',
          height: '100%',
          opacity: 0.3,
        }}
      >
        <path
          d={`M0 22 C15 30, 30 16, 50 26 C70 36, 85 18, 105 28 C125 38, 145 14, 165 24
              C185 34, 205 16, 225 26 C245 36, 265 14, 285 24 C305 34, 325 18, 345 28
              C365 38, 385 14, 405 24 C425 34, 445 16, 465 26 C485 36, 505 14, 525 24
              C545 34, 565 18, 585 28 C605 38, 625 14, 645 24 C665 34, 685 16, 705 26
              C725 36, 745 14, 765 24 C785 34, 805 18, 825 28 C845 38, 865 14, 885 24
              C905 34, 925 16, 945 26 C965 36, 985 14, 1005 24 C1025 34, 1045 18, 1065 28
              C1085 38, 1105 14, 1125 24 C1145 34, 1165 16, 1185 26 C1205 36, 1225 14, 1245 24
              C1265 34, 1285 18, 1305 28 C1325 38, 1345 14, 1365 24 C1385 34, 1405 18, 1440 26
              L1440 84 L0 84 Z`}
          fill={color}
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Solid base seal to eliminate any sub-pixel seam at the flat edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: color,
        }}
      />
    </div>
  );
}