# Impact Start

**Discover what your experience could make possible.**

An interactive, evidence-linked career-impact discovery experience for experienced professionals. It is
an **independent concept prototype** created for the Program Launch Lead / Director application at
High Impact Professionals (HIP), not an official HIP product.

* **Product walkthrough:** [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md)
* **Brand audit (incomplete, with temporary tokens):** [docs/BRAND_AUDIT.md](docs/BRAND_AUDIT.md)
* **Design rationale:** [docs/DESIGN_RATIONALE.md](docs/DESIGN_RATIONALE.md)
* **Limitations and assumptions:** [docs/LIMITATIONS.md](docs/LIMITATIONS.md)
* **Test results:** [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md)

## Run it locally

Requires Node 20 or later.

```bash
npm install
npm run dev          # http://localhost:3000
```

No API key is needed. Optional environment variables (see `.env.example`):

| Variable | Effect |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables AI-assisted wording of results on the server. Recommendations still come from the rules engine. |
| `ENABLE_DEV_REVIEW=1` | Exposes `/dev/evaluations` on a production build (it is always available in `npm run dev`). |

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing and introduction (also offers a fictional sample profile) |
| `/discover` | Swipe Discovery |
| `/crossroads` | Career Crossroads scenarios |
| `/impact-map` | The Living Impact Map, with corrections |
| `/reveal` | Seven-slide results reveal |
| `/pathways` | Pathway details, comparison, save, investigate, set aside |
| `/passport` | Impact Passport (print to PDF, shareable summary, data controls) |
| `/learn` | First learning lesson |
| `/dev/evaluations` | Dev-only console: fictional profiles, extraction, ranking, evidence, validator, events, seeded funnel |
| `POST /api/report` | Builds and validates a report; optionally applies AI wording |

## Checks

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # Vitest: engine, validator, analytics, API route, swipe interaction
npm run build        # Production build
npm run test:e2e     # Playwright: journey, touch/mouse/keyboard, errors, reduced motion, axe, viewports
```

`npm run test:e2e` needs a production build first. It starts `next start` on port 3100.

## Code map

```
src/lib/assessment/   Question bank, vocabulary and labels (versioned)
src/lib/knowledge/    Curated pathway library and source list (versioned)
src/lib/engine/       Extraction, ranking, report building, Living Map graph, Zod schema, validator
src/lib/ai/           Optional server-side AI wording layer and its prompt (versioned)
src/lib/state/        Session state; nothing persists unless the participant opts in
src/lib/analytics.ts  Allow-listed, versioned product events (no answer content)
src/components/       UI by stage: landing, discover, crossroads, map, report, pathways, passport, learn, dev
src/app/globals.css   Design tokens (temporary brand values)
e2e/                  Playwright tests
```

## Deployment

Deployed on Vercel (team `impact-axis`, project `newwebsite-7hfm`). `vercel.json` pins the Next.js
framework preset. Pushes to `main` deploy to production.
