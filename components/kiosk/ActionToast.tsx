import { ClipboardX, Grid2x2Plus, Grid2x2X, Repeat } from "lucide-react";
import { cn } from "cn";
import type { ToastModel } from "@/lib/verify/selectors";

/**
 * The single action toast at the bottom of the stage: what the packer must do
 * next with their hands. Red = remove wrong/extra, amber = put the rest of a
 * multi-quantity line down, neutral = swap guidance (designer decision: swap
 * is never amber).
 */
export function ActionToast({ toast }: { toast: ToastModel }) {
  let icon: React.ReactNode;
  let iconTile: string;
  let title: string;
  let titleColor: string;
  let subtitle: string;
  let pill: { text: string; tone: "amber" | "red" } | undefined;

  switch (toast.kind) {
    case "remove_wrong": {
      const [first] = toast.itemNames;
      const multi = toast.itemNames.length > 1;
      icon = <ClipboardX className="size-6 text-black" />;
      iconTile = "bg-kiosk-red";
      title = multi ? `Remove ${toast.itemNames.length} items` : `Remove the ${first}`;
      titleColor = "text-kiosk-red";
      subtitle = multi
        ? `${toast.itemNames.join(", ")} aren’t on this order`
        : "Not on this order";
      break;
    }
    case "remove_over": {
      icon = <Grid2x2X className="size-6 text-kiosk-red" />;
      iconTile = "bg-kiosk-red/20";
      title = `Remove ${toast.excess} ${toast.line.name}`;
      titleColor = "text-kiosk-red";
      subtitle = "";
      pill = { text: `${toast.line.onMat} of ${toast.line.qty}`, tone: "red" };
      break;
    }
    case "put_all": {
      icon = <Grid2x2Plus className="size-6 text-black" />;
      iconTile = "bg-kiosk-amber";
      title = `Put all ${toast.line.qty} ${toast.line.name}s down together`;
      titleColor = "text-kiosk-amber";
      subtitle = "";
      pill = { text: `${toast.line.onMat} of ${toast.line.qty}`, tone: "amber" };
      break;
    }
    case "swap_waiting": {
      icon = <Repeat className="size-6 text-white" />;
      iconTile = "bg-kiosk-border";
      title = "Put the swap down";
      titleColor = "text-white";
      subtitle = `They will replace x${toast.line.qty} ${toast.line.name}`;
      break;
    }
    case "swap_placed": {
      icon = <Repeat className="size-6 text-white" />;
      iconTile = "bg-kiosk-border";
      title = "Put the swap on the mat";
      titleColor = "text-white";
      subtitle = `They will replace x${toast.line.qty} ${toast.line.name}`;
      break;
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start overflow-clip rounded-[14px] border border-kiosk-border bg-kiosk-card">
      <div className="flex w-full items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-[10px]",
            iconTile,
          )}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p
              className={cn(
                "w-full text-[18px] leading-[27px] font-medium",
                titleColor,
              )}
            >
              {title}
            </p>
            {subtitle ? (
              <p className="w-full text-sm leading-5 font-normal text-kiosk-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          {pill ? (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full px-2 py-[2px]",
                pill.tone === "amber" ? "bg-kiosk-border" : "bg-white",
              )}
            >
              <p
                className={cn(
                  "text-xs leading-4 font-semibold whitespace-nowrap",
                  pill.tone === "amber" ? "text-kiosk-amber" : "text-kiosk-red",
                )}
              >
                {pill.text}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
