"use client";

import * as React from "react";
import { FlowSelector } from "@/components/demo/FlowSelector";
import {
  OperatorConsole,
  type OutboundLogEntry,
} from "@/components/demo/OperatorConsole";
import { KioskFrame } from "@/components/kiosk/KioskFrame";
import { VerifyScreen } from "@/components/kiosk/VerifyScreen";
import { effectiveSteps, FLOWS, type Flow } from "@/lib/demo/flows";
import { formatKioskTime } from "@/lib/verify/format";
import { createKdsIntegratedIngress } from "@/lib/verify/ingress";
import { initialState, reduce } from "@/lib/verify/reducer";
import type {
  OutboundEvent,
  ScreenEvent,
  SessionState,
  VerifyEvent,
} from "@/lib/verify/types";

const { ingress } = createKdsIntegratedIngress();

/** Pause between individual placements so a step plays like a real scene. */
const BEAT_MS = 600;

type HistEntry = { state: SessionState; step: number; branchId?: string };

const INITIAL: HistEntry = { state: initialState, step: 0 };

function applyEvents(base: SessionState, events: VerifyEvent[]) {
  const now = formatKioskTime(new Date());
  let state = base;
  const outbound: OutboundEvent[] = [];
  for (const event of events) {
    const result = reduce(state, event, now);
    state = result.state;
    outbound.push(...result.outbound);
  }
  return { state, outbound, now };
}

/**
 * One beat = one physical action. A step that places or removes several
 * objects plays them one at a time, like a real packer would.
 */
function expandBeats(events: VerifyEvent[]): VerifyEvent[] {
  const beats: VerifyEvent[] = [];
  for (const e of events) {
    if (
      (e.type === "PLACE" || e.type === "PLACE_UNRECOGNIZED") &&
      e.placements.length > 1
    ) {
      for (const p of e.placements) beats.push({ ...e, placements: [p] });
    } else if (e.type === "REMOVE" && e.qty > 1) {
      for (let i = 0; i < e.qty; i++) beats.push({ ...e, qty: 1 });
    } else {
      beats.push(e);
    }
  }
  return beats;
}

/** Does a kiosk gesture fulfil the current step's scripted screen event? */
function fulfils(step: VerifyEvent, done: ScreenEvent): boolean {
  if (step.type !== done.type) return false;
  if (step.type === "LONG_PRESS_ROW" && done.type === "LONG_PRESS_ROW")
    return step.lineId === done.lineId;
  if (step.type === "CHOOSE" && done.type === "CHOOSE")
    return step.option === done.option;
  return true;
}

export default function DemoPage() {
  const [flow, setFlow] = React.useState<Flow>(FLOWS[0]);
  const [history, setHistory] = React.useState<HistEntry[]>([INITIAL]);
  const [outbound, setOutbound] = React.useState<OutboundLogEntry[]>([]);
  const [busy, setBusy] = React.useState(false);
  const seqRef = React.useRef(0);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const current = history[history.length - 1];
  const steps = effectiveSteps(flow, current.branchId);
  const currentStep = steps[current.step];
  const atBranchPoint =
    !currentStep && !!flow.branches && current.branchId === undefined;

  const log = (events: OutboundEvent[], at: string) => {
    if (events.length === 0) return;
    const entries = events.map((event) => ({ seq: ++seqRef.current, at, event }));
    setOutbound((prev) => [...entries.reverse(), ...prev]);
  };

  const cancelBeats = React.useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setBusy(false);
  }, []);

  React.useEffect(() => cancelBeats, [cancelBeats]);

  /** Apply one beat; the first beat of a step pushes the step's history entry. */
  const applyBeat = React.useCallback(
    (event: VerifyEvent, first: boolean, last: boolean) => {
      setHistory((h) => {
        const top = h[h.length - 1];
        const { state, outbound: out, now } = applyEvents(top.state, [event]);
        log(out, now);
        const entry: HistEntry = {
          state,
          step: last ? top.step + 1 : top.step,
          branchId: top.branchId,
        };
        return first ? [...h, entry] : [...h.slice(0, -1), entry];
      });
    },
    [],
  );

  const fireNext = React.useCallback(() => {
    if (busy) return;
    const top = history[history.length - 1];
    const step = effectiveSteps(flow, top.branchId)[top.step];
    if (!step) return;
    const beats = expandBeats(step.events);
    if (beats.length === 1) {
      applyBeat(beats[0], true, true);
      return;
    }
    setBusy(true);
    beats.forEach((beat, i) => {
      const t = setTimeout(() => {
        applyBeat(beat, i === 0, i === beats.length - 1);
        if (i === beats.length - 1) {
          timersRef.current = [];
          setBusy(false);
        }
      }, i * BEAT_MS);
      timersRef.current.push(t);
    });
  }, [busy, history, flow, applyBeat]);

  const selectBranch = (branchId: string) => {
    if (busy) return;
    setHistory((h) => {
      const top = h[h.length - 1];
      return [...h, { ...top, branchId }];
    });
  };

  const dispatchScreen = (event: ScreenEvent) => {
    const top = history[history.length - 1];
    const step = busy
      ? undefined
      : effectiveSteps(flow, top.branchId)[top.step];
    const advances =
      !!step && step.events.length === 1 && fulfils(step.events[0], event);
    applyBeat(event, advances, advances);
  };

  const reset = React.useCallback(() => {
    cancelBeats();
    setHistory([INITIAL]);
    setOutbound([]);
  }, [cancelBeats]);

  const selectFlow = React.useCallback(
    (next: Flow) => {
      cancelBeats();
      setFlow(next);
      setHistory([INITIAL]);
      setOutbound([]);
    },
    [cancelBeats],
  );

  const prev = React.useCallback(() => {
    cancelBeats();
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, [cancelBeats]);

  // Deep link: /?flow=04&step=2&branch=extra — replay the script up to `step`.
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const params = new URLSearchParams(window.location.search);
    const flowId = params.get("flow");
    const target = FLOWS.find((f) => f.id === flowId);
    if (!target) return;
    // Replay asynchronously: this is one-time URL hydration, not render logic.
    const timer = setTimeout(() => {
      const branchId =
        target.branches?.find((b) => b.id === params.get("branch"))?.id ??
        undefined;
      const script = effectiveSteps(target, branchId);
      const step = Math.min(
        Math.max(parseInt(params.get("step") ?? "0", 10) || 0, 0),
        script.length,
      );
      const entries: HistEntry[] = [INITIAL];
      let state: SessionState = initialState;
      for (let i = 0; i < step; i++) {
        // The branch choice happens after the trunk, before its first step.
        if (branchId && i === target.steps.length) {
          entries.push({ state, step: i, branchId });
        }
        const r = applyEvents(state, script[i].events);
        state = r.state;
        log(r.outbound, r.now);
        entries.push({
          state,
          step: i + 1,
          branchId: i + 1 > target.steps.length ? branchId : undefined,
        });
      }
      if (branchId && step === target.steps.length) {
        entries.push({ state, step, branchId });
      }
      setFlow(target);
      setHistory(entries);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Reflect the current position in the URL.
  React.useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    params.set("flow", flow.id);
    params.set("step", String(current.step));
    if (current.branchId) params.set("branch", current.branchId);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [flow.id, current.step, current.branchId]);

  // Keyboard: → next, ← prev, R reset, 1–5 switch flow.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "ArrowRight") fireNext();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "r" || e.key === "R") reset();
      else if (/^[1-5]$/.test(e.key)) {
        const next = FLOWS[Number(e.key) - 1];
        if (next) selectFlow(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fireNext, prev, reset, selectFlow]);

  return (
    <main className="flex min-h-dvh flex-1 flex-col gap-6 bg-muted/40 px-6 py-6">
      <FlowSelector activeId={flow.id} onSelect={selectFlow} />
      <div className="flex flex-1 flex-col items-center gap-6 xl:flex-row xl:items-start xl:justify-center">
        <div className="flex max-h-[80dvh] w-full max-w-5xl flex-1 items-start justify-center">
          <KioskFrame>
            <VerifyScreen
              state={current.state}
              ingress={ingress}
              dispatch={dispatchScreen}
            />
          </KioskFrame>
        </div>
        <OperatorConsole
          flow={flow}
          steps={steps}
          currentIndex={current.step}
          branchId={current.branchId}
          atBranchPoint={atBranchPoint}
          busy={busy}
          onSelectBranch={selectBranch}
          onFire={fireNext}
          onPrev={prev}
          onReset={reset}
          outbound={outbound}
        />
      </div>
    </main>
  );
}
