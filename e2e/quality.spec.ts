import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { noHorizontalOverflow } from "./helpers";

async function axe(page: Page) {
  await page.waitForTimeout(1200); // fades in progress would otherwise be reported as low contrast
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([]);
}

/** Loads the fictional sample so result pages have content, then navigates client-side. */
async function openSample(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "View a sample profile" }).click();
  await expect(page.getByRole("heading", { name: "Your career has equipped you with more than a job title." })).toBeVisible();
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  test("landing", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    await axe(page);
  });

  test("discover and crossroads", async ({ page }) => {
    await page.goto("/discover");
    await page.getByRole("button", { name: "Skip" }).click();
    await axe(page);
    await page.getByRole("button", { name: /Operations, programmes/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(800);
    await axe(page);
    await page.goto("/crossroads");
    await page.waitForTimeout(800);
    await axe(page);
  });

  test("results, pathways, passport and learning", async ({ page }) => {
    await openSample(page);
    await axe(page);
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next →" }).click();
    await page.waitForTimeout(1200);
    await axe(page);
    await page.getByRole("button", { name: "Next →" }).click();
    await page.getByRole("link", { name: "Explore and compare these pathways" }).click();
    await expect(page.getByRole("heading", { name: "Three hypotheses, side by side." })).toBeVisible();
    await page.waitForTimeout(800);
    await axe(page);
    await page.getByRole("link", { name: "Open your Impact Passport" }).click();
    await expect(page.getByRole("heading", { name: "What your experience could make possible" })).toBeVisible();
    await axe(page);
    await page.getByRole("link", { name: "Start the first lesson" }).click();
    await expect(page.getByRole("heading", { name: /Judging whether a career path/ })).toBeVisible();
    await axe(page);
  });
});

const VIEWPORTS = [
  { name: "small-mobile", width: 320, height: 640 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet-portrait", width: 820, height: 1180 },
  { name: "tablet-landscape", width: 1180, height: 820 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport sweep runs once, on the desktop project");
    await page.setViewportSize(vp);
    await page.goto("/");
    await page.waitForTimeout(600);
    await noHorizontalOverflow(page);
    await page.goto("/discover");
    await page.getByRole("button", { name: "Skip" }).click();
    await page.getByRole("button", { name: /Operations, programmes/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("swipe-card")).toBeVisible();
    await noHorizontalOverflow(page);
    await page.screenshot({ path: `test-results/screens/${vp.name}-discover.png` });
    await openSample(page);
    await noHorizontalOverflow(page);
    await page.screenshot({ path: `test-results/screens/${vp.name}-reveal.png`, fullPage: true });
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next →" }).click();
    await page.waitForTimeout(1200);
    await noHorizontalOverflow(page);
    await page.screenshot({ path: `test-results/screens/${vp.name}-map.png`, fullPage: true });
  });
}
