# Test results

Run on 11 October 2026 against a production build (`next build` + `next start`), in Playwright
1.56.1's bundled Chromium. Re-run with the commands in the README.

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | Pass, no errors |
| ESLint (`npm run lint`) | Pass, no warnings |
| Production build (`npm run build`) | Pass |
| Unit and component tests (`npm test`) | **29 passed** |
| End-to-end tests (`npm run test:e2e`) | **25 passed**, 9 skipped by design (desktop-only or mobile-only cases on the other project) |

Accessibility: axe-core checks (WCAG 2.0, 2.1 and 2.2 AA tags) on the landing page, discovery, crossroads,
results, map slide, pathways, passport and lesson report no serious or critical violations, on desktop and
on a Pixel 7 profile. Automated checks don't replace a manual screen-reader review, which has not been done.

Viewports covered: 320 × 640, 390 × 844, 820 × 1180, 1180 × 820, 1440 × 900 (no horizontal overflow on
landing, discovery or results), plus the full journey on a Pixel 7 profile.

## Unit and component tests

```
✓ src/app/api/report/route.test.ts > POST /api/report > returns a validated rules-based report when no AI key is configured
✓ src/app/api/report/route.test.ts > POST /api/report > never sends sample profiles to the AI service
✓ src/app/api/report/route.test.ts > POST /api/report > rejects incomplete assessments with 422
✓ src/app/api/report/route.test.ts > POST /api/report > rejects malformed input with 400
✓ src/lib/engine/__tests__/engine.test.ts > extractProfile > separates demonstrated capabilities from stated preferences
✓ src/lib/engine/__tests__/engine.test.ts > extractProfile > records 'Not sure' answers without turning them into signals
✓ src/lib/engine/__tests__/engine.test.ts > extractProfile > treats financial concern as a constraint, not as lower motivation
✓ src/lib/engine/__tests__/engine.test.ts > extractProfile > drops themes the participant rejected
✓ src/lib/engine/__tests__/engine.test.ts > extractProfile > knows when the assessment is incomplete
✓ src/lib/engine/__tests__/engine.test.ts > selectPathways > returns three differentiated hypotheses: adjacent, stretch and no-switch
✓ src/lib/engine/__tests__/engine.test.ts > selectPathways > offers no stretch to someone who is not looking to switch
✓ src/lib/engine/__tests__/engine.test.ts > selectPathways > follows stated cause interests for the stretch option
✓ src/lib/engine/__tests__/engine.test.ts > selectPathways > replaces a rejected pathway with a different one
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > produces a valid, evidence-linked report for Amara (fictional)
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > produces a valid, evidence-linked report for Daniel (fictional)
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > produces a valid, evidence-linked report for Priya (fictional)
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > produces a valid, evidence-linked report for Marco (fictional)
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > quotes the participant's own words verbatim
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > uses the selected pathway's experiment
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > refuses to build results from an incomplete assessment
✓ src/lib/engine/__tests__/engine.test.ts > buildReport > never shows numeric scores or percentages to participants
✓ src/lib/engine/__tests__/engine.test.ts > validateReport > flags unsupported claims, invented figures and unknown sources
✓ src/lib/engine/__tests__/engine.test.ts > validateReport > flags evidence that cites an unanswered question
✓ src/lib/engine/__tests__/engine.test.ts > validateReport > rejects structurally invalid reports
✓ src/components/__tests__/DiscoverFlow.test.tsx > DiscoverFlow > records swipe answers from buttons and arrow keys, and lets people go back and revise
✓ src/components/__tests__/DiscoverFlow.test.tsx > DiscoverFlow > does not let arrow keys answer while focus is in another control
✓ src/lib/__tests__/analytics.test.ts > analytics > drops answer content and any non-allowlisted property
✓ src/lib/__tests__/analytics.test.ts > analytics > stamps every event with question, engine, library and prompt versions
✓ src/lib/__tests__/analytics.test.ts > privacySafeSummary > contains no free-text answers
```

## End-to-end tests

```
✓   2 [desktop] › e2e/journey.spec.ts:91:5 › keyboard-only users can complete Part 1 with arrow keys
✓   3 [desktop] › e2e/journey.spec.ts:98:5 › answers survive going back, and revisions are recorded
✓   4 [desktop] › e2e/journey.spec.ts:110:5 › results are not shown for an empty assessment
✓   5 [desktop] › e2e/journey.spec.ts:116:5 › if the analysis service fails, results still come from the in-browser engine and say so
-   6 [desktop] › e2e/journey.spec.ts:125:5 › swiping a card by touch answers it
✓   7 [desktop] › e2e/journey.spec.ts:151:5 › dragging a card with a mouse answers it
✓   8 [desktop] › e2e/journey.spec.ts:165:7 › reduced motion › the experience works without animation
✓   9 [desktop] › e2e/journey.spec.ts:178:5 › the dev review area loads fictional profiles and catches unsupported claims
✓  10 [desktop] › e2e/quality.spec.ts:20:7 › accessibility (axe, WCAG 2.2 AA) › landing
✓   1 [desktop] › e2e/journey.spec.ts:4:5 › a participant completes the whole journey
✓  11 [desktop] › e2e/quality.spec.ts:26:7 › accessibility (axe, WCAG 2.2 AA) › discover and crossroads
✓  13 [desktop] › e2e/quality.spec.ts:68:7 › no horizontal overflow at small-mobile (320px)
✓  12 [desktop] › e2e/quality.spec.ts:39:7 › accessibility (axe, WCAG 2.2 AA) › results, pathways, passport and learning
✓  14 [desktop] › e2e/quality.spec.ts:68:7 › no horizontal overflow at mobile (390px)
✓  15 [desktop] › e2e/quality.spec.ts:68:7 › no horizontal overflow at tablet-portrait (820px)
✓  16 [desktop] › e2e/quality.spec.ts:68:7 › no horizontal overflow at tablet-landscape (1180px)
✓  17 [desktop] › e2e/quality.spec.ts:68:7 › no horizontal overflow at desktop (1440px)
-  19 [mobile] › e2e/journey.spec.ts:91:5 › keyboard-only users can complete Part 1 with arrow keys
✓  20 [mobile] › e2e/journey.spec.ts:98:5 › answers survive going back, and revisions are recorded
✓  21 [mobile] › e2e/journey.spec.ts:110:5 › results are not shown for an empty assessment
✓  22 [mobile] › e2e/journey.spec.ts:116:5 › if the analysis service fails, results still come from the in-browser engine and say so
✓  23 [mobile] › e2e/journey.spec.ts:125:5 › swiping a card by touch answers it
-  24 [mobile] › e2e/journey.spec.ts:151:5 › dragging a card with a mouse answers it
✓  25 [mobile] › e2e/journey.spec.ts:165:7 › reduced motion › the experience works without animation
-  26 [mobile] › e2e/journey.spec.ts:178:5 › the dev review area loads fictional profiles and catches unsupported claims
✓  27 [mobile] › e2e/quality.spec.ts:20:7 › accessibility (axe, WCAG 2.2 AA) › landing
✓  28 [mobile] › e2e/quality.spec.ts:26:7 › accessibility (axe, WCAG 2.2 AA) › discover and crossroads
✓  18 [mobile] › e2e/journey.spec.ts:4:5 › a participant completes the whole journey
-  30 [mobile] › e2e/quality.spec.ts:68:7 › no horizontal overflow at small-mobile (320px)
-  31 [mobile] › e2e/quality.spec.ts:68:7 › no horizontal overflow at mobile (390px)
-  32 [mobile] › e2e/quality.spec.ts:68:7 › no horizontal overflow at tablet-portrait (820px)
-  33 [mobile] › e2e/quality.spec.ts:68:7 › no horizontal overflow at tablet-landscape (1180px)
-  34 [mobile] › e2e/quality.spec.ts:68:7 › no horizontal overflow at desktop (1440px)
✓  29 [mobile] › e2e/quality.spec.ts:39:7 › accessibility (axe, WCAG 2.2 AA) › results, pathways, passport and learning
```
