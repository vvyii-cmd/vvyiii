"use client";

import { Check } from "lucide-react";
import { cn } from "cn";
import type { Notification as NotificationModel, ScreenEvent } from "@/lib/verify/types";
import { usePresence } from "./motion";

function copy(n: NotificationModel): { title: string; subtitle: string } {
  switch (n.kind) {
    case "checked_by_you":
      return { title: "Checked by you", subtitle: n.itemName };
    case "manager_notified":
      return {
        title: "Notified your manager",
        subtitle: `${n.itemName} • Sold out`,
      };
    case "swapped":
      return {
        title: "Swapped",
        subtitle: `x${n.fromQty} ${n.fromName} →  x${n.toQty} ${n.toName}`,
      };
  }
}

/**
 * Status notification: slides in from the right edge of the stage and slides
 * back out when superseded. Carries an Undo button while a human-confirmed
 * check can still be reverted.
 */
export function Notification({
  notification,
  dispatch,
}: {
  notification: NotificationModel | undefined;
  dispatch: (e: ScreenEvent) => void;
}) {
  const { item, exiting } = usePresence(notification, 200);
  if (!item) return null;
  const key = `${item.kind}:${"itemName" in item ? item.itemName : ""}`;
  const { title, subtitle } = copy(item);

  return (
    <div
      key={key}
      className={cn(
        "absolute top-0 right-0 flex max-w-full items-center gap-4 overflow-clip rounded-[10px] border border-kiosk-border bg-kiosk-card px-3 py-2",
        exiting ? "kiosk-exit-note" : "kiosk-enter-note",
      )}
      data-testid="notification"
    >
      <div className="flex w-[376px] max-w-full items-start gap-3">
        <div className="flex items-center pt-[2px]">
          <Check className="size-4 text-white" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[2px] text-sm leading-5">
          <p className="w-full font-medium text-white">{title}</p>
          <p className="w-full font-normal whitespace-pre-wrap text-kiosk-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      {item.kind === "checked_by_you" ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "UNDO" })}
          className="flex shrink-0 items-center justify-center rounded-[8px] border border-kiosk-border bg-black/30 px-2 py-[3px]"
        >
          <span className="text-[16px] leading-6 font-medium text-white">Undo</span>
        </button>
      ) : null}
    </div>
  );
}
