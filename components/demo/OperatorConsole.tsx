"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
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
import type { Flow } from "@/lib/demo/flows";
import type { OutboundEvent } from "@/lib/verify/types";

export type OutboundLogEntry = {
  seq: number;
  at: string;
  event: OutboundEvent;
};

/**
 * Demo-only operator console: fires the world events the camera would observe.
 * Deletable without touching anything in components/kiosk.
 */
export function OperatorConsole({
  flow,
  fired,
  onFire,
  onPrev,
  onReset,
  outbound,
}: {
  flow: Flow;
  fired: number;
  onFire: () => void;
  onPrev: () => void;
  onReset: () => void;
  outbound: OutboundLogEntry[];
}) {
  const current = flow.steps[fired];
  return (
    <Card className="w-full max-w-sm gap-4">
      <CardHeader>
        <CardTitle>{flow.title}</CardTitle>
        <CardDescription>{flow.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw data-icon="inline-start" />
            Reset flow
          </Button>
          <Button variant="outline" size="sm" onClick={onPrev} disabled={fired === 0}>
            <ArrowLeft data-icon="inline-start" />
            Prev
          </Button>
          <Button size="sm" onClick={onFire} disabled={!current}>
            Next
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        <ol className="flex flex-col gap-1">
          {flow.steps.map((step, i) => {
            const isCurrent = i === fired;
            const done = i < fired;
            return (
              <li key={i} className="flex flex-col">
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
                    {step.label}
                  </Button>
                </div>
                {isCurrent && step.expect ? (
                  <p className="pt-0.5 pl-7 text-xs text-muted-foreground">
                    → {step.expect}
                  </p>
                ) : null}
                {isCurrent && step.screenHint ? (
                  <p className="pt-0.5 pl-7 text-xs font-medium">
                    👆 You tap on the kiosk: {step.screenHint}
                  </p>
                ) : null}
              </li>
            );
          })}
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
