import Image from "next/image";
import { cn } from "cn";
import type { MatObject as MatObjectModel } from "@/lib/verify/types";

/**
 * A physical object on the mat, positioned on the 800×480 canvas at the slot
 * the camera (demo script) reported. Lands with a small settle, fades away
 * when taken off the mat.
 */
export function MatObject({
  object,
  exiting,
}: {
  object: MatObjectModel;
  exiting?: boolean;
}) {
  const { slot } = object;
  return (
    <div
      className={cn("absolute", exiting ? "kiosk-exit-fade" : "kiosk-enter-land")}
      style={{
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
      }}
      data-item={object.itemName}
    >
      <Image
        src={object.image}
        alt=""
        width={slot.w}
        height={slot.h}
        className={
          object.shadow
            ? "h-full w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
            : "h-full w-full object-contain"
        }
      />
    </div>
  );
}
