"use client";

import * as React from "react";
import Image from "next/image";
import { formatKioskTime } from "@/lib/verify/format";

/**
 * Status bar: logo, product name, language and a real-time clock.
 * Language and settings affordances are rendered but non-functional.
 */
export function KioskHeader() {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const tick = () => setTime(formatKioskTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex w-full items-center justify-between px-4 py-2">
      {/* Subtle perspective gradient straight from the Figma status bar. */}
      <Image
        src="/assets/stage/status-bar-bg.png"
        alt=""
        fill
        priority
        sizes="800px"
        className="pointer-events-none object-cover"
      />
      <div className="relative flex items-center gap-2">
        <Image
          src="/assets/icons/otter-verify-logo.svg"
          alt=""
          width={12}
          height={12}
        />
        <p className="text-xs leading-4 font-semibold text-[#f5f5f5]">
          Otter Verify
        </p>
      </div>
      <div className="relative flex items-center gap-4 text-xs leading-4 font-medium text-[#f5f5f5]">
        <p>EN</p>
        <p className="min-w-[42px] text-right" suppressHydrationWarning>
          {time ?? ""}
        </p>
      </div>
    </div>
  );
}
