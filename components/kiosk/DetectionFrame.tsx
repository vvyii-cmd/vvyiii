import { Repeat } from "lucide-react";
import { cn } from "cn";
import type { DetectionFrameModel } from "@/lib/verify/selectors";

const BORDER: Record<DetectionFrameModel["variant"], string> = {
  red: "border-kiosk-red",
  amber: "border-kiosk-amber",
  neutral: "border-kiosk-border",
};

const LABEL_TEXT: Record<DetectionFrameModel["variant"], string> = {
  red: "text-kiosk-red",
  amber: "text-kiosk-amber",
  neutral: "text-white",
};

/**
 * Dashed detection frame on the stage — rendered only when the packer must
 * act. Red = wrong/extra, amber = partial multi-quantity count, neutral =
 * pending swap. The dark label pill sits centered on the frame's top stroke
 * (everything floating over the stage is dark mode).
 */
export function DetectionFrame({ model }: { model: DetectionFrameModel }) {
  const { rect } = model;
  return (
    <>
      <div
        className={cn(
          "absolute rounded-[10px] border-3 border-dashed bg-black/15",
          BORDER[model.variant],
        )}
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      />
      {model.label ? (
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full bg-black px-2 py-[2px]"
          style={{ left: rect.x + rect.w / 2, top: rect.y }}
        >
          {model.variant === "neutral" ? (
            <Repeat className="size-3 text-white" />
          ) : null}
          <p
            className={cn(
              "text-xs leading-4 font-semibold whitespace-nowrap",
              LABEL_TEXT[model.variant],
            )}
          >
            {model.label}
          </p>
        </div>
      ) : null}
    </>
  );
}
