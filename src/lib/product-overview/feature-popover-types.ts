import type { DemoDetailPanel } from "@/lib/product-overview/types";

export type FeaturePopoverPlacement = "right" | "bottom" | "left" | "top";

export type FeaturePopoverRelatedAction = {
  label: string;
  panel: NonNullable<DemoDetailPanel>;
  featureKey?: string;
};

export type FeaturePopoverMetric = {
  label: string;
  value: string;
};

export type FeaturePopoverModel = {
  title: string;
  badge?: string;
  subtitle?: string;
  description: string;
  whyItMatters?: string;
  businessValue?: string;
  relatedFeatures?: string[];
  relatedActions?: FeaturePopoverRelatedAction[];
  highlights?: string[];
  metrics?: FeaturePopoverMetric[];
};

export type FeaturePopoverTourControls = {
  stepLabel: string;
  progressPercent: number;
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onRestart: () => void;
};

export const FEATURE_POPOVER_ANCHOR_ATTR = "data-feature-popover-anchor";
export const DEMO_FEATURE_ATTR = "data-demo-feature";

export function demoFeatureKey(
  kind: string,
  id?: string,
): string {
  return id ? `${kind}:${id}` : kind;
}

export function findDemoFeatureElement(featureKey: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[${DEMO_FEATURE_ATTR}="${featureKey}"]`);
}

export function resolveAnchorElement(
  anchor?: HTMLElement | EventTarget | null,
): HTMLElement | null {
  if (!anchor) return null;
  if (anchor instanceof HTMLElement) return anchor;
  return null;
}
