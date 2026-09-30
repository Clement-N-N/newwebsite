# Build progress

## Completed

### 1. Project foundations and navigation header (2026-09-30)

- Astro 7 project with strict TypeScript (`strictest` preset), static output, scoped CSS and a committed `package-lock.json`.
- Design tokens (`src/styles/tokens.css`) for brand colours, typography, spacing, gutters, content widths, borders/radii, focus indicator and motion timing. Motion durations drop to `0ms` under `prefers-reduced-motion: reduce`.
- Self-hosted Poppins (Latin subset, 400/500/600) with preloads for the header weights and a metric-matched fallback to limit layout shift.
- Shared components: `BaseLayout` (title/description interface, skip link), `Header`, `Container`, `Button`, `NavLink`, `Logo` (temporary wordmark), `PageIntro`.
- Desktop header (≥1200px): wordmark left, primary navigation centred, yellow "Partner with us" CTA right. Sticky, with a hairline border that appears only once content scrolls under it (no height change). Short underline on hover; persistent underline and `aria-current="page"` for the active page.
- Mobile header (<1200px): labelled "Menu" button (`aria-expanded`, `aria-controls`) opening a full-height navy panel with white links, yellow active state and a yellow CTA. While open, the rest of the page is `inert` and scroll-locked. Escape closes and returns focus to the button; choosing a destination closes the menu; resizing to desktop closes it and resets state. Without JavaScript the links render in normal flow beneath the bar.
- Page shells with the shared header and a heading: `/`, `/about`, `/our-work`, `/work-with-us`, `/stories`, `/reports`, `/contact`, plus a 404 page.

Verified with Playwright (Chromium) at 1440, 1280, 1200, 1199, 1024, 768, 640, 390 and 320px: no horizontal overflow, links on one line, logo/button clearance, active states on every route, all header links resolve, keyboard order, focus rings, Escape/selection/resize behaviour, reduced motion, no-JS fallback, font loading and no failed requests. Screenshots are in `docs/screenshots/`.

Contrast (WCAG 2.x): navy on white 15.57:1, navy on yellow 10.55:1, navy on hover yellow 7.99:1, yellow on navy 10.55:1, white on navy 15.57:1, text black on white 18.88:1.

## Missing content and assets

- **Official Impact Axis Foundation logo.** Not supplied. The header uses a temporary text wordmark ("Impact Axis Foundation") in `src/components/Logo.astro`. Replace it with the genuine logo file (SVG preferred, plus a white/reversed version for dark backgrounds).
- **Favicon / app icons.** None supplied, so none are set. Derive them from the official logo once available.
- **Website Content document.** Not available in this environment. Page shells therefore contain only their headings. Page descriptions fall back to the supplied positioning line ("Building the bridge from education to meaningful work.") until page-specific copy is provided.
- **Production domain.** Not confirmed. `site` is unset in `astro.config.mjs`, so canonical URLs and a sitemap are not generated yet.

## Known limitations

- The yellow CTA against the white header measures 1.48:1 as a shape. The button is identified by its text label (10.55:1), so it does not rely on its boundary, but avoid yellow-on-white for anything that must read as a shape alone.
- The header's 1200px switch point is sized for the temporary wordmark. Re-check spacing once the real logo (and its proportions) is in place.
- Browser verification was automated in Chromium only. Safari/iOS and Firefox have not been checked by hand yet.
- `/contact` is not in the primary navigation (per the navigation brief). It currently has no inbound link.

## Next piece

**Homepage hero.** Build it from the Website Content document and genuine photography. Do not start other homepage sections.
