import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

// Google Apps Script Web App URL (same as RSVP)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyytCJuwINzNHOyuTDDPMlF9452CwhN_nYmUMg6fGzMoUqGI0Vq3E-UZFS7He3U33QM/exec';

const LOCAL_KEY = 'wedding_guest_wishes';
const CACHE_KEY = 'wedding_remote_wishes_cache';

// Sheet rows are usually oldest -> newest. Set true to show newest first.
const NEWEST_FIRST = true;

/* ----------------------------- helpers ----------------------------- */

const wishKey = (w) => `${w.name}::${w.message}`.toLowerCase();

const normKey = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');

// Find a field in an object by flexible column name matching
const pickField = (obj, candidates) => {
  const keys = Object.keys(obj);
  // exact normalized match first
  for (const c of candidates) {
    const hit = keys.find(k => normKey(k) === c);
    if (hit !== undefined && obj[hit] !== undefined && obj[hit] !== null && String(obj[hit]).trim() !== '') {
      return obj[hit];
    }
  }
  // then "contains" match
  for (const c of candidates) {
    const hit = keys.find(k => normKey(k).includes(c));
    if (hit !== undefined && obj[hit] !== undefined && obj[hit] !== null && String(obj[hit]).trim() !== '') {
      return obj[hit];
    }
  }
  return '';
};

const formatDate = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  // ISO / sheet timestamps -> "Nov 2026"
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  return str;
};

// Accepts: array of objects, array of arrays (first row = headers),
// or { data | wishes | rows | values | result: [...] }
const parseRemoteWishes = (data) => {
  let rows = Array.isArray(data)
    ? data
    : (data && (data.data || data.wishes || data.rows || data.values || data.result)) || [];

  if (!Array.isArray(rows) || rows.length === 0) return [];

  // Array of arrays -> convert using header row
  if (Array.isArray(rows[0])) {
    const headers = rows[0].map(h => String(h));
    rows = rows.slice(1).map(r => {
      const o = {};
      headers.forEach((h, i) => { o[h] = r[i]; });
      return o;
    });
  }

  const parsed = rows
    .filter(item => item && typeof item === 'object')
    .map((item, idx) => {
      const message = String(item.message || item.Message || pickField(item, ['message', 'wish', 'blessing', 'note', 'comment'])).trim();
      const name = String(item.name || item.Name || pickField(item, ['fullname', 'name', 'guest'])).trim() || 'Anonymous Guest';
      const date = formatDate(item.date || item.Date || pickField(item, ['date', 'timestamp', 'time', 'submitted']));
      return { id: item.id || `remote-${idx}`, name, message, date };
    })
    .filter(w => w.message);

  return NEWEST_FIRST ? parsed.reverse() : parsed;
};

const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(w => w && w.message && !String(w.id || '').startsWith('w-'))
      : [];
  } catch {
    return [];
  }
};

/* ----------------------------- component ----------------------------- */

export default function Wishes() {
  const { t } = useTranslation();

  // Real wishes from the Google Sheet (loaded instantly from cache, then refreshed)
  const [remoteWishes, setRemoteWishes] = useState(() => readStorage(CACHE_KEY));
  // Wishes submitted from this device / during this session
  const [localWishes, setLocalWishes] = useState(() => readStorage(LOCAL_KEY));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [, setSyncStatus] = useState(null); // null | 'success' | 'error'
  const scrollContainerRef = useRef(null);

  // Merge: session/local first, then sheet (strictly real wishes only)
  const wishes = useMemo(() => {
    const seen = new Set();
    const combined = [];
    const add = (list) => {
      (list || []).forEach(w => {
        if (!w || !w.message) return;
        const key = wishKey(w);
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(w);
        }
      });
    };
    add(localWishes);
    add(remoteWishes);
    return combined;
  }, [localWishes, remoteWishes]);

  // Fetch live submissions from Google Sheets (via Google Apps Script)
  const fetchLiveWishes = useCallback(async (attempt = 0) => {
    setIsSyncing(true);
    try {
      // Cache-busting param so the browser never serves a stale/empty response
      const url = `${SCRIPT_URL}${SCRIPT_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store', redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      let data;
      if (typeof res.text === 'function') {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Google Apps Script did not return JSON. Make sure doGet is deployed with access "Anyone".');
        }
      } else if (typeof res.json === 'function') {
        data = await res.json();
      }

      const formatted = parseRemoteWishes(data);
      setRemoteWishes(formatted);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
      } catch { /* storage full or blocked */ }
      setSyncStatus('success');
      setIsSyncing(false);
    } catch (err) {
      console.warn('Live Google Sheets wishes check:', err.message);
      if (attempt < 1) {
        // one quick retry (Apps Script cold starts can fail the first call)
        setTimeout(() => fetchLiveWishes(attempt + 1), 1500);
        return;
      }
      setSyncStatus('error');
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch live submissions on mount
    fetchLiveWishes();

    // Listen for new RSVP submissions in real-time
    const handleNewWish = (e) => {
      if (e.detail && e.detail.message) {
        setLocalWishes(prev => [e.detail, ...prev]);
      }
    };

    window.addEventListener('wedding-new-wish', handleNewWish);
    return () => window.removeEventListener('wedding-new-wish', handleNewWish);
  }, [fetchLiveWishes]);

  const openModal = () => {
    setSearchQuery('');
    setIsModalOpen(true);
    fetchLiveWishes();
  };

  // Filter wishes safely for the modal view
  const filteredWishes = wishes.filter(w => {
    if (!w) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const name = String(w.name || '').toLowerCase();
    const message = String(w.message || '').toLowerCase();
    return name.includes(query) || message.includes(query);
  });

  // Duplicate wishes for seamless infinite marquee loop
  const displayWishes = wishes.length > 0 ? [...wishes, ...wishes] : [];

  const scrollToRSVP = () => {
    setIsModalOpen(false);
    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: 'smooth' });
      // If sealed RSVP button exists, open it automatically
      const rsvpToggle = rsvpSection.querySelector('button[aria-controls="rsvp-panel"]');
      if (rsvpToggle && rsvpToggle.getAttribute('aria-expanded') === 'false') {
        rsvpToggle.click();
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes wishesSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .wishes-track {
          display: flex;
          width: max-content;
          animation: wishesSlide 45s linear infinite;
        }
        .wishes-track-paused {
          animation-play-state: paused !important;
        }
        @media (max-width: 640px) {
          .wishes-track {
            animation-duration: 35s;
          }
        }
      `}</style>

      <section
        id="wishes"
        aria-label={t('wishes.title', 'Messages from Guests')}
        className="relative bg-[#FAF8F5] pt-20 sm:pt-24 pb-20 sm:pb-28 text-center overflow-hidden"
      >
        {/* Subtle decorative background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(245, 239, 230, 0.5) 50%, rgba(250, 248, 245, 0) 75%)',
            filter: 'blur(60px)',
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        <div className="relative z-[30] mx-auto w-full max-w-5xl px-4 sm:px-6">
          {/* Eyebrow Script */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-script text-3xl sm:text-4xl lg:text-5xl text-gold tracking-wide drop-shadow-sm block">
              {t('wishes.eyebrow', 'Wishes')}
            </span>

            {/* Main Section Heading */}
            <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl text-royal tracking-normal font-normal">
              {t('wishes.title', 'Messages from Guests')}
            </h2>
          </motion.div>
        </div>

        {/* Sliding Carousel Track Container OR Empty State */}
        {wishes.length > 0 ? (
          <div
            className="relative z-10 mt-10 sm:mt-12 w-full overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Infinite Smooth Sliding Track */}
            <div
              ref={scrollContainerRef}
              className={`wishes-track py-4 px-2 ${isPaused ? 'wishes-track-paused' : ''}`}
            >
              {displayWishes.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 mx-3 sm:mx-4"
                >
                  <div className="h-full min-h-[220px] sm:min-h-[240px] bg-[#F5EFEB] rounded-2xl p-6 sm:p-7 border border-gold/50 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between text-left relative group">
                    {/* Subtle decorative quotation mark in background */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3 right-4 font-display text-6xl text-gold/20 select-none pointer-events-none font-serif leading-none"
                    >
                      ”
                    </span>

                    <div>
                      {/* Guest Name */}
                      <h3 className="font-display font-semibold text-base sm:text-lg text-[#1A1917] tracking-wide">
                        {item.name}
                      </h3>

                      {/* Message Quote */}
                      <p className="mt-3 font-body italic text-sm sm:text-base text-[#1A1917] leading-relaxed relative z-10">
                        "{item.message}"
                      </p>
                    </div>

                    {/* Optional date or heart signet */}
                    <div className="mt-4 pt-3 border-t border-gold/40 flex items-center justify-between text-xs text-[#3B3328] font-body">
                      <span>{item.date || 'Ermias & Bethelhem'}</span>
                      <span className="text-gold text-sm">❧</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative z-30 mt-8 sm:mt-10 mx-auto max-w-md px-4">
            <div className="bg-[#F5EFEB] rounded-2xl p-6 sm:p-8 border border-gold/40 shadow-sm text-center">
              <span className="text-gold text-2xl block mb-2">❧</span>
              <p className="font-body italic text-sm sm:text-base text-ink/80 leading-relaxed">
                {isSyncing
                  ? t('wishes.loading', 'Loading wishes...')
                  : t('wishes.noWishesYet', 'No messages yet. Be the first to leave a blessing for the couple!')}
              </p>
              <button
                type="button"
                onClick={scrollToRSVP}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold hover:bg-goldLight px-6 py-2.5 font-display text-xs tracking-wider uppercase text-white hover:text-royal transition-all duration-300 shadow-sm"
              >
                <span>{t('wishes.leaveAWish', 'Leave a Blessing in RSVP')}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* View All Messages Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 sm:mt-10 relative z-30"
        >
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2.5 rounded-full border-2 border-gold/80 hover:border-gold bg-transparent hover:bg-gold px-7 sm:px-9 py-2.5 sm:py-3 font-display text-xs sm:text-sm tracking-widest uppercase text-gold hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group active:scale-95"
          >
            <svg
              className="w-4 h-4 text-gold group-hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{t('wishes.viewAll', 'VIEW ALL MESSAGES')}</span>
          </button>
        </motion.div>

        {/* Realistic Torn Edge transitioning smoothly into the Footer below */}
        <TornEdge color="#1A1917" />
      </section>

      {/* Full Guestbook Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishes-modal-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#FAF8F5] rounded-3xl border border-gold/40 shadow-2xl overflow-hidden flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-gold/20 bg-white/60 relative">
                <span className="font-script text-2xl sm:text-3xl text-gold block">
                  {t('wishes.eyebrow', 'Wishes')}
                </span>
                <h3
                  id="wishes-modal-title"
                  className="font-display text-xl sm:text-2xl text-royal font-normal mt-1"
                >
                  {t('wishes.modalTitle', 'Messages from Loved Ones')}
                </h3>
                <p className="font-body italic text-xs sm:text-sm text-ink/70 mt-1">
                  {t('wishes.modalSubtitle', 'Heartfelt blessings and prayers shared by our family and friends')}
                </p>

                {/* Header Actions: Refresh & Close Button */}
                <div className="absolute top-5 right-5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fetchLiveWishes()}
                    disabled={isSyncing}
                    aria-label="Refresh messages"
                    title="Refresh messages"
                    className="p-2 rounded-full text-ink/60 hover:text-gold hover:bg-gold/15 transition-all disabled:opacity-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-4 h-4 ${isSyncing ? 'animate-spin text-gold' : ''}`}
                    >
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    aria-label={t('wishes.close', 'Close')}
                    className="p-2 rounded-full text-ink/60 hover:text-gold hover:bg-gold/15 transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('wishes.searchPlaceholder', 'Search wishes by name or words...')}
                    className="w-full rounded-full border border-gold/40 bg-white/90 px-4 py-2 sm:py-2.5 pl-10 font-body text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                  />
                  <svg
                    className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              {/* Wishes List Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4 max-h-[50vh]">
                {filteredWishes.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="font-body text-sm text-ink/60">
                      {searchQuery.trim()
                        ? t('wishes.noWishesFound', 'No messages found matching your search.')
                        : t('wishes.noWishesYet', 'No messages yet. Be the first to leave a blessing for the couple!')}
                    </p>
                  </div>
                ) : (
                  filteredWishes.map((item, idx) => (
                    <div
                      key={`modal-${item.id}-${idx}`}
                      className="bg-white rounded-2xl p-5 border border-gold/30 shadow-sm hover:border-gold/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold text-base text-ink">
                          {item.name}
                        </h4>
                        {item.date && (
                          <span className="font-body text-xs text-ink/80">
                            {item.date}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-body italic text-sm text-ink leading-relaxed">
                        "{item.message}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-gold/20 bg-white/70 flex items-center justify-between flex-wrap gap-3">
                <span className="font-body text-xs text-ink/60">
                  {t('wishes.totalWishes', { count: wishes.length, defaultValue: `${wishes.length} messages received` })}
                </span>
                <button
                  type="button"
                  onClick={scrollToRSVP}
                  className="inline-flex items-center gap-1.5 font-display text-xs tracking-wider uppercase text-gold hover:text-goldLight transition-colors font-semibold"
                >
                  <span>{t('wishes.leaveAWish', 'Leave a Blessing in RSVP')}</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}