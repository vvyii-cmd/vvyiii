import Image from "next/image";
import type { MatObject as MatObjectModel } from "@/lib/verify/types";

/**
 * A physical object on the mat, positioned on the 800×480 canvas at the slot
 * the camera (demo script) reported.
 */
export function MatObject({ object }: { object: MatObjectModel }) {
  const { slot } = object;
  return (
    <div
      className="absolute"
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
