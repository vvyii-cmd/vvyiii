// Visual QA for the demo shell layout: kiosk centered, console bar below.
// Usage: PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium node scripts/layout-check.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:8790";
const OUT = "qa/layout";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM,
});

const shots = [
  { name: "1-wide-start", width: 1512, height: 982, url: "/" },
  { name: "2-wide-midflow", width: 1512, height: 982, url: "/?flow=01&step=4" },
  { name: "3-wide-branch", width: 1512, height: 982, url: "/?flow=05&step=5" },
  { name: "4-laptop-midflow", width: 1280, height: 800, url: "/?flow=02&step=3" },
  { name: "5-narrow-midflow", width: 1024, height: 768, url: "/?flow=04&step=2" },
  { name: "6-wide-screenstep", width: 1512, height: 982, url: "/?flow=02&step=4" },
];

for (const s of shots) {
  const page = await browser.newPage({
    viewport: { width: s.width, height: s.height },
  });
  await page.goto(`${BASE}${s.url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${s.name}.png` });
  await page.close();
  console.log(`captured ${s.name}`);
}

// Events log expanded on the wide viewport.
const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
await page.goto(`${BASE}/?flow=01&step=7`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.getByRole("button", { name: /Events/ }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/7-wide-log-open.png` });
await page.close();
console.log("captured 7-wide-log-open");

await browser.close();
