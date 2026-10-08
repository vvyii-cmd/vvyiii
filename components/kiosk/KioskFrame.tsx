"use client";

import * as React from "react";

/**
 * The kiosk is a fixed 800×480 logical canvas (plus an 8px device bezel).
 * It renders at exactly 800×480 CSS px and the whole frame scales uniformly
 * to fit its container, so viewers always see true device proportions.
 * Nothing inside ever reflows.
 */
const CANVAS_W = 800;
const CANVAS_H = 480;
const BEZEL = 8;
const OUTER_W = CANVAS_W + 2 * BEZEL;
const OUTER_H = CANVAS_H + 2 * BEZEL;

export function KioskFrame({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setScale(Math.min(r.width / OUTER_W, r.height / OUTER_H));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center"
    >
      <div style={{ width: OUTER_W * scale, height: OUTER_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div
            data-testid="kiosk-frame"
            className="relative box-content overflow-clip rounded-[16px] border-8 border-black bg-black shadow-2xl"
            style={{ width: CANVAS_W, height: CANVAS_H }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
