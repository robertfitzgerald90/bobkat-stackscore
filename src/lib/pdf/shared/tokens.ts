/**
 * StackScore PDF report design tokens — single source of truth for all report PDFs.
 */

export const REPORT_COLORS = {
  navy: "#082F5B",
  accent: "#082F5B",
  background: "#FFFFFF",
  sectionBackground: "#F8FAFC",
  border: "#E2E8F0",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  success: "#059669",
  warning: "#D97706",
  critical: "#DC2626",
  /** Current / baseline score values */
  scoreCurrent: "#082F5B",
  /** Positive movement / projected improvement */
  scoreImprovement: "#059669",
  /** Negative movement only */
  scoreDecline: "#DC2626",
  /** Neutral / inactive timeline elements */
  neutral: "#94A3B8",
  white: "#FFFFFF",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  accentBg: "#F1F5F9",
  accentBorder: "#CBD5E1",
} as const;

export const REPORT_SPACING = {
  pagePaddingX: 48,
  pagePaddingTop: 56,
  pagePaddingBottom: 92,
  headerReserve: 68,
  section: 28,
  block: 16,
  element: 10,
  cardPadding: 16,
  cardPaddingCompact: 12,
} as const;

export const REPORT_RADIUS = {
  sm: 6,
  md: 10,
  lg: 12,
} as const;

export const REPORT_TYPOGRAPHY = {
  coverTitle: 32,
  coverClient: 24,
  sectionTitle: 16,
  sectionSubtitle: 10,
  body: 11,
  bodySmall: 10,
  kpiValue: 22,
  kpiLabel: 9,
  tableHeader: 9,
  footer: 8,
} as const;
