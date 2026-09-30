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

## In progress

### 2. Homepage hero preparation (2026-09-30), blocked on photography

Done:
- The working content reference `reference/impact-axis-website-content.md` is in place (local only, gitignored; see `reference/README.md`). It was read in full, and its source hash matches the supplied PDF. `CLAUDE.md` now names it as the content reference and separates website copy from editorial instructions.
- Hero copy is confirmed in the reference (Source page 4): eyebrow, main headline, supporting copy, primary CTA "Explore our work", secondary CTA "Partner with us".
- Source-asset folder prepared: `brand-source/photography/hero-candidates/`, with a provenance and consent table in `brand-source/photography/README.md`.
- Logo check: the official logo was already supplied and is in the header. Horizontal lockup 1042 × 390px after trimming (2.67:1); symbol 815 × 1093px (0.75:1). The header keeps the black lockup at 48px tall on desktop and 40px on mobile (128 × 48 and 107 × 40). No change proposed. The symbol alone is the better fit wherever a mark must sit in a square or very narrow space (favicon, social avatar).

Blocked: **the photographs could not be retrieved or inspected.**
- `drive.google.com` is denied by this environment's network egress policy: the proxy answers `403` to the HTTPS CONNECT (`connect_rejected`), and WebFetch returns `EGRESS_BLOCKED`. This happens before Google is reached, so the folders' own sharing settings are unknown.
- Affected folders (named as in the content reference, Source page 2): **GWF Photos** and **GWF Photos More**.
- No hero candidates have been selected, and no photographs have been described.

To unblock, either:
1. Upload the photographs directly: every original from **GWF Photos** and **GWF Photos More** (or a first pass of about 10–20 you consider strongest), as full-resolution originals (ideally at least 2400px on the long edge), with filenames unchanged. Or
2. Allow `drive.google.com` and `drive.usercontent.google.com` in the environment's network access settings, and make sure both folders are shared as "Anyone with the link can view".

Also needed: confirmation that the people shown have consented to publication on the website.

## Missing content and assets

- **Vector logo master.** Only raster files (PNG/WebP) were supplied. An SVG would be sharper at every size and lighter.
- **White / reversed logo** for dark (navy) backgrounds. Not supplied. The mobile menu panel currently shows no logo, so it is not yet needed.
- **Logo colour.** The supplied colour logo is `#2024D4`, not the brand navy `#101370`. Confirm which blue is official, or supply a navy version.
- **Organisation name.** The Website Content document uses "Impact Axis" throughout, and the logo reads "IMPACT AXIS". The build brief says "Impact Axis Foundation", which is currently used in page titles (`src/data/site.ts`). Confirm the public name.
- **Contact page copy.** Not in the Website Content document. `/contact` has only its heading and uses the positioning line as its description.
- **Photography, partner logos, video.** The content reference links to Google Drive folders (partner logos, team, board, The Hive, Goodwill Fellowship photos), individual team/board photos, and a YouTube testimonial (Sally Tabe). Drive is not reachable from the build environment (see *Homepage hero preparation*), so these must be uploaded as files or the network policy changed.
- **Photo consent.** No confirmation yet that the people shown in programme photographs have consented to publication.
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
- Browser verification was automated in Chromium only. Safari/iOS and Firefox have not been checked by hand yet.
- `/contact` is not in the primary navigation (per the navigation brief). It currently has no inbound link.

## Next piece

**Homepage hero.** Once the photographs are available: shortlist three candidates, confirm the choice and its crops, then build the hero from the content reference (Home Page > Hero Section: eyebrow, headline, supporting copy, "Explore our work" and "Partner with us" CTAs) and genuine photography, which must be supplied as files. Do not start other homepage sections.
