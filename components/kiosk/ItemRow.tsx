"use client";

import * as React from "react";
import { cn } from "cn";
import type { LineItem } from "@/lib/verify/types";

export type ItemRowVisual = "normal" | "struck" | "dimmed" | "highlighted";

/** Hold duration before the "What happened?" sheet opens. */
const LONG_PRESS_MS = 500;

/**
 * One open order line (44px touch target). A long press — not a tap — raises
 * the row action (the "What happened?" sheet); the row highlights while held.
 * Strike-through happens in place before the line slides into the Checked
 * zone (handled by OrderPanel).
 */
export function ItemRow({
  line,
  visual = "normal",
  onHold,
}: {
  line: LineItem;
  visual?: ItemRowVisual;
  onHold?: () => void;
}) {
  const [pressing, setPressing] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  }, []);

  React.useEffect(() => cancel, [cancel]);

  const start = () => {
    if (!onHold) return;
    setPressing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPressing(false);
      onHold();
    }, LONG_PRESS_MS);
  };

  const struck = visual === "struck";
  return (
    <div
      role={onHold ? "button" : undefined}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "flex w-full touch-none items-center justify-between rounded-[8px] text-left select-none",
        (pressing || visual === "highlighted") && "bg-black/10 opacity-80",
        visual === "dimmed" && "opacity-50",
      )}
      data-line-id={line.id}
    >
      <div className="flex h-11 min-w-0 flex-1 items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <div className="flex w-full items-center gap-1 text-[18px] leading-[27px] whitespace-nowrap">
            <span
              className={cn(
                "shrink-0 font-medium text-muted-foreground",
                struck && "line-through",
              )}
            >
              x{line.qty}{" "}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate font-semibold text-foreground",
                struck && "text-muted-foreground line-through",
              )}
            >
              {line.name}
            </span>
          </div>
          {line.modifier ? (
            <p
              className={cn(
                "w-full truncate text-sm leading-5 font-normal text-muted-foreground",
                struck && "line-through",
              )}
            >
              {line.modifier}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
