# Limitations and unvalidated assumptions

## Brand
* HIP's website could not be reached from the build environment. Colours were sampled from a supplied
  screenshot and fonts are visual matches (see `BRAND_AUDIT.md`); both need confirming against HIP's
  own sources.
* The HIP logo is a low-resolution crop of that screenshot and should be replaced with the official SVG.
* Buttons use navy text on HIP's orange instead of white, for contrast.
* No licensed photography is used.

## Content and evidence
* The 17-pathway library and its assumptions were written for this prototype and need review by HIP
  staff and domain experts.
* Source links (HIP, 80,000 Hours, GiveWell, Giving What We Can, Animal Charity Evaluators, Probably
  Good) could not be fetched from the build environment. Each is cited only for a general point, and
  is marked `checked: false` in `src/lib/knowledge/sources.ts` until a person verifies it.
* The learning lesson summarises widely used ideas (scale, neglectedness, tractability; personal fit;
  cheap tests) in general terms. It has not been reviewed by HIP.

## Reasoning engine
* Weights in `recommend.ts` are hand-set judgements, tuned on four fictional profiles. They are not
  validated against real outcomes.
* With 15 required questions, some people will see the same piece of evidence quoted for more than one
  pathway.
* The Impact Compass master instructions (v1.0) are the AI system prompt, and the rules-based engine
  implements the same framework deterministically (see `IMPACT_COMPASS_ALIGNMENT.md`). Some parts are
  approximations: the 0–3 ratings come from hand-set thresholds, and trade-offs and the reflective
  question come from templates rather than open-ended reasoning.
* In this prototype the AI only rewrites wording. It does not choose pathways or ratings, so the
  instructions' reasoning sections guide its tone and caution rather than its decisions.
* The AI-assisted wording path is implemented and unit-tested for its fallbacks, but has **not been run
  against the live API** (no key was available). Without `ANTHROPIC_API_KEY`, results say plainly that
  no AI was used.

## Product and data
* Answers live in browser memory and are lost on reload unless the participant opts in to "Remember on
  this device" (localStorage).
* Analytics events are recorded in memory only. No analytics provider is connected, and the dashboard
  in `/dev/evaluations` uses seeded, clearly labelled illustrative numbers.
* "Download PDF" uses the browser's print dialog with a print stylesheet; output varies slightly by
  browser.
* None of the participant outcomes in the brief have been tested with real people.
