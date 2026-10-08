"use client";

import { ClipboardX, Grid2x2Plus, Grid2x2X, Repeat } from "lucide-react";
import { cn } from "cn";
import type { ToastModel } from "@/lib/verify/selectors";
import { usePresence } from "./motion";

/** "Biscuit" → "Biscuits", "Sandwich" → "Sandwiches". */
const pluralize = (name: string) =>
  /(?:s|x|z|ch|sh)$/i.test(name) ? `${name}es` : `${name}s`;

type ToastView = {
  icon: React.ReactNode;
  iconTile: string;
  title: string;
  titleColor: string;
  subtitle: string;
  pill?: { text: string; tone: "amber" | "red" };
};

function view(toast: ToastModel): ToastView {
  switch (toast.kind) {
    case "remove_wrong": {
      const [first] = toast.itemNames;
      const multi = toast.itemNames.length > 1;
      return {
        icon: <ClipboardX className="size-6 text-black" />,
        iconTile: "bg-kiosk-red",
        title: multi
          ? `Remove ${toast.itemNames.length} items`
          : `Remove the ${first}`,
        titleColor: "text-kiosk-red",
        subtitle: multi
          ? `${toast.itemNames.join(", ")} aren’t on this order`
          : "Not on this order",
      };
    }
    case "remove_over":
      return {
        icon: <Grid2x2X className="size-6 text-kiosk-red" />,
        iconTile: "bg-kiosk-red/20",
        title: `Remove ${toast.excess} ${toast.line.name}`,
        titleColor: "text-kiosk-red",
        subtitle: "",
        pill: { text: `${toast.line.onMat} of ${toast.line.qty}`, tone: "red" },
      };
    case "put_all":
      return {
        icon: <Grid2x2Plus className="size-6 text-black" />,
        iconTile: "bg-kiosk-amber",
        title: `Put all ${toast.line.qty} ${pluralize(toast.line.name)} down together`,
        titleColor: "text-kiosk-amber",
        subtitle: "",
        pill: { text: `${toast.line.onMat} of ${toast.line.qty}`, tone: "amber" },
      };
    case "swap_waiting":
      return {
        icon: <Repeat className="size-6 text-white" />,
        iconTile: "bg-kiosk-border",
        title: "Put the swap down",
        titleColor: "text-white",
        subtitle: `They will replace x${toast.line.qty} ${toast.line.name}`,
      };
    case "swap_placed":
      return {
        icon: <Repeat className="size-6 text-white" />,
        iconTile: "bg-kiosk-border",
        title: "Put the swap on the mat",
        titleColor: "text-white",
        subtitle: `They will replace x${toast.line.qty} ${toast.line.name}`,
      };
  }
}

/**
 * The single action toast at the bottom of the stage: what the packer must do
 * next with their hands. Slides up from the bottom edge; content changes
 * crossfade without re-sliding the card.
 */
export function ActionToast({ toast }: { toast: ToastModel | undefined }) {
  const { item, exiting } = usePresence(toast, 320);
  if (!item) return null;
  const v = view(item);
  const contentKey = `${item.kind}:${v.title}:${v.pill?.text ?? ""}`;

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col items-start overflow-clip rounded-[14px] border border-kiosk-border bg-kiosk-card",
        exiting ? "kiosk-exit-toast" : "kiosk-enter-toast",
      )}
      data-testid="action-toast"
    >
      <div key={contentKey} className="kiosk-enter-fade flex w-full items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-[10px]",
            v.iconTile,
          )}
        >
          {v.icon}
        </div>
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className={cn("w-full text-[18px] leading-[27px] font-medium", v.titleColor)}>
              {v.title}
            </p>
            {v.subtitle ? (
              <p className="w-full text-sm leading-5 font-normal text-kiosk-muted-foreground">
                {v.subtitle}
              </p>
            ) : null}
          </div>
          {v.pill ? (
            <div className="flex shrink-0 items-center justify-center rounded-full bg-black px-2 py-[2px]">
              <p
                className={cn(
                  "text-xs leading-4 font-semibold whitespace-nowrap",
                  v.pill.tone === "amber" ? "text-kiosk-amber" : "text-kiosk-red",
                )}
              >
                {v.pill.text}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
