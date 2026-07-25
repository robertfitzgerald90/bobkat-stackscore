"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { isGa4Enabled } from "@/lib/analytics/ga4-config";

export { getGaMeasurementId, isGa4Enabled } from "@/lib/analytics/ga4-config";

/** Canonical pathname without query strings (never send private URL params to GA). */
export function getCanonicalPagePath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  return window.location.pathname || fallback;
}

type Ga4ParamValue = string | number | boolean;

/** Allowlisted, privacy-safe GA4 parameter bags only. */
export type Ga4EventParams = Record<string, Ga4ParamValue | Array<Record<string, Ga4ParamValue>> | undefined>;

const memoryOnceKeys = new Set<string>();

function onceStorageKey(key: string) {
  return `stackscore:ga4:once:${key}`;
}

/** Fire at most once per browser session for the given key. SSR-safe. */
export function trackGa4Once(key: string, track: () => void): void {
  if (typeof window === "undefined") return;
  if (memoryOnceKeys.has(key)) return;

  try {
    if (window.sessionStorage.getItem(onceStorageKey(key)) === "1") {
      memoryOnceKeys.add(key);
      return;
    }
  } catch {
    // sessionStorage may be unavailable; fall through to in-memory dedupe only
  }

  memoryOnceKeys.add(key);
  try {
    window.sessionStorage.setItem(onceStorageKey(key), "1");
  } catch {
    // ignore quota / private mode
  }

  track();
}

/**
 * SSR-safe GA4 event sender. Silently no-ops when Analytics is disabled,
 * unavailable, or blocked. Never throws into product UI.
 */
export function sendGa4Event(eventName: string, params?: Ga4EventParams): void {
  if (typeof window === "undefined") return;
  if (!isGa4Enabled()) return;

  try {
    if (params) {
      sendGAEvent("event", eventName, params);
    } else {
      sendGAEvent("event", eventName);
    }
  } catch {
    // Ad blockers / missing dataLayer must not break the app
  }
}
