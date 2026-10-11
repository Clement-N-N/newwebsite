# HIP brand audit

**Status: incomplete. All visual tokens in this prototype are temporary.**

## What was attempted

The brief asks for a token-level audit of these pages:

| Page | Result |
| --- | --- |
| https://www.highimpactprofessionals.org/ | Not reachable from the build environment (DNS lookup failed; HTTPS proxy returned 403) |
| https://www.highimpactprofessionals.org/about-us | Not reachable |
| https://www.highimpactprofessionals.org/impact-accelerator | Not reachable |
| https://www.highimpactprofessionals.org/our-impact | Not reachable |
| https://www.highimpactprofessionals.org/free-resources | Not reachable |

A web search for HIP brand guidelines returned nothing about this organisation. No CSS, rendered
screenshots, logo files or fonts could be inspected, so **no value below is a verified HIP brand value.**

## What the prototype uses instead

The brief observes that HIP's site uses **deep blue, white, orange, strong sans-serif headings, and
portraits of real professionals**. The tokens follow that observation and were then tuned for WCAG AA
contrast. They live in one place: `src/app/globals.css` (`:root`), mirrored for Motion in
`src/lib/design/motion.ts`. No component uses a raw hex value.

| Token | Temporary value | Notes |
| --- | --- | --- |
| `brand-primary` | `#0b2a4a` | Deep blue. White text on it: 14.5:1 |
| `brand-accent` | `#f28c28` | Orange. Used for buttons and highlights, **never as text on white** (2.5:1) |
| `brand-accent-text` | `#a65200` | Orange tone for text on light surfaces: 5.5:1 |
| `brand-background` | `#ffffff` | |
| `brand-surface` | `#f4f6f9` | Long-reflection chapters |
| `brand-text` | `#0b1b2b` | |
| `brand-muted` | `#4a5a6b` | 7.1:1 on white |
| `brand-border` / `-strong` | `#d6dde5` / `#8296aa` | Strong variant meets 3:1 for control outlines |
| `brand-success` / `brand-warning` | `#1f7a4d` / `#9a5b00` | Always paired with an icon or label |
| `typography-heading` | Inter Tight 700–800 | Stand-in for HIP's heading face |
| `typography-body` | Inter | Stand-in for HIP's body face |
| `radius-card` / `radius-button` | 20px / 10px | |
| `shadow-soft` | two-layer blue-tinted shadow | |
| `motion-standard` / `motion-emphasis` | 240ms / 640ms, ease-out curves | |

Orange on deep blue (and deep blue on orange) is 5.9:1.

## Logo

No logo file was available, and none was redrawn. The header shows a dashed **"HIP logo placeholder"**
(`src/components/LogoPlaceholder.tsx`). Every page states that Impact Start is an independent concept,
not an official HIP product.

## Imagery

No licensed photography was available. The experience is deliberately typography-led, and the only
graphic motif is the Impact Map's own node-and-line language. HIP's real portraits could be added to the
landing page once licensed.

## To complete the audit

Please provide any of: screenshots of the five pages above, the site's CSS (or Webflow/Figma style
export), the logo in SVG with usage guidance, and the font names. Swapping values in `:root` and the two
`next/font` imports in `src/app/layout.tsx` re-themes the whole product.
