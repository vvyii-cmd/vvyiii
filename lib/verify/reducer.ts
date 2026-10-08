import type {
  LineItem,
  MatObject,
  Notification,
  OutboundEvent,
  Placement,
  ReduceResult,
  SessionState,
  VerifyEvent,
} from "./types";

let objectSeq = 0;
const nextObjectId = () => `obj_${++objectSeq}`;

const RESOLVED: ReadonlyArray<LineItem["status"]> = [
  "checked",
  "checked_by_you",
  "sold_out",
  "swapped",
];

export const totalUnits = (lines: LineItem[]) =>
  lines.reduce((n, l) => n + l.qty, 0);

/** Wrong and over-count objects never move the counter. */
export const resolvedUnits = (lines: LineItem[]) =>
  lines.reduce((n, l) => n + (RESOLVED.includes(l.status) ? l.qty : 0), 0);

const lineStatusFromMat = (line: LineItem): LineItem["status"] => {
  // Human-resolved states stick; only camera-driven states recompute.
  if (RESOLVED.includes(line.status) && line.status !== "checked") return line.status;
  if (line.onMat === line.qty) return "checked";
  if (line.onMat > 0) return "partial"; // includes over-count: unresolved
  return "pending";
};

const isResolved = (status: LineItem["status"]) => RESOLVED.includes(status);

const nextSeq = (lines: LineItem[]) =>
  Math.max(0, ...lines.map((l) => l.resolvedSeq ?? 0)) + 1;

/** Apply a status change, stamping/clearing the resolution order. */
const withStatus = (
  line: LineItem,
  status: LineItem["status"],
  lines: LineItem[],
): LineItem => {
  if (status === line.status) return line;
  if (isResolved(status) && !isResolved(line.status))
    return { ...line, status, resolvedSeq: nextSeq(lines) };
  if (!isResolved(status) && isResolved(line.status))
    return { ...line, status, resolvedSeq: undefined };
  return { ...line, status };
};

const recorded = (
  lines: LineItem[],
  orderId: string,
  recordedAt: string,
): OutboundEvent => ({
  type: "verification.recorded",
  orderId,
  recordedAt,
  lines: lines.map((l) => ({
    id: l.id,
    name: l.name,
    status: l.status,
    humanConfirmed: l.status === "checked_by_you",
  })),
});

/** Promote packing → complete when every unit is resolved. */
const settle = (
  state: Extract<SessionState, { phase: "packing" }>,
  now: string,
  outbound: OutboundEvent[],
): ReduceResult => {
  if (resolvedUnits(state.lines) >= totalUnits(state.lines)) {
    const complete: SessionState = {
      phase: "complete",
      order: state.order,
      lines: state.lines,
      mat: state.mat,
      recordedAt: now,
      notification: state.notification,
    };
    return {
      state: complete,
      outbound: [...outbound, recorded(state.lines, state.order.id, now)],
    };
  }
  return { state, outbound };
};

const toObjects = (
  itemName: string,
  placements: Placement[],
  recognized: boolean,
  match: MatObject["match"],
): MatObject[] =>
  placements.map((p) => ({
    id: nextObjectId(),
    itemName,
    slot: p.slot,
    image: p.image,
    shadow: p.shadow,
    recognized,
    match,
  }));

/**
 * Pure state machine for a packing session. `now` is the display-formatted
 * current time (e.g. "2:16pm"), injected so the reducer stays pure.
 */
export function reduce(
  state: SessionState,
  event: VerifyEvent,
  now: string,
): ReduceResult {
  const none: OutboundEvent[] = [];

  switch (event.type) {
    case "KDS_PACK_NOW": {
      const lines: LineItem[] = event.order.lines.map((l) => ({
        ...l,
        status: "pending",
        onMat: 0,
      }));
      return {
        state: { phase: "packing", order: event.order, lines, mat: [] },
        outbound: none,
      };
    }

    case "CLEAR_MAT":
      return { state: { phase: "idle" }, outbound: none };
  }

  if (state.phase === "idle") return { state, outbound: none };

  switch (event.type) {
    case "PLACE": {
      if (state.phase !== "packing") return { state, outbound: none };
      const line = state.lines.find((l) => l.name === event.itemName);

      // A swap is pending and something not on the ticket lands: that is the swap.
      if (!line && state.swapPendingLineId) {
        const mat = [
          ...state.mat,
          ...toObjects(event.itemName, event.placements, true, "pending_swap"),
        ];
        return { state: { ...state, mat, notification: undefined }, outbound: none };
      }

      if (!line) {
        const mat = [
          ...state.mat,
          ...toObjects(event.itemName, event.placements, true, "wrong"),
        ];
        return { state: { ...state, mat }, outbound: none };
      }

      const mat = [
        ...state.mat,
        ...toObjects(event.itemName, event.placements, true, "ok"),
      ];
      const grown = state.lines.map((l) =>
        l.id === line.id
          ? { ...l, onMat: l.onMat + event.placements.length }
          : l,
      );
      const updated = grown.map((l) =>
        l.id === line.id ? withStatus(l, lineStatusFromMat(l), grown) : l,
      );
      return settle({ ...state, lines: updated, mat }, now, none);
    }

    case "PLACE_UNRECOGNIZED": {
      if (state.phase !== "packing") return { state, outbound: none };
      // Trained-but-unread: the object appears, nothing else changes.
      const mat = [
        ...state.mat,
        ...toObjects(event.itemName, event.placements, false, "ok"),
      ];
      return { state: { ...state, mat }, outbound: none };
    }

    case "RECOGNITION_COMPLETE": {
      if (state.phase !== "packing" || !state.swapPendingLineId)
        return { state, outbound: none };
      const pendingObjects = state.mat.filter((o) => o.match === "pending_swap");
      if (pendingObjects.length === 0) return { state, outbound: none };
      const toName = pendingObjects[0].itemName;
      const line = state.lines.find((l) => l.id === state.swapPendingLineId);
      if (!line) return { state, outbound: none };

      const lines = state.lines.map((l) =>
        l.id === line.id
          ? {
              ...withStatus(l, "swapped", state.lines),
              swappedTo: { name: toName, qty: l.qty },
            }
          : l,
      );
      const mat = state.mat.map((o) =>
        o.match === "pending_swap" ? { ...o, match: "ok" as const } : o,
      );
      const notification: Notification = {
        kind: "swapped",
        fromQty: line.qty,
        fromName: line.name,
        toQty: line.qty,
        toName,
      };
      const outbound: OutboundEvent[] = [
        {
          type: "manager.notify",
          reason: "swap",
          itemName: line.name,
          detail: `x${line.qty} ${line.name} → x${line.qty} ${toName}`,
        },
      ];
      return settle(
        { ...state, lines, mat, swapPendingLineId: undefined, notification },
        now,
        outbound,
      );
    }

    case "REMOVE": {
      if (state.phase !== "packing") return { state, outbound: none };
      let remaining = event.qty;
      const mat: MatObject[] = [];
      // Remove the most recently placed objects of that item first.
      for (let i = state.mat.length - 1; i >= 0; i--) {
        const o = state.mat[i];
        if (remaining > 0 && o.itemName === event.itemName) {
          remaining--;
          continue;
        }
        mat.unshift(o);
      }
      const removed = event.qty - remaining;
      const lines = state.lines.map((l) => {
        if (l.name !== event.itemName) return l;
        if (RESOLVED.includes(l.status) && l.status !== "checked") return l;
        const next = { ...l, onMat: Math.max(0, l.onMat - removed) };
        return withStatus(next, lineStatusFromMat(next), state.lines);
      });
      return { state: { ...state, lines, mat }, outbound: none };
    }

    case "TAP_ROW": {
      if (state.phase !== "packing") return { state, outbound: none };
      const line = state.lines.find((l) => l.id === event.lineId);
      if (!line || (line.status !== "pending" && line.status !== "partial"))
        return { state, outbound: none };
      return { state: { ...state, activeSheetLineId: line.id }, outbound: none };
    }

    case "DISMISS_SHEET": {
      if (state.phase !== "packing") return { state, outbound: none };
      return { state: { ...state, activeSheetLineId: undefined }, outbound: none };
    }

    case "CHOOSE": {
      if (state.phase !== "packing" || !state.activeSheetLineId)
        return { state, outbound: none };
      const line = state.lines.find((l) => l.id === state.activeSheetLineId);
      if (!line) return { state, outbound: none };
      const base = { ...state, activeSheetLineId: undefined };

      if (event.option === "camera_missed") {
        const lines = state.lines.map((l) =>
          l.id === line.id ? withStatus(l, "checked_by_you", state.lines) : l,
        );
        const notification: Notification = {
          kind: "checked_by_you",
          lineId: line.id,
          itemName: line.name,
        };
        const outbound: OutboundEvent[] = [
          { type: "recognition.report", itemName: line.name },
        ];
        return settle({ ...base, lines, notification }, now, outbound);
      }

      if (event.option === "sold_out") {
        const lines = state.lines.map((l) =>
          l.id === line.id ? withStatus(l, "sold_out", state.lines) : l,
        );
        const notification: Notification = {
          kind: "manager_notified",
          itemName: line.name,
          reason: "sold_out",
        };
        const outbound: OutboundEvent[] = [
          {
            type: "manager.notify",
            reason: "sold_out",
            itemName: line.name,
            detail: `${line.name} • Sold out`,
          },
        ];
        return settle({ ...base, lines, notification }, now, outbound);
      }

      // swap: wait for the replacement to be put down
      return {
        state: { ...base, swapPendingLineId: line.id },
        outbound: none,
      };
    }

    case "UNDO": {
      const notification = state.notification;
      if (!notification || notification.kind !== "checked_by_you")
        return { state, outbound: none };
      const lines = state.lines.map((l) =>
        l.id === notification.lineId ? withStatus(l, "pending", state.lines) : l,
      );
      const packing: SessionState = {
        phase: "packing",
        order: state.order,
        lines,
        mat: state.mat,
      };
      return {
        state: packing,
        outbound: [{ type: "undo", lineId: notification.lineId }],
      };
    }
  }

  return { state, outbound: none };
}

export const initialState: SessionState = { phase: "idle" };
