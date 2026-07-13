import type { Priority, Rating } from "@/generated/prisma/client";
import { REPORT_COLORS } from "@/lib/pdf/shared/tokens";

/** @deprecated Use REPORT_COLORS from tokens — kept as PDF_COLORS for existing imports. */
export const PDF_COLORS = {
  navy: REPORT_COLORS.navy,
  navyLight: REPORT_COLORS.accentBg,
  slate: REPORT_COLORS.textPrimary,
  muted: REPORT_COLORS.textSecondary,
  border: REPORT_COLORS.border,
  surface: REPORT_COLORS.sectionBackground,
  white: REPORT_COLORS.white,
  critical: REPORT_COLORS.critical,
  criticalBg: REPORT_COLORS.criticalBg,
  criticalBorder: REPORT_COLORS.criticalBorder,
  high: "#9A3412",
  highBg: REPORT_COLORS.warningBg,
  highBorder: REPORT_COLORS.warningBorder,
  medium: REPORT_COLORS.textSecondary,
  mediumBg: REPORT_COLORS.sectionBackground,
  low: REPORT_COLORS.textSecondary,
  success: REPORT_COLORS.success,
  successBg: REPORT_COLORS.successBg,
  warning: REPORT_COLORS.warning,
  warningBg: REPORT_COLORS.warningBg,
  target: REPORT_COLORS.navy,
  accent: REPORT_COLORS.accent,
  accentBorder: REPORT_COLORS.accentBorder,
  scoreCurrent: REPORT_COLORS.scoreCurrent,
  scoreImprovement: REPORT_COLORS.scoreImprovement,
  scoreDecline: REPORT_COLORS.scoreDecline,
  neutral: REPORT_COLORS.neutral,
} as const;

export const COLORS = PDF_COLORS;

/** Maturity/risk bar colors — current scores should use scoreCurrent, not critical red. */
export const PDF_RATING_BAR: Record<Rating, string> = {
  critical: REPORT_COLORS.critical,
  at_risk: REPORT_COLORS.warning,
  stable: REPORT_COLORS.scoreCurrent,
  strong: REPORT_COLORS.scoreImprovement,
  exceptional: REPORT_COLORS.navy,
};

export const PDF_SCORE_BAR = {
  current: REPORT_COLORS.scoreCurrent,
  improvement: REPORT_COLORS.scoreImprovement,
  decline: REPORT_COLORS.scoreDecline,
  neutral: REPORT_COLORS.neutral,
} as const;

export const PDF_PRIORITY_BADGE: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  critical: {
    label: "CRITICAL",
    bg: REPORT_COLORS.criticalBg,
    text: REPORT_COLORS.critical,
    border: REPORT_COLORS.criticalBorder,
  },
  high: {
    label: "HIGH",
    bg: REPORT_COLORS.warningBg,
    text: REPORT_COLORS.warning,
    border: REPORT_COLORS.warningBorder,
  },
  medium: {
    label: "MEDIUM",
    bg: REPORT_COLORS.sectionBackground,
    text: REPORT_COLORS.textSecondary,
    border: REPORT_COLORS.border,
  },
  low: {
    label: "LOW",
    bg: REPORT_COLORS.white,
    text: REPORT_COLORS.textSecondary,
    border: REPORT_COLORS.border,
  },
};
