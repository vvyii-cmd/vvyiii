"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  GitBranch,
  Hand,
  Loader2,
  RotateCcw,
} from "lucide-react";
import * as React from "react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flow, FlowStep } from "@/lib/demo/flows";
import type { OutboundEvent } from "@/lib/verify/types";

export type OutboundLogEntry = {
  seq: number;
  at: string;
  event: OutboundEvent;
};

/**
 * Demo-only operator console: a horizontal bar under the kiosk. One big
 * button drives the scene; steps render as dot progress. Deletable without
 * touching anything in components/kiosk.
 */
export function OperatorConsole({
  flow,
  steps,
  currentIndex,
  branchId,
  atBranchPoint,
  busy,
  onSelectBranch,
  onFire,
  onPrev,
  onReset,
  outbound,
}: {
  flow: Flow;
  steps: FlowStep[];
  currentIndex: number;
  branchId?: string;
  atBranchPoint: boolean;
  busy: boolean;
  onSelectBranch: (id: string) => void;
  onFire: () => void;
  onPrev: () => void;
  onReset: () => void;
  outbound: OutboundLogEntry[];
}) {
  const [showLog, setShowLog] = React.useState(false);
  const current = steps[currentIndex];
  const branch = flow.branches?.find((b) => b.id === branchId);
  const flowDone = !current && !atBranchPoint;

  return (
    <Card className="w-full max-w-6xl gap-0 px-4 py-3">
      <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
        {/* Flow + progress */}
        <div className="flex min-w-44 flex-col gap-1.5">
          <p className="text-sm leading-5 font-semibold">{flow.title}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-2.5 rounded-full transition-colors",
                    i < currentIndex
                      ? "bg-primary"
                      : i === currentIndex
                        ? "bg-background ring-2 ring-primary"
                        : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.min(currentIndex, steps.length)}/{steps.length}
            </span>
            {branch ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GitBranch className="size-3" />
                {branch.label}
              </span>
            ) : null}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden h-10 sm:block" />

        {/* Main action */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {atBranchPoint && flow.branches ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium whitespace-nowrap">
                What happens next?
              </p>
              {flow.branches.map((b) => (
                <Button
                  key={b.id}
                  variant="outline"
                  size="xl"
                  onClick={() => onSelectBranch(b.id)}
                >
                  <GitBranch data-icon="inline-start" />
                  {b.label}
                </Button>
              ))}
            </div>
          ) : current ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                {current.kind === "screen" ? (
                  <>
                    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-muted px-3 py-2">
                      <Hand className="size-5 shrink-0" />
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate text-sm leading-5 font-semibold">
                          {current.label}
                        </p>
                        {current.screenHint ? (
                          <p className="truncate text-xs leading-4 text-muted-foreground">
                            {current.screenHint}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={onFire}
                      disabled={busy}
                    >
                      Simulate it for me
                    </Button>
                  </>
                ) : (
                  <Button
                    size="2xl"
                    className="max-w-full min-w-64"
                    onClick={onFire}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : null}
                    <span className="truncate">{current.label}</span>
                    {!busy ? <ArrowRight data-icon="inline-end" /> : null}
                  </Button>
                )}
              </div>
              {current.expect ? (
                <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
                  {current.expect}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {flowDone ? "Flow complete — reset or pick another flow." : ""}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xl"
            onClick={onPrev}
            disabled={currentIndex === 0 && !branchId}
            title="←"
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <Button variant="outline" size="xl" onClick={onReset} title="R">
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="xl"
            onClick={() => setShowLog((s) => !s)}
            aria-expanded={showLog}
          >
            <ChevronUp
              data-icon="inline-start"
              className={cn("transition-transform", showLog && "rotate-180")}
            />
            Events
            <Badge variant="secondary">{outbound.length}</Badge>
          </Button>
        </div>
      </div>

      {showLog ? (
        <div className="mt-3 border-t pt-3">
          {outbound.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing sent yet — completion, sold-out and swap emit here.
            </p>
          ) : (
            <ul className="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
              {outbound.map((entry) => (
                <li key={entry.seq} className="flex items-center gap-2">
                  <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                    {entry.event.type}
                  </Badge>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {entry.at}
                  </span>
                  <pre className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-0.5 font-mono text-[10px] leading-4 text-muted-foreground">
                    {JSON.stringify(entry.event, null, 0)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </Card>
  );
}
