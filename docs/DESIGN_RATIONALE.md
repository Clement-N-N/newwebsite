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

## Motion

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
