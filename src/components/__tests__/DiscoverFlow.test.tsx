import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { DiscoverFlow } from "@/components/discover/DiscoverFlow";
import { AssessmentProvider, useAssessment } from "@/lib/state/AssessmentProvider";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/discover" }));

beforeAll(() => {
  // Reduced motion shortens card commits to a quick fade, so the test exercises logic rather than animation timing.
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

let latest: ReturnType<typeof useAssessment>;
function Probe() {
  latest = useAssessment();
  return null;
}

async function setup() {
  render(
    <AssessmentProvider>
      <Probe />
      <DiscoverFlow />
    </AssessmentProvider>,
  );
  act(() => latest.markChapterSeen("discover"));
  fireEvent.click(await screen.findByRole("button", { name: /Operations, programmes/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByRole("group", { name: /Statement 1 of 8/ });
}

describe("DiscoverFlow", () => {
  it("records swipe answers from buttons and arrow keys, and lets people go back and revise", async () => {
    await setup();
    fireEvent.click(screen.getByRole("button", { name: "Resonates" }));
    await waitFor(() => expect(latest.responses["s-org-better"]).toEqual({ type: "swipe", value: "yes" }));

    await screen.findByRole("group", { name: /Statement 2 of 8/ });
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
    await waitFor(() => expect(latest.responses["s-evidence"]).toEqual({ type: "swipe", value: "no" }));

    await screen.findByRole("group", { name: /Statement 3 of 8/ });
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    await waitFor(() => expect(latest.responses["s-built"]).toEqual({ type: "swipe", value: "unsure" }));

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText(/Earlier you chose/)).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    await waitFor(() => expect(latest.responses["s-built"]).toEqual({ type: "swipe", value: "yes" }));
  });

  it("does not let arrow keys answer while focus is in another control", async () => {
    await setup();
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(latest.responses["s-org-better"]).toBeUndefined();
    input.remove();
  });
});
