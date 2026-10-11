import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { QUESTION_BY_ID } from "../assessment/questions";
import type { Responses } from "../assessment/types";
import type { Report } from "../engine/schema";
import { validateReport } from "../engine/validate";
import { NARRATIVE_SYSTEM_PROMPT, PROMPT_VERSION } from "./prompt";

export const NARRATIVE_MODEL = "claude-opus-5-5";

const NarrativeSchema = z.object({
  story: z.array(z.object({ index: z.number().int(), text: z.string() })),
  strengths: z.array(z.object({ id: z.string(), description: z.string() })),
  pathways: z.array(z.object({ id: z.string(), why: z.string() })),
});

export type NarrativeStatus =
  | { status: "applied"; model: string }
  | { status: "not-configured" }
  | { status: "failed"; reason: string }
  | { status: "rejected"; reason: string };

/** Answers as readable text for the model. Free text is included because it is quoted in the report. */
function describeAnswers(responses: Responses): string {
  return Object.entries(responses)
    .map(([id, a]) => {
      const q = QUESTION_BY_ID[id];
      if (!q) return null;
      const label = q.type === "swipe" ? q.statement : q.type === "scenario" ? q.prompt : q.prompt;
      let value: string;
      if (a.type === "swipe") value = a.value === "yes" ? "Resonates" : a.value === "no" ? "Doesn't resonate" : "Not sure";
      else if (a.type === "text") value = a.text;
      else if (a.type === "rank") value = a.order.join(" > ");
      else {
        value = a.values.join(", ");
        if (a.type === "scenario" && a.note) value += ` (note: ${a.note})`;
      }
      return `- ${label}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Ask Claude to improve the wording of a rules-based report. Returns the original report
 * unchanged unless the rewritten version passes the same validator.
 */
export async function applyNarrative(report: Report, responses: Responses): Promise<{ report: Report; ai: NarrativeStatus }> {
  if (!process.env.ANTHROPIC_API_KEY) return { report, ai: { status: "not-configured" } };

  const draft = {
    story: report.story.paragraphs.map((p, index) => ({ index, text: p.text })),
    strengths: report.strengths.map((s) => ({ id: s.id, description: s.description })),
    pathways: report.pathways.map((p) => ({ id: p.id, title: p.title, why: p.why.text })),
  };

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: NARRATIVE_MODEL,
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(NarrativeSchema) },
      system: NARRATIVE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Participant answers:\n${describeAnswers(responses)}\n\nDraft to rewrite (JSON):\n${JSON.stringify(draft, null, 2)}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") return { report, ai: { status: "failed", reason: "The model declined the request." } };
    const out = response.parsed_output;
    if (!out) return { report, ai: { status: "failed", reason: "The response did not match the expected format." } };

    const next: Report = structuredClone(report);
    for (const s of out.story) if (next.story.paragraphs[s.index] && s.index < 2) next.story.paragraphs[s.index].text = s.text;
    for (const s of out.strengths) {
      const target = next.strengths.find((x) => x.id === s.id);
      if (target) target.description = s.description;
    }
    for (const p of out.pathways) {
      const target = next.pathways.find((x) => x.id === p.id);
      if (target) target.why.text = p.why;
    }
    next.meta.narrative = "ai";
    next.meta.promptVersion = PROMPT_VERSION;

    const check = validateReport(next, responses);
    if (!check.valid) {
      return { report, ai: { status: "rejected", reason: check.issues.map((i) => i.message).join("; ") } };
    }
    return { report: next, ai: { status: "applied", model: NARRATIVE_MODEL } };
  } catch (error) {
    let reason = "The AI service could not be reached.";
    if (error instanceof Anthropic.RateLimitError) reason = "The AI service is busy. Try again shortly.";
    else if (error instanceof Anthropic.AuthenticationError) reason = "The AI service is not authorised.";
    else if (error instanceof Anthropic.APIError) reason = `The AI service returned an error (${error.status}).`;
    return { report, ai: { status: "failed", reason } };
  }
}
