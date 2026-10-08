import { Repeat, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import type { LineItem } from "@/lib/verify/types";
import { Tick } from "./motion";

/** A single resolved row inside the Checked zone / completion list. */
export function CheckedRow({ line }: { line: LineItem }) {
  if (line.status === "swapped" && line.swappedTo) {
    return (
      <>
        <div className="flex w-full items-center gap-1 pl-5 text-sm leading-5 whitespace-nowrap text-destructive">
          <span className="shrink-0 line-through">x{line.qty} </span>
          <span className="min-w-0 flex-1 truncate line-through">{line.name}</span>
        </div>
        <div className="flex w-full items-center gap-1 pl-10">
          <Repeat className="size-3 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-sm leading-5 text-muted-foreground">
            x{line.swappedTo.qty}{" "}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm leading-5 text-muted-foreground">
            {line.swappedTo.name}
          </span>
        </div>
      </>
    );
  }

  const annotated = line.status === "sold_out" || line.status === "checked_by_you";
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 pl-5 text-sm leading-5 whitespace-nowrap",
        annotated ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <span className={cn("shrink-0", line.status === "sold_out" && "line-through")}>
        x{line.qty}{" "}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          line.status === "sold_out" && "line-through",
        )}
      >
        {line.name}
      </span>
      {annotated ? (
        <span className="shrink-0 text-right font-medium text-destructive">
          {line.status === "sold_out" ? "Sold out" : "Checked by you"}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Resolved lines pin to the bottom of the panel. While packing, only the most
 * recently checked item shows (one row even when several check at once); the
 * rest collapse into a "..." row. The zone is fixed — the full list only
 * appears (and scrolls) in the completion state.
 */
export function CheckedZone({ lines }: { lines: LineItem[] }) {
  if (lines.length === 0) return null;
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const latest = lines[0];
  return (
    <div className="kiosk-enter-rise flex w-full flex-col gap-[2px] border-t border-dashed border-border bg-kiosk-green-surface px-3 pt-2 pb-2 shadow-[0_-3px_10px_-6px_rgba(0,0,0,0.08)]">
      <div className="flex w-full items-center gap-1">
        <ShieldCheck className="size-4 text-foreground" />
        <p className="text-sm leading-5 font-semibold text-foreground">
          Checked (<Tick value={count} />)
        </p>
      </div>
      <div key={latest.id} className="kiosk-enter-tick flex w-full flex-col gap-[2px]">
        <CheckedRow line={latest} />
      </div>
      {lines.length > 1 ? (
        <p className="pl-5 text-sm leading-5 text-muted-foreground">...</p>
      ) : null}
    </div>
  );
}
