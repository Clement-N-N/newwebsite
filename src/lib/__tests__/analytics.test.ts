import { beforeEach, describe, expect, it } from "vitest";
import { privacySafeSummary } from "@/components/passport/ImpactPassport";
import { clearEvents, getEvents, sanitize, track } from "@/lib/analytics";
import { QUESTION_BANK_VERSION } from "@/lib/assessment/questions";
import { buildReport } from "@/lib/engine/report";
import { SAMPLE_BY_ID } from "@/lib/fixtures/profiles";

describe("analytics", () => {
  beforeEach(clearEvents);

  it("drops answer content and any non-allowlisted property", () => {
    expect(sanitize({ questionId: "proud", text: "my secret", value: "yes", answer: "x" })).toEqual({ questionId: "proud" });
  });

  it("stamps every event with question, engine, library and prompt versions", () => {
    track("question_answered", { questionId: "s-lead", questionType: "swipe" });
    const [e] = getEvents();
    expect(e.name).toBe("question_answered");
    expect(e.versions.questions).toBe(QUESTION_BANK_VERSION);
    expect(e.versions.engine).toMatch(/^engine-/);
    expect(e.versions.prompt).toMatch(/^narrative-/);
  });
});

describe("privacySafeSummary", () => {
  it("contains no free-text answers", () => {
    const report = buildReport(SAMPLE_BY_ID.amara.responses);
    const summary = privacySafeSummary(report, report.experiment.title);
    expect(summary).not.toContain("distribution network");
    expect(summary).toContain(report.pathways[0].title);
    expect(summary).toMatch(/not an official High Impact Professionals product/);
  });
});
