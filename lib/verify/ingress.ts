import type { Order } from "./types";

/** A run of empty-state subtitle text; bold runs render emphasised. */
export type CopyRun = { text: string; bold?: boolean };

/**
 * How orders arrive at the kiosk. This is a seam, not a feature: only the
 * KDS-integrated path exists today (the order arrives when someone presses
 * "Pack Now" on the KDS, delivered to the session as a KDS_PACK_NOW event).
 * The other two modes slot in later without touching packing logic.
 */
export interface OrderIngress {
  kind: "kds-integrated" | "kds-manual" | "paper-ticket";
  /** Copy shown on the kiosk while waiting for an order (verbatim from Figma). */
  emptyState: { title: string; subtitle: CopyRun[] };
  /** Subscribe to incoming orders; returns an unsubscribe. */
  onOrder(listener: (order: Order) => void): () => void;
}

type Listener = (order: Order) => void;

/**
 * KDS-integrated ingress. In the demo the operator console pushes orders in;
 * on the real device this would be fed by the KDS integration.
 */
export function createKdsIntegratedIngress() {
  const listeners = new Set<Listener>();
  const ingress: OrderIngress = {
    kind: "kds-integrated",
    emptyState: {
      title: "Pick an order on the KDS",
      subtitle: [
        { text: "Tap " },
        { text: "Pack Now", bold: true },
        { text: " on an active order, it will show up here" },
      ],
    },
    onOrder(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  const push = (order: Order) => listeners.forEach((l) => l(order));
  return { ingress, push };
}
