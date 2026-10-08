/**
 * Core domain types for the Otter Verify packing session.
 *
 * This module is production-grade kiosk logic: it knows nothing about demo
 * flows, the operator console, or scripted steps. Behaviour contract lives in
 * the project brief; visual contract in docs/DESIGN_NOTES.md.
 */

export type LineStatus =
  | "pending"
  | "partial"
  | "checked"
  | "checked_by_you"
  | "sold_out"
  | "swapped";

export type OrderLine = {
  id: string;
  name: string;
  qty: number;
  modifier?: string;
};

export type Order = {
  id: string;
  customer: string;
  /** Service badge, e.g. "Pickup". */
  channel: string;
  /** Ticket code badge, e.g. "EF541". */
  code: string;
  lines: OrderLine[];
};

export type LineItem = OrderLine & {
  status: LineStatus;
  /** Recognized units of this line currently on the mat. */
  onMat: number;
  swappedTo?: { name: string; qty: number };
  /**
   * Monotonic order in which the line was resolved; the last checked item
   * ranks first in the Checked zone. Cleared when a resolution is undone.
   */
  resolvedSeq?: number;
};

/** Position of an object on the 800×480 kiosk canvas, from Figma. */
export type Slot = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees, clockwise. */
  rotation?: number;
};

export type Placement = {
  slot: Slot;
  /** Image URL under /assets/items/. */
  image: string;
  /** Figma gives some objects (sandwiches) a drop shadow. */
  shadow?: boolean;
};

export type MatMatch = "ok" | "wrong" | "pending_swap";

export type MatObject = {
  id: string;
  itemName: string;
  slot: Slot;
  image: string;
  shadow?: boolean;
  /** false = the camera cannot read it: no frame, no panel change. */
  recognized: boolean;
  match: MatMatch;
};

export type Notification =
  | { kind: "checked_by_you"; lineId: string; itemName: string }
  | { kind: "manager_notified"; itemName: string; reason: "sold_out" }
  | { kind: "swapped"; fromQty: number; fromName: string; toQty: number; toName: string };

export type SessionState =
  | { phase: "idle" }
  | {
      phase: "packing";
      order: Order;
      lines: LineItem[];
      mat: MatObject[];
      activeSheetLineId?: string;
      /** Line waiting for its replacement item to be put down. */
      swapPendingLineId?: string;
      notification?: Notification;
    }
  | {
      phase: "complete";
      order: Order;
      lines: LineItem[];
      mat: MatObject[];
      recordedAt: string;
      notification?: Notification;
    };

/** World events: what the camera / KDS would observe. */
export type WorldEvent =
  | { type: "KDS_PACK_NOW"; order: Order }
  | { type: "PLACE"; itemName: string; placements: Placement[] }
  | { type: "PLACE_UNRECOGNIZED"; itemName: string; placements: Placement[] }
  /** Camera finishes recognising a pending swap item (flow step, not a tap). */
  | { type: "RECOGNITION_COMPLETE" }
  | { type: "REMOVE"; itemName: string; qty: number }
  | { type: "CLEAR_MAT" };

/** Screen events: what a packer does with a finger on the kiosk. */
export type ScreenEvent =
  | { type: "LONG_PRESS_ROW"; lineId: string }
  | { type: "DISMISS_SHEET" }
  | { type: "CHOOSE"; option: "camera_missed" | "sold_out" | "swap" }
  | { type: "UNDO" }
  /** Fired by the notification's auto-dismiss timer — it is a toast, not a banner. */
  | { type: "DISMISS_NOTIFICATION" };

export type VerifyEvent = WorldEvent | ScreenEvent;

/** The product's second data stream, surfaced in the demo console. */
export type OutboundEvent =
  | {
      type: "manager.notify";
      reason: "sold_out" | "swap";
      itemName: string;
      detail: string;
    }
  | {
      type: "verification.recorded";
      orderId: string;
      recordedAt: string;
      lines: { id: string; name: string; status: LineStatus; humanConfirmed: boolean }[];
    }
  | { type: "recognition.report"; itemName: string }
  | { type: "undo"; lineId: string };

export type ReduceResult = { state: SessionState; outbound: OutboundEvent[] };
