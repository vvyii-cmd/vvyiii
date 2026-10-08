import Image from "next/image";
import type { OrderIngress } from "@/lib/verify/ingress";
import type { ScreenEvent, SessionState } from "@/lib/verify/types";
import { matObjects } from "@/lib/verify/selectors";
import { KioskHeader } from "./KioskHeader";
import { EmptyState } from "./EmptyState";
import { OrderPanel } from "./OrderPanel";
import { CameraStage } from "./CameraStage";
import { MatObject } from "./MatObject";

/**
 * The full kiosk screen for a verification session. Pure function of the
 * session state: it knows nothing about demo flows or the operator console.
 * Screen events (the packer's taps) go out through `dispatch`.
 */
export function VerifyScreen({
  state,
  ingress,
  dispatch,
}: {
  state: SessionState;
  ingress: OrderIngress;
  dispatch: (e: ScreenEvent) => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-start">
      {/* Kitchen backdrop, cropped exactly as the Figma hero screen crops it. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/assets/stage/kitchen-bg@2x.webp"
          alt=""
          width={1752}
          height={1112}
          priority
          className="absolute top-[-3.75%] left-[-15.7%] h-auto w-[131.4%] max-w-none"
        />
      </div>

      {/* Physical objects live on the canvas layer, under the UI chrome. */}
      <div className="pointer-events-none absolute inset-0">
        {matObjects(state).map((o) => (
          <MatObject key={o.id} object={o} />
        ))}
      </div>

      <div className="relative z-10 w-full">
        <KioskHeader />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center gap-3 px-4 pt-2 pb-4">
        {state.phase === "idle" ? (
          <EmptyState
            title={ingress.emptyState.title}
            subtitle={ingress.emptyState.subtitle}
          />
        ) : (
          <OrderPanel
            order={state.order}
            lines={state.lines}
            phase={state.phase}
            recordedAt={state.phase === "complete" ? state.recordedAt : undefined}
            dispatch={dispatch}
          />
        )}
        <CameraStage complete={state.phase === "complete"} />
      </div>
    </div>
  );
}
