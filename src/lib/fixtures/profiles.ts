import type { Responses } from "../assessment/types";

/** Fictional participants for demos, the dev review area and tests. Not real people. */
export interface SampleProfile {
  id: string;
  name: string;
  summary: string;
  responses: Responses;
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: "amara",
    name: "Amara (fictional)",
    summary: "Operations director at a logistics company, 14 years' experience, curious about global health.",
    responses: {
      background: { type: "select", values: ["ops"] },
      "s-org-better": { type: "swipe", value: "yes" },
      "s-evidence": { type: "swipe", value: "unsure" },
      "s-built": { type: "swipe", value: "yes" },
      "s-lead": { type: "swipe", value: "yes" },
      "s-explain": { type: "swipe", value: "no" },
      "s-behind": { type: "swipe", value: "yes" },
      "s-longterm": { type: "swipe", value: "no" },
      "s-switch": { type: "swipe", value: "yes" },
      causes: { type: "select", values: ["global-health"] },
      contribution: { type: "rank", order: ["enabling", "direct", "resources"] },
      proud: { type: "text", text: "I rebuilt our regional distribution network so deliveries stopped failing during peak season." },
      "x-paycut": { type: "scenario", values: ["effectiveness", "finances"] },
      "x-transfer": { type: "scenario", values: ["enabling"] },
      "x-time": { type: "scenario", values: ["project"] },
    },
  },
  {
    id: "daniel",
    name: "Daniel (fictional)",
    summary: "Engineering manager at a software company, interested in AI safety, open to a bigger change.",
    responses: {
      background: { type: "select", values: ["tech"] },
      "s-org-better": { type: "swipe", value: "no" },
      "s-evidence": { type: "swipe", value: "yes" },
      "s-built": { type: "swipe", value: "yes" },
      "s-lead": { type: "swipe", value: "yes" },
      "s-explain": { type: "swipe", value: "unsure" },
      "s-behind": { type: "swipe", value: "no" },
      "s-longterm": { type: "swipe", value: "yes" },
      "s-switch": { type: "swipe", value: "yes" },
      causes: { type: "select", values: ["ai-safety", "biosecurity"] },
      contribution: { type: "rank", order: ["direct", "enabling", "resources"] },
      "x-paycut": { type: "scenario", values: ["effectiveness", "career"] },
      "x-transfer": { type: "scenario", values: ["direct"] },
      "x-time": { type: "scenario", values: ["prepare"], note: "I'd want a year to build machine-learning skills first." },
    },
  },
  {
    id: "priya",
    name: "Priya (fictional)",
    summary: "Corporate finance lead with young children; not planning to change jobs soon.",
    responses: {
      background: { type: "select", values: ["finance"] },
      "s-org-better": { type: "swipe", value: "yes" },
      "s-evidence": { type: "swipe", value: "yes" },
      "s-built": { type: "swipe", value: "no" },
      "s-lead": { type: "swipe", value: "unsure" },
      "s-explain": { type: "swipe", value: "no" },
      "s-behind": { type: "swipe", value: "yes" },
      "s-longterm": { type: "swipe", value: "unsure" },
      "s-switch": { type: "swipe", value: "no" },
      causes: { type: "select", values: [] },
      contribution: { type: "rank", order: ["resources", "enabling", "direct"] },
      "x-paycut": { type: "scenario", values: ["finances", "effectiveness"] },
      "x-transfer": { type: "scenario", values: ["resources"] },
      "x-time": { type: "scenario", values: ["giving"] },
    },
  },
  {
    id: "marco",
    name: "Marco (fictional)",
    summary: "Marketing vice-president and former founder, motivated by animal welfare.",
    responses: {
      background: { type: "select", values: ["comms", "founder"] },
      "s-org-better": { type: "swipe", value: "no" },
      "s-evidence": { type: "swipe", value: "no" },
      "s-built": { type: "swipe", value: "yes" },
      "s-lead": { type: "swipe", value: "yes" },
      "s-explain": { type: "swipe", value: "yes" },
      "s-behind": { type: "swipe", value: "no" },
      "s-longterm": { type: "swipe", value: "no" },
      "s-switch": { type: "swipe", value: "yes" },
      causes: { type: "select", values: ["animal-welfare", "climate"] },
      contribution: { type: "rank", order: ["direct", "resources", "enabling"] },
      proud: { type: "text", text: "I took a consumer brand from launch to national distribution in three years." },
      "x-paycut": { type: "scenario", values: ["influence", "effectiveness"] },
      "x-transfer": { type: "scenario", values: ["direct"] },
      "x-time": { type: "scenario", values: ["advising"] },
    },
  },
];

export const SAMPLE_BY_ID = Object.fromEntries(SAMPLE_PROFILES.map((p) => [p.id, p]));
