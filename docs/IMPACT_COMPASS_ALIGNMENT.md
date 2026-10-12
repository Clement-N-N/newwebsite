# Impact Compass alignment

How the **Impact Compass Master AI Evaluation and Recommendation Instructions (v1.0)** map onto
Impact Career Compass.

The instructions are used in two ways:

1. **As the AI system prompt.** `src/lib/ai/impact-compass.ts` holds the instructions
   (`IMPACT_COMPASS_VERSION = "impact-compass-1.0"`). `src/lib/ai/prompt.ts` adds a short
   writing-layer task note. Every report records the prompt version, and so do analytics events.
2. **As the specification for the rules-based engine.** The engine (`src/lib/engine`) applies the
   same framework deterministically, so the product works and stays auditable without AI. When an
   API key is set, the AI only rewrites wording. It cannot change pathways, ratings, priorities or
   sources, and its output goes through the same validator.

## Section by section

| Instructions | Where it lives | Notes |
| --- | --- | --- |
| §2 Core philosophy (hypotheses, counterfactual, no false precision) | `validate.ts` overclaim patterns; `pathways.ts` `counterfactual` | No percentages, scores or certainty words reach participants |
| §5–6 Assessment and evidence types | `extract.ts` (demonstrated vs stated basis); `InsightSchema.evidenceType` | Strengths are labelled "Explicit evidence" or "Reasonable inference". "Not sure" answers become unknowns, not signals |
| §7 Opportunity evaluation (skill, motivation, feasibility, evidence, counterfactual) | `recommend.ts` `rate()` and `SKILL_SCALE`, `MOTIVATION_SCALE`, `FEASIBILITY_SCALE` | Anchored 0–3 ratings. Participants see the anchor wording, never the number |
| §8 Pathway generation; don't manufacture three | `selectPathways` | Candidates with no skill match and low motivation are dropped, so fewer than three can be shown. The validator warns rather than padding |
| §9 Calibration and priority | `Fit.priority`, `Fit.priorityReason`, `Pathway.evidence` | Explore now / Worth investigating / Longer-term possibility / Not currently practical, each with a stated reason |
| §10 Recommendation quality (8 questions) | `PathwayRec`: `why`, `capabilities`, `need`, `mechanism`, `assumptions`, `uncertainties`, `experiment`, `reviseIf` | Shown in the pathway detail dialog |
| §11 Diversification | adjacent / stretch / no-switch roles | When someone wants to stay in their role, two no-switch options are offered and the stretch is never "Explore now". The validator warns if this is missing |
| §12 Cause prioritisation | `sources.ts`, Lesson 1 | The tool doesn't rank causes. It links to evaluators and teaches scale, neglectedness and tractability |
| §13 Experiment design | `Pathway.experiment`: hypothesis, steps, effort, evidence, decision rule | All 17 pathways |
| §14 Seven-day plan | `buildPlan` | Day 1–7 by default; a single weekly action when the person said time is their constraint. Rebuilt in the UI when they pick a different experiment |
| §15 Learning recommendations | `Report.learning` | Lesson 1, then HIP's Impact Accelerator Program (if switching) or HIP resources |
| §16 Nine-section report | Reveal slides 01–09 and Passport sections 1–9 | See below |
| §17 Tone | Engine copy; AI task note | British English, second person, no flattery |
| §18 Knowledge and evidence | `sources.ts` (`checked: false` until verified) | No HIP policies, jobs or eligibility are implied |
| §19 Privacy, fairness and safety | `AssessmentProvider` (memory by default, opt-in storage), shareable summary excludes free text | Financial and time constraints never lower motivation |
| §20 Quality checklist | `validateReport` plus unit tests | Checks evidence, sources, overclaiming, diversification, no-switch option and that the reflective question is a question |
| §21–24 Iteration and rejection | "Not for me" dialog | Reasons follow the instructions: interest, misread experience, finances, eligibility, values, evidence, preferred mechanism. Rejected pathways are replaced, not reworded |

## The nine report sections

| § | Section | Reveal slide | Passport |
| --- | --- | --- | --- |
| 1 | Your Impact Discovery | 01: personalised headline and discovery summary | 1 |
| 2 | Your Professional Capital | 02: strengths with evidence, "why it travels", evidence type and confidence | 2 |
| 3 | What Drives You | 03: motivations split into backed-by-experience and stated | 3 |
| 4 | Your Impact Opportunities | 05: pathways with priority, ratings and evidence strength (04 is the Impact Map) | 4 |
| 5 | Important Trade-offs | 06: personal fit, time and effort, financial risk, learning and career capital | 5 |
| 6 | Your Biggest Unknowns | 07: two or three, the leading pathway's key assumption included | 6 |
| 7 | Your Seven-Day Experiment | 08: hypothesis, day-by-day plan, effort, decision rule | 7 |
| 8 | Your Next Learning Step | 09: Lesson 1 and a follow-on resource | 8 |
| 9 | A Reflective Question | 09: specific to the profile and its next decision | 9 |

## Known gaps

* The ratings come from hand-set thresholds, not from open-ended reasoning over each person's story.
* Trade-offs and reflective questions are template-based, with branches for common situations.
* The AI layer has not yet been run against the live API in this environment.
