/**
 * Captures the key states of flows 02–05 through URL deep links (which also
 * exercises the deep-link replay) for visual QA against the Figma frames.
 *
 * Usage: node scripts/screenshot-flows.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const baseUrl = process.argv[2] ?? "http://localhost:8788";
const outDir = process.argv[3] ?? "qa/flows";
mkdirSync(outDir, { recursive: true });

const SHOTS = [
  // flow 02
  ["02-1wrong", "flow=02&step=2"],
  ["02-2wrong", "flow=02&step=3&branch=multi"],
  ["02-removed", "flow=02&step=4&branch=multi"],
  // flow 03
  ["03-unread", "flow=03&step=2"],
  ["03-sheet", "flow=03&step=3"],
  ["03-checkedbyyou", "flow=03&step=4"],
  ["03-undone", "flow=03&step=5"],
  // flow 04
  ["04-1of3", "flow=04&step=2"],
  ["04-resolved", "flow=04&step=3&branch=all"],
  ["04-4of3", "flow=04&step=3&branch=extra"],
  ["04-extra-resolved", "flow=04&step=4&branch=extra"],
  // flow 05
  ["05-sheet", "flow=05&step=2"],
  ["05-soldout-toast", "flow=05&step=3&branch=soldout"],
  ["05-soldout-complete", "flow=05&step=5&branch=soldout"],
  ["05-swap-waiting", "flow=05&step=3&branch=swap"],
  ["05-swap-placed", "flow=05&step=4&branch=swap"],
  ["05-swapped", "flow=05&step=5&branch=swap"],
  ["05-swap-complete", "flow=05&step=7&branch=swap"],
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? undefined,
});
const page = await browser.newPage({ viewport: { width: 1760, height: 990 } });

for (const [name, query] of SHOTS) {
  await page.goto(`${baseUrl}/?${query}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900); // deep-link replay + animations settle
  await page.getByTestId("kiosk-frame").screenshot({ path: `${outDir}/${name}.png` });
  console.log(`captured ${name}`);
}

await browser.close();
