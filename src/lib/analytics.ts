import { QUESTION_BANK_VERSION } from "./assessment/questions";
import { ENGINE_VERSION } from "./engine/recommend";
import { LIBRARY_VERSION } from "./knowledge/pathways";
import { PROMPT_VERSION } from "./ai/prompt";

export const EVENT_NAMES = [
  "landing_viewed",
  "assessment_started",
  "question_viewed",
  "question_answered",
  "answer_revised",
  "crossroads_started",
  "scenario_completed",
  "assessment_completed",
  "report_requested",
  "report_generated",
  "report_generation_failed",
  "results_viewed",
  "pathway_opened",
  "pathway_saved",
  "experiment_selected",
  "passport_downloaded",
  "learning_started",
  "learning_completed",
  "feedback_submitted",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/**
 * Only these property keys may be sent. Answer content, free text and anything that
 * identifies the participant are deliberately excluded.
 */
const ALLOWED_PROPS = new Set([
  "questionId",
  "questionType",
  "stage",
  "pathwayId",
  "role",
  "narrative",
  "reason",
  "slide",
  "sample",
  "durationMs",
  "rating",
]);

export type EventProps = Partial<Record<string, string | number | boolean>>;

export interface AnalyticsEvent {
  name: EventName;
  at: string;
  props: EventProps;
  versions: { questions: string; engine: string; library: string; prompt: string };
}

const MAX_EVENTS = 500;
const log: AnalyticsEvent[] = [];
const listeners = new Set<(events: AnalyticsEvent[]) => void>();

export function sanitize(props: EventProps = {}): EventProps {
  return Object.fromEntries(Object.entries(props).filter(([k, v]) => ALLOWED_PROPS.has(k) && v !== undefined));
}

/**
 * Records an event in memory for this browser session. There is no third-party analytics
 * provider in the prototype; a real deployment would forward `sanitize`d events to one.
 */
export function track(name: EventName, props?: EventProps) {
  const event: AnalyticsEvent = {
    name,
    at: new Date().toISOString(),
    props: sanitize(props),
    versions: { questions: QUESTION_BANK_VERSION, engine: ENGINE_VERSION, library: LIBRARY_VERSION, prompt: PROMPT_VERSION },
  };
  log.push(event);
  if (log.length > MAX_EVENTS) log.shift();
  listeners.forEach((l) => l([...log]));
}

export const getEvents = () => [...log];

export function subscribe(listener: (events: AnalyticsEvent[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearEvents() {
  log.length = 0;
  listeners.forEach((l) => l([]));
}
