"use client";

import { cn } from "@/lib/utils";
import { useInstrumentCountUp } from "./use-instrument-count-up";

type InstrumentScoreReadoutProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

/**
 * The one motion exception for StackScore: a brief phosphor count-up when a
 * score reveals, reinforcing "this was just measured for you." Reserved for
 * primary readings only — not applied to every number on a panel.
 */
export function InstrumentScoreReadout({ value, durationMs, className }: InstrumentScoreReadoutProps) {
  const animated = useInstrumentCountUp(value, durationMs);
  return <span className={cn("instrument-mono", className)}>{animated}</span>;
}
