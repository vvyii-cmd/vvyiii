import type { Order } from "@/lib/verify/types";

/** Demo image for each item (clearly fake placeholder order data). */
export const ITEM_IMAGES: Record<string, string> = {
  "Honey Chicken Sandwich": "/assets/items/honey-chicken-sandwich.png",
  "Classic Sandwich": "/assets/items/classic-sandwich.png",
  "6pc Wings": "/assets/items/6pc-wings.png",
  "Cajun Fries Reg": "/assets/items/cajun-fries-reg.png",
  Biscuit: "/assets/items/biscuit.png",
  "Dt Coke": "/assets/items/dt-coke.png",
  "Apple Pie": "/assets/items/apple-pie.png",
  Coleslaw: "/assets/items/coleslaw.png",
  "Mac & Cheese": "/assets/items/mac-and-cheese.png",
};

/** Order EF541 · Stella Maya · Pickup — 8 units (flows 01–03, 05). */
export const EF541: Order = {
  id: "EF541",
  customer: "Stella Maya",
  channel: "Pickup",
  code: "EF541",
  lines: [
    { id: "hcs", name: "Honey Chicken Sandwich", qty: 2 },
    { id: "classic", name: "Classic Sandwich", qty: 1 },
    { id: "wings", name: "6pc Wings", qty: 1, modifier: "extra sauce " },
    { id: "fries", name: "Cajun Fries Reg", qty: 1 },
    { id: "biscuit", name: "Biscuit", qty: 2 },
    { id: "coke", name: "Dt Coke", qty: 1 },
  ],
};

/** Flow 04 variant: 3× Biscuit (9 units). */
export const EF541_SPLIT: Order = {
  ...EF541,
  lines: EF541.lines.map((l) =>
    l.id === "biscuit" ? { ...l, qty: 3 } : l,
  ),
};
