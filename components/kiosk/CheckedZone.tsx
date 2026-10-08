import { Repeat, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import type { LineItem } from "@/lib/verify/types";

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
 * Resolved lines pin to the bottom of the panel; the last checked item ranks
 * first. The list is height-capped and scrolls internally.
 */
export function CheckedZone({ lines }: { lines: LineItem[] }) {
  if (lines.length === 0) return null;
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return (
    <div className="flex w-full flex-col gap-[2px] border-t border-dashed border-border bg-kiosk-green-surface px-3 pt-2 pb-2 shadow-[0_-4px_6px_-4px_rgba(0,0,0,0.1),0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="flex w-full items-center gap-1">
        <ShieldCheck className="size-4 text-foreground" />
        <p className="text-sm leading-5 font-semibold text-foreground">
          Checked ({count})
        </p>
      </div>
      <div className="flex max-h-[66px] w-full flex-col gap-[2px] overflow-y-auto">
        {lines.map((l) => (
          <CheckedRow key={l.id} line={l} />
        ))}
      </div>
    </div>
  );
}
