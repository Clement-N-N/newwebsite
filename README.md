# HIP Program Launch Prototype

An immersive, scroll-driven site showcasing a program-launch prototype for the
**Program Launch Lead / Director** application at High Impact Professionals (HIP).

## Stack

- [Next.js 15](https://nextjs.org) (App Router, static output), TypeScript
- Tailwind CSS v4
- [Motion](https://motion.dev) for scroll and reveal animations, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Deployed on Vercel (team `impact-axis`, project `newwebsite-7hfm`)

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Editing content

All copy lives in [`src/content/site.ts`](src/content/site.ts). Search for `TODO`
to find what still needs your details (program name, journey stages, your experience, links).

## Structure

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Page sections: hero, context, opportunity, prototype journey, 90-day plan, why me, contact |
| `src/components/Constellation.tsx` | Interactive canvas network in the hero |
| `src/components/Journey.tsx` | Pinned section that scrolls the program stages horizontally |
| `src/components/Reveal.tsx`, `Counter.tsx` | Scroll-triggered reveals and animated stats |
| `src/components/SmoothScroll.tsx`, `ScrollProgress.tsx` | Smooth scrolling and the top progress bar |

Animations respect `prefers-reduced-motion`. The site sets `noindex` by default.

## Deploying

Connect this GitHub repository to the Vercel project (Settings → Git). Vercel detects
Next.js automatically: pushes to `main` deploy to production, and other branches get
preview deployments. No environment variables are needed.
