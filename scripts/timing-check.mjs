/** One-off: capture a mid-collapse frame to verify the check animation order. */
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? undefined,
});
const page = await browser.newPage({ viewport: { width: 1760, height: 990 } });
await page.goto(process.argv[2] ?? "http://localhost:8788", {
  waitUntil: "networkidle",
});
const kiosk = page.getByTestId("kiosk-frame");
const next = page.getByRole("button", { name: "Next" });
await next.click();
await page.waitForTimeout(400); // pack now settles
await next.click();
await page.waitForTimeout(310); // just as the slide begins
await kiosk.screenshot({ path: "qa/flow01/timing-mid-collapse.png" });
await browser.close();
console.log("captured");
