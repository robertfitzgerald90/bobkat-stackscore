"use client";

import { useEffect, useState } from "react";

/**
 * Restrained count-up for score reveals — ease-out, no bounce/spring, plays
 * on mount, and snaps straight to the final value under
 * prefers-reduced-motion instead of animating.
 *
 * The effect is intentionally idempotent (no "already animated" guard):
 * each invocation resets to 0 and runs its own rAF loop, and cleanup
 * cancels that loop. This matters because React's dev-only Strict Mode
 * double-invokes effects on mount (setup -> cleanup -> setup again) for
 * any client-side (re)mount — a stateful "only once" guard would cancel
 * the first run and then refuse to start the second, leaving the value
 * stuck at 0 in development. A "replay" affordance that remounts this
 * component via a changing `key` relies on this being safe to re-run.
 */
export function useInstrumentCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    setValue(0);
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
