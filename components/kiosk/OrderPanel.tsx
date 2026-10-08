"use client";

import * as React from "react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import type { LineItem, Order, ScreenEvent } from "@/lib/verify/types";
import { checkedLines } from "@/lib/verify/selectors";
import { ItemRow } from "./ItemRow";
import { CheckedZone } from "./CheckedZone";
import { CompletionState } from "./CompletionState";

/** Strike-in-place hold before a satisfied line slides into the Checked zone. */
const STRIKE_HOLD_MS = 300;
/** Slide/collapse duration. */
const SLIDE_MS = 250;

type LeavingStage = "strike" | "collapse";

const RESOLVED_BY_CAMERA: ReadonlyArray<LineItem["status"]> = ["checked"];

/**
 * The order panel: header (name, badges, N/M counter), the open item list and
 * the Checked zone, or the completion state. When a line is satisfied it
 * strikes through in place, holds briefly, then slides down into Checked;
 * lines never reorder or vanish.
 */
export function OrderPanel({
  order,
  lines,
  phase,
  recordedAt,
  dispatch,
}: {
  order: Order;
  lines: LineItem[];
  phase: "packing" | "complete";
  recordedAt?: string;
  dispatch: (e: ScreenEvent) => void;
}) {
  const [leaving, setLeaving] = React.useState<Map<string, LeavingStage>>(
    () => new Map(),
  );
  const prevRef = React.useRef<LineItem[]>(lines);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = lines;
    const departed = lines.filter((l) => {
      const before = prev.find((p) => p.id === l.id);
      return (
        before &&
        (before.status === "pending" || before.status === "partial") &&
        RESOLVED_BY_CAMERA.includes(l.status)
      );
    });
    if (departed.length === 0) return;
    setLeaving((m) => {
      const next = new Map(m);
      for (const l of departed) next.set(l.id, "strike");
      return next;
    });
    for (const l of departed) {
      timers.current.push(
        setTimeout(() => {
          setLeaving((m) => {
            if (m.get(l.id) !== "strike") return m;
            const next = new Map(m);
            next.set(l.id, "collapse");
            return next;
          });
        }, STRIKE_HOLD_MS),
        setTimeout(() => {
          setLeaving((m) => {
            if (!m.has(l.id)) return m;
            const next = new Map(m);
            next.delete(l.id);
            return next;
          });
        }, STRIKE_HOLD_MS + SLIDE_MS),
      );
    }
  }, [lines]);

  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const resolved = checkedLines(lines);
  // Animation order: while a line is striking in place nothing else changes;
  // the moment it starts sliding out ("collapse"), it surfaces as the first
  // item in the Checked zone and both counters tick — at the same time.
  const strikingQty = lines
    .filter((l) => leaving.get(l.id) === "strike")
    .reduce((n, l) => n + l.qty, 0);
  const shownResolved =
    resolved.reduce((n, l) => n + l.qty, 0) - strikingQty;
  const total = lines.reduce((n, l) => n + l.qty, 0);

  // Rows kept in the open list: unresolved lines plus lines mid-animation,
  // in ticket order (lines never reorder in place).
  const openRows = lines.filter(
    (l) =>
      l.status === "pending" ||
      l.status === "partial" ||
      leaving.has(l.id),
  );
  const checkedRows = resolved.filter((l) => leaving.get(l.id) !== "strike");

  const showComplete = phase === "complete" && leaving.size === 0;

  return (
    <div
      className={cn(
        "relative flex h-full w-[281px] shrink-0 flex-col items-start overflow-clip rounded-[10px] border border-border shadow-xl",
        showComplete ? "bg-[rgba(240,253,244,0.85)]" : "bg-white/90",
      )}
    >
      <div className="flex w-full items-center justify-between bg-gradient-to-b from-black/10 to-transparent px-3 pt-2 pb-3">
        <div className="flex flex-col items-start">
          {/* KDS-integrated build: order selection lives on the KDS, so no
              multi-order button/badge here (Figma node 124:3736). */}
          <div className="flex items-center gap-2 py-1">
            <p className="max-w-[160px] truncate text-[22px] leading-[26.4px] font-medium tracking-[-0.5px] text-foreground">
              {order.customer}
            </p>
          </div>
          <div className="flex items-start gap-1">
            <Badge className="rounded-full bg-primary px-2 py-[2px] text-xs leading-4 font-semibold text-primary-foreground">
              {order.channel}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-border bg-white px-2 py-[2px] text-xs leading-4 font-semibold text-foreground"
            >
              {order.code}
            </Badge>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center justify-end gap-[2px] text-[26px] leading-[26px] font-medium tracking-[-1px] whitespace-nowrap",
          )}
        >
          <span
            className={cn(
              showComplete
                ? "text-kiosk-green"
                : shownResolved > 0
                  ? "text-foreground"
                  : "text-muted-foreground",
            )}
          >
            {showComplete ? total : shownResolved}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{total}</span>
        </div>
      </div>

      {showComplete && recordedAt ? (
        <CompletionState lines={lines} recordedAt={recordedAt} />
      ) : (
        <>
          <div className="flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2">
            {openRows.map((l) => {
              const stage = leaving.get(l.id);
              return (
                <div
                  key={l.id}
                  className={cn(
                    "w-full shrink-0 overflow-hidden transition-all ease-in-out",
                    stage === "collapse"
                      ? "max-h-0 opacity-0"
                      : l.modifier
                        ? "max-h-16"
                        : "max-h-11",
                  )}
                  style={{ transitionDuration: `${SLIDE_MS}ms` }}
                >
                  <ItemRow
                    line={l}
                    visual={stage ? "struck" : "normal"}
                    onHold={
                      !stage && (l.status === "pending" || l.status === "partial")
                        ? () => dispatch({ type: "LONG_PRESS_ROW", lineId: l.id })
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
          <CheckedZone lines={checkedRows} />
        </>
      )}
    </div>
  );
}
