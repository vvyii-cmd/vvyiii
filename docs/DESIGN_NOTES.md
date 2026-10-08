# Otter Verify — Design Notes (Phase 0)

Source of truth: Figma file `Otter verify (Master)` (`0q3xvvFRPfUPJeQqSQs42L`) and the
Shadcn component library file (`NHmgXOp6WmyAACTeefpsVO`). Everything below was read via the
Figma MCP (`get_design_context`, `get_variable_defs`, `get_metadata`, `get_screenshot`).

Figma section ↔ demo flow mapping (note: Figma's own section numbers differ from the brief;
**the brief's numbering governs** everywhere in code and UI):

| Demo flow (brief) | Figma section | Section node id | Screen frame ids (left → right) |
|---|---|---|---|
| 01 Happy Path | `01 happy path :)` | `145:12611` | `278:31194` (empty), `145:11231` (0/8), `129:6074`, `129:6078`, `130:7726`, `145:12346` (complete) |
| 02 Items not on the ticket | `02 items not on the ticket` | `161:3736` | `157:2406` (4/8), `307:52519` (1 wrong), `307:52521` (2 wrong), `161:3586` (removed) |
| 03 Camera can't read | `04 can't recognize items` | `307:52511` | `314:9578`, `314:9748`, `314:10515` (sheet), `318:11046` (undo toast), `318:11269` (complete) |
| 04 Item Split | `03 Item Split` | `161:10113` | `161:9404` (1 of 3), `161:9744` (3 of 3), `161:9948` (7/9), `161:9578` (take away), `312:9111` (4 of 3) |
| 05 Items out of stock | `05 Items out of stock` | `161:8927` | sold-out: `161:4240`, `161:4391`, `161:4734`, `161:5434`, `161:5598`, `278:32557`; swap: `161:7669`, `161:7856`, `161:8039`, `161:8683`, `161:9123`, `278:32600` |
| Components | (component sheet) | `108:44200` | — |

---

## 1. Token table

All values read from `get_variable_defs` on the components sheet, cross-checked against
per-screen `get_design_context` output. Figma variable names in backticks.

### 1.1 Colors — light surface (order panel, badges)

| Token (Figma) | Value | Used for |
|---|---|---|
| `shadcn colors/general/primary` | `#171717` | Pickup badge bg, shadcn `--primary` |
| `shadcn colors/general/primary foreground` | `#ffffff` | text on primary |
| `shadcn colors/general/secondary` | `#f5f5f5` | More-button bg |
| `shadcn colors/general/secondary foreground` | `#171717` | — |
| `shadcn colors/general/foreground` | `#000000` | item names, headings |
| `shadcn colors/general/muted` | `#f5f5f5` | EmptyState icon tile bg |
| `shadcn colors/general/muted foreground` | `#737373` | qty prefixes, sub-copy, counter `/N` |
| `shadcn colors/general/border` | `#e5e5e5` | panel & badge borders |
| `shadcn colors/general/destructive` / `theme/destructive/600` | `#dc2626` | "Sold out", "Checked by you", struck swap rows (panel only) |
| `shadcn colors/focus/ring` | `#d4d4d4` | dashed divider above Checked zone (complete state) |
| `alpha/white/no-switch/alpha-90` | `#ffffffe5` | order panel bg |
| `tw-raw/blue/600` | `#2563eb` | notification count badge on More button |

### 1.2 Colors — dark surface (everything floating over the camera stage)

Stage overlays (toasts, sheet, CTA) use the **dark mode values** of the same shadcn variables:

| Token | Dark value | Used for |
|---|---|---|
| `general/card` | `#262626` | ActionToast, StatusToast, WhatHappenedSheet bg |
| `general/border` | `#404040` | borders of the above, Undo button border, neutral pending-swap frame |
| `general/muted foreground` | `#a3a3a3` | toast/sheet sub-copy |
| `general/muted` | `#171717` | sheet option icon tile bg |
| `alpha/black/no-switch/alpha-40` | `#00000066` | CTA cluster bg |
| `alpha/black/no-switch/alpha-60` | (black 60%) | sheet full-screen mask |
| `alpha/black/no-switch/alpha-15` | `#00000026` | detection-frame fill |
| `alpha/black/switch/alpha-10` | `#0000001a` | tapped/highlighted list row bg |

### 1.3 Colors — semantic accents

| Token | Value | Semantics (matches brief §3.4) |
|---|---|---|
| `tw-raw/red/400` | `#f87171` | wrong/extra on stage: frames, frame badges, toast title+icon |
| `tw-raw/orange/300` | `#fdba74` | amber = multi-quantity partial counts only (flow 04 frames, toasts, pills). NOT for swap — swap is neutral gray (designer decision, see §7.3) |
| `tw-raw/green/700` | `#15803d` | "All N checked", counter numerator at completion |
| `tw-raw/green/50` | `#f0fdf4` | Checked-zone bg (open state); completion panel bg is `rgba(240,253,244,0.85)` |
| green/300 | `#86efac` | completion stage outline (`border-2`, fill `rgba(134,239,172,0.1)`) |

Note: red has two tones by surface — stage uses `red/400`, the light panel uses `destructive/600`.

### 1.4 Radii

`radius-sm` 6 · `radius-md` 8 · `radius-lg (radius)` **10** · `radius-xl` 14 · `radius-2xl` 16 · `radius-full` 999.
Kiosk screen corner: 16 (`2xl`). Panels/frames/buttons: 10. Toast cards (Card-Nova): 14. List rows: 8.

### 1.5 Shadows

- `shadow-lg`: 0 10px 15px -3px + 0 4px 6px -4px, `#0000001a` — Checked zone
- `shadow-xl`: 0 20px 25px -5px + 0 8px 10px -6px, `#0000001a` — order panel
- `shadow-2xl`: 0 25px 50px -12px, `#00000040` — kiosk frame, CTA, food objects

### 1.6 Type scale (font: **Geist**; weights regular 400 / medium 500 / semibold 600)

| Style | Size/LH | Tracking | Usage |
|---|---|---|---|
| `heading 2` | 26/26 medium | −1 | N/M counter |
| `heading 3` | 22/26.4 medium | −0.5 | customer name, "All 8 checked", EmptyState title |
| `paragraph large` | 18/27 | 0 | item rows (name semibold, qty medium), toast titles, sheet titles |
| `paragraph regular` | 16/24 | 0 | Undo button label, "Pack Now" bold span |
| `paragraph small` | 14/20 | 0 | modifiers, Checked rows, toast sub-copy, "Recorded • …" |
| `paragraph mini` | 12/16 | 0 | status bar, badges, frame labels, count pills |

### 1.7 Spacing

`3xs` 2 · `2xs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 20 · `3xl` 40; out-of-scale: 0.75→3, 1.5→6, 2.5→10, 3.5→14.

### 1.8 Button sizes (from the Shadcn library file — already implemented in `components/ui/button.tsx`)

| Figma size | Height | Padding/text | Code size |
|---|---|---|---|
| Extra large | 44 | px-16, text 16/24 medium, gap 8, radius 10, icons 20 | `xl` / `icon-xl` (44×44, 12px pad, 20px icon) |
| 2X Large | 56 | px-16, text 18/27 medium, gap 8, radius 10, icons 20 | `2xl` / `icon-2xl` (56×56, 16px pad, 24px icon) |

---

## 2. Component inventory

Production components (`components/kiosk/*`), with observed states:

- **KioskFrame** — 800×480, 8px black bezel border, radius 16, shadow-2xl, layered kitchen bg.
- **KioskHeader (status bar)** — h 32 (py-8), logo 12px + "Otter Verify" 12 semibold `#f5f5f5`; right: "EN", clock "2:14pm" 12 medium. Background is the subtle perspective-gradient image from Figma node `97:42390`, exported to `public/assets/stage/status-bar-bg.png` — never a solid black fill. Non-functional in demo.
- **OrderPanel (left panel)** — 281×424, bg white/90, border `#e5e5e5`, radius 10, shadow-xl. Header has a top gradient `rgba(0,0,0,0.1)→0`. States: order loaded / EmptyState / completion (bg `rgba(240,253,244,0.85)`).
  - Header: name 22 (truncates); badges **Pickup** (filled `#171717`, pill, 12 semibold) and **EF541** (outline); counter `N/M` 26px (numerator black → green-700 at completion; `/M` muted). **KDS-integrated build has no More button and no count badge** (order selection and multi-order handling live on the KDS — Figma node `124:3736`). The multi-order treatment for the future paper-ticket / non-integrated-KDS variants is the stacked-cards + "N more" pill component set (nodes `274:20355`, `326:14391`) — reference only, not built in this pass.
- **ItemRow** — 257×44, radius 8. qty `x2 ` 18 medium muted + name 18 semibold black + optional modifier line 14 regular muted. States: pending; **held** (bg black/10, opacity .8 while long-pressing); **dimmed** (opacity .5, during Undo window); **struck in place** (line-through, from components sheet) before sliding to Checked. **A long press (~500 ms), not a tap, opens the "What happened?" sheet** (designer decision — supersedes the brief's "tap the row"). The open ticket list scrolls vertically.
- **CheckedZone** — bg `#f0fdf4`, dashed top border `#e5e5e5`, shadow-lg, pt/pb 8, px 12. Title: shield-check 16 + "Checked (N)" 14 semibold. **While packing it shows only the most recently checked item (one row even when several check at once) plus a "..." row for the rest; the zone is fixed (no scrolling).** The full checked list appears only at completion, where it scrolls vertically. Rows: `x2 ` + name, 14 regular `#737373`, pl 20. Annotated rows (red `#dc2626`): "Sold out" / "Checked by you" right-aligned 14 medium; swapped = struck red original row + indented (pl 40) sub-row with 12px repeat icon + `x1 Mac & Cheese`.
- **CompletionState** — "All 8 checked" 22 green-700 + "Recorded • 2:16pm" 14 muted (px 16 / py 20), divider dashed `#d4d4d4`, then full Checked (8) list.
- **CameraStage** — right flex area; completion outline: border-2 `#86efac`, fill `rgba(134,239,172,0.1)`, radius 8.
- **MatObject** — food PNGs at per-flow absolute slots (shadow-2xl on sandwiches; honey chicken instance 1 rotated 9.1°).
- **DetectionFrame (Alert frame)** — dashed **3px**, radius 10, fill black/15. Variants: red `#f87171`, amber `#fdba74`, neutral `#404040` (pending swap — see ambiguity #3).
- **Frame badge** — pill overlapping frame's top-left (offset ~−9px up), px-8 py-2, 12 semibold; text in frame color; bg is color blended over black (on-stage) e.g. "Apple Pie", "1 of 3 • Biscuit", "4 of 3 • Biscuit" (bullet `•`).
- **ActionToast (Card - Nova)** — bottom of stage, full stage width (475), bg `#262626`, border `#404040`, radius 14, p-16. Icon tile 48×48 radius 10 (bg red-400 / orange-300 / `#f5f5f5`-on-neutral), icon 24 dark. Title 18 medium in accent color; sub 14 regular `#a3a3a3`. Optional count pill right-aligned: "1 of 3" (amber, bg `#404040`) / "4 of 3" (red tones).
- **Notification (Alert - Nova)** — slides in from the **top-right** of the stage (designer decision, §7.2), bg `#262626`, border `#404040`, radius 10, px-12 py-8; check icon 16; title 14 medium white; sub 14 regular `#a3a3a3`; optional **Undo** button (px-8 py-3, radius 8, border `#404040`, label 16 medium white).
- **WhatHappenedSheet** — centered dialog at (315,161), w 469, bg `#262626`, border `#404040`, radius 14, over full-screen black/60 mask. Title 18 medium white + sub 14 `#a3a3a3`; 3 option tiles 437 wide (≈64 tall): p-8, radius 10, gap-12, icon tile 48 (`#171717`) with 24px lucide icon; tile titles 18 medium / subs 14 `#a3a3a3`; focused/pressed tile bg `alpha/black/switch/alpha-333`.
- **EmptyState** — centered in panel: icon tile 48 (bg `#f5f5f5`, radius 10, 24px icon), title 22 heading-3, sub 14 centered muted. Variants on the components sheet: "Pick an order on the KDS", "No orders right now", "Failed to get an order", "Tickets here" (paper-ticket — out of scope), plus skeleton card.
- **CTA cluster** — top-right of stage: container bg black/40, radius 10, shadow; 3 × icon button 44×44 (radius 10, 12px pad, transparent-white bg, 20px icons: `focus`, `flag`, `settings`). Non-functional.

Icons: all lucide — pointer, ellipsis, focus, flag, settings, check, shield-check, scan-line, archive-x, repeat, clipboard-x, grid-2x2-plus, grid-2x2-x, file-text, monitor-x. (The 52px "touch" cursor uses Material `touch_app` but is a prototype annotation, not product UI.) **No custom SVGs needed so far.**

Demo components (`components/demo/*`): FlowSelector, OperatorConsole — not in Figma; shadcn-styled per brief §5.

---

## 3. Copy table (verbatim)

Trailing/double spaces from Figma are shown as `␣`.

### Global chrome
| Key | Copy |
|---|---|
| statusbar.logo / lang / clock | `Otter Verify` / `EN` / `2:14pm` (`2:16pm` on completion screens) |
| order.name / tags / code | `Stella Maya` / `Pickup` / `EF541`; More-badge count `6` |
| counter | `0/8` → `8/8` (flow 04: `4/9` → `7/9`) |

### Order lines (flows 01–03, 05)
`x2 Honey Chicken Sandwich` · `x1 Classic Sandwich` · `x1 6pc Wings` + modifier `extra sauce␣` · `x1 Cajun Fries Reg` · `x2 Biscuit` · `x1 Dt Coke` — flow 04 variant: `x3 Biscuit` (9 units).

### Empty states
| State | Title | Sub |
|---|---|---|
| idle (KDS) | `Pick an order on the KDS` | `Tap **Pack Now** on an active order, it will show up here` (Pack Now bold 16, rest 14) |
| no orders | `No orders right now` | `When you start one on the KDS, it shows up here` |
| failed | `Failed to get an order` | `Tap **Pack Now** on KDS again, or put the ticket on the table` |
| paper (out of scope) | `Tickets here` | `Put tickets on the table` |

### Checked zone / completion
`Checked (N)` · rows `x2 Honey Chicken Sandwich` … · overflow `...` · `All 8 checked` · `Recorded • 2:16pm` · annotations `Sold out`, `Checked by you` · swap row: struck `x1 Cajun Fries Reg` + `x1 Mac & Cheese`.

### Flow 02
| State | Copy |
|---|---|
| ActionToast 1 wrong | title `Remove the Apple Pie` / sub `Not on this order` (icon: clipboard-x on red-400) |
| ActionToast 2 wrong | title `Remove 2 items␣` / sub `Apple Pie, Coleslaw aren’t on this order` |
| Frame badges | `␣Apple Pie` (leading space in Figma), `Apple Pie`, `Coleslaw` |

### Flow 03
| State | Copy |
|---|---|
| Sheet | title `Dt Coke` / sub `Not checked yet. What happened?` |
| Option 1 | `Camera missed it` / `Mark as checked` (scan-line) |
| Option 2 | `It’s sold out` / `Your manager gets a message` (archive-x) |
| Option 3 | `Swap␣` / `Replace with another item` (repeat) |
| StatusToast | `Checked by you` / `Dt Coke` + button `Undo` |

### Flow 04
| State | Copy |
|---|---|
| ActionToast partial | `Put all 3 Biscuits down together` + pill `1 of 3` → `3 of 3` (icon grid-2x2-plus on orange-300) |
| Stage badge | `1 of 3 • Biscuit` (amber) |
| ActionToast over | `Remove 1 Biscuit` + pill `4 of 3` (icon grid-2x2-x, red) |
| Stage badge over | `4 of 3 • Biscuit` (red) |

### Flow 05
| State | Copy |
|---|---|
| StatusToast sold out | `Notified your manager` / `Cajun Fries Reg • Sold out` |
| ActionToast swap 1 | `Put the swap down` / `They will replace x1 Cajun Fries Reg` (repeat on orange-300) |
| ActionToast swap 2 | `Put the swap on the mat` / `They will replace x1 Cajun Fries Reg` |
| StatusToast swapped | `Swapped` / `x1 Cajun Fries →␣␣x1 Mac & Cheese` (double space in Figma) |

---

## 4. Touch targets (measured)

| Element | Size |
|---|---|
| CTA icon buttons (stage) | 44×44 |
| List rows (tappable) | 257×44 |
| Sheet option tiles | 437×64 |
| Undo button | ~62×30 |
| More button (non-functional) | 28×28 |
| New button sizes (library) | 44 (`xl`), 56 (`2xl`) |

⚠️ The brief (§3.6) states primary = 88px / secondary = 64px "as measured from Figma". Nothing in these frames measures 88px; the real values are above → ambiguity #1.

## 5. Stage object slots (positions inside the 800×480 screen)

Common cluster (flows 01–05): honey chicken ×2 at (395,162, rotated 9.1°, 81×55) and (480,172); classic sandwich (561,94, 71×66); 6pc wings (626,158, 122×98). Biscuits: (390,278) & (421,270) — flow 04 stacks up to 4 around (395–470, 208–305); fries (538,240, 74×95); Dt Coke (632,234 / 464,232 in flow 03, 75×150). Flow 02: apple pie (459,223, 93×53 — frame at 448,208, 111×80), coleslaw (654,236, 85×68 — frame at 630,224, 107×80). Flow 05 swap: Mac & Cheese pending frame 126×80. Exact per-step values are in the Figma frames listed in the mapping table; `lib/demo/flows.ts` will store these per flow.

## 6. Asset status

Provided (renamed by actual content; all items are **1×** — they match Figma's placed pixel size exactly):

| File | Size | Matches Figma object |
|---|---|---|
| `public/assets/stage/kitchen-bg@2x.webp` | 1752×1112 | stage/kitchen background |
| `public/assets/items/classic-sandwich.png` | 71×66 | "Classic Sandwich" (Figma 71×66) |
| `public/assets/items/6pc-wings.png` | 122×98 | "6pc Wings" (122×98) |
| `public/assets/items/cajun-fries-reg.png` | 74×95 | "Cajun Fries Reg" (74×95) |
| `public/assets/items/biscuit.png` | 73×54 | "Biscuit" (73×54) |

**Missing** (listed per brief §1 — stopping on these): honey-chicken-sandwich (81×55), dt-coke (≈75×150), apple-pie (≈93×53), coleslaw (≈85×68), mac-and-cheese. No custom icons are needed (all glyphs are lucide).

---

## 7. Ambiguities / questions (batched)

Decisions received so far are marked ✅ RESOLVED.

1. ✅ **Touch target sizes** — RESOLVED: build to Figma's measured 44px (CTA, rows) / 64px (sheet tiles).
2. ✅ **StatusToast position** — RESOLVED: "StatusToast" here = the notification bar (`Alert - Nova`: "Checked by you · Undo", "Notified your manager", "Swapped"). Per designer: it is a notification that **slides in from the top-right** of the stage. The top-left placement seen in some frames is superseded. Component renamed **Notification** in the inventory.
3. ✅ **Swap colors** — RESOLVED (designer corrected the Figma): everything about a pending swap is **neutral gray**, not amber — the dashed detection frame (`#404040`, as drawn) AND the swap ActionToasts ("Put the swap down" / "Put the swap on the mat": neutral icon tile + neutral title, not orange-300). Amber remains only for multi-quantity partial counts (flow 04). The orange-300 on the swap toasts in Figma is a known mistake; do not copy it.
4. **Dark theme for stage overlays**: all toasts/sheet render dark (#262626/#404040/#a3a3a3) in Figma renders, though a few instances resolve variables to light fallbacks via the API. Proposal: dark for everything floating over the stage.
5. **Literal whitespace**: several strings carry trailing/leading/double spaces (`Swap␣`, `Remove 2 items␣`, `␣Apple Pie`, `→␣␣`). Copy-verbatim rule says reproduce — I will reproduce them unless you prefer trimming.
6. **Assets**: provided item images are 1× (sharp at scale ≤1; slightly soft when the kiosk scales up on a large screen). Want @2x exports? Also confirm `classic-sandwich.png` mapping (your file 5 matched Classic's 71×66, not Honey Chicken's 81×55).
7. ✅ **Per-flow Checked list contents** — RESOLVED: each flow's frames already show exactly which rows/treatments apply to that flow (sold-out flow shows only the sold-out row, swap flow only the swap treatment, etc.). Build each flow's states from that flow's own frames; the all-annotations completion card is the component sheet showing every case, and Flow 01's completion is 8 plain checked rows.
8. **Flow 03 step 1** ("trained but unrecognised"): Figma shows the bottle with no frame and no panel change — matches the brief; `DWELL_PROMPT_MS` will be built behind a flag, default 0 (off).
9. **Deployment** (already discussed in chat): staying on the existing Cloudflare Workers static-export setup (Data Console, access policy "Internal all"); Vercel + `middleware.ts` DEMO_KEY gate from brief §8 is skipped because middleware breaks `output: 'export'`. Flagging per the working agreement.
10. **Numbering mismatch** between Figma sections and the brief (Figma "03 Item Split" = brief flow 04; Figma "04 can't recognize items" = brief flow 03). Code and demo UI follow the brief.

**Phase 0 complete — stopping here per the working agreement.** Phase 1 (scaffold + theme + Flow 01) starts after the questions above are answered and the missing assets land.
