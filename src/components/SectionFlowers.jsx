import React from 'react';
import { motion } from 'framer-motion';

/**
 * SectionFlowers – decorative flower PNG placed in corner(s) of a section.
 *
 * The scale mirror (scaleX / scaleY) lives on a plain inner div, NOT on the
 * motion element (framer-motion's animate.rotate would overwrite style.transform).
 *
 * Props:
 *   size         – base size in px for the flower on desktop (default 180)
 *   opacity      – CSS opacity for subtle blending (default 0.85)
 *   customLayout – object describing which corners to render (default topLeft + topRight)
 *   zIndex       – stacking order (default 25, above TornEdge z-10/z-20)
 *   topOffset    – CSS value pushing top-corner flowers DOWN, e.g. '4.5rem' to clear a fixed header
 *   pull         – px to shift artwork INTO the corner via CSS transform (compensates for PNG
 *                  transparent margins). Container stays at position 0 — transparent overflow
 *                  is invisible and never covers the TornEdge. (default 20)
 */
export default function SectionFlowers({
  size = 180,
  opacity = 0.85,
  customLayout = null,
  zIndex = 30,
  topOffset = 0,
  bottomOffset = 0,
  pull = 20,
  imageSrc = '/assets/flower.webp',
  images = null,
  rotations = null,
}) {
  const responsiveSize = `clamp(${Math.round(size * 0.5)}px, ${Math.round(size / 4)}vw, ${size}px)`;

  // Sway animation — applied only to the motion wrapper, NOT to the img
  const swayAnimate = { rotate: [0, 3, 0] };
  const swayTransition = { repeat: Infinity, duration: 8, ease: 'easeInOut' };

  const layout = customLayout || { topLeft: true, topRight: true };

  // Container stays at the section corner — never outside it.
  const wrapperStyle = (corner) => {
    const topVal = topOffset || 0;
    const bottomVal = bottomOffset || 0;
    const positions = {
      topLeft:     { top: topVal,  left:  0 },
      topRight:    { top: topVal,  right: 0 },
      bottomLeft:  { bottom: bottomVal,    left:  0 },
      bottomRight: { bottom: bottomVal,    right: 0 },
    };
    const origins = {
      topLeft:     'top left',
      topRight:    'top right',
      bottomLeft:  'bottom left',
      bottomRight: 'bottom right',
    };
    return {
      position: 'absolute',
      width: responsiveSize,
      height: 'auto',
      pointerEvents: 'none',
      zIndex,
      margin: 0,
      padding: 0,
      ...positions[corner],
      transformOrigin: origins[corner],
    };
  };

  // Inner-div transform = mirror scale  +  translate toward corner.
  //
  // We always translate(-pull, -pull) in PRE-SCALE coordinate space.
  // After each corner's mirror, this resolves to a shift TOWARD that corner:
  //   topLeft     none          → (-pull, -pull)  ↖
  //   topRight    scaleX(-1)   → (+pull, -pull)  ↗
  //   bottomLeft  scaleY(-1)   → (-pull, +pull)  ↙
  //   bottomRight scale(-1,-1) → (+pull, +pull)  ↘
  //
  // Transparent PNG pixels that overflow the section boundary are invisible
  // and never obscure the TornEdge.
  const innerTransform = (corner) => {
    const t = `translate(-${pull}px, -${pull}px)`;
    return {
      topLeft:     t,
      topRight:    `scaleX(-1) ${t}`,
      bottomLeft:  `scaleY(-1) ${t}`,
      bottomRight: `scale(-1,-1) ${t}`,
    }[corner];
  };

  const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

  return (
    <>
      {corners.map((corner) =>
        layout[corner] ? (
          <motion.div
            key={corner}
            aria-hidden="true"
            animate={swayAnimate}
            transition={swayTransition}
            style={wrapperStyle(corner)}
          >
            {/* Inner div: mirror scale + pull toward corner (translate in pre-scale space) */}
            <div style={{ transform: innerTransform(corner), width: '100%' }}>
              <img
                src={(images && images[corner]) || imageSrc}
                alt=""
                draggable="false"
                style={{
                  width: '100%',
                  height: 'auto',
                  opacity,
                  display: 'block',
                  transform: rotations && rotations[corner] ? `rotate(${rotations[corner]})` : undefined,
                }}
              />
            </div>
          </motion.div>
        ) : null
      )}
    </>
  );
}
