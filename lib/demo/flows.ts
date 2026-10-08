import type { Placement, Slot, VerifyEvent } from "@/lib/verify/types";
import { EF541, EF541_SPLIT, ITEM_IMAGES } from "./orders";

/**
 * A flow is just a scripted list of world events plus presenter guidance.
 * The kiosk never knows which flow it is in.
 *
 * `kind: "screen"` steps are gestures the presenter performs on the kiosk
 * itself (long-press, sheet choice, Undo). Their events exist so Next and
 * URL deep links can replay them; performing the matching gesture on the
 * kiosk advances the flow the same way.
 */
export type FlowStep = {
  label: string;
  kind?: "world" | "screen";
  events: VerifyEvent[];
  expect?: string;
  screenHint?: string;
};

export type FlowBranch = { id: string; label: string; steps: FlowStep[] };

export type Flow = {
  id: "01" | "02" | "03" | "04" | "05";
  title: string;
  description: string;
  steps: FlowStep[];
  /** Offered once the trunk steps are exhausted. */
  branches?: FlowBranch[];
};

/* ------------------------------------------------------------------ */
/* Object slots on the 800×480 canvas, read from the Figma flow frames */
/* ------------------------------------------------------------------ */

const SLOTS = {
  // The sandwich export carries transparent padding (drips), so the slot is
  // larger than the Figma 81×55 box to keep the visible sandwich the same size.
  honeyChicken1: { x: 369, y: 160, w: 112, h: 94, rotation: 9.1 } as Slot,
  honeyChicken2: { x: 454, y: 170, w: 112, h: 94 } as Slot,
  classic: { x: 561, y: 94, w: 71, h: 66 } as Slot,
  wings: { x: 626, y: 158, w: 122, h: 98 } as Slot,
  fries: { x: 538, y: 240, w: 74, h: 95 } as Slot,
  biscuit1: { x: 390, y: 278, w: 73, h: 54 } as Slot,
  biscuit2: { x: 421, y: 266, w: 73, h: 54 } as Slot,
  coke: { x: 632, y: 234, w: 75, h: 150 } as Slot,
  // flow 02 wrong items
  applePie: { x: 470, y: 261, w: 93, h: 53 } as Slot,
  coleslaw: { x: 665, y: 274, w: 85, h: 68 } as Slot,
  // flow 03 unread bottle
  cokeUnread: { x: 464, y: 232, w: 75, h: 150 } as Slot,
  // flow 04 biscuit cluster
  biscuitSplit1: { x: 406, y: 280, w: 73, h: 54 } as Slot,
  biscuitSplit2: { x: 440, y: 294, w: 66, h: 49 } as Slot,
  biscuitSplit3: { x: 418, y: 318, w: 66, h: 49 } as Slot,
  biscuitOver2: { x: 443, y: 294, w: 73, h: 54 } as Slot,
  biscuitOver3: { x: 480, y: 308, w: 73, h: 54 } as Slot,
  biscuitOver4: { x: 421, y: 321, w: 73, h: 54 } as Slot,
  // flow 05 swap
  macAndCheese: { x: 461, y: 266, w: 87, h: 85 } as Slot,
};

const put = (item: string, slot: Slot, shadow?: boolean): Placement => ({
  slot,
  image: ITEM_IMAGES[item],
  shadow,
});

const placeHoneyChicken: VerifyEvent = {
  type: "PLACE",
  itemName: "Honey Chicken Sandwich",
  placements: [
    put("Honey Chicken Sandwich", SLOTS.honeyChicken1, true),
    put("Honey Chicken Sandwich", SLOTS.honeyChicken2, true),
  ],
};
const placeClassic: VerifyEvent = {
  type: "PLACE",
  itemName: "Classic Sandwich",
  placements: [put("Classic Sandwich", SLOTS.classic)],
};
const placeWings: VerifyEvent = {
  type: "PLACE",
  itemName: "6pc Wings",
  placements: [put("6pc Wings", SLOTS.wings)],
};
const placeFries: VerifyEvent = {
  type: "PLACE",
  itemName: "Cajun Fries Reg",
  placements: [put("Cajun Fries Reg", SLOTS.fries)],
};
const placeBiscuits: VerifyEvent = {
  type: "PLACE",
  itemName: "Biscuit",
  placements: [put("Biscuit", SLOTS.biscuit1), put("Biscuit", SLOTS.biscuit2)],
};
const placeCoke: VerifyEvent = {
  type: "PLACE",
  itemName: "Dt Coke",
  placements: [put("Dt Coke", SLOTS.coke)],
};

/** Mid-order setup shared by flows 02 and 05: 4/8, sandwiches + wings placed. */
const MID_ORDER_SETUP: VerifyEvent[] = [
  { type: "KDS_PACK_NOW", order: EF541 },
  placeHoneyChicken,
  placeClassic,
  placeWings,
];

const clearStep: FlowStep = {
  label: "Clear the mat",
  expect: "Back to Idle / EmptyState.",
  events: [{ type: "CLEAR_MAT" }],
};

/* --------------------------------- 01 --------------------------------- */

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
      events: [placeHoneyChicken],
    },
    {
      label: "Place Classic Sandwich",
      expect: "Line resolves the same way; counter 3/8.",
      events: [placeClassic],
    },
    {
      label: "Place 6pc Wings",
      expect: "Counter 4/8.",
      events: [placeWings],
    },
    {
      label: "Place Cajun Fries Reg",
      expect: "Counter 5/8.",
      events: [placeFries],
    },
    {
      label: "Place 2× Biscuit",
      expect: "Counter 7/8, Checked (7), only x1 Dt Coke left in the open list.",
      events: [placeBiscuits],
    },
    {
      label: "Place Dt Coke",
      expect:
        'Counter 8/8 → "All 8 checked", "Recorded · time", green outline around the stage, full Checked (8) list. Emits verification.recorded.',
      events: [placeCoke],
    },
    clearStep,
  ],
};

/* --------------------------------- 02 --------------------------------- */

export const FLOW_02: Flow = {
  id: "02",
  title: "02 Items not on the ticket",
  description: "Wrong items get red frames and a remove toast; counter never moves.",
  steps: [
    {
      label: "Load mid-order state (4/8 packed)",
      expect:
        "Counter 4/8; Checked (4); open: Cajun Fries Reg, 2× Biscuit, Dt Coke. Sandwiches and wings on the stage.",
      events: MID_ORDER_SETUP,
    },
    {
      label: "Place Apple Pie (not on ticket)",
      expect:
        'Red dashed frame labelled "Apple Pie"; toast "Remove the Apple Pie / Not on this order". Counter unchanged.',
      events: [
        {
          type: "PLACE",
          itemName: "Apple Pie",
          placements: [put("Apple Pie", SLOTS.applePie)],
        },
      ],
    },
  ],
  branches: [
    {
      id: "multi",
      label: "Second wrong item",
      steps: [
        {
          label: "Place Coleslaw (not on ticket)",
          expect:
            'Second red frame; toast becomes "Remove 2 items / Apple Pie, Coleslaw aren’t on this order".',
          events: [
            {
              type: "PLACE",
              itemName: "Coleslaw",
              placements: [put("Coleslaw", SLOTS.coleslaw)],
            },
          ],
        },
        {
          label: "Remove wrong items",
          expect: "Frames and toast gone; back to the clean 4/8 state.",
          events: [
            { type: "REMOVE", itemName: "Apple Pie", qty: 1 },
            { type: "REMOVE", itemName: "Coleslaw", qty: 1 },
          ],
        },
      ],
    },
    {
      id: "single",
      label: "Remove it right away",
      steps: [
        {
          label: "Remove the Apple Pie",
          expect: "Frame and toast gone; back to the clean 4/8 state.",
          events: [{ type: "REMOVE", itemName: "Apple Pie", qty: 1 }],
        },
      ],
    },
  ],
};

/* --------------------------------- 03 --------------------------------- */

const FLOW_03_SETUP: VerifyEvent[] = [
  { type: "KDS_PACK_NOW", order: EF541 },
  placeHoneyChicken,
  placeClassic,
  placeWings,
  placeFries,
  placeBiscuits,
];

export const FLOW_03: Flow = {
  id: "03",
  title: "03 Camera can't read",
  description:
    "A trained item the camera can't recognise: the packer confirms it by hand.",
  steps: [
    {
      label: "Load 7/8 state",
      expect: "Counter 7/8; open: x1 Dt Coke; Checked (7). Stage shows the other items.",
      events: FLOW_03_SETUP,
    },
    {
      label: "Place Dt Coke — camera can't recognise it",
      expect:
        "The bottle appears on the stage with no frame; nothing on the panel changes.",
      events: [
        {
          type: "PLACE_UNRECOGNIZED",
          itemName: "Dt Coke",
          placements: [put("Dt Coke", SLOTS.cokeUnread)],
        },
      ],
    },
    {
      label: "Long-press the Dt Coke row",
      kind: "screen",
      screenHint: "Hold the x1 Dt Coke row on the kiosk for half a second.",
      expect:
        'Sheet: "Dt Coke / Not checked yet. What happened?" with three options.',
      events: [{ type: "LONG_PRESS_ROW", lineId: "coke" }],
    },
    {
      label: 'Choose "Camera missed it"',
      kind: "screen",
      screenHint: "Tap the first option on the kiosk.",
      expect:
        'Sheet closes; notification "Checked by you · Dt Coke" with Undo slides in; counter 8/8 → completion with "Checked by you" in red. Emits recognition.report + verification.recorded.',
      events: [{ type: "CHOOSE", option: "camera_missed" }],
    },
    {
      label: "Undo (while the notification shows)",
      kind: "screen",
      screenHint: "Tap Undo on the notification.",
      expect: "Reverts to the 7/8 state with the bottle still on the mat; logs an undo.",
      events: [{ type: "UNDO" }],
    },
    clearStep,
  ],
};

/* --------------------------------- 04 --------------------------------- */

export const FLOW_04: Flow = {
  id: "04",
  title: "04 Item Split",
  description: "A multi-quantity line placed in parts: amber until all are down.",
  steps: [
    {
      label: "Load mid-order state (4/9 packed)",
      expect:
        "Counter 4/9; open: Cajun Fries Reg, 3× Biscuit, Dt Coke; Checked (4).",
      events: [
        { type: "KDS_PACK_NOW", order: EF541_SPLIT },
        placeHoneyChicken,
        placeClassic,
        placeWings,
      ],
    },
    {
      label: "Place 1 Biscuit",
      expect:
        'Amber dashed frame "1 of 3 • Biscuit"; amber toast "Put all 3 Biscuits down together" with badge 1 of 3. Counter unchanged.',
      events: [
        {
          type: "PLACE",
          itemName: "Biscuit",
          placements: [put("Biscuit", SLOTS.biscuitSplit1)],
        },
      ],
    },
  ],
  branches: [
    {
      id: "all",
      label: "Put the rest down",
      steps: [
        {
          label: "Place 2 more Biscuits",
          expect:
            "Badge ticks to 3 of 3, the line strikes in place, frames disappear, line slides to Checked (7); counter 7/9.",
          events: [
            {
              type: "PLACE",
              itemName: "Biscuit",
              placements: [
                put("Biscuit", SLOTS.biscuitSplit2),
                put("Biscuit", SLOTS.biscuitSplit3),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "away",
      label: "Take it away",
      steps: [
        {
          label: "Take the Biscuit away",
          expect: "Frame and toast gone; back to the clean 4/9 state.",
          events: [{ type: "REMOVE", itemName: "Biscuit", qty: 1 }],
        },
      ],
    },
    {
      id: "extra",
      label: "Extra items",
      steps: [
        {
          label: "Place 3 more Biscuits (4 total)",
          expect:
            'Red frame "4 of 3 • Biscuit"; red toast "Remove 1 Biscuit" with badge 4 of 3; counter unchanged.',
          events: [
            {
              type: "PLACE",
              itemName: "Biscuit",
              placements: [
                put("Biscuit", SLOTS.biscuitOver2),
                put("Biscuit", SLOTS.biscuitOver3),
                put("Biscuit", SLOTS.biscuitOver4),
              ],
            },
          ],
        },
        {
          label: "Remove 1 Biscuit",
          expect: "Resolves like the happy case: line checked, counter 7/9.",
          events: [{ type: "REMOVE", itemName: "Biscuit", qty: 1 }],
        },
      ],
    },
  ],
};

/* --------------------------------- 05 --------------------------------- */

const placeBiscuits05: VerifyEvent = {
  type: "PLACE",
  itemName: "Biscuit",
  placements: [
    put("Biscuit", { x: 352, y: 232, w: 84, h: 62 }),
    put("Biscuit", { x: 376, y: 270, w: 73, h: 54 }),
  ],
};
const placeCoke05: VerifyEvent = {
  type: "PLACE",
  itemName: "Dt Coke",
  placements: [put("Dt Coke", { x: 634, y: 224, w: 75, h: 150 })],
};

export const FLOW_05: Flow = {
  id: "05",
  title: "05 Items out of stock",
  description: "An open line that can't be packed: mark it sold out, or swap it.",
  steps: [
    {
      label: "Load mid-order state (4/8 packed)",
      expect:
        "Counter 4/8; open: Cajun Fries Reg, 2× Biscuit, Dt Coke; Checked (4).",
      events: MID_ORDER_SETUP,
    },
    {
      label: "Long-press the Cajun Fries Reg row",
      kind: "screen",
      screenHint: "Hold the x1 Cajun Fries Reg row on the kiosk.",
      expect: 'Sheet: "Cajun Fries Reg / Not checked yet. What happened?"',
      events: [{ type: "LONG_PRESS_ROW", lineId: "fries" }],
    },
  ],
  branches: [
    {
      id: "soldout",
      label: "Mark as sold out",
      steps: [
        {
          label: 'Choose "It’s sold out"',
          kind: "screen",
          screenHint: "Tap the second option on the kiosk.",
          expect:
            'Sheet closes; notification "Notified your manager · Cajun Fries Reg • Sold out"; line moves to Checked with Sold out in red; counter 5/8. Emits manager.notify.',
          events: [{ type: "CHOOSE", option: "sold_out" }],
        },
        {
          label: "Place 2× Biscuit",
          expect: "Counter 7/8.",
          events: [placeBiscuits05],
        },
        {
          label: "Place Dt Coke",
          expect:
            "Counter 8/8 → completion; Cajun Fries shown struck with Sold out.",
          events: [placeCoke05],
        },
        clearStep,
      ],
    },
    {
      id: "swap",
      label: "Swap",
      steps: [
        {
          label: 'Choose "Swap"',
          kind: "screen",
          screenHint: "Tap the third option on the kiosk.",
          expect:
            'Sheet closes; neutral toast "Put the swap down / They will replace x1 Cajun Fries Reg".',
          events: [{ type: "CHOOSE", option: "swap" }],
        },
        {
          label: "Place Mac & Cheese",
          expect:
            'The object gets the neutral pending-swap frame; toast becomes "Put the swap on the mat".',
          events: [
            {
              type: "PLACE",
              itemName: "Mac & Cheese",
              placements: [put("Mac & Cheese", SLOTS.macAndCheese)],
            },
          ],
        },
        {
          label: "Recognition completes",
          expect:
            'Notification "Swapped · x1 Cajun Fries →  x1 Mac & Cheese"; line becomes swapped; counter 5/8. Emits manager.notify.',
          events: [{ type: "RECOGNITION_COMPLETE" }],
        },
        {
          label: "Place 2× Biscuit",
          expect: "Counter 7/8.",
          events: [placeBiscuits05],
        },
        {
          label: "Place Dt Coke",
          expect: "Counter 8/8 → completion with the swap row in the checked list.",
          events: [placeCoke05],
        },
        clearStep,
      ],
    },
  ],
};

export const FLOWS: Flow[] = [FLOW_01, FLOW_02, FLOW_03, FLOW_04, FLOW_05];

/** Steps that apply given the chosen branch (trunk first, then the branch). */
export function effectiveSteps(flow: Flow, branchId?: string): FlowStep[] {
  const branch = flow.branches?.find((b) => b.id === branchId);
  return branch ? [...flow.steps, ...branch.steps] : flow.steps;
}
