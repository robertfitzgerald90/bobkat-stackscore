import type { Priority, Rating } from "@/generated/prisma/client";
import { REPORT_COLORS } from "@/lib/pdf/shared/tokens";

/** @deprecated Prefer REPORT_COLORS — kept as PDF_COLORS for existing imports. */
export const PDF_COLORS = {
  navy: REPORT_COLORS.forest,
  navyLight: REPORT_COLORS.accentBg,
  slate: REPORT_COLORS.ink,
  muted: REPORT_COLORS.inkSecondary,
  border: REPORT_COLORS.rule,
  surface: REPORT_COLORS.sectionBackground,
  white: REPORT_COLORS.white,
  paper: REPORT_COLORS.paper,
  forest: REPORT_COLORS.forest,
  ink: REPORT_COLORS.ink,
  inkSecondary: REPORT_COLORS.inkSecondary,
  rule: REPORT_COLORS.rule,
  critical: REPORT_COLORS.critical,
  criticalBg: REPORT_COLORS.criticalBg,
  criticalBorder: REPORT_COLORS.criticalBorder,
  high: REPORT_COLORS.warning,
  highBg: REPORT_COLORS.warningBg,
  highBorder: REPORT_COLORS.warningBorder,
  medium: REPORT_COLORS.inkSecondary,
  mediumBg: REPORT_COLORS.sectionBackground,
  low: REPORT_COLORS.inkSecondary,
  success: REPORT_COLORS.forest,
  successBg: REPORT_COLORS.successBg,
  warning: REPORT_COLORS.warning,
  warningBg: REPORT_COLORS.warningBg,
  target: REPORT_COLORS.forest,
  accent: REPORT_COLORS.forest,
  accentBorder: REPORT_COLORS.accentBorder,
  scoreCurrent: REPORT_COLORS.scoreCurrent,
  scoreImprovement: REPORT_COLORS.scoreImprovement,
  scoreDecline: REPORT_COLORS.scoreDecline,
  neutral: REPORT_COLORS.neutral,
} as const;

export const COLORS = PDF_COLORS;

/** Maturity/risk bar colors — current scores use forest; critical stays critical. */
export const PDF_RATING_BAR: Record<Rating, string> = {
  critical: REPORT_COLORS.critical,
  at_risk: REPORT_COLORS.warning,
  stable: REPORT_COLORS.scoreCurrent,
  strong: REPORT_COLORS.scoreImprovement,
  exceptional: REPORT_COLORS.forest,
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
    text: REPORT_COLORS.inkSecondary,
    border: REPORT_COLORS.rule,
  },
  low: {
    label: "LOW",
    bg: REPORT_COLORS.paper,
    text: REPORT_COLORS.inkSecondary,
    border: REPORT_COLORS.rule,
  },
};
