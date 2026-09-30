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

## Missing content and assets

- **Vector logo master.** Only raster files (PNG/WebP) were supplied. An SVG would be sharper at every size and lighter.
- **White / reversed logo** for dark (navy) backgrounds. Not supplied. The mobile menu panel currently shows no logo, so it is not yet needed.
- **Logo colour.** The supplied colour logo is `#2024D4`, not the brand navy `#101370`. Confirm which blue is official, or supply a navy version.
- **Organisation name.** The Website Content document uses "Impact Axis" throughout, and the logo reads "IMPACT AXIS". The build brief says "Impact Axis Foundation", which is currently used in page titles (`src/data/site.ts`). Confirm the public name.
- **Contact page copy.** Not in the Website Content document. `/contact` has only its heading and uses the positioning line as its description.
- **Photography, partner logos, video.** The content document links to Google Drive folders (partner logos, team, board, The Hive, Goodwill Fellowship photos), individual team/board photos, and a YouTube testimonial (Sally Tabe). These have not been downloaded and must be supplied as files when the relevant section is built.
- **Team biographies.** The four core team entries have empty biographies in the content document.
- **Timeline.** Refers to page 16 of the 2025 annual report, which has not been supplied.
- **Reports.** The report PDFs (2023–2025 annual, 2026 H1, financial) have not been supplied.
- **Production domain.** Not confirmed. `site` is unset in `astro.config.mjs`, so canonical URLs and a sitemap are not generated yet.

## Content source

The Website Content document (PDF, 37 pages) is kept locally in `docs/content/` and is **gitignored**. The repository is public, and the document contains private Google Drive links and unpublished copy. Share it with each new working session rather than committing it.

## Known limitations

- The yellow CTA against the white header measures 1.48:1 as a shape. The button is identified by its text label (10.55:1), so it does not rely on its boundary, but avoid yellow-on-white for anything that must read as a shape alone.
- The 1200px switch point is limited by the space between the nav and the CTA (120px at 1200px), not by the logo.
- Browser verification was automated in Chromium only. Safari/iOS and Firefox have not been checked by hand yet.
- `/contact` is not in the primary navigation (per the navigation brief). It currently has no inbound link.

## Next piece

**Homepage hero.** Build it from the Website Content document (Home Page > Hero Section: eyebrow, headline, supporting copy, "Explore our work" and "Partner with us" CTAs) and genuine photography, which must be supplied as files. Do not start other homepage sections.
