# Impact Axis Foundation website: standing instructions

These rules apply to every piece of work in this repository.

## How to work

- **Work on the requested piece only.** Build the section or change you were asked for and stop. Do not build ahead (heroes, footers, forms, statistics, etc.) unless that piece has been requested.
- **Preserve reviewed work.** Do not restyle, restructure or remove components that have already been built and reviewed unless the request explicitly asks for it. Extend the existing tokens and components instead of creating parallel ones.
- **Use the supplied content and genuine assets.** Organisational copy comes from the supplied *Website Content* document. Logos, photography and other assets must be the genuine Impact Axis Foundation files. Never invent facts, figures, quotes, partners, programmes, logos or imagery.
- **Record missing information.** When content or an asset is not available, use a clearly temporary treatment (never a fabricated one) and record the gap in `BUILD_PROGRESS.md` under *Missing content and assets*.
- **Check desktop, mobile, keyboard access and reduced motion** for everything you build: at minimum 1440, 1280, 768, 640, 390 and 320px wide, keyboard-only operation with visible focus, and `prefers-reduced-motion: reduce`.
- **Verify the running interface before reporting completion.** Run the site, inspect it in a browser (screenshots), and run `npm run check` and `npm run build`. Do not report a piece as done from reading the code alone.
- Update `BUILD_PROGRESS.md` at the end of each piece.

## Project conventions

- Astro (static output), strict TypeScript (`astro/tsconfigs/strictest`), scoped component CSS.
- Design tokens live in `src/styles/tokens.css`. Use the custom properties rather than hard-coded values. Brand colours are fixed:
  navy `#101370`, yellow `#FED001`, white `#FFFFFF`, text black `#111111`, secondary red `#D82F27` (occasional use only).
- Typeface: Poppins, self-hosted via `@fontsource/poppins` (Latin subset, weights 400/500/600 only). Add a weight only if a design genuinely needs it.
- Keep the site primarily static. Add client-side JavaScript only where an interaction needs it, and make sure essential content and navigation work without it.
- Navigation items and the partnership CTA are defined once in `src/data/navigation.ts`. Page titles and descriptions are defined in `src/data/site.ts` and passed to `BaseLayout`.
- The desktop/mobile header switch is at `75rem` (1200px). The value appears in `src/data/navigation.ts`, `src/styles/tokens.css` and `src/components/Header.astro`. Change all three together.
- Visual direction: premium, editorial, warm and contemporary. Keep chrome (header, footer) restrained so photography and page compositions carry the strongest moments. Minimal corner rounding.
- Older instructions or skills may refer to a previous Next.js/Tailwind project or to `/home/claude/site`. Those paths are outdated. Do not import from them.
