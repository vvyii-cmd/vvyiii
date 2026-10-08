import { Pointer } from "lucide-react";
import type { CopyRun } from "@/lib/verify/ingress";

/**
 * Left-panel empty state ("Pick an order on the KDS" and friends).
 * Copy comes verbatim from the active ingress.
 */
export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: CopyRun[];
}) {
  return (
    <div className="flex h-full w-[281px] shrink-0 flex-col items-start justify-center rounded-[10px] border border-border bg-white/90 p-3 shadow-xl">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5 px-5 pb-10">
        <div className="flex items-center justify-center rounded-[10px] bg-muted p-4">
          <Pointer className="size-6 text-foreground" />
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-[22px] leading-[26.4px] font-medium tracking-[-0.5px] whitespace-nowrap text-foreground">
            {title}
          </p>
          <p className="w-full text-center text-sm leading-5 font-normal text-muted-foreground">
            {subtitle.map((run, i) =>
              run.bold ? (
                <strong
                  key={i}
                  className="text-[16px] leading-6 font-bold text-muted-foreground"
                >
                  {run.text}
                </strong>
              ) : (
                <span key={i}>{run.text}</span>
              ),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
