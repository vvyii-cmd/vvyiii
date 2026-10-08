import { Flag, Focus, Settings } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

/**
 * The camera view area to the right of the order panel. Mat objects render on
 * the screen-level layer underneath (their Figma coordinates are absolute on
 * the 800×480 canvas); this cell carries the completion outline, the CTA
 * cluster and, later, detection frames and toasts.
 */
export function CameraStage({
  complete,
  children,
}: {
  complete?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative h-full min-w-0 flex-1",
        complete &&
          "rounded-[8px] border-2 border-kiosk-green-outline bg-[rgba(134,239,172,0.1)]",
      )}
    >
      <div className="absolute top-0 right-0 flex items-center gap-3 rounded-[10px] bg-black/40 shadow-2xl">
        <Button
          variant="ghost"
          size="icon-xl"
          aria-label="Camera"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Focus />
        </Button>
        <Button
          variant="ghost"
          size="icon-xl"
          aria-label="Report"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Flag />
        </Button>
        <Button
          variant="ghost"
          size="icon-xl"
          aria-label="Settings"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Settings />
        </Button>
      </div>
      {children}
    </div>
  );
}
