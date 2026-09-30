# Impact Axis Foundation website: standing instructions

These rules apply to every piece of work in this repository.

## How to work

- **Work on the requested piece only.** Build the section or change you were asked for and stop. Do not build ahead (heroes, footers, forms, statistics, etc.) unless that piece has been requested.
- **Preserve reviewed work.** Do not restyle, restructure or remove components that have already been built and reviewed unless the request explicitly asks for it. Extend the existing tokens and components instead of creating parallel ones.
- **Use the supplied content and genuine assets.** Organisational copy comes from the supplied *Website Content* document; use its wording verbatim. Logos, photography and other assets must be the genuine Impact Axis files. Never invent facts, figures, quotes, partners, programmes, logos or imagery. Never redraw, recolour or trace the logo.
- **Keep private source material out of git.** This repository is public. `reference/impact-axis-website-content.md`, the Website Content PDF and its extracted text (`docs/content/`) are gitignored because they contain private Google Drive links. Do not commit them, and do not paste those links or Drive file IDs into committed files. Refer to assets by folder name and original filename instead.
- **Photographs of young people** may be published only once Impact Axis confirms consent for each image.
- **Record missing information.** When content or an asset is not available, use a clearly temporary treatment (never a fabricated one) and record the gap in `BUILD_PROGRESS.md` under *Missing content and assets*.
- **Check desktop, mobile, keyboard access and reduced motion** for everything you build: at minimum 1440, 1280, 768, 640, 390 and 320px wide, keyboard-only operation with visible focus, and `prefers-reduced-motion: reduce`.
- **Verify the running interface before reporting completion.** Run the site, inspect it in a browser (screenshots), and run `npm run check` and `npm run build`. Do not report a piece as done from reading the code alone.
- Update `BUILD_PROGRESS.md` at the end of each piece.

## Content reference

`reference/impact-axis-website-content.md` is the **working content reference** for all website copy. It is a faithful extraction of the supplied Website Content PDF (the PDF stays the source of truth where extraction order is ambiguous). See `reference/README.md`.

The document mixes two kinds of text. Keep them apart:

1. **Website copy.** Publish it verbatim: headlines, eyebrows, body copy, CTA labels, FAQ questions and answers, quotes with their attribution, programme descriptions, statistics, biographies. Do not rewrite, shorten, "improve" or re-punctuate it. Fixing an obvious typo needs the owner's approval and a note in `BUILD_PROGRESS.md`.
2. **Editorial instructions and structure.** Never publish these as copy. They include:
   - Section and field labels: "Hero Section", "Eyebrow", "Main headline", "Supporting copy", "Supporting text", "Body", "Calls to action", "Primary:", "Secondary:", "Call to action", "CTA:", "Quotes", "Timeline", "Core Team", "Name:", "Photo:", "Role:", "Biography:", "Bio", and the "… Section" headings (for example "Why We Exists Section").
   - Build notes and placeholders: "Resources you can use for the website", "Photo + name + role + short biography", "click here" / "Click here", "Place partner logos beneath this copy.", "[Partner logos]", "Then present the actual programmes.", "Carousel photographs/video from: …" and its list, "Perhaps very little text underneath.", "Something like:", "Refer to page 16 of the 2025 annual report to see timeline: Report", "Video: Sally Tabe testimonial".
   - Recovered hyperlinks. These are asset sources, not page links.
3. **Tentative copy.** Text introduced by "Something like:" (Our Work > Work in Action) is a suggestion. Confirm it with the owner before publishing.

Presentation details in the source, such as the "01 —" numbering, the → and ↓ arrows after CTA labels, and ALL-CAPS eyebrows, are design decisions to review, not wording to change. Empty fields (for example the core team biographies) are missing content. Record them; never fill them.

## Project conventions

- Astro (static output), strict TypeScript (`astro/tsconfigs/strictest`), scoped component CSS.
- Design tokens live in `src/styles/tokens.css`. Use the custom properties rather than hard-coded values. Brand colours are fixed:
  navy `#101370`, yellow `#FED001`, white `#FFFFFF`, text black `#111111`, secondary red `#D82F27` (occasional use only).
- Typeface: Poppins, self-hosted via `@fontsource/poppins` (Latin subset, weights 400/500/600 only). Add a weight only if a design genuinely needs it.
- Keep the site primarily static. Add client-side JavaScript only where an interaction needs it, and make sure essential content and navigation work without it.
- Navigation items and the partnership CTA are defined once in `src/data/navigation.ts`. Page titles and descriptions are defined in `src/data/site.ts` and passed to `BaseLayout`.
- The desktop/mobile header switch is at `75rem` (1200px). The value appears in `src/data/navigation.ts`, `src/styles/tokens.css` and `src/components/Header.astro`. Change all three together.
- Visual direction: premium, editorial, warm and contemporary. Keep chrome (header, footer) restrained so photography and page compositions carry the strongest moments. Minimal corner rounding.
- Source assets: originals in `brand-source/` (`logo/`, `photography/`), kept unchanged. Web-ready derivatives go in `src/assets/`.
- Brand files: originals in `brand-source/logo/` (unchanged). Web-ready derivatives in `src/assets/brand/`, rendered through `astro:assets`. The header uses the black lockup; the colour lockup is `#2024D4`.
- The homepage uses `src/components/Hero.astro` ("Illuminated Humanity"). The earlier photographic hero, `HomeHero.astro`, is kept but unused. Its photograph and cutout share one stage geometry (`--stage-ar`, `--front-*` in `src/components/HomeHero.astro`). Regenerate both with `tools/hero-matte/` if the crop changes, and never move one without the other.
- Older instructions or skills may refer to a previous Next.js/Tailwind project or to `/home/claude/site`. Those paths are outdated. Do not import from them.
