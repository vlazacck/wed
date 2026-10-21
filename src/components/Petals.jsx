import React, { useMemo } from 'react';

// Purely decorative, ambient motion. Respects prefers-reduced-motion via CSS
// (see .animate-floatPetal override in index.css's reduced-motion block).
export default function Petals({ count = 40 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 9,
        duration: 7 + Math.random() * 5,
        size: 10 + Math.random() * 10
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-full bg-gold/30 animate-floatPetal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}
