# Assets Manifest

This project ships with **generated SVG placeholders only** — no photos were copied
from the original reference site (it's a real couple's private, paid Tilda template,
so nothing was scraped or reused). Replace the following before launch:

| Placeholder | Used in | What to source |
|---|---|---|
| `parchment-texture.svg` | body background (via Tailwind `bg-parchmentTexture` utility) | A subtle warm paper-grain texture. Free options: Unsplash ("parchment paper texture"), Pexels, or generate one in Procreate/Photoshop. |
| `stained-glass.svg` | optional heading overlay (via `bg-stainedGlass` utility, not applied by default) | A tasteful stained-glass or rose-window photo/texture, warm gold + royal purple + burgundy tones to match the theme. |
| Hero background | `Hero.jsx` (currently a pure-CSS gradient + SVG arch, no photo) | An arch/venue photo, or the couple's engagement photo, sized ~1200×1600 for portrait mobile-first framing. |
| RSVP couple photo | `RSVP.jsx` (currently text-only) | The couple's portrait, same treatment as the original site's walking-couple photo (rounded corners + floral corner overlay). |
| Venue photo | `Location.jsx` (currently an inline SVG line-art cathedral) | A real photo of the venue (St. Mary's Cathedral placeholder — replace with actual church). |
| Cross / wax-seal icon | `Envelope.jsx`, `RSVP.jsx` (inline SVG) | Fine as-is; swap for a custom monogram-and-cross wax-seal graphic if you want a bespoke look. |

## Suggested copyright-safe sources for Christian/church imagery
- [Unsplash](https://unsplash.com) — search "church wedding," "stained glass," "cathedral," "cross"
- [Pexels](https://pexels.com) — same search terms, good royalty-free selection
- [Pixabay](https://pixabay.com) — additional free stock, includes some illustrations

Always check each image's specific license before commercial use, even on "free" stock sites.
