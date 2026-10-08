"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  GitBranch,
  Hand,
  Loader2,
  RotateCcw,
} from "lucide-react";
import * as React from "react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flow, FlowStep } from "@/lib/demo/flows";
import type { OutboundEvent } from "@/lib/verify/types";

export type OutboundLogEntry = {
  seq: number;
  at: string;
  event: OutboundEvent;
};

/**
 * Demo-only operator console. One big button drives the scene; steps render
 * as a dot progress bar instead of a wall of text. Deletable without touching
 * anything in components/kiosk.
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
    <Card className="w-full max-w-sm gap-4">
      <CardHeader className="gap-1">
        <CardTitle className="text-base">{flow.title}</CardTitle>
        <div className="flex items-center gap-2 pt-1">
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
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="size-3" />
              {branch.label}
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {atBranchPoint && flow.branches ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">What happens next?</p>
            {flow.branches.map((b) => (
              <Button
                key={b.id}
                variant="outline"
                size="xl"
                className="w-full justify-start"
                onClick={() => onSelectBranch(b.id)}
              >
                <GitBranch data-icon="inline-start" />
                {b.label}
              </Button>
            ))}
          </div>
        ) : current ? (
          <div className="flex flex-col gap-2">
            {current.kind === "screen" ? (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
                  <Hand className="mt-0.5 size-5 shrink-0" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-sm leading-5 font-semibold">
                      {current.label}
                    </p>
                    {current.screenHint ? (
                      <p className="text-xs leading-4 text-muted-foreground">
                        {current.screenHint}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full"
                  onClick={onFire}
                  disabled={busy}
                >
                  Simulate it for me
                </Button>
              </>
            ) : (
              <Button
                size="2xl"
                className="w-full"
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
            {current.expect ? (
              <p className="line-clamp-2 text-xs leading-4 text-muted-foreground">
                {current.expect}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {flowDone ? "Flow complete — reset or pick another flow." : ""}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={onPrev}
            disabled={currentIndex === 0 && !branchId}
            title="←"
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={onReset}
            title="R"
          >
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </div>

        <Separator />

        <button
          type="button"
          className="flex items-center gap-2 text-left text-sm font-medium"
          onClick={() => setShowLog((s) => !s)}
          aria-expanded={showLog}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", !showLog && "-rotate-90")}
          />
          Outbound events
          <Badge variant="secondary" className="ml-auto">
            {outbound.length}
          </Badge>
        </button>
        {showLog ? (
          outbound.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing sent yet — completion, sold-out and swap emit here.
            </p>
          ) : (
            <ul className="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
              {outbound.map((entry) => (
                <li key={entry.seq} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {entry.event.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.at}
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded bg-muted px-2 py-1 font-mono text-[10px] leading-4 text-muted-foreground">
                    {JSON.stringify(entry.event, null, 0)}
                  </pre>
                </li>
              ))}
            </ul>
          )
        ) : null}

        <p className="text-center text-[10px] text-muted-foreground">
          ← back · → next · R reset · 1–5 flows
        </p>
      </CardContent>
    </Card>
  );
}
