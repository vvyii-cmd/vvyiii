import type { LineItem } from "@/lib/verify/types";
import { ShieldCheck } from "lucide-react";
import { CheckedRow } from "./CheckedZone";

/**
 * Panel body once every unit is resolved: "All N checked", the recorded
 * timestamp, and the full checked list (ticket order).
 */
export function CompletionState({
  lines,
  recordedAt,
}: {
  lines: LineItem[];
  recordedAt: string;
}) {
  const total = lines.reduce((n, l) => n + l.qty, 0);
  return (
    <>
      <div className="kiosk-enter-rise flex w-full flex-col gap-1 px-4 py-5">
        <p className="text-[22px] leading-[26.4px] font-medium tracking-[-0.5px] text-kiosk-green">
          All {total} checked
        </p>
        <p className="text-sm leading-5 font-normal text-muted-foreground">
          Recorded • {recordedAt}
        </p>
      </div>
      <div className="kiosk-enter-rise flex min-h-0 w-full flex-1 flex-col gap-[2px] border-t border-dashed border-[#d4d4d4] px-3 pt-2 pb-2">
        <div className="flex w-full items-center gap-1">
          <ShieldCheck className="size-4 text-foreground" />
          <p className="text-sm leading-5 font-semibold text-foreground">
            Checked ({total})
          </p>
        </div>
        <div className="flex min-h-0 w-full flex-1 flex-col gap-[2px] overflow-y-auto">
          {lines.map((l) => (
            <CheckedRow key={l.id} line={l} />
          ))}
        </div>
      </div>
    </>
  );
}
