"use client";

import { ArrowLeft, ArrowRight, GitBranch, RotateCcw } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flow, FlowStep } from "@/lib/demo/flows";
import type { OutboundEvent } from "@/lib/verify/types";

export type OutboundLogEntry = {
  seq: number;
  at: string;
  event: OutboundEvent;
};

/**
 * Demo-only operator console: fires the world events the camera would observe
 * and guides the presenter through kiosk gestures. Deletable without touching
 * anything in components/kiosk.
 */
export function OperatorConsole({
  flow,
  steps,
  currentIndex,
  branchId,
  atBranchPoint,
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
  onSelectBranch: (id: string) => void;
  onFire: () => void;
  onPrev: () => void;
  onReset: () => void;
  outbound: OutboundLogEntry[];
}) {
  const current = steps[currentIndex];
  const branch = flow.branches?.find((b) => b.id === branchId);
  return (
    <Card className="w-full max-w-sm gap-4">
      <CardHeader>
        <CardTitle>{flow.title}</CardTitle>
        <CardDescription>{flow.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} title="R">
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentIndex === 0 && !branchId}
            title="←"
          >
            <ArrowLeft data-icon="inline-start" />
            Prev
          </Button>
          <Button size="sm" onClick={onFire} disabled={!current} title="→">
            Next
            <ArrowRight data-icon="inline-end" />
          </Button>
          <span className="ml-auto text-[10px] text-muted-foreground">
            ← → · R · 1–5
          </span>
        </div>

        <ol className="flex flex-col gap-1">
          {steps.map((step, i) => {
            const isCurrent = i === currentIndex;
            const done = i < currentIndex;
            return (
              <li key={`${i}-${step.label}`} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      done
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-2 border-primary text-primary"
                          : "border border-border text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <Button
                    variant={isCurrent ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-auto min-h-7 flex-1 justify-start py-1 text-left whitespace-normal",
                      !isCurrent && "text-muted-foreground",
                    )}
                    disabled={!isCurrent}
                    onClick={onFire}
                  >
                    {step.kind === "screen" ? "👆 " : ""}
                    {step.label}
                  </Button>
                </div>
                {isCurrent && step.screenHint ? (
                  <p className="pt-0.5 pl-7 text-xs font-medium">
                    You do it on the kiosk: {step.screenHint}
                  </p>
                ) : null}
                {isCurrent && step.expect ? (
                  <p className="pt-0.5 pl-7 text-xs text-muted-foreground">
                    → {step.expect}
                  </p>
                ) : null}
              </li>
            );
          })}
          {atBranchPoint && flow.branches ? (
            <li className="flex flex-col gap-1 pt-1">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <GitBranch className="size-3" /> Pick a branch
              </p>
              <div className="flex flex-wrap gap-1.5 pl-5">
                {flow.branches.map((b) => (
                  <Button
                    key={b.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectBranch(b.id)}
                  >
                    {b.label}
                  </Button>
                ))}
              </div>
            </li>
          ) : null}
          {branch ? (
            <li className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
              <GitBranch className="size-3" /> Branch: {branch.label}
            </li>
          ) : null}
        </ol>

        <Separator />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Outbound events</p>
          {outbound.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing sent yet — completion, sold-out and swap emit here.
            </p>
          ) : (
            <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
