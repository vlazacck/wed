import React, { useRef, useEffect, useState } from 'react';

/**
 * WeddingPhoto – renders the wedding photo cleanly without artificial white
 * vignettes or masks that wash out the subjects.
 *
 * Props:
 *   src       – path to the wedding image
 *   className – additional CSS classes on the wrapper div
 *   feather   – optional boolean if feathering is explicitly desired
 */
export default function WeddingPhoto({
  src = '/assets/wedding.avif',
  className = '',
  feather = false,
  featherX = 0.85,
  featherY = 0.82,
  featherEdge = 0.35,
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!feather) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      setLoaded(true);
    };

    img.onerror = () => {
      console.error('WeddingPhoto: failed to load', src);
    };
  }, [src, feather]);

  if (!feather) {
    return (
      <div
        className={`wedding-photo-wrapper ${className}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          overflow: 'visible',
          position: 'relative',
        }}
      >
        <img
          src={src}
          alt="Ermias and Bethelhem"
          loading="eager"
          onError={(e) => {
            if (e.target.src !== window.location.origin + '/assets/wedding.avif') {
              e.target.src = '/assets/wedding.avif';
            }
          }}
          className="w-full h-auto object-contain select-none pointer-events-none"
          style={{
            maxWidth: '100%',
            position: 'relative',
            zIndex: 2,
            maskImage: 'linear-gradient(to bottom, black 65%, rgba(0, 0, 0, 0.4) 85%, transparent 98%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 65%, rgba(0, 0, 0, 0.4) 85%, transparent 98%)',
          }}
        />
        {/* Soft white vignette confined strictly to the bottom edge */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3]"
          style={{
            height: '26%',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 1) 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`wedding-photo-wrapper ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
          position: 'relative',
          zIndex: 2,
        }}
      />
    </div>
  );
}
