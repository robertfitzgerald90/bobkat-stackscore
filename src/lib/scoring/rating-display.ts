import type { Rating } from "@/generated/prisma/client";

/** Display-only rating labels for UI surfaces. */
export const RATING_DISPLAY_LABELS: Record<Rating, string> = {
  critical: "Critical Risk",
  at_risk: "At Risk",
  stable: "Stable",
  strong: "Strong",
  exceptional: "Exceptional",
};

export const RATING_BADGE_VARIANT: Record<
  Rating,
  "success" | "default" | "secondary" | "warning" | "destructive"
> = {
  exceptional: "success",
  strong: "success",
  stable: "secondary",
  at_risk: "warning",
  critical: "destructive",
};

export const MATURITY_CATEGORY_ORDER: Rating[] = [
  "critical",
  "at_risk",
  "stable",
  "strong",
  "exceptional",
];
