import { expect, type Page } from "@playwright/test";

export async function startAssessment(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Discover your impact pathways" }).click();
  await page.waitForURL("**/discover");
  await expect(page.getByRole("dialog", { name: "How this works" })).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).click();
}

/** Answers Part 1 with buttons and keys. Returns once on the crossroads page. */
export async function completeDiscover(page: Page, { useKeys = false } = {}) {
  await page.getByRole("button", { name: /Operations, programmes/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  const answers = ["Resonates", "Not sure", "Resonates", "Resonates", "Doesn't resonate", "Resonates", "Doesn't resonate", "Resonates"];
  const keys: Record<string, string> = { Resonates: "ArrowRight", "Doesn't resonate": "ArrowLeft", "Not sure": "ArrowDown" };
  for (let i = 0; i < answers.length; i++) {
    await expect(page.getByRole("group", { name: new RegExp(`Statement ${i + 1} of 8`) })).toBeVisible();
    if (useKeys) await page.keyboard.press(keys[answers[i]]);
    else await page.getByRole("button", { name: answers[i], exact: true }).click();
  }

  await expect(page.getByRole("heading", { name: /Which problems/ })).toBeVisible();
  await page.getByRole("button", { name: "Global health and development" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: /Rank how you'd most like to contribute/ })).toBeVisible();
  await page.getByRole("button", { name: /Move “Building and running the organisations that do” up/ }).click();
  await page.getByRole("button", { name: "Confirm order" }).click();

  await page.getByRole("textbox").fill("I rebuilt our supplier onboarding so it took days instead of months.");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.waitForURL("**/crossroads");
}

export async function completeCrossroads(page: Page) {
  const picks = [["How effective the programme's work actually is", "Whether my financial commitments would stay manageable"], ["Strengthening the organisations doing that work"], ["A small, time-boxed exploration project"]];
  for (let i = 0; i < picks.length; i++) {
    await expect(page.getByText(`Crossroads ${i + 1} of 3`)).toBeVisible();
    for (const label of picks[i]) await page.getByRole("button", { name: label }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("What this tells us")).toBeVisible();
    await page.getByRole("button", { name: i === 2 ? "See your Impact Map" : "Next crossroads" }).click();
  }
  await page.waitForURL("**/impact-map");
}

export async function noHorizontalOverflow(page: Page) {
  await page.waitForTimeout(800); // let entrance transitions settle
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page should not scroll horizontally").toBeLessThanOrEqual(0);
}
