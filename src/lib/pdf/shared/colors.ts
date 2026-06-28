import { BRAND } from "@/lib/branding";
import type { Priority, Rating } from "@/generated/prisma/client";

export const PDF_COLORS = {
  navy: BRAND.primaryColor,
  navyLight: "#EEF4F8",
  slate: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: BRAND.lightBackground,
  white: "#FFFFFF",
  critical: "#DC2626",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  high: "#9A3412",
  highBg: "#FFF7ED",
  highBorder: "#FED7AA",
  medium: "#475569",
  mediumBg: "#F8FAFC",
  low: "#64748B",
  success: "#15803D",
  successBg: "#F0FDF4",
  warning: "#B45309",
  warningBg: "#FFFBEB",
  target: "#082F5B",
  accent: "#7D97AC",
} as const;

/** @deprecated Use PDF_COLORS — kept for incremental migration in report documents. */
export const COLORS = PDF_COLORS;

export const PDF_RATING_BAR: Record<Rating, string> = {
  critical: "#DC2626",
  at_risk: "#D97706",
  stable: "#7D97AC",
  strong: "#16A34A",
  exceptional: "#082F5B",
};

export const PDF_PRIORITY_BADGE: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  critical: {
    label: "CRITICAL",
    bg: PDF_COLORS.criticalBg,
    text: PDF_COLORS.critical,
    border: PDF_COLORS.criticalBorder,
  },
  high: {
    label: "HIGH",
    bg: PDF_COLORS.highBg,
    text: PDF_COLORS.high,
    border: PDF_COLORS.highBorder,
  },
  medium: {
    label: "MEDIUM",
    bg: PDF_COLORS.mediumBg,
    text: PDF_COLORS.medium,
    border: PDF_COLORS.border,
  },
  low: {
    label: "LOW",
    bg: PDF_COLORS.white,
    text: PDF_COLORS.low,
    border: PDF_COLORS.border,
  },
};
