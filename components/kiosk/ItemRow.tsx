import { cn } from "cn";
import type { LineItem } from "@/lib/verify/types";

export type ItemRowVisual = "normal" | "struck" | "dimmed" | "highlighted";

/**
 * One open order line (44px touch target). Strike-through happens in place
 * before the line slides into the Checked zone (handled by OrderPanel).
 */
export function ItemRow({
  line,
  visual = "normal",
  onTap,
}: {
  line: LineItem;
  visual?: ItemRowVisual;
  onTap?: () => void;
}) {
  const struck = visual === "struck";
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!onTap}
      className={cn(
        "flex w-full items-center justify-between rounded-[8px] text-left transition-all duration-250",
        visual === "highlighted" && "bg-black/10 opacity-80",
        visual === "dimmed" && "opacity-50",
      )}
      data-line-id={line.id}
    >
      <div className="flex h-11 min-w-0 flex-1 items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <div className="flex w-full items-center gap-1 text-[18px] leading-[27px] whitespace-nowrap">
            <span
              className={cn(
                "shrink-0 font-medium text-muted-foreground",
                struck && "line-through",
              )}
            >
              x{line.qty}{" "}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate font-semibold text-foreground",
                struck && "text-muted-foreground line-through",
              )}
            >
              {line.name}
            </span>
          </div>
          {line.modifier ? (
            <p
              className={cn(
                "w-full truncate text-sm leading-5 font-normal text-muted-foreground",
                struck && "line-through",
              )}
            >
              {line.modifier}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
