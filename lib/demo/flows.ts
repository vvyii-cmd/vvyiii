import type { Placement, Slot, VerifyEvent } from "@/lib/verify/types";
import { EF541, ITEM_IMAGES } from "./orders";

/**
 * A flow is just a scripted list of world events plus presenter guidance.
 * The kiosk never knows which flow it is in.
 */
export type FlowStep = {
  /** Plain-language button label, e.g. "Place 2× Honey Chicken Sandwich". */
  label: string;
  /** What the room should see after this step. */
  expect?: string;
  events: VerifyEvent[];
  /** Shown when the next action is a tap on the kiosk itself. */
  screenHint?: string;
};

export type Flow = {
  id: "01" | "02" | "03" | "04" | "05";
  title: string;
  description: string;
  steps: FlowStep[];
};

/** Object slots on the 800×480 canvas, read from the Figma flow frames. */
const SLOTS = {
  // The sandwich export carries transparent padding (drips), so the slot is
  // larger than the Figma 81×55 box to keep the visible sandwich the same size.
  honeyChicken1: { x: 384, y: 147, w: 104, h: 87, rotation: 9.1 } as Slot,
  honeyChicken2: { x: 469, y: 157, w: 104, h: 87 } as Slot,
  classic: { x: 561, y: 94, w: 71, h: 66 } as Slot,
  wings: { x: 626, y: 158, w: 122, h: 98 } as Slot,
  fries: { x: 538, y: 240, w: 74, h: 95 } as Slot,
  biscuit1: { x: 390, y: 278, w: 73, h: 54 } as Slot,
  biscuit2: { x: 421, y: 266, w: 73, h: 54 } as Slot,
  coke: { x: 632, y: 234, w: 75, h: 150 } as Slot,
};

const put = (item: string, slot: Slot, shadow?: boolean): Placement => ({
  slot,
  image: ITEM_IMAGES[item],
  shadow,
});

export const FLOW_01: Flow = {
  id: "01",
  title: "01 Happy Path",
  description: "Every item is recognised; the order completes itself.",
  steps: [
    {
      label: "Pack Now on KDS",
      expect: "Order panel loads, counter 0/8, stage empty, no frames.",
      events: [{ type: "KDS_PACK_NOW", order: EF541 }],
    },
    {
      label: "Place 2× Honey Chicken Sandwich",
      expect:
        "Both recognised, no frames; the x2 line strikes in place, slides into Checked (2); counter 2/8.",
      events: [
        {
          type: "PLACE",
          itemName: "Honey Chicken Sandwich",
          placements: [
            put("Honey Chicken Sandwich", SLOTS.honeyChicken1, true),
            put("Honey Chicken Sandwich", SLOTS.honeyChicken2, true),
          ],
        },
      ],
    },
    {
      label: "Place Classic Sandwich",
      expect: "Line resolves the same way; counter 3/8.",
      events: [
        {
          type: "PLACE",
          itemName: "Classic Sandwich",
          placements: [put("Classic Sandwich", SLOTS.classic)],
        },
      ],
    },
    {
      label: "Place 6pc Wings",
      expect: "Counter 4/8.",
      events: [
        {
          type: "PLACE",
          itemName: "6pc Wings",
          placements: [put("6pc Wings", SLOTS.wings)],
        },
      ],
    },
    {
      label: "Place Cajun Fries Reg",
      expect: "Counter 5/8.",
      events: [
        {
          type: "PLACE",
          itemName: "Cajun Fries Reg",
          placements: [put("Cajun Fries Reg", SLOTS.fries)],
        },
      ],
    },
    {
      label: "Place 2× Biscuit",
      expect: "Counter 7/8, Checked (7), only x1 Dt Coke left in the open list.",
      events: [
        {
          type: "PLACE",
          itemName: "Biscuit",
          placements: [put("Biscuit", SLOTS.biscuit1), put("Biscuit", SLOTS.biscuit2)],
        },
      ],
    },
    {
      label: "Place Dt Coke",
      expect:
        'Counter 8/8 → "All 8 checked", "Recorded · time", green outline around the stage, full Checked (8) list. Emits verification.recorded.',
      events: [
        {
          type: "PLACE",
          itemName: "Dt Coke",
          placements: [put("Dt Coke", SLOTS.coke)],
        },
      ],
    },
    {
      label: "Clear the mat",
      expect: "Back to Idle / EmptyState.",
      events: [{ type: "CLEAR_MAT" }],
    },
  ],
};

/** Flows 02–05 are scripted in Phase 3. */
export const FLOWS: Flow[] = [FLOW_01];

export const FLOW_PLACEHOLDERS: { id: string; title: string }[] = [
  { id: "02", title: "02 Items not on the ticket" },
  { id: "03", title: "03 Camera can't read" },
  { id: "04", title: "04 Item Split" },
  { id: "05", title: "05 Items out of stock" },
];
