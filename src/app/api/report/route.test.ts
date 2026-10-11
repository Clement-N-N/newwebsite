// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { POST } = await import("./route");
const { SAMPLE_BY_ID } = await import("@/lib/fixtures/profiles");

const post = (body: unknown) =>
  POST(new Request("http://test/api/report", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }));

describe("POST /api/report", () => {
  it("returns a validated rules-based report when no AI key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await post({ responses: SAMPLE_BY_ID.amara.responses });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ai.status).toBe("not-configured");
    expect(data.report.meta.narrative).toBe("rules");
    expect(data.validation.valid).toBe(true);
  });

  it("never sends sample profiles to the AI service", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-not-used";
    const res = await post({ responses: SAMPLE_BY_ID.amara.responses, sample: true });
    const data = await res.json();
    expect(data.ai.status).toBe("not-configured");
    expect(data.report.meta.sample).toBe(true);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("rejects incomplete assessments with 422", async () => {
    const res = await post({ responses: { background: { type: "select", values: ["ops"] } } });
    expect(res.status).toBe(422);
  });

  it("rejects malformed input with 400", async () => {
    const res = await post({ responses: { background: { type: "swipe", value: "maybe" } } });
    expect(res.status).toBe(400);
  });
});
