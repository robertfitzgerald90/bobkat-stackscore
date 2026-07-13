/**
 * StackScore PDF report design tokens — single source of truth for all report PDFs.
 */

export const REPORT_COLORS = {
  navy: "#0F2744",
  accent: "#2F80ED",
  background: "#FFFFFF",
  sectionBackground: "#F8FAFC",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  success: "#16A34A",
  warning: "#D97706",
  critical: "#DC2626",
  /** Current / baseline score values */
  scoreCurrent: "#2F80ED",
  /** Positive movement / projected improvement */
  scoreImprovement: "#16A34A",
  /** Negative movement only */
  scoreDecline: "#DC2626",
  /** Neutral / inactive timeline elements */
  neutral: "#9CA3AF",
  white: "#FFFFFF",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  accentBg: "#EFF6FF",
  accentBorder: "#BFDBFE",
} as const;

export const REPORT_SPACING = {
  pagePaddingX: 54,
  pagePaddingTop: 52,
  pagePaddingBottom: 88,
  headerReserve: 88,
  section: 24,
  block: 14,
  element: 8,
  cardPadding: 14,
  cardPaddingCompact: 12,
} as const;

export const REPORT_RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export const REPORT_TYPOGRAPHY = {
  coverTitle: 28,
  coverClient: 22,
  sectionTitle: 13,
  sectionSubtitle: 9,
  body: 10,
  bodySmall: 9,
  kpiValue: 26,
  kpiLabel: 8,
  tableHeader: 8,
  footer: 7,
} as const;
