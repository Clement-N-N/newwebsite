import { NextResponse } from "next/server";
import { z } from "zod";
import { applyNarrative } from "@/lib/ai/narrative";
import { buildReport, IncompleteAssessmentError } from "@/lib/engine/report";
import { validateReport } from "@/lib/engine/validate";

const AnswerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("swipe"), value: z.enum(["yes", "no", "unsure"]) }),
  z.object({ type: z.literal("select"), values: z.array(z.string().max(40)).max(10) }),
  z.object({ type: z.literal("rank"), order: z.array(z.string().max(40)).max(10) }),
  z.object({ type: z.literal("text"), text: z.string().max(300) }),
  z.object({ type: z.literal("scenario"), values: z.array(z.string().max(40)).max(10), note: z.string().max(300).optional() }),
]);

const RequestSchema = z.object({
  responses: z.record(z.string().max(40), AnswerSchema),
  rejectedThemes: z.array(z.string().max(60)).max(50).default([]),
  rejectedPathways: z.array(z.string().max(60)).max(50).default([]),
  selectedPathwayId: z.string().max(60).nullable().default(null),
  sample: z.boolean().default(false),
});

/** Builds the report on the server so the optional AI step can use a key that never reaches the browser. */
export async function POST(request: Request) {
  const body = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { responses, rejectedThemes, rejectedPathways, selectedPathwayId, sample } = body.data;
  let report;
  try {
    report = buildReport(responses, { rejectedThemes, rejectedPathways, selectedPathwayId, sample });
  } catch (error) {
    if (error instanceof IncompleteAssessmentError) {
      return NextResponse.json({ error: "The assessment is not complete yet." }, { status: 422 });
    }
    throw error;
  }

  // Sample profiles are demonstrations: never send them to the AI service.
  const result = sample ? { report, ai: { status: "not-configured" as const } } : await applyNarrative(report, responses);
  const validation = validateReport(result.report, responses);
  return NextResponse.json({ report: result.report, ai: result.ai, validation });
}
