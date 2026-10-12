import { expect, test } from "@playwright/test";
import { beginChapter, completeCrossroads, completeDiscover, noHorizontalOverflow, startAssessment } from "./helpers";

test("a participant completes the whole journey", async ({ page }) => {
  // The full journey crosses seven chapters with real animations, so it gets more time.
  test.setTimeout(150_000);
  await startAssessment(page);
  await completeDiscover(page);

  // Financial concern is reflected neutrally.
  await expect(page.getByText("Crossroads 1 of 3")).toBeVisible();
  await completeCrossroads(page);

  // Living map: correct a mistaken interpretation, then restore it.
  await expect(page.getByRole("heading", { name: /Here's what we heard/ })).toBeVisible();
  await page.getByRole("button", { name: /^Leadership\./ }).click();
  await expect(page.getByText("What supports this")).toBeVisible();
  await page.getByRole("button", { name: /This doesn't describe me/ }).click();
  await expect(page.getByRole("button", { name: /^Leadership\./ })).toHaveCount(0);
  await page.getByRole("button", { name: "Restore Leadership" }).click();
  await expect(page.getByRole("button", { name: /^Leadership\./ })).toBeVisible();

  await page.getByRole("link", { name: "Reveal your results" }).click();
  await expect(page.getByRole("heading", { name: "Here's what your experience could make possible." })).toBeVisible();
  await expect(page.getByText(/No AI was used/)).toBeVisible();
  await page.getByRole("button", { name: "Play your results" }).click();
  await expect(page.getByRole("heading", { name: /experience may travel further than you think\.$/ })).toBeVisible();
  await expect(page.getByText(/supplier onboarding/)).toBeVisible();

  const headings = [
    "Here are the capabilities that keep showing up in your work.",
    "These are the problems and contributions that seem to matter to you.",
    "How your capabilities, motivations and possible pathways connect.",
    "Your experience may open doors you haven't explored.",
    "Every path asks something different of you.",
    "Good decisions begin with better questions.",
    "You don't need to decide your future today. You can test a possibility.",
    "One lesson, one question, and the next step is yours.",
  ];
  for (const h of headings) {
    await page.getByRole("button", { name: "Next →" }).click();
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.getByText("A question to sit with")).toBeVisible();

  // Pathways: open, compare, save, choose, reject.
  await page.getByRole("link", { name: "Explore your pathways" }).click();
  await page.waitForURL("**/pathways");
  await beginChapter(page, 5);
  const cards = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Open details" }) });
  await expect(cards).toHaveCount(3);
  await cards.first().getByRole("button", { name: "Open details" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Assumptions to check")).toBeVisible();
  await expect(dialog.getByText(/Low-cost experiment/)).toBeVisible();
  await expect(dialog.getByText("Decision rule")).toBeVisible();
  await expect(dialog.getByText("What would change this view")).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page.getByRole("table")).toContainText("Skill fit");

  await cards.nth(1).getByRole("button", { name: /Save/ }).click();
  await expect(cards.nth(1).getByRole("button", { name: /Saved/ })).toBeVisible();
  await cards.nth(1).getByRole("button", { name: "Investigate" }).click();
  await expect(page.getByText("Your seven-day experiment")).toBeVisible();

  const thirdTitle = await cards.nth(2).getByRole("heading").textContent();
  await cards.nth(2).getByRole("button", { name: "Not for me" }).click();
  await page.getByLabel("It doesn't work for me financially").check();
  await page.getByRole("button", { name: "Set aside and replace" }).click();
  await expect(page.getByRole("heading", { name: "Set aside" })).toBeVisible();
  await expect(cards).toHaveCount(3);
  await expect(cards.getByRole("heading", { name: thirdTitle! })).toHaveCount(0);

  // Passport and learning.
  await page.getByRole("link", { name: "Open your Impact Passport" }).first().click();
  await page.waitForURL("**/passport");
  await expect(page.getByRole("heading", { name: "What your experience could make possible" })).toBeVisible();
  const sections = [
    "1 · Your impact discovery",
    "2 · Your professional capital",
    "3 · What drives you",
    "4 · Opportunities worth exploring",
    "5 · Important trade-offs",
    "6 · Key unknowns",
    "7 · Your seven-day experiment",
    "8 · Your next learning step",
    "9 · A question to reflect on",
  ];
  for (const s of sections) {
    await expect(page.getByRole("heading", { name: s })).toBeVisible();
  }
  await page.evaluate(() => {
    window.print = () => {
      (window as unknown as { printed: boolean }).printed = true;
    };
  });
  await page.getByRole("button", { name: "Download PDF" }).click();
  expect(await page.evaluate(() => (window as unknown as { printed?: boolean }).printed)).toBe(true);

  await page.getByRole("link", { name: "Start the first lesson" }).click();
  await page.waitForURL("**/learn");
  await beginChapter(page, 7);
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(i < 4 ? `Section ${i + 2} of 5` : "Check your thinking", { exact: true }).last()).toBeVisible();
  }
  await page.getByLabel("The one that receives far less attention").check();
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await expect(page.getByRole("heading", { name: "Where to go from here" })).toBeVisible();
  await noHorizontalOverflow(page);
});

test("keyboard-only users can complete Part 1 with arrow keys", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard path is a desktop concern");
  await startAssessment(page);
  await completeDiscover(page, { useKeys: true });
  await expect(page.getByText("Crossroads 1 of 3")).toBeVisible();
});

test("answers survive going back, and revisions are recorded", async ({ page }) => {
  await startAssessment(page);
  await page.getByRole("button", { name: /Finance, legal/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Resonates", exact: true }).click();
  await expect(page.getByRole("group", { name: /Statement 2 of 8/ })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Earlier you chose: Resonates")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: /Finance, legal/ })).toHaveAttribute("aria-pressed", "true");
});

test("results are not shown for an empty assessment", async ({ page }) => {
  await page.goto("/reveal");
  await expect(page.getByRole("heading", { name: "Your results need a few more answers." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start the assessment" })).toBeVisible();
});

test("if the analysis service fails, results still come from the in-browser engine and say so", async ({ page }) => {
  await page.route("**/api/report", (route) => route.fulfill({ status: 500, body: "boom" }));
  await page.goto("/");
  await page.getByRole("button", { name: "View a sample profile" }).click();
  await expect(page.getByRole("heading", { name: "Here's what your experience could make possible." })).toBeVisible();
  await expect(page.getByText(/couldn't reach the analysis service/)).toBeVisible();
  await expect(page.getByText(/Demonstration: these results belong to Amara/)).toBeVisible();
});

test("swiping a card by touch answers it", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch gestures run on the mobile project");
  await startAssessment(page);
  await page.getByRole("button", { name: /Operations, programmes/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const card = page.getByTestId("swipe-card");
  await expect(card).toBeVisible();
  const box = (await card.boundingBox())!;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: startX, y }] });
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: startX + i * 22, y }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByRole("group", { name: /Statement 2 of 8/ })).toBeVisible();

  // A short drag springs back instead of answering.
  const box2 = (await card.boundingBox())!;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box2.x + 100, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box2.x + 130, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByRole("group", { name: /Statement 2 of 8/ })).toBeVisible();
});

test("dragging a card with a mouse answers it", async ({ page, isMobile }) => {
  test.skip(isMobile, "mouse drag runs on the desktop project");
  await startAssessment(page);
  await page.getByRole("button", { name: /Operations, programmes/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const box = (await page.getByTestId("swipe-card").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 260, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole("group", { name: /Statement 2 of 8/ })).toBeVisible();
});

test.describe("reduced motion", () => {
  test("the experience works without animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await startAssessment(page);
    await completeDiscover(page);
    await completeCrossroads(page);
    await page.getByRole("link", { name: "Reveal your results" }).click();
    await expect(page.getByRole("heading", { name: "Here's what your experience could make possible." })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: /experience may travel further than you think\.$/ })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Here are the capabilities that keep showing up in your work." })).toBeVisible();
  });
});

test("the dev review area loads fictional profiles and catches unsupported claims", async ({ page, isMobile }) => {
  test.skip(isMobile, "internal tool, desktop only");
  await page.goto("/dev/evaluations");
  await expect(page.getByRole("heading", { name: "Evaluation console" })).toBeVisible();
  await page.getByRole("tab", { name: "Validator" }).click();
  await expect(page.getByText("✓ Report passes validation")).toBeVisible();
  await page.getByLabel("Inject an unsupported claim to test the validator").check();
  await expect(page.getByText("✕ Report fails validation")).toBeVisible();
  await page.getByRole("tab", { name: "Funnel" }).click();
  await expect(page.getByText(/Seeded illustration/)).toBeVisible();
});
