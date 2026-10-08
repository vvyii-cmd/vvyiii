/** Kiosk time format, e.g. "2:14pm" (no space, lowercase, no leading zero). */
export function formatKioskTime(d: Date): string {
  const ap = d.getHours() >= 12 ? "pm" : "am";
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}${ap}`;
}
