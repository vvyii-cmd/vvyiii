"use client";

import * as React from "react";
import Image from "next/image";
import { DWELL_PROMPT_MS, PARTIAL_PROMPT_DWELL_MS } from "@/lib/verify/config";
import type { OrderIngress } from "@/lib/verify/ingress";
import type { ScreenEvent, SessionState } from "@/lib/verify/types";
import {
  activeToast,
  detectionFrames,
  matObjects,
} from "@/lib/verify/selectors";
import { Crossfade, useListPresence } from "./motion";
import { KioskHeader } from "./KioskHeader";
import { EmptyState } from "./EmptyState";
import { OrderPanel } from "./OrderPanel";
import { CameraStage } from "./CameraStage";
import { MatObject } from "./MatObject";
import { DetectionFrame } from "./DetectionFrame";
import { ActionToast } from "./ActionToast";
import { Notification } from "./Notification";
import { WhatHappenedSheet } from "./WhatHappenedSheet";

/**
 * The full kiosk screen for a verification session. Pure function of the
 * session state: it knows nothing about demo flows or the operator console.
 * Screen events (the packer's gestures) go out through `dispatch`.
 */
export function VerifyScreen({
  state,
  ingress,
  dispatch,
}: {
  state: SessionState;
  ingress: OrderIngress;
  dispatch: (e: ScreenEvent) => void;
}) {
  // Selector results are memoized per state so the presence hooks (which
  // compare by identity) settle instead of re-rendering forever.
  const liveObjects = React.useMemo(() => matObjects(state), [state]);
  const liveFrames = React.useMemo(() => detectionFrames(state), [state]);
  const toast = React.useMemo(() => activeToast(state), [state]);

  // The amber split guidance only appears once the partial state has lingered
  // (PARTIAL_PROMPT_DWELL_MS): a packer placing a multi-quantity line in quick
  // succession never sees it flash. Each new placement restarts the dwell.
  const partialSig = React.useMemo(() => {
    if (state.phase !== "packing") return "";
    return state.lines
      .filter((l) => l.status === "partial" && l.onMat < l.qty)
      .map((l) => `${l.id}:${l.onMat}`)
      .join(",");
  }, [state]);
  const [dwelledSig, setDwelledSig] = React.useState("");
  React.useEffect(() => {
    if (!partialSig) return;
    const id = setTimeout(() => setDwelledSig(partialSig), PARTIAL_PROMPT_DWELL_MS);
    return () => clearTimeout(id);
  }, [partialSig]);
  const partialLingers = partialSig !== "" && dwelledSig === partialSig;

  const shownFrames = React.useMemo(
    () =>
      partialLingers
        ? liveFrames
        : liveFrames.filter((f) => f.variant !== "amber"),
    [liveFrames, partialLingers],
  );
  const shownToast =
    toast?.kind === "put_all" && !partialLingers ? undefined : toast;

  const objects = useListPresence(liveObjects, (o) => o.id, 280);
  const frames = useListPresence(shownFrames, (f) => f.key, 280);
  const notification = state.phase === "idle" ? undefined : state.notification;
  const sheetLine = React.useMemo(
    () =>
      state.phase === "packing" && state.activeSheetLineId
        ? state.lines.find((l) => l.id === state.activeSheetLineId)
        : undefined,
    [state],
  );

  // Optional dwell prompt (off by default, see lib/verify/config.ts).
  React.useEffect(() => {
    if (DWELL_PROMPT_MS <= 0 || state.phase !== "packing" || state.activeSheetLineId)
      return;
    const unread = state.mat.find((o) => !o.recognized);
    if (!unread) return;
    const line = state.lines.find(
      (l) =>
        l.name === unread.itemName &&
        (l.status === "pending" || l.status === "partial"),
    );
    if (!line) return;
    const id = setTimeout(
      () => dispatch({ type: "LONG_PRESS_ROW", lineId: line.id }),
      DWELL_PROMPT_MS,
    );
    return () => clearTimeout(id);
  }, [state, dispatch]);

  return (
    <div className="relative flex h-full w-full flex-col items-start">
      {/* Kitchen backdrop, cropped exactly as the Figma hero screen crops it. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/assets/stage/kitchen-bg@2x.webp"
          alt=""
          width={1752}
          height={1112}
          priority
          className="absolute top-[-3.75%] left-[-15.7%] h-auto w-[131.4%] max-w-none"
        />
      </div>

      {/* Physical objects and detection frames live on the canvas layer. */}
      <div className="pointer-events-none absolute inset-0">
        {objects.map((e) => (
          <MatObject key={e.key} object={e.item} exiting={e.exiting} />
        ))}
        {frames.map((e) => (
          <DetectionFrame key={e.key} model={e.item} exiting={e.exiting} />
        ))}
      </div>

      <div className="relative z-10 w-full">
        <KioskHeader />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center gap-3 px-4 pt-2 pb-4">
        <Crossfade
          id={state.phase === "idle" ? "empty" : "order"}
          className="h-full w-[281px] shrink-0"
        >
          {state.phase === "idle" ? (
            <EmptyState
              title={ingress.emptyState.title}
              subtitle={ingress.emptyState.subtitle}
            />
          ) : (
            <OrderPanel
              order={state.order}
              lines={state.lines}
              phase={state.phase}
              recordedAt={state.phase === "complete" ? state.recordedAt : undefined}
              activeSheetLineId={
                state.phase === "packing" ? state.activeSheetLineId : undefined
              }
              swapPendingLineId={
                // The line strikes through once the replacement is on the mat.
                state.phase === "packing" &&
                state.mat.some((o) => o.match === "pending_swap")
                  ? state.swapPendingLineId
                  : undefined
              }
              dispatch={dispatch}
            />
          )}
        </Crossfade>
        <CameraStage complete={state.phase === "complete"}>
          <ActionToast toast={shownToast} />
          <Notification notification={notification} dispatch={dispatch} />
        </CameraStage>
      </div>

      <WhatHappenedSheet line={sheetLine} dispatch={dispatch} />
    </div>
  );
}
