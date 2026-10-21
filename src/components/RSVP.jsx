import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TornEdge from './TornEdge.jsx';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyytCJuwINzNHOyuTDDPMlF9452CwhN_nYmUMg6fGzMoUqGI0Vq3E-UZFS7He3U33QM/exec';

const initialForm = { name: '', phone: '', attending: 'yes', guests: 1, message: '', website: '' };

export default function RSVP() {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');

  // Audio Recording States (Strictly Microphone Only)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    setServerError('');

    // Browsers disable navigator.mediaDevices on plain http:// IP addresses (like http://172.20.10.3)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setServerError(
        'Microphone access requires an HTTPS connection (https://) or localhost. Please open the https:// link to record.'
      );
      return;
    }

    try {
      // Strictly audio: true, video: false
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(timerRef.current);
        const finalMime = (mediaRecorder.mimeType || mimeType || 'audio/webm').split(';')[0];
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop all microphone tracks
        stream.getTracks().forEach((track) => track.stop());
        // Immediately resume background music as soon as recording finishes
        window.dispatchEvent(new CustomEvent('wedding-resume-music'));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      // Immediately pause background music while recording
      window.dispatchEvent(new CustomEvent('wedding-pause-music'));
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or unsupported:', err);
      setServerError('Unable to access microphone. Please allow microphone permissions in your browser.');
      window.dispatchEvent(new CustomEvent('wedding-resume-music'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      window.dispatchEvent(new CustomEvent('wedding-resume-music'));
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingSeconds(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    window.dispatchEvent(new CustomEvent('wedding-resume-music'));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const base64String = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('rsvp.requiredField', 'Required');
    if (!form.phone.trim()) {
      next.phone = t('rsvp.requiredField', 'Required');
    } else if (!/^[+()\d\s-]{7,20}$/.test(form.phone.trim())) {
      next.phone = t('rsvp.invalidPhone', 'Please enter a valid phone number');
    }
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (form.website) {
      setStatus('success');
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('submitting');

    try {
      let audioBase64 = null;
      let audioMimeType = null;
      let recording = null;

      if (audioBlob) {
        audioBase64 = await blobToBase64(audioBlob);
        audioMimeType = (audioBlob.type || 'audio/webm').split(';')[0];
        recording = {
          dataBase64: audioBase64,
          mimeType: audioMimeType,
        };
      }

      const payload = {
        ...form,
        audioBase64,
        audioMimeType,
        recording,
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const textResult = await response.text();
      let result;
      try {
        result = JSON.parse(textResult);
      } catch (parseErr) {
        console.error('Non-JSON response from Apps Script:', textResult);
        throw new Error('Server returned an unexpected response. Make sure you deployed a New Version in Google Apps Script.');
      }

      if (result.status === 'success') {
        setStatus('success');
        if (form.message && form.message.trim()) {
          const newWish = {
            id: Date.now(),
            name: form.name.trim(),
            message: form.message.trim(),
            date: new Date().toLocaleDateString(),
          };
          window.dispatchEvent(new CustomEvent('wedding-new-wish', { detail: newWish }));
          try {
            const saved = JSON.parse(localStorage.getItem('wedding_guest_wishes') || '[]');
            saved.unshift(newWish);
            localStorage.setItem('wedding_guest_wishes', JSON.stringify(saved));
          } catch (e) {
            // ignore storage errors
          }
        }
        setForm(initialForm);
        clearRecording();
      } else {
        console.error('Apps Script API Error:', result.message);
        setServerError(result.message || 'Apps Script returned an error.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Network/Fetch Error:', err);
      setServerError(err.message || 'Network error while submitting RSVP.');
      setStatus('error');
    }
  };

  return (
    <>
      <style>{`
        @keyframes rsvp-swing-right {
          0%, 100% { transform: rotate(-2.5deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes rsvp-swing-left {
          0%, 100% { transform: rotate(2.5deg); }
          50% { transform: rotate(-2.5deg); }
        }
        .rsvp-flower-tr {
          animation: rsvp-swing-right 8s ease-in-out infinite;
          transform-origin: top right;
        }
        .rsvp-flower-bl {
          animation: rsvp-swing-left 8s ease-in-out infinite;
          transform-origin: bottom left;
        }
      `}</style>

      <section id="rsvp" className="relative bg-white px-4 sm:px-6 pt-24 sm:pt-28 pb-24 sm:pb-28 text-center overflow-hidden">
        <img
          src="/assets/Rightflower.webp"
          alt=""
          aria-hidden="true"
          className="absolute top-0 right-0 w-[120px] sm:w-[145px] md:w-[165px] h-auto opacity-90 z-[50] rsvp-flower-tr pointer-events-none"
          style={{ marginTop: '26px' }}
        />

        <img
          src="/assets/Leftflower.webp"
          alt=""
          aria-hidden="true"
          className="absolute bottom-8 left-0 w-[120px] sm:w-[145px] md:w-[165px] h-auto opacity-90 z-[50] rsvp-flower-bl pointer-events-none"
        />

        <div className="relative z-[40] mx-auto w-full" style={{ maxWidth: '640px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mt-6 sm:mt-8 font-script text-3xl sm:text-4xl lg:text-5xl text-gold relative z-[40]"
          >
            {t('rsvp.formTitle', 'Will you join us?')}
          </motion.h2>

          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onClick={() => setRevealed((r) => !r)}
            aria-expanded={revealed}
            aria-controls="rsvp-panel"
            className="mx-auto mt-6 flex flex-col items-center gap-2 relative z-[40]"
          >
            <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gold shadow-lg border-2 border-goldLight/60">
              <span className="font-display text-[0.6rem] sm:text-xs tracking-widest text-goldLight uppercase">
                {t('rsvp.sealLabel', 'RSVP')}
              </span>
            </span>
            <span className="font-script text-base sm:text-lg text-royal/80">
              {revealed ? t('rsvp.clickToClose', 'Close') : t('rsvp.clickToOpen', 'Tap to open')}
            </span>
          </motion.button>

          <AnimatePresence initial={false}>
            {revealed && (
              <motion.div
                id="rsvp-panel"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="max-w-md mx-auto overflow-hidden text-left relative z-[40]"
              >
                {status === 'success' ? (
                  <div className="rounded-lg bg-sage/20 border border-sage/40 px-4 py-6 text-center">
                    <p className="font-script text-xl sm:text-2xl text-gold mb-2">
                      {t('rsvp.successTitle', 'Thank you!')}
                    </p>
                    <p role="status" className="font-body text-sm sm:text-base text-ink/80">
                      {t('rsvp.success', 'Your RSVP has been received.')}
                    </p>
                    <p className="mt-4 font-script text-lg text-royal/80">
                      {t('rsvp.farewell', 'Hope to see you there!')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5 bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-gold/30 shadow-xl">
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
                    </div>

                    <div>
                      <label htmlFor="name" className="block font-body text-sm text-ink/80 mb-1">
                        {t('rsvp.nameLabel', 'Full Name')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t('rsvp.namePlaceholder', 'John Doe')}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="w-full rounded-md border border-gold/50 bg-white px-3 py-2.5 font-body text-sm sm:text-base text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                      />
                      {errors.name && <p id="name-error" className="mt-1 text-xs sm:text-sm text-gold">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block font-body text-sm text-ink/80 mb-1">
                        {t('rsvp.phoneLabel', 'Phone number')}
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder={t('rsvp.phonePlaceholder', '09XXXXXXXX')}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className="w-full rounded-md border border-gold/50 bg-white px-3 py-2.5 font-body text-sm sm:text-base text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                      />
                      {errors.phone && <p id="phone-error" className="mt-1 text-xs sm:text-sm text-gold">{errors.phone}</p>}
                    </div>

                    <fieldset>
                      <legend className="font-body text-sm text-ink/80 mb-2">
                        {t('rsvp.attendingLabel', 'Will you be attending?')}
                      </legend>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
                          <input type="radio" name="attending" value="yes" checked={form.attending === 'yes'} onChange={handleChange} className="text-royal focus:ring-royal" />
                          {t('rsvp.attendingYes', 'Joyfully Accept')}
                        </label>
                        <label className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
                          <input type="radio" name="attending" value="no" checked={form.attending === 'no'} onChange={handleChange} className="text-royal focus:ring-royal" />
                          {t('rsvp.attendingNo', 'Regretfully Decline')}
                        </label>
                      </div>
                    </fieldset>

                    {form.attending === 'yes' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label htmlFor="guests" className="block font-body text-sm text-ink/80 mb-1">
                          {t('rsvp.guestsLabel', 'Number of Guests')}
                        </label>
                        <input
                          id="guests"
                          name="guests"
                          type="number"
                          min="1"
                          max="10"
                          value={form.guests}
                          onChange={handleChange}
                          className="w-24 rounded-md border border-gold/50 bg-white px-3 py-2.5 font-body text-sm sm:text-base text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                        />
                      </motion.div>
                    )}

                    <div>
                      <label htmlFor="message" className="block font-body text-sm text-ink/80 mb-1">
                        {t('rsvp.messageLabel', 'Message for the Couple (Optional)')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                        placeholder={t('rsvp.messagePlaceholder', 'Wishing you a lifetime of love...')}
                        className="w-full rounded-md border border-gold/50 bg-white px-3 py-2.5 font-body text-sm sm:text-base text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Voice Message Recorder Section (Pure Audio Only) */}
                    <div className="rounded-xl border border-gold/40 bg-gold/5 p-3 sm:p-4 text-center">
                      <p className="font-body text-xs sm:text-sm text-ink/80 mb-2 font-medium">
                        🎙️ {t('rsvp.voiceMessageLabel', 'Voice Message (Optional)')}
                      </p>

                      {!audioBlob ? (
                        <div>
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-white px-4 py-2 font-body text-xs sm:text-sm font-medium text-gold hover:bg-gold/10 transition-colors shadow-sm"
                            >
                              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                              {t('rsvp.recordStart', 'Record Voice Note')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="inline-flex items-center gap-2 rounded-full border border-red-500 bg-red-500 px-4 py-2 font-body text-xs sm:text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-sm animate-pulse"
                            >
                              ⏹ {t('rsvp.recordStop', 'Stop Recording')} ({formatTime(recordingSeconds)})
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <audio
                            controls
                            src={audioUrl}
                            onPlay={() => window.dispatchEvent(new CustomEvent('wedding-pause-music'))}
                            onPause={() => window.dispatchEvent(new CustomEvent('wedding-resume-music'))}
                            onEnded={() => window.dispatchEvent(new CustomEvent('wedding-resume-music'))}
                            className="w-full max-w-xs h-10 mt-1"
                          />
                          <button
                            type="button"
                            onClick={clearRecording}
                            className="text-xs text-red-500 hover:underline pt-1"
                          >
                            {t('rsvp.recordDelete', 'Delete & Record Again')}
                          </button>
                        </div>
                      )}
                    </div>

                    {(status === 'error' || serverError) && (
                      <p role="alert" className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 text-center">
                        {serverError || t('rsvp.error', 'Something went wrong. Please try again.')}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting' || isRecording}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-gold bg-gold px-5 sm:px-6 py-2.5 sm:py-3 font-display text-xs sm:text-sm tracking-wide text-white shadow-md hover:bg-goldLight hover:text-royal transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? t('rsvp.submitting', 'Sending...') : t('rsvp.submit', 'Send RSVP')}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TornEdge color="#F8F9FA" />
      </section>
    </>
  );
}