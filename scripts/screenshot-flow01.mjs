/**
 * Captures each Flow 01 state from the running demo for visual QA against the
 * Figma frames (brief §9 definition of done).
 *
 * Usage: node scripts/screenshot-flow01.mjs [baseUrl] [outDir]
 * Default baseUrl http://localhost:8788, outDir ./qa/flow01
 *
 * Local QA only — playwright is intentionally not a project dependency (the
 * deployment platform runs npm ci): install it ad hoc with
 *   npm i --no-save playwright
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const baseUrl = process.argv[2] ?? "http://localhost:8788";
const outDir = process.argv[3] ?? "qa/flow01";
mkdirSync(outDir, { recursive: true });

const executablePath = process.env.PLAYWRIGHT_CHROMIUM ?? undefined;

const browser = await chromium.launch(
  executablePath ? { executablePath } : undefined,
);
const page = await browser.newPage({ viewport: { width: 1760, height: 990 } });
await page.goto(baseUrl, { waitUntil: "networkidle" });

const kiosk = page.getByTestId("kiosk-frame");
const next = page.getByRole("button", { name: "Next" });

const shot = async (name) => {
  await kiosk.screenshot({ path: `${outDir}/${name}.png` });
  console.log(`captured ${name}`);
};

// 0 — idle / empty state
await page.waitForTimeout(400);
await shot("0-idle");

// 1 — Pack Now on KDS → 0/8
await next.click();
await page.waitForTimeout(400);
await shot("1-loaded-0of8");

// 2 — Place 2× Honey Chicken Sandwich: strike in place, then 2/8
await next.click();
await page.waitForTimeout(120); // inside the 300ms strike hold
await shot("2a-strike-in-place");
await page.waitForTimeout(900);
await shot("2b-checked-2of8");

// 3..5 — Classic, Wings, Fries
for (const step of ["3-classic", "4-wings", "5-fries"]) {
  await next.click();
  await page.waitForTimeout(900);
  await shot(step);
}

// 6 — 2× Biscuit → 7/8
await next.click();
await page.waitForTimeout(900);
await shot("6-biscuits-7of8");

// 7 — Dt Coke → completion
await next.click();
await page.waitForTimeout(1200);
await shot("7-complete-8of8");

// 8 — Clear the mat → idle
await next.click();
await page.waitForTimeout(400);
await shot("8-cleared-idle");

await browser.close();
