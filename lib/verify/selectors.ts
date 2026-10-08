import type { LineItem, MatObject, SessionState, Slot } from "./types";
import { resolvedUnits, totalUnits } from "./reducer";

export type Counter = { resolved: number; total: number };

export const counter = (state: SessionState): Counter | undefined => {
  if (state.phase === "idle") return undefined;
  return { resolved: resolvedUnits(state.lines), total: totalUnits(state.lines) };
};

/** Open (unresolved) lines, in ticket order. */
export const openLines = (lines: LineItem[]) =>
  lines.filter(
    (l) => l.status === "pending" || l.status === "partial",
  );

/** Resolved lines for the Checked zone: the last checked item ranks first. */
export const checkedLines = (lines: LineItem[]) =>
  lines
    .filter(
      (l) =>
        l.status === "checked" ||
        l.status === "checked_by_you" ||
        l.status === "sold_out" ||
        l.status === "swapped",
    )
    .sort((a, b) => (b.resolvedSeq ?? 0) - (a.resolvedSeq ?? 0));

export type FrameVariant = "red" | "amber" | "neutral";

export type DetectionFrameModel = {
  key: string;
  variant: FrameVariant;
  /** Pill label, centered on the frame's top stroke; undefined = no pill. */
  label?: string;
  rect: { x: number; y: number; w: number; h: number };
};

const FRAME_PADDING = 13;

const boundingRect = (slots: Slot[]) => {
  const x0 = Math.min(...slots.map((s) => s.x));
  const y0 = Math.min(...slots.map((s) => s.y));
  const x1 = Math.max(...slots.map((s) => s.x + s.w));
  const y1 = Math.max(...slots.map((s) => s.y + s.h));
  return {
    x: x0 - FRAME_PADDING,
    y: y0 - FRAME_PADDING,
    w: x1 - x0 + 2 * FRAME_PADDING,
    h: y1 - y0 + 2 * FRAME_PADDING,
  };
};

/**
 * Detection frames render only when the packer must act: wrong items, partial
 * or over-count multi-quantity lines, and a placed pending swap. A correctly
 * recognised item gets no frame.
 */
export const detectionFrames = (state: SessionState): DetectionFrameModel[] => {
  if (state.phase !== "packing") return [];
  const frames: DetectionFrameModel[] = [];

  for (const o of state.mat) {
    if (o.match === "wrong") {
      frames.push({
        key: o.id,
        variant: "red",
        label: o.itemName,
        rect: boundingRect([o.slot]),
      });
    }
  }

  const pendingSwap = state.mat.filter((o) => o.match === "pending_swap");
  if (pendingSwap.length > 0) {
    const bbox = boundingRect(pendingSwap.map((o) => o.slot));
    frames.push({
      key: `swap_${pendingSwap[0].itemName}`,
      variant: "neutral",
      label: `${pendingSwap.length}x ${pendingSwap[0].itemName}`,
      // The swap frame pads wider than tall in the design.
      rect: { x: bbox.x - 11, y: bbox.y + 5, w: bbox.w + 22, h: bbox.h - 10 },
    });
  }

  for (const line of state.lines) {
    if (line.qty <= 1) continue;
    if (line.status !== "partial") continue;
    const objects = state.mat.filter(
      (o) => o.itemName === line.name && o.match === "ok" && o.recognized,
    );
    if (objects.length === 0) continue;
    frames.push({
      key: `count_${line.id}`,
      variant: line.onMat > line.qty ? "red" : "amber",
      label: `${line.onMat} of ${line.qty} • ${line.name}`,
      rect: boundingRect(objects.map((o) => o.slot)),
    });
  }

  return frames;
};

export type ToastModel =
  | { kind: "remove_wrong"; itemNames: string[] }
  | { kind: "put_all"; line: LineItem }
  | { kind: "remove_over"; line: LineItem; excess: number }
  | { kind: "swap_waiting"; line: LineItem }
  | { kind: "swap_placed"; line: LineItem };

/** At most one action toast shows, picked by urgency. */
export const activeToast = (state: SessionState): ToastModel | undefined => {
  if (state.phase !== "packing") return undefined;

  const wrong = state.mat.filter((o) => o.match === "wrong");
  if (wrong.length > 0) {
    const names: string[] = [];
    for (const o of wrong) if (!names.includes(o.itemName)) names.push(o.itemName);
    return { kind: "remove_wrong", itemNames: names };
  }

  const over = state.lines.find((l) => l.onMat > l.qty);
  if (over) return { kind: "remove_over", line: over, excess: over.onMat - over.qty };

  const partial = state.lines.find(
    (l) => l.status === "partial" && l.qty > 1 && l.onMat < l.qty,
  );
  if (partial) return { kind: "put_all", line: partial };

  if (state.swapPendingLineId) {
    const line = state.lines.find((l) => l.id === state.swapPendingLineId);
    if (line) {
      const placed = state.mat.some((o) => o.match === "pending_swap");
      return placed ? { kind: "swap_placed", line } : { kind: "swap_waiting", line };
    }
  }

  return undefined;
};

/** Objects to draw on the stage (every mat object, recognised or not). */
export const matObjects = (state: SessionState): MatObject[] =>
  state.phase === "idle" ? [] : state.mat;
