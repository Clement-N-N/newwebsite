# Build progress

## Completed

### 1. Project foundations and navigation header (2026-09-30)

- Astro 7 project with strict TypeScript (`strictest` preset), static output, scoped CSS and a committed `package-lock.json`.
- Design tokens (`src/styles/tokens.css`) for brand colours, typography, spacing, gutters, content widths, borders/radii, focus indicator and motion timing. Motion durations drop to `0ms` under `prefers-reduced-motion: reduce`.
- Self-hosted Poppins (Latin subset, 400/500/600) with preloads for the header weights and a metric-matched fallback to limit layout shift.
- Shared components: `BaseLayout` (title/description interface, skip link), `Header`, `Container`, `Button`, `NavLink`, `Logo`, `PageIntro`.
- Desktop header (≥1200px): logo left, primary navigation centred, yellow "Partner with us" CTA right. Sticky, with a hairline border that appears only once content scrolls under it (no height change). Short underline on hover; persistent underline and `aria-current="page"` for the active page.
- Mobile header (<1200px): labelled "Menu" button (`aria-expanded`, `aria-controls`) opening a full-height navy panel with white links, yellow active state and a yellow CTA. While open, the rest of the page is `inert` and scroll-locked. Escape closes and returns focus to the button; choosing a destination closes the menu; resizing to desktop closes it and resets state. Without JavaScript the links render in normal flow beneath the bar.
- Page shells with the shared header and a heading: `/`, `/about`, `/our-work`, `/work-with-us`, `/stories`, `/reports`, `/contact`, plus a 404 page.

Verified with Playwright (Chromium) at 1440, 1280, 1200, 1199, 1024, 768, 640, 390 and 320px: no horizontal overflow, links on one line, logo/button clearance, active states on every route, all header links resolve, keyboard order, focus rings, Escape/selection/resize behaviour, reduced motion, no-JS fallback, font loading and no failed requests. Screenshots are in `docs/screenshots/`.

Contrast (WCAG 2.x): navy on white 15.57:1, navy on yellow 10.55:1, navy on hover yellow 7.99:1, yellow on navy 10.55:1, white on navy 15.57:1, text black on white 18.88:1.

### 1a. Genuine logo, favicon and content-based page descriptions (2026-09-30)

- Official logo files supplied and stored unchanged in `brand-source/logo/` (black and blue horizontal lockups; black and blue symbols).
- Header now uses the **black** horizontal lockup (`src/assets/brand/impact-axis-lockup-black.png`: the same artwork trimmed to its edges, white background converted to transparency). It is served as optimised WebP at 1x/2x/3x with `alt="Impact Axis"`. Height 40px on mobile, 48px on desktop. The blue lockup is available through `<Logo variant="blue" />`.
  Why black: the supplied colour lockup is `#2024D4`, which differs from the brand navy `#101370`. Beside the navy navigation and the yellow CTA it read as a second, competing blue. Black keeps the header restrained. **Needs brand sign-off.**
- Favicon (`favicon.ico` 16/32/48), `icon-512.png` and `apple-touch-icon.png` generated from the blue symbol.
- Page meta descriptions now use each page's introduction copy verbatim from the Website Content document (home, about, our work, work with us, insights & stories, reports).
- Re-verified: all checks pass at every width. The logo loads with its accessible name, the icons resolve, and there is clearance at 320px (91px between logo and menu button).

### 2. Homepage hero (2026-09-30)

**Concept:** "Opening the space between education and opportunity."

- **Component:** `src/components/HomeHero.astro`, used on `/` in place of the page shell. The copy is verbatim from the content reference (Source page 4): eyebrow, headline, supporting copy, and the two CTAs, "Explore our work" (`/our-work`) and "Partner with us" (`/work-with-us`). "meaningful work." carries the yellow accent. Learn, Apply and Connect are the approach words from About > Our Approach.
- **Composition:** a navy canvas beneath the white header, with three planes only.
  1. Typography sits left. The headline has intentional line breaks and is sized to the column with container units.
  2. The genuine programme photograph (GWF Photos / IDT-46.jpg) sits in a window that runs to the viewport's right edge and to the hero's lower edge.
  3. A precisely aligned cutout of the same participant makes her crown rise above the window's top edge into the navy.
  Both photographic planes share one "stage" coordinate system, cover-fitted to the frame with container query units, so they stay registered at every width. The crown crosses the frame on desktop, tablet and mobile.
- **Learn, Apply, Connect:** a small typographic progression with fine yellow connectors. On desktop the last line runs on to the photograph's edge.
- **Buttons:** yellow primary ("Partner with us") and a white outline secondary ("Explore our work"). The shared `Button` gained an `outline-light` variant and an `arrow` option; the arrow is decorative, `aria-hidden`, and nudges 4px on hover and keyboard focus. The header CTA is unchanged.
  - **Order note:** the content document labels "Explore our work" as *Primary* and "Partner with us" as *Secondary*. The build brief asked for the yellow partnership button to be the prominent one. Reading order follows the document (Explore first); visual prominence follows the brief.
- **Opening sequence:** CSS only. The eyebrow fades; the headline lines rise about 20px through stationary masks; the copy and buttons follow. The window opens from its centre, the crown then emerges upwards through a clip reveal (never a double edge), and the yellow line draws last.
  - The main composition settles by about 1.2s; the final line finishes at 1.4s.
  - The photographic layers wait, paused, until the photo has loaded. A small inline script marks it ready on load, on error, or after 2.5s.
  - Mobile uses a simpler whole-headline reveal. There is no loop, parallax or pointer-following motion.
- **Reduced motion and no JavaScript:** the full, static composition, with no animations.
- **Images:** `astro:assets` Picture (AVIF/WebP, 640–2560px) with explicit dimensions, `loading="eager"` and `fetchpriority="high"`. The cutout is WebP with alpha, 13–93 KB.

Verified in Chromium:
- Settled composition at 1440, 1280, 1024, 768, 390 and 320px; no horizontal overflow at any width.
- One unbroken h1 in the accessibility tree.
- CTA names exclude the arrow; tab order and navigation checked; the yellow focus ring is visible.
- The mobile menu covers the hero and makes it inert.
- Reduced motion and no-JS are static and complete.
- No console errors or failed requests.
- CLS 0.0000. LCP about 0.6–0.95s locally; the photograph or the cutout is the LCP element.
- The header regression suite still passes (106 checks).
- Frame line seamless at 2× pixel density.

Contrast on navy: white 15.57:1, yellow 10.55:1, 80% white (eyebrow, supporting copy) 10.21:1, outline border 5.40:1.

Screenshots and a recording of the entrance are in `docs/screenshots/` (`hero-*`). Photograph provenance and every edit are recorded in `brand-source/photography/README.md`.

**Canva:** connected and used for background removal on the original. The full-resolution result could not be exported, because the network policy blocks `canva.com` and `media.canva.com`. The final matte was produced locally, using Canva's preview as a guide (details in the photography README).

**Reference sites:** The Playground, LightEd and FEED Ghana could not be viewed; all three are blocked by the environment's network policy (curl and WebFetch). The hero follows the principles described in the brief, not observed layouts or interactions.

### 3. Homepage hero: "Illuminated Humanity" (2026-09-30)

This replaces the photographic hero from piece 2 on the homepage, following the new creative brief. The earlier `HomeHero.astro` and its assets are kept in the repository, unused. To restore it, change the import in `src/pages/index.astro`.

- **Component:** `src/components/Hero.astro`. The copy is verbatim from the content reference (Home Page > Hero Section): the eyebrow, the headline, the supporting copy, and the primary CTA "Explore our work" (`/our-work`) in the yellow button style with a decorative arrow.
- **Layout:** a deep navy canvas that is at least 80svh tall and fills the view below the header, with a strong left typographic grid. The h1 is white, Poppins 600, line-height 0.96 and tightly tracked, up to 116px. It is capped by viewport height (12.5svh) so the CTA stays in the first view on laptops. It fits 820 of 820px at 1440 × 900 and 752 of 752px at 1280 × 800.
- **Illumination:** vanilla TypeScript, pointer-driven and throttled with requestAnimationFrame. It sets `--light-x` and `--light-y`, which are registered with `@property`, so the light glides with a 700ms lag.
  - The light reveals a genuine Goodwill Fellowship photograph (GWF Photos / IDT-46.jpg stage crop). The photograph is held deep in the navy: greyscale, luminosity blend, and masked by the light.
  - A left-hand shade keeps the text column dark, and a faint warm glow marks the light itself.
  - Leaving the hero lets the light drift back to its resting place.
  - The whole backdrop is decorative: `alt=""` and `aria-hidden`.
- **Touch, reduced motion and no JavaScript:** tracking only runs for `(hover: hover) and (pointer: fine)` with motion allowed. Otherwise the light rests in a fixed, composed position: high right on phones, and right of the text on larger screens.
- **Entrance:** a slow fade and rise (1.1s, staggered) for the eyebrow, headline, supporting copy and CTA, and a gentle fade-in of the backdrop. There is none under reduced motion or without JavaScript.

Verified in Chromium:
- 1440, 1280, 1024, 768, 640, 390 and 320px: no horizontal overflow, CTA inside the hero, no console errors or failed requests.
- The light follows the cursor and returns to rest when the pointer leaves; touch does not track.
- Reduced motion: static light, 0 animations. No-JS: complete and static.
- One h1, and the CTA is the first tab stop in `main`, with a yellow focus ring.
- CLS 0.0094. `npm run check`: 0 errors, 0 warnings, 0 hints. Header regression suite passes.
- **Worst-case contrast**, measured with the light centred on each text block and the brightest background pixel taken:
  - Headline (white): at least 9.2:1.
  - Eyebrow and supporting copy (80% white): at least 6.2:1.
  - CTA (navy on yellow): 10.55:1.

Screenshots: `docs/screenshots/illuminated-hero-*`.

**Owner-approved copy change (2026-09-30):** the hero's supporting copy was shortened from 38 to 23 words at the owner's request. It no longer repeats "Cameroon-based nonprofit" (already in the eyebrow) or "meaningful work" (already in the headline).
- Original (content document): "Impact Axis is a Cameroon-based nonprofit helping young people build the practical skills, experience and networks they need to access meaningful and dignified work. We do this through experiential learning, mentorship and applied projects."
- Now: "We help young people in Cameroon gain the skills, experience and networks for dignified work, through learning by doing, mentorship and real projects."
- The homepage meta description still uses the document's original first sentence.

## Missing content and assets

- **Vector logo master.** Only raster files (PNG/WebP) were supplied. An SVG would be sharper at every size and lighter.
- **White / reversed logo** for dark (navy) backgrounds. Not supplied. The mobile menu panel currently shows no logo, so it is not yet needed.
- **Logo colour.** The supplied colour logo is `#2024D4`, not the brand navy `#101370`. Confirm which blue is official, or supply a navy version.
- **Organisation name.** The Website Content document uses "Impact Axis" throughout, and the logo reads "IMPACT AXIS". The build brief says "Impact Axis Foundation", which is currently used in page titles (`src/data/site.ts`). Confirm the public name.
- **Contact page copy.** Not in the Website Content document. `/contact` has only its heading and uses the positioning line as its description.
- **Photography, partner logos, video.** The Goodwill Fellowship folders are now reachable through the Google Drive connector (not through the network, which still blocks `drive.google.com`). Partner logos, team and board photos, The Hive photos and the YouTube testimonial (Sally Tabe) have not been fetched yet.
- **Photo consent.** Not yet confirmed for the hero photograph (GWF Photos / IDT-46.jpg) or the two alternatives. Confirm consent before the site goes public.
- **Team biographies.** The four core team entries have empty biographies in the content document.
- **Timeline.** Refers to page 16 of the 2025 annual report, which has not been supplied.
- **Reports.** The report PDFs (2023–2025 annual, 2026 H1, financial) have not been supplied.
- **Production domain.** Not confirmed. `site` is unset in `astro.config.mjs`, so canonical URLs and a sitemap are not generated yet.

## Content source

- Working reference: `reference/impact-axis-website-content.md` (gitignored).
- Original PDF (37 pages): `docs/content/Website_Content.pdf` (gitignored).

Both are kept out of git because the repository is public and they contain private Google Drive links. Supply them again to each new working session.

## Known limitations

- The yellow CTA against the white header measures 1.48:1 as a shape. The button is identified by its text label (10.55:1), so it does not rely on its boundary, but avoid yellow-on-white for anything that must read as a shape alone.
- The 1200px switch point is limited by the space between the nav and the CTA (120px at 1200px), not by the logo.
- Illuminated hero: the photograph shows only as texture. At 1024–1279px the fellow's face sits partly behind the headline, so the light reveals her shoulder rather than her face. The previous hero's "Partner with us" secondary CTA is not in this hero, because the brief asked for the primary CTA only; the header still carries "Partner with us".
- Illuminated hero: `@property` transitions need Firefox 128+ or Safari 16.4+. Older browsers move the light instantly instead of gliding.
- (Earlier photographic hero, now unused) On phones the hero photograph sits partly below the fold, so most of its reveal plays before the visitor scrolls to it. The text reveal is immediate.
- The hero's LCP element can be the cutout rather than the photograph, because the photograph starts fully clipped by the opening curtain. It measured about 0.95s locally.
- Browser verification was automated in Chromium only. Safari/iOS and Firefox have not been checked by hand yet.
- `/contact` is not in the primary navigation (per the navigation brief). It currently has no inbound link.

## Next piece

**Section 2: Impact & Statistics.** Do not start other sections.
