"use client";

import { ArchiveX, Repeat, ScanLine } from "lucide-react";
import { cn } from "cn";
import type { LineItem, ScreenEvent } from "@/lib/verify/types";
import { usePresence } from "./motion";

const OPTIONS: {
  option: "camera_missed" | "sold_out" | "swap";
  title: string;
  subtitle: string;
  Icon: typeof ScanLine;
}[] = [
  {
    option: "camera_missed",
    title: "Camera missed it",
    subtitle: "Mark as checked",
    Icon: ScanLine,
  },
  {
    option: "sold_out",
    title: "It’s sold out",
    subtitle: "Your manager gets a message",
    Icon: ArchiveX,
  },
  {
    option: "swap",
    title: "Swap",
    subtitle: "Replace with another item",
    Icon: Repeat,
  },
];

/**
 * "Not checked yet. What happened?" — opened by long-pressing an open line.
 * The dim mask fades and the dark dialog floats up; tapping outside dismisses.
 */
export function WhatHappenedSheet({
  line,
  dispatch,
}: {
  line: LineItem | undefined;
  dispatch: (e: ScreenEvent) => void;
}) {
  const { item, exiting } = usePresence(line, 280);
  if (!item) return null;

  return (
    <div className="absolute inset-0 z-30" data-testid="what-happened-sheet">
      <button
        type="button"
        aria-label="Dismiss"
        className={cn(
          "absolute inset-0 bg-black/60",
          exiting ? "kiosk-exit-fade" : "kiosk-enter-fade",
        )}
        onClick={() => dispatch({ type: "DISMISS_SHEET" })}
      />
      <div
        className={cn(
          "absolute top-[161px] left-[315px] flex w-[469px] flex-col items-start overflow-clip rounded-[14px] border border-kiosk-border bg-kiosk-card",
          exiting ? "kiosk-exit-sheet" : "kiosk-enter-sheet",
        )}
      >
        <div className="flex w-full flex-col items-start justify-center gap-4 p-4">
          <div className="flex w-full flex-col items-start">
            <p className="w-full text-[18px] leading-[27px] font-medium text-white">
              {item.name}
            </p>
            <p className="w-full text-sm leading-5 font-normal text-kiosk-muted-foreground">
              Not checked yet. What happened?
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            {OPTIONS.map(({ option, title, subtitle, Icon }) => (
              <button
                key={option}
                type="button"
                onClick={() => dispatch({ type: "CHOOSE", option })}
                className="flex w-full items-start gap-3 rounded-[10px] bg-white/5 p-2 text-left transition-colors active:bg-white/15"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-kiosk-muted">
                  <Icon className="size-6 text-white" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <p className="w-full text-[18px] leading-[27px] font-medium text-white">
                    {title}
                  </p>
                  <p className="w-full text-sm leading-5 font-normal text-kiosk-muted-foreground">
                    {subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
