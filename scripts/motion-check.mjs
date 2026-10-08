/**
 * Motion spot-checks: captures mid-animation frames to verify the toast
 * slides up, items land one beat at a time, and the sheet transitions.
 * Local QA only — install playwright ad hoc: npm i --no-save playwright
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:8789";
mkdirSync("qa/motion", { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? undefined,
});
const page = await browser.newPage({ viewport: { width: 1760, height: 990 } });
const kiosk = page.getByTestId("kiosk-frame");

// 1) Beat sequencing + strike: flow 01, "Place 2× Honey Chicken Sandwich".
await page.goto(`${base}/?flow=01&step=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Place 2× Honey Chicken/ }).click();
await page.waitForTimeout(200);
await kiosk.screenshot({ path: "qa/motion/1-beat1-landing.png" }); // sandwich #1 landing
await page.waitForTimeout(350); // ~550ms: beat 1 settled, amber "1 of 2" visible
await kiosk.screenshot({ path: "qa/motion/2-beat1-amber.png" });
await page.waitForTimeout(500); // ~1050ms: beat 2 landed, resolving
await kiosk.screenshot({ path: "qa/motion/3-beat2-resolve.png" });
await page.waitForTimeout(900);
await kiosk.screenshot({ path: "qa/motion/4-settled-2of8.png" });

// 2) Toast slide-up: flow 02, place the apple pie.
await page.goto(`${base}/?flow=02&step=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Place Apple Pie/ }).click();
await page.waitForTimeout(120); // mid slide-up
await kiosk.screenshot({ path: "qa/motion/5-toast-midslide.png" });
await page.waitForTimeout(600);
await kiosk.screenshot({ path: "qa/motion/6-toast-settled.png" });

// 3) Sheet enter: flow 03 via simulate button.
await page.goto(`${base}/?flow=03&step=2`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: "Simulate it for me" }).click();
await page.waitForTimeout(90); // mid fade/float
await kiosk.screenshot({ path: "qa/motion/7-sheet-mid.png" });
await page.waitForTimeout(400);
await kiosk.screenshot({ path: "qa/motion/8-sheet-settled.png" });

// 4) Console v2 overview.
await page.goto(`${base}/?flow=05&step=2`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/motion/9-console.png", fullPage: false });

await browser.close();
console.log("motion checks captured");
