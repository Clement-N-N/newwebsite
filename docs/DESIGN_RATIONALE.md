# Design rationale

## The problem we are designing for

Experienced professionals arrive curious but uncertain. They are busy, sceptical of personality
quizzes, and may face real constraints (income, family, location). The design goal is a short experience
that feels premium **and** earns trust by showing its reasoning.

## Principles

1. **Evidence over flattery.** Every personal claim links back to the answer that produced it ("Why we
   say this"). A validator blocks percentages, impact figures, certainty language and unsupported claims.
2. **Hypotheses, not verdicts.** Pathways are labelled as things to test. There is no overall score.
   Fit is shown in categories (Strong, Moderate, Developing) so it can't be mistaken for precision.
3. **Demonstrated versus stated.** Capabilities come from what people say they have *done*; motivations
   and interests are *stated*. The results keep these apart, and say when they agree.
4. **Constraints are not a lack of commitment.** Choosing "financial commitments" in a crossroads
   records a constraint, never lowers motivation, and feedback is neutral ("Financial sustainability is
   an important consideration in your decisions.").
5. **The participant can disagree.** Any theme on the map can be removed ("This doesn't describe me"),
   and any pathway set aside with a reason; results rebuild immediately.
6. **Honesty about the machine.** Results say whether they came from the rules engine, AI-assisted
   wording, or a fallback after an error. Sample profiles are labelled fictional on every screen.

## Experience architecture

| Stage | Interaction model | Why |
| --- | --- | --- |
| Invitation (`/`) | Editorial hero on deep blue, animated underline, a quiet preview of the map motif | Communicates value and quality in seconds without stock imagery |
| Swipe Discovery (`/discover`) | 8 statement cards (drag, buttons, ← → ↓), plus select, drag-to-rank and one optional free-text question | Fast, low-effort reactions for simple judgements; richer formats where swiping would lose information |
| Career Crossroads (`/crossroads`) | Split editorial scenario with tactile choice panels, neutral reflection and an optional follow-up | Brings out trade-offs that swipes can't |
| Living Impact Map (`/impact-map`, in the discovery sidebar, slide 4) | Progressive network: capabilities, motivations and interests, then pathway hypotheses | Makes the reasoning visible and correctable |
| The Reveal (`/reveal`) | Seven slides on deep blue, one insight each | The emotional high point, paced like a story |
| Pathways (`/pathways`) | Cards, detail dialog, comparison table, save, investigate, set aside | Moves from inspiration to an informed choice |
| Impact Passport (`/passport`) | Print-styled report, privacy-safe summary, data controls | Something useful to keep |
| Learn (`/learn`) | Five short sections and one check | Continues into HIP's learning journey |

## The immersive learning layer

The assessment is framed as a seven-chapter learning journey (`src/lib/journey.ts`). Each chapter
teaches one idea used to choose high-impact work, then applies it to the participant:

| Chapter | Idea taught |
| --- | --- |
| 1 · What you bring | Career capital |
| 2 · What you'd weigh | Trade-offs are information |
| 3 · How it connects | Personal fit |
| 4 · What it could mean | Hypotheses, not answers |
| 5 · Where you could go | Three routes to impact |
| 6 · What you take with you | Small, deliberate tests |
| 7 · How to judge a path | Scale, neglectedness, tractability |

* **Chapter openings** (`ChapterIntro`): a full-screen moment with the idea, the objective and the time
  it takes. Shown once per chapter, focus-trapped, dismissed with one button or Escape.
* **Journey rail** in the header: where you are, what's done and what you can jump to.
* **Learning inside the flow:** a mid-deck insight card, neutral reflections in the crossroads, and a
  lesson with hands-on tools (a problem-lens explorer, contribution routes linked to your ranking, a
  ladder of cheap tests linked to your experiment).
* **Your answers become visible:** each answer that adds a theme announces "New on your map", and the
  live map grows beside the deck (in a sheet on phones).
* **Impact Wrapped:** the reveal opens on a cover made from the participant's own themes, then plays as
  story-style slides with optional auto-play, swipe and tap navigation on phones, per-slide atmosphere,
  cards dealt in, and the three pathways fanned like a hand.

## Motion

Values follow the `better-ui` guidance: staged entrances 100ms apart with opacity, 4px blur and a
12px rise over 300ms; headlines read in word by word 80ms apart; exits are 150ms and smaller than
entrances; buttons press to 0.96 over 150ms (never when disabled); springs have no bounce; transitions
name their properties; one icon set (Lucide) with stroke matched to text weight. Surfaces use layered
shadow rings with a transparent border for forced-colors mode, and dark chapters keep one light ring.
The ambient "aurora" backdrop uses only tints of the brand blue and orange, is kept dim enough that every
text token stays at AA contrast, and is static under reduced motion.

Motion always does a job: the swipe card follows the finger and tilts; the next card rises from the
stack; route changes fade up rather than hard-cut; the landing CTA opens into the assessment; map nodes
appear as evidence arrives; slides move in the direction of travel. Everything respects
`prefers-reduced-motion` (`MotionConfig reducedMotion="user"`, instant swipe commits, CSS overrides).
There is no confetti, sound or artificial "thinking" delay. The loading screen appears only while the
report request is actually in flight.

## Visual system

Light, neutral surfaces carry longer reflection (discover, crossroads, pathways). Deep blue marks the
transitions and the results reveal. Orange is reserved for primary actions, progress and emphasis.
Cards share one radius, border and shadow family across swipe, crossroads, insights, pathways and the
passport. Typography carries the experience; there are no decorative illustrations.

## Recommendation engine

`src/lib/engine` is plain TypeScript, separate from the UI:

1. **Extract** (`extract.ts`): each answer emits weighted signals for capabilities, motivations, causes,
   contribution modes, constraints and readiness, each carrying its evidence and basis.
2. **Rank** (`recommend.ts`): each of the 17 curated pathways is scored on skill fit, motivation, cause
   interest, preferred mode and feasibility given constraints. Weights differ by pathway type: a
   *stretch* weighs cause interest more; a *no-switch* option weighs how someone wants to contribute.
3. **Select**: one adjacent move, one stretch and one way to contribute without switching jobs,
   differentiated by cause and mode. People who aren't looking to switch get a second no-switch option.
4. **Report** (`report.ts`): participant-facing text is built only from evidence quotes and library
   content. Uncertainties are generated from the person's constraints and "Not sure" answers.
5. **Validate** (`validate.ts`): Zod schema plus semantic checks.

The optional AI layer (`src/lib/ai`) only rewrites wording. It never chooses pathways or adds claims,
and its output must pass the same validator or it is discarded.
