"use client";

import { Button } from "@/components/ui/button";
import { FLOWS, type Flow } from "@/lib/demo/flows";

/** Top bar: one button per demo flow. Selecting a flow resets to its step 0. */
export function FlowSelector({
  activeId,
  onSelect,
}: {
  activeId: Flow["id"];
  onSelect: (flow: Flow) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {FLOWS.map((flow) => (
        <Button
          key={flow.id}
          variant={flow.id === activeId ? "default" : "outline"}
          onClick={() => onSelect(flow)}
        >
          {flow.title}
        </Button>
      ))}
    </div>
  );
}
