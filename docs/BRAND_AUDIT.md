# HIP brand audit

**Status: sampled from a screenshot of highimpactprofessionals.org supplied on 12 October 2026.**
HIP's website could not be reached from the build environment, so values were measured from that
screenshot (pixel sampling), not from HIP's CSS. They should be confirmed against HIP's style sources.

## What the screenshot shows

* A navy hero with a left-to-right gradient, white headline type and a white "HIP" box logo with the
  wordmark "HIGH IMPACT PROFESSIONALS".
* Bold geometric sans-serif headings (Montserrat-like) and a humanist sans-serif body (Source Sans-like).
* A rectangular orange gradient button ("Join the Waitlist") with white text and almost square corners.
* Square portrait tiles: greyscale photos over a band that runs from orange into light grey.
* Navigation: Impact Accelerator, Talent Directory, Job Board, Pledge Club, Resources, About.

## Tokens

All values live in `src/app/globals.css` (`:root`). No component uses a raw hex value.

| Token | Value | Source |
| --- | --- | --- |
| `brand-gradient-hero` | `#09355d` → `#0c2d52` → `#111d32` | Sampled across the hero |
| `brand-primary` | `#0c2d52` | Hero mid-point. White text: 13.9:1 |
| `brand-primary-deep` | `#111d32` | Hero right edge; also body text |
| `brand-accent-gradient` | `#fba12c` → `#f75a22` | Sampled top to bottom of the button |
| `brand-accent` | `#fb832c` | Button mid-point |
| `brand-accent-text` | `#b4470c` | HIP orange darkened for text on white: 5.5:1 |
| `brand-accent-on-dark` | `#fba12c` | Light end of the button gradient, for text on navy: 6.8:1 |
| `brand-tile-grey` | `#f5f0f4` → `#c2c4c4` | Portrait tile background |
| `brand-surface` | `#f3f5f8` | Light chapters (not sampled; neutral) |
| `typography-heading` | Montserrat 600–800 | Visual match; not confirmed |
| `typography-body` | Source Sans 3 | Visual match; not confirmed |
| `radius-card` / `radius-button` | 6px / 2px | HIP uses square tiles and near-square buttons |

## Deliberate deviation

HIP's button uses **white text on orange**, which measures about 2.5:1 and fails WCAG AA for normal
text. The prototype keeps HIP's orange gradient but uses navy text (`#111d32`: 5.2:1 at the darkest end of the gradient, 8.2:1 at the lightest). This is the
only intentional departure from what the screenshot shows.

## Logo

`public/brand/hip-logo-screenshot.png` is cropped from the supplied screenshot and shown small, after
"Concept for", in the header. It is low resolution and should be replaced with HIP's official SVG and
usage guidance. Impact Career Compass has its own compass mark, so the product is never presented as
HIP's own. Every page states that it is an independent concept, not an official HIP product.

## Imagery

No licensed photography is used. The landing page echoes HIP's portrait tiles with six capability
tiles (Operations, Finance, Engineering, Research, People, Communications) in the same orange-to-grey
treatment, using icons instead of faces. Real portraits could replace them once licensed.

## To finish the audit

Confirm the hex values and font names against HIP's CSS or design files, and supply the logo as SVG.
Changing `:root` in `globals.css` and the two `next/font` imports in `src/app/layout.tsx` re-themes the
whole product.
