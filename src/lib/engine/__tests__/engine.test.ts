import { describe, expect, it } from "vitest";
import { REQUIRED_QUESTION_IDS } from "@/lib/assessment/questions";
import type { Responses } from "@/lib/assessment/types";
import { extractProfile } from "@/lib/engine/extract";
import { selectPathways } from "@/lib/engine/recommend";
import { buildReport, IncompleteAssessmentError } from "@/lib/engine/report";
import { validateReport } from "@/lib/engine/validate";
import { SAMPLE_BY_ID, SAMPLE_PROFILES } from "@/lib/fixtures/profiles";

const amara = SAMPLE_BY_ID.amara.responses;
const priya = SAMPLE_BY_ID.priya.responses;

describe("extractProfile", () => {
  it("separates demonstrated capabilities from stated preferences", () => {
    const p = extractProfile(amara);
    const ops = p.capabilities.find((t) => t.key === "operations")!;
    expect(ops.basis).toBe("demonstrated");
    expect(ops.confidence).toBe("strong");
    expect(ops.evidence.map((e) => e.questionId)).toEqual(expect.arrayContaining(["background", "s-org-better"]));
    expect(p.modes.every((t) => t.basis === "stated")).toBe(true);
  });

  it("records 'Not sure' answers without turning them into signals", () => {
    const p = extractProfile(amara);
    expect(p.unsure.map((q) => q.id)).toContain("s-evidence");
    expect(p.capabilities.find((t) => t.key === "research")).toBeUndefined();
  });

  it("treats financial concern as a constraint, not as lower motivation", () => {
    const withConcern = extractProfile(amara);
    const without = extractProfile({ ...amara, "x-paycut": { type: "scenario", values: ["effectiveness"] } });
    expect(withConcern.constraints.map((t) => t.key)).toContain("financial");
    expect(withConcern.motivations.find((t) => t.key === "evidence")?.score).toBe(
      without.motivations.find((t) => t.key === "evidence")?.score,
    );
  });

  it("drops themes the participant rejected", () => {
    const p = extractProfile(amara, ["capability:operations"]);
    expect(p.capabilities.map((t) => t.key)).not.toContain("operations");
  });

  it("knows when the assessment is incomplete", () => {
    const p = extractProfile({ background: { type: "select", values: ["ops"] } });
    expect(p.complete).toBe(false);
    expect(p.required).toBe(REQUIRED_QUESTION_IDS.length);
  });
});

describe("selectPathways", () => {
  it("returns three differentiated hypotheses: adjacent, stretch and no-switch", () => {
    const chosen = selectPathways(extractProfile(amara));
    expect(chosen.map((c) => c.role)).toEqual(["adjacent", "stretch", "no-switch"]);
    expect(new Set(chosen.map((c) => c.candidate.pathway.id)).size).toBe(3);
  });

  it("offers no stretch to someone who is not looking to switch", () => {
    const chosen = selectPathways(extractProfile(priya));
    expect(chosen.map((c) => c.role)).not.toContain("stretch");
    expect(chosen.filter((c) => c.role === "no-switch").length).toBeGreaterThanOrEqual(2);
  });

  it("follows stated cause interests for the stretch option", () => {
    const daniel = selectPathways(extractProfile(SAMPLE_BY_ID.daniel.responses));
    expect(daniel.find((c) => c.role === "stretch")?.candidate.pathway.cause).toBe("ai-safety");
  });

  it("replaces a rejected pathway with a different one", () => {
    const before = selectPathways(extractProfile(amara)).map((c) => c.candidate.pathway.id);
    const after = selectPathways(extractProfile(amara), [before[0]]).map((c) => c.candidate.pathway.id);
    expect(after).not.toContain(before[0]);
    expect(after).toHaveLength(3);
  });
});

describe("buildReport", () => {
  it.each(SAMPLE_PROFILES.map((p) => [p.name, p.responses] as const))("produces a valid, evidence-linked report for %s", (_, responses) => {
    const report = buildReport(responses);
    const result = validateReport(report, responses);
    expect(result.issues.filter((i) => i.severity === "error")).toEqual([]);
    expect(report.pathways).toHaveLength(3);
    expect(report.strengths.length).toBeGreaterThanOrEqual(1);
    expect(report.strengths.length).toBeLessThanOrEqual(5);
    expect(report.map.nodes.filter((n) => n.group === "pathway").every((n) => n.hypothesis)).toBe(true);
  });

  it("quotes the participant's own words verbatim", () => {
    const report = buildReport(amara);
    expect(report.story.paragraphs.some((p) => p.text.includes("rebuilt our regional distribution network"))).toBe(true);
  });

  it("uses the selected pathway's experiment", () => {
    const first = buildReport(amara);
    const other = first.pathways[2].id;
    expect(buildReport(amara, { selectedPathwayId: other }).experiment.pathwayId).toBe(other);
  });

  it("refuses to build results from an incomplete assessment", () => {
    const partial: Responses = { background: { type: "select", values: ["ops"] } };
    expect(() => buildReport(partial)).toThrow(IncompleteAssessmentError);
  });

  it("never shows numeric scores or percentages to participants", () => {
    for (const p of SAMPLE_PROFILES) {
      const text = JSON.stringify(buildReport(p.responses, { now: new Date(0) }).pathways);
      expect(text).not.toMatch(/\d+\s?%/);
      expect(text).not.toMatch(/"score"/);
    }
  });
});

describe("validateReport", () => {
  it("flags unsupported claims, invented figures and unknown sources", () => {
    const report = buildReport(amara);
    report.story.paragraphs.push({ text: "You are a 95% match and guaranteed to succeed.", evidence: [], sources: [] });
    report.pathways[0].sources.push("made-up-source");
    const { valid, issues } = validateReport(report, amara);
    expect(valid).toBe(false);
    const messages = issues.map((i) => i.message).join("\n");
    expect(messages).toMatch(/no supporting evidence/);
    expect(messages).toMatch(/percentage/);
    expect(messages).toMatch(/overstates certainty/);
    expect(messages).toMatch(/Unknown source/);
  });

  it("flags evidence that cites an unanswered question", () => {
    const report = buildReport(amara);
    report.strengths[0].evidence.push({ questionId: "s-explain", quote: "invented" });
    const withoutAnswer = { ...amara };
    delete withoutAnswer["s-explain"];
    const { issues } = validateReport(report, withoutAnswer);
    expect(issues.some((i) => i.message.includes("not answered"))).toBe(true);
  });

  it("rejects structurally invalid reports", () => {
    expect(validateReport({ nope: true }, amara).valid).toBe(false);
  });
});
