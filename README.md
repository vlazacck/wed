# Ermias & Bethelhem — Digital Wedding Invitation

A beautiful single-page, bilingual (English / Amharic) digital wedding invitation built with
Vite + React + Tailwind CSS. Inspired by the format of scroll-driven wedding
microsites (envelope reveal → hero → welcome/verse → countdown → schedule → location
→ RSVP → footer), with **original layout, code, and Christian-themed content and
copy** — not copied from any specific existing site.

The invitation includes a welcoming envelope reveal, wedding details, countdown,
event schedule, Kotebe Muluwengel location map, RSVP form, bilingual content, and
decorative falling petals and floral artwork.

> **A note on the reference image you shared:** it was a real couple's private,
> commercially-licensed wedding invitation (paid Tilda template, real names, real
> venue). This project does not reuse its text, images, or exact layout/animation
> code — it's a new build in a similar *format* with placeholder names
> (Ermias & Bethelhem) that you're free to swap for your own couple.

## Quick start

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm test          # run unit tests (i18n toggle + RSVP form validation)
npm run extract-text  # regenerate content-map-generated.csv from the locale files
```

## Project structure

```
src/
  components/       # Header, Envelope, Hero, Welcome, Countdown, Schedule,
                     # Location, RSVP, Footer, Petals, TornEdge
  locales/
    en.json          # English copy (source of truth for keys)
    am.json          # Amharic translations (mirrors en.json keys)
  i18n.js            # i18next setup, default language = English
  styles/index.css   # Tailwind + custom utilities (cross icon, torn edge, focus rings)
public/assets/        # SVG placeholders + MANIFEST.md (what to replace with real photos)
scripts/extract-text.js  # flattens locale JSON → CSV for translation review
content-map.csv       # original → Christianized-English → Amharic content table
content-map-generated.csv  # auto-generated from the live locale files (npm run extract-text)
```

## Language toggle

The toggle lives top-right in the sticky header (`EN | አማ`). Switching:
- Instantly re-renders all text via `react-i18next`
- Updates `<html lang="...">` (`en` or `am`) for accessibility and correct font selection
- Updates the document `<title>` and meta description

Amharic text uses **Noto Sans Ethiopic**, loaded from Google Fonts in `index.html` with
system-font fallbacks. English uses Cormorant Garamond (display), EB Garamond (body),
and Parisienne (script accents for names/verses).

**Translation note:** the Amharic copy in `am.json` was produced by Claude and is a
reasonable best effort, but it hasn't been reviewed by a native speaker. Please have
someone fluent check it — especially the scripture translations — before printing or
publishing.

## Customizing for your couple

1. **Names, date, venue, verses:** edit `src/locales/en.json` and mirror the change
   in `am.json`. The current venue is **Kotebe Muluwengel**. The countdown target date is a separate constant in
   `src/components/Countdown.jsx` (`WEDDING_DATE`) — update both places.
2. **Colors/fonts/theme tokens:** `tailwind.config.js` (`colors`, `fontFamily`) and the
   Google Fonts `<link>` in `index.html`.
3. **Photos:** see `public/assets/MANIFEST.md` for exactly which placeholders to
   replace and suggested royalty-free sources (Unsplash, Pexels, Pixabay).

## RSVP form → email delivery

The form (`src/components/RSVP.jsx`) currently simulates a submission. To wire it to
a real inbox without a backend, pick one:

**Option A — EmailJS**
```bash
npm install @emailjs/browser
```
```js
import emailjs from '@emailjs/browser';
await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  form,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
```
Add a `.env.local` (never commit it) with:
```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

**Option B — Netlify Forms**
Add `data-netlify="true"` and a hidden `form-name` input to the `<form>`, deploy to
Netlify, and submissions land in your Netlify dashboard automatically — no API keys
needed. See https://docs.netlify.com/forms/setup/.

The form already includes a hidden **honeypot** field (`website`) for basic spam
filtering — leave it in place either way.

## Accessibility

- Skip-to-content link, visible on keyboard focus
- All form fields have associated `<label>`s and `aria-describedby` error messaging
- Language buttons use `aria-pressed`; RSVP disclosure uses `aria-expanded`/`aria-controls`
- `prefers-reduced-motion` disables/shortens all animations (petals, seal pulse, scroll reveals)
- Color contrast checked against the parchment/ink/royal palette for AA-level body text

## Deploy

**Netlify**
```bash
npm run build
# drag-and-drop dist/ into Netlify, or connect the repo with build command `npm run build`
# and publish directory `dist`
```

**Vercel**
```bash
npm run build
# vercel --prod, or connect the repo — framework preset "Vite" is auto-detected
```

## Tests

`npm test` runs Vitest + React Testing Library covering:
- Language toggle defaults to English and switches to Amharic on click
- RSVP form: required-field errors, invalid-phone error, successful submission path
