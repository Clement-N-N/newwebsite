# Impact Axis Foundation Website

Building the bridge from education to meaningful work.

The website is being developed section by section. See [`BUILD_PROGRESS.md`](BUILD_PROGRESS.md) for what has been built, known gaps and the next piece, and [`CLAUDE.md`](CLAUDE.md) for the standing project rules.

## Stack

- [Astro](https://astro.build) 7 (static output) with strict TypeScript
- Scoped component CSS plus global CSS custom properties (`src/styles/tokens.css`)
- Poppins, self-hosted via `@fontsource/poppins`

## Requirements

- Node.js 22.12 or later (see `.nvmrc`)
- npm 10 or later

## Setup

```sh
npm ci
```

## Development

```sh
npm run dev       # http://localhost:4321 with live reload
```

## Checking

```sh
npm run check     # Astro + TypeScript diagnostics
```

## Build and preview

```sh
npm run build     # static site in dist/
npm run preview   # serve dist/ locally at http://localhost:4321
```

## Structure

```
brand-source/logo/  original logo files as supplied (do not edit)
public/             favicon and app icons
src/
  assets/brand/ web-ready logo derivatives
  assets/hero/  hero photograph stage crop and aligned cutout
  components/   Header, Logo, NavLink, Button, Container, PageIntro, HomeHero
  data/         navigation.ts (nav items, CTA, breakpoint), site.ts (page titles/descriptions)
  layouts/      BaseLayout.astro
  pages/        route shells and 404
  styles/       tokens.css (design tokens), global.css
docs/screenshots/  verification screenshots and the hero entrance recording
tools/hero-matte/  scripts that rebuild the hero cutout
```
