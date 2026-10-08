import { describe, expect, it } from "vitest";
import { initialState, reduce } from "./reducer";
import {
  activeToast,
  counter,
  detectionFrames,
} from "./selectors";
import type {
  Order,
  OutboundEvent,
  Placement,
  SessionState,
  VerifyEvent,
} from "./types";

const order: Order = {
  id: "EF541",
  customer: "Stella Maya",
  channel: "Pickup",
  code: "EF541",
  lines: [
    { id: "hcs", name: "Honey Chicken Sandwich", qty: 2 },
    { id: "cs", name: "Classic Sandwich", qty: 1 },
    { id: "wings", name: "6pc Wings", qty: 1, modifier: "extra sauce " },
    { id: "fries", name: "Cajun Fries Reg", qty: 1 },
    { id: "biscuit", name: "Biscuit", qty: 2 },
    { id: "coke", name: "Dt Coke", qty: 1 },
  ],
};

const slot = { x: 0, y: 0, w: 10, h: 10 };
const place = (n: number): Placement[] =>
  Array.from({ length: n }, () => ({ slot, image: "/x.png" }));

const NOW = "2:16pm";

function run(events: VerifyEvent[], from: SessionState = initialState) {
  let state = from;
  const outbound: OutboundEvent[] = [];
  for (const e of events) {
    const r = reduce(state, e, NOW);
    state = r.state;
    outbound.push(...r.outbound);
  }
  return { state, outbound };
}

const packNow: VerifyEvent = { type: "KDS_PACK_NOW", order };

describe("flow 01 — happy path", () => {
  it("loads the order with counter 0/8", () => {
    const { state } = run([packNow]);
    expect(state.phase).toBe("packing");
    expect(counter(state)).toEqual({ resolved: 0, total: 8 });
  });

  it("checks a full multi-quantity line in one place", () => {
    const { state } = run([
      packNow,
      { type: "PLACE", itemName: "Honey Chicken Sandwich", placements: place(2) },
    ]);
    if (state.phase !== "packing") throw new Error("expected packing");
    expect(state.lines[0].status).toBe("checked");
    expect(counter(state)).toEqual({ resolved: 2, total: 8 });
    expect(detectionFrames(state)).toHaveLength(0);
    expect(activeToast(state)).toBeUndefined();
  });

  it("completes at 8/8, records, and clears to idle", () => {
    const { state, outbound } = run([
      packNow,
      { type: "PLACE", itemName: "Honey Chicken Sandwich", placements: place(2) },
      { type: "PLACE", itemName: "Classic Sandwich", placements: place(1) },
      { type: "PLACE", itemName: "6pc Wings", placements: place(1) },
      { type: "PLACE", itemName: "Cajun Fries Reg", placements: place(1) },
      { type: "PLACE", itemName: "Biscuit", placements: place(2) },
      { type: "PLACE", itemName: "Dt Coke", placements: place(1) },
    ]);
    expect(state.phase).toBe("complete");
    if (state.phase !== "complete") throw new Error();
    expect(state.recordedAt).toBe(NOW);
    const rec = outbound.find((o) => o.type === "verification.recorded");
    expect(rec).toBeDefined();
    if (rec?.type !== "verification.recorded") throw new Error();
    expect(rec.lines.every((l) => l.status === "checked")).toBe(true);
    expect(rec.lines.every((l) => !l.humanConfirmed)).toBe(true);

    const cleared = reduce(state, { type: "CLEAR_MAT" }, NOW).state;
    expect(cleared.phase).toBe("idle");
  });
});

describe("flow 02 — items not on the ticket", () => {
  const wrongOne: VerifyEvent[] = [
    packNow,
    { type: "PLACE", itemName: "Apple Pie", placements: place(1) },
  ];

  it("flags a wrong item without moving the counter", () => {
    const { state } = run(wrongOne);
    expect(counter(state)).toEqual({ resolved: 0, total: 8 });
    const frames = detectionFrames(state);
    expect(frames).toHaveLength(1);
    expect(frames[0].variant).toBe("red");
    expect(frames[0].label).toBe("Apple Pie");
    expect(activeToast(state)).toEqual({
      kind: "remove_wrong",
      itemNames: ["Apple Pie"],
    });
  });

  it("collapses back when wrong items are removed", () => {
    const { state } = run([
      ...wrongOne,
      { type: "PLACE", itemName: "Coleslaw", placements: place(1) },
      { type: "REMOVE", itemName: "Apple Pie", qty: 1 },
      { type: "REMOVE", itemName: "Coleslaw", qty: 1 },
    ]);
    expect(detectionFrames(state)).toHaveLength(0);
    expect(activeToast(state)).toBeUndefined();
  });

  it("lists both wrong items in the toast", () => {
    const { state } = run([
      ...wrongOne,
      { type: "PLACE", itemName: "Coleslaw", placements: place(1) },
    ]);
    expect(activeToast(state)).toEqual({
      kind: "remove_wrong",
      itemNames: ["Apple Pie", "Coleslaw"],
    });
  });
});

describe("flow 03 — camera can't read", () => {
  const upToSeven: VerifyEvent[] = [
    packNow,
    { type: "PLACE", itemName: "Honey Chicken Sandwich", placements: place(2) },
    { type: "PLACE", itemName: "Classic Sandwich", placements: place(1) },
    { type: "PLACE", itemName: "6pc Wings", placements: place(1) },
    { type: "PLACE", itemName: "Cajun Fries Reg", placements: place(1) },
    { type: "PLACE", itemName: "Biscuit", placements: place(2) },
  ];

  it("an unrecognised placement changes nothing on the panel", () => {
    const { state } = run([
      ...upToSeven,
      { type: "PLACE_UNRECOGNIZED", itemName: "Dt Coke", placements: place(1) },
    ]);
    expect(counter(state)).toEqual({ resolved: 7, total: 8 });
    expect(detectionFrames(state)).toHaveLength(0);
    expect(activeToast(state)).toBeUndefined();
  });

  it("camera missed it → checked_by_you, completion, report + record", () => {
    const { state, outbound } = run([
      ...upToSeven,
      { type: "PLACE_UNRECOGNIZED", itemName: "Dt Coke", placements: place(1) },
      { type: "LONG_PRESS_ROW", lineId: "coke" },
      { type: "CHOOSE", option: "camera_missed" },
    ]);
    expect(state.phase).toBe("complete");
    if (state.phase !== "complete") throw new Error();
    expect(state.lines.find((l) => l.id === "coke")?.status).toBe("checked_by_you");
    expect(state.notification?.kind).toBe("checked_by_you");
    expect(outbound.some((o) => o.type === "recognition.report")).toBe(true);
    const rec = outbound.find((o) => o.type === "verification.recorded");
    if (rec?.type !== "verification.recorded") throw new Error();
    expect(rec.lines.find((l) => l.id === "coke")?.humanConfirmed).toBe(true);
  });

  it("auto-dismissing the notification clears it without touching the line", () => {
    const base = run([
      ...upToSeven,
      { type: "PLACE_UNRECOGNIZED", itemName: "Dt Coke", placements: place(1) },
      { type: "LONG_PRESS_ROW", lineId: "coke" },
      { type: "CHOOSE", option: "camera_missed" },
    ]);
    const { state, outbound } = run([{ type: "DISMISS_NOTIFICATION" }], base.state);
    expect(state.phase).toBe("complete");
    if (state.phase !== "complete") throw new Error();
    expect(state.notification).toBeUndefined();
    expect(state.lines.find((l) => l.id === "coke")?.status).toBe("checked_by_you");
    expect(outbound).toEqual([]);
  });

  it("undo while the toast shows reverts to packing", () => {
    const base = run([
      ...upToSeven,
      { type: "PLACE_UNRECOGNIZED", itemName: "Dt Coke", placements: place(1) },
      { type: "LONG_PRESS_ROW", lineId: "coke" },
      { type: "CHOOSE", option: "camera_missed" },
    ]);
    const { state, outbound } = run([{ type: "UNDO" }], base.state);
    expect(state.phase).toBe("packing");
    if (state.phase !== "packing") throw new Error();
    expect(state.lines.find((l) => l.id === "coke")?.status).toBe("pending");
    expect(counter(state)).toEqual({ resolved: 7, total: 8 });
    expect(outbound).toEqual([{ type: "undo", lineId: "coke" }]);
  });
});

describe("flow 04 — item split", () => {
  const splitOrder: Order = {
    ...order,
    lines: order.lines.map((l) =>
      l.id === "biscuit" ? { ...l, qty: 3 } : l,
    ),
  };
  const start: VerifyEvent[] = [{ type: "KDS_PACK_NOW", order: splitOrder }];

  it("partial placement shows amber count frame and toast, counter unchanged", () => {
    const { state } = run([
      ...start,
      { type: "PLACE", itemName: "Biscuit", placements: place(1) },
    ]);
    expect(counter(state)).toEqual({ resolved: 0, total: 9 });
    const frames = detectionFrames(state);
    expect(frames).toHaveLength(1);
    expect(frames[0].variant).toBe("amber");
    expect(frames[0].label).toBe("1 of 3 • Biscuit");
    const toast = activeToast(state);
    expect(toast?.kind).toBe("put_all");
  });

  it("placing the rest resolves the line", () => {
    const { state } = run([
      ...start,
      { type: "PLACE", itemName: "Biscuit", placements: place(1) },
      { type: "PLACE", itemName: "Biscuit", placements: place(2) },
    ]);
    expect(counter(state)).toEqual({ resolved: 3, total: 9 });
    expect(detectionFrames(state)).toHaveLength(0);
  });

  it("over-count turns red and asks to remove the excess", () => {
    const { state } = run([
      ...start,
      { type: "PLACE", itemName: "Biscuit", placements: place(1) },
      { type: "PLACE", itemName: "Biscuit", placements: place(3) },
    ]);
    expect(counter(state)).toEqual({ resolved: 0, total: 9 });
    const frames = detectionFrames(state);
    expect(frames[0].variant).toBe("red");
    expect(frames[0].label).toBe("4 of 3 • Biscuit");
    const toast = activeToast(state);
    expect(toast).toMatchObject({ kind: "remove_over", excess: 1 });
  });

  it("taking the item away returns to a clean state", () => {
    const { state } = run([
      ...start,
      { type: "PLACE", itemName: "Biscuit", placements: place(1) },
      { type: "REMOVE", itemName: "Biscuit", qty: 1 },
    ]);
    expect(detectionFrames(state)).toHaveLength(0);
    expect(activeToast(state)).toBeUndefined();
    if (state.phase !== "packing") throw new Error();
    expect(state.lines.find((l) => l.id === "biscuit")?.status).toBe("pending");
  });
});

describe("flow 05 — sold out and swap", () => {
  const midway: VerifyEvent[] = [
    packNow,
    { type: "PLACE", itemName: "Honey Chicken Sandwich", placements: place(2) },
    { type: "PLACE", itemName: "Classic Sandwich", placements: place(1) },
    { type: "PLACE", itemName: "6pc Wings", placements: place(1) },
  ];

  it("sold out resolves the line and notifies the manager", () => {
    const { state, outbound } = run([
      ...midway,
      { type: "LONG_PRESS_ROW", lineId: "fries" },
      { type: "CHOOSE", option: "sold_out" },
    ]);
    expect(counter(state)).toEqual({ resolved: 5, total: 8 });
    if (state.phase !== "packing") throw new Error();
    expect(state.lines.find((l) => l.id === "fries")?.status).toBe("sold_out");
    expect(state.notification?.kind).toBe("manager_notified");
    expect(
      outbound.find((o) => o.type === "manager.notify" && o.reason === "sold_out"),
    ).toBeDefined();
  });

  it("swap: waiting → placed → recognised, with neutral treatment", () => {
    const waiting = run([
      ...midway,
      { type: "LONG_PRESS_ROW", lineId: "fries" },
      { type: "CHOOSE", option: "swap" },
    ]);
    expect(activeToast(waiting.state)?.kind).toBe("swap_waiting");

    const placed = run(
      [{ type: "PLACE", itemName: "Mac & Cheese", placements: place(1) }],
      waiting.state,
    );
    expect(activeToast(placed.state)?.kind).toBe("swap_placed");
    const frames = detectionFrames(placed.state);
    expect(frames).toHaveLength(1);
    expect(frames[0].variant).toBe("neutral");
    expect(counter(placed.state)).toEqual({ resolved: 4, total: 8 });

    const done = run([{ type: "RECOGNITION_COMPLETE" }], placed.state);
    expect(counter(done.state)).toEqual({ resolved: 5, total: 8 });
    if (done.state.phase !== "packing") throw new Error();
    const line = done.state.lines.find((l) => l.id === "fries");
    expect(line?.status).toBe("swapped");
    expect(line?.swappedTo).toEqual({ name: "Mac & Cheese", qty: 1 });
    expect(done.state.notification?.kind).toBe("swapped");
    expect(
      done.outbound.find((o) => o.type === "manager.notify" && o.reason === "swap"),
    ).toBeDefined();
    expect(detectionFrames(done.state)).toHaveLength(0);
    expect(activeToast(done.state)).toBeUndefined();
  });
});
