"use client";

import * as React from "react";
import { FlowSelector } from "@/components/demo/FlowSelector";
import {
  OperatorConsole,
  type OutboundLogEntry,
} from "@/components/demo/OperatorConsole";
import { KioskFrame } from "@/components/kiosk/KioskFrame";
import { VerifyScreen } from "@/components/kiosk/VerifyScreen";
import { FLOW_01, type Flow } from "@/lib/demo/flows";
import { formatKioskTime } from "@/lib/verify/format";
import { createKdsIntegratedIngress } from "@/lib/verify/ingress";
import { initialState, reduce } from "@/lib/verify/reducer";
import type { ScreenEvent, SessionState, VerifyEvent } from "@/lib/verify/types";

const { ingress } = createKdsIntegratedIngress();

export default function DemoPage() {
  const [flow, setFlow] = React.useState<Flow>(FLOW_01);
  const [history, setHistory] = React.useState<SessionState[]>([initialState]);
  const [outbound, setOutbound] = React.useState<OutboundLogEntry[]>([]);
  const seqRef = React.useRef(0);

  const fired = history.length - 1;
  const state = history[fired];

  const apply = (base: SessionState, events: VerifyEvent[]) => {
    const now = formatKioskTime(new Date());
    let next = base;
    const entries: OutboundLogEntry[] = [];
    for (const event of events) {
      const result = reduce(next, event, now);
      next = result.state;
      for (const out of result.outbound) {
        entries.push({ seq: ++seqRef.current, at: now, event: out });
      }
    }
    if (entries.length > 0) setOutbound((prev) => [...entries.reverse(), ...prev]);
    return next;
  };

  const fireStep = () => {
    const step = flow.steps[fired];
    if (!step) return;
    const next = apply(state, step.events);
    setHistory((h) => [...h, next]);
  };

  const dispatchScreen = (event: ScreenEvent) => {
    const next = apply(state, [event]);
    setHistory((h) => [...h.slice(0, -1), next]);
  };

  const reset = () => {
    setHistory([initialState]);
    setOutbound([]);
  };

  const selectFlow = (next: Flow) => {
    setFlow(next);
    reset();
  };

  const prev = () => {
    if (fired > 0) setHistory((h) => h.slice(0, -1));
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col gap-6 bg-muted/40 px-6 py-6">
      <FlowSelector activeId={flow.id} onSelect={selectFlow} />
      <div className="flex flex-1 flex-col items-center gap-6 xl:flex-row xl:items-start xl:justify-center">
        <div className="flex max-h-[80dvh] w-full max-w-5xl flex-1 items-start justify-center">
          <KioskFrame>
            <VerifyScreen state={state} ingress={ingress} dispatch={dispatchScreen} />
          </KioskFrame>
        </div>
        <OperatorConsole
          flow={flow}
          fired={fired}
          onFire={fireStep}
          onPrev={prev}
          onReset={reset}
          outbound={outbound}
        />
      </div>
    </main>
  );
}
