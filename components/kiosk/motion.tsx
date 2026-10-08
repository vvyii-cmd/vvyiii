"use client";

import * as React from "react";
import { cn } from "cn";

/**
 * Kiosk motion system. One easing, two speeds: entrances glide in and settle
 * (~350–550ms, ease-out), exits get out of the way (~280–320ms, ease-in).
 * The keyframes and .kiosk-* utility classes live in globals.css.
 */
export const ENTER_MS = 400;
export const EXIT_MS = 280;

/**
 * Keep rendering a value briefly after it goes away so it can animate out.
 * Returns the value to render (current, or the previous one while exiting).
 */
export function usePresence<T>(value: T | undefined, exitMs: number = EXIT_MS) {
  const [stored, setStored] = React.useState<T | undefined>(value);
  // Derived state during render (the documented React pattern).
  if (value !== undefined && value !== stored) setStored(value);
  const exiting = value === undefined && stored !== undefined;

  React.useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => setStored(undefined), exitMs);
    return () => clearTimeout(t);
  }, [exiting, exitMs]);

  return { item: value !== undefined ? value : stored, exiting };
}

export type PresentEntry<T> = { key: string; item: T; exiting: boolean };

/**
 * List version of usePresence: removed entries stay (marked exiting) for
 * exitMs so they can animate out. Entries keep insertion order.
 */
export function useListPresence<T>(
  items: T[],
  getKey: (item: T) => string,
  exitMs: number = EXIT_MS,
): PresentEntry<T>[] {
  const [entries, setEntries] = React.useState<PresentEntry<T>[]>(() =>
    items.map((item) => ({ key: getKey(item), item, exiting: false })),
  );

  // Reconcile during render: keep live entries (reusing unchanged objects so
  // this converges), mark missing ones exiting.
  const liveKeys = new Set(items.map(getKey));
  const byKey = new Map(entries.map((e) => [e.key, e]));
  const rebuilt: PresentEntry<T>[] = [];
  for (const e of entries) {
    if (liveKeys.has(e.key)) continue;
    rebuilt.push(e.exiting ? e : { ...e, exiting: true });
  }
  for (const item of items) {
    const key = getKey(item);
    const existing = byKey.get(key);
    rebuilt.push(
      existing && !existing.exiting && existing.item === item
        ? existing
        : { key, item, exiting: false },
    );
  }
  const changed =
    rebuilt.length !== entries.length ||
    rebuilt.some((e, i) => e !== entries[i]);
  if (changed) setEntries(rebuilt);

  const hasExiting = entries.some((e) => e.exiting);
  React.useEffect(() => {
    if (!hasExiting) return;
    const t = setTimeout(
      () => setEntries((prev) => prev.filter((e) => !e.exiting)),
      exitMs,
    );
    return () => clearTimeout(t);
  }, [hasExiting, exitMs]);

  return entries;
}

/**
 * Crossfade between contents when `id` changes: the old content fades out in
 * place (absolute overlay) while the new one fades in.
 */
export function Crossfade({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const lastRef = React.useRef<{ id: string; node: React.ReactNode }>({
    id,
    node: children,
  });
  const [prev, setPrev] = React.useState<{ id: string; node: React.ReactNode }>();

  // A crossfade needs a snapshot of the previous render's content at the
  // moment `id` flips — that is inherently a render-time ref read/write
  // (same pattern as React's own "previous render" examples), so the blanket
  // refs-in-render rule is relaxed here deliberately.
  /* eslint-disable react-hooks/refs */
  if (id !== lastRef.current.id) {
    setPrev(lastRef.current);
    lastRef.current = { id, node: children };
  } else {
    lastRef.current = { id, node: children };
  }
  /* eslint-enable react-hooks/refs */

  React.useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setPrev(undefined), EXIT_MS);
    return () => clearTimeout(t);
  }, [prev]);

  return (
    <div className={cn("relative", className)}>
      {prev ? (
        <div className="kiosk-exit-fade pointer-events-none absolute inset-0">
          {prev.node}
        </div>
      ) : null}
      <div key={id} className="kiosk-enter-fade h-full w-full">
        {children}
      </div>
    </div>
  );
}

/** A number (or short text) that ticks in with a tiny rise when it changes. */
export function Tick({
  value,
  className,
}: {
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <span key={String(value)} className={cn("kiosk-enter-tick inline-block", className)}>
      {value}
    </span>
  );
}
