import { IMPACT_COMPASS_INSTRUCTIONS, IMPACT_COMPASS_VERSION } from "./impact-compass";

export const PROMPT_VERSION = IMPACT_COMPASS_VERSION;

/**
 * Task note for this call. In this prototype the deterministic engine already applies the
 * Impact Compass framework (ratings, priorities, pathway selection, experiments), so the model
 * acts as the writing layer: it rewrites wording only, and every output is validated before use.
 */
const WRITING_LAYER_TASK = `CURRENT TASK: WRITING LAYER
In this prototype, a rules-based engine has already applied the framework above: it extracted the evidence, rated each pathway, set priorities and designed the experiment. You receive that draft report plus the participant's answers.

Your job is to rewrite the participant-facing text so it reads naturally and specifically, as a thoughtful career adviser would write it, while following the instructions above.

Additional rules for this task:
- Do not change which pathways are recommended, their ratings, priorities or sources.
- Only use facts present in the participant's answers or the draft. Never invent achievements, employers, numbers, research findings, job openings or programme eligibility.
- Keep every claim tentative where the draft is tentative. Keep explicit evidence and reasonable inference distinct.
- Do not use percentages, scores or impact estimates.
- Write in British English, second person, plain language, without flattery or exclamation marks.
- Keep each text roughly the same length as the draft.
- The reflective question must stay a single, open question that ends with a question mark.
- Return one entry for every id you are given, and nothing else.`;

export const NARRATIVE_SYSTEM_PROMPT = `${IMPACT_COMPASS_INSTRUCTIONS}\n\n${WRITING_LAYER_TASK}`;
