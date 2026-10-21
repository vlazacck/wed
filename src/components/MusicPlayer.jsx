import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MusicPlayer – auto-plays soft wedding background music when the invitation
 * is opened. Shows a floating play/pause button in the bottom-right corner.
 *
 * Uses local audio file: public/assets/song.aac
 */
export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.loop = true;

    const showTimer = setTimeout(() => setVisible(true), 600);

    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            // Remove listeners once successfully playing
            document.removeEventListener("click", playAudio);
            document.removeEventListener("touchstart", playAudio);
            document.removeEventListener("keydown", playAudio);
          })
          .catch(() => setPlaying(false));
      }
    };

    // Attempt auto-play immediately
    playAudio();

    // Fallback: Modern browsers block autoplay until the first user interaction.
    // This ensures the music starts automatically as soon as the user taps/clicks anywhere.
    document.addEventListener("click", playAudio);
    document.addEventListener("touchstart", playAudio);
    document.addEventListener("keydown", playAudio);

    // Pause/resume listeners for RSVP voice note recording
    const handleExternalPause = () => {
      audio.pause();
      setPlaying(false);
    };

    const handleExternalResume = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };

    window.addEventListener("wedding-pause-music", handleExternalPause);
    window.addEventListener("wedding-resume-music", handleExternalResume);

    return () => {
      clearTimeout(showTimer);
      audio.pause();
      document.removeEventListener("click", playAudio);
      document.removeEventListener("touchstart", playAudio);
      document.removeEventListener("keydown", playAudio);
      window.removeEventListener("wedding-pause-music", handleExternalPause);
      window.removeEventListener("wedding-resume-music", handleExternalResume);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/assets/song.aac" type="audio/aac" />
      </audio>

      <AnimatePresence>
        {visible && (
          <motion.button
            key="music-btn"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={toggle}
            aria-label={playing ? "Pause music" : "Play music"}
            title={playing ? "Pause music" : "Play music"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            style={{
              position: "fixed",
              bottom: "1.5rem",
              right: "1.5rem",
              zIndex: 9999,
              width: "3rem",
              height: "3rem",
              borderRadius: "50%",
              border: "1.5px solid rgba(201,162,39,0.6)",
              background: "rgba(251,248,240,0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(100,70,10,0.18)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7C4F12",
            }}
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="5" y="4" width="4" height="16" rx="1.2" />
                <rect x="15" y="4" width="4" height="16" rx="1.2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.div
            key="music-pulse"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.55, 0], scale: [1, 1.45, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: "1.35rem",
              right: "1.35rem",
              width: "3.3rem",
              height: "3.3rem",
              borderRadius: "50%",
              border: "1.5px solid rgba(201,162,39,0.55)",
              zIndex: 9998,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}