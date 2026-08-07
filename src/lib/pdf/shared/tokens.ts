/**
 * StackScore PDF report design tokens — paper-safe print palette.
 * Not a port of the on-screen Obsidian/phosphor theme.
 */

export const REPORT_COLORS = {
  paper: "#FAFAF8",
  ink: "#1A1D22",
  inkSecondary: "#55595F",
  rule: "#D8DBDF",
  forest: "#0B5A46",
  critical: "#9C2B2B",

  /** @deprecated Prefer `forest` — kept so existing COLORS.navy imports remapped */
  navy: "#0B5A46",
  accent: "#0B5A46",
  background: "#FAFAF8",
  sectionBackground: "#F3F3F0",
  border: "#D8DBDF",
  textPrimary: "#1A1D22",
  textSecondary: "#55595F",
  /** Consolidated into forest — no separate success green */
  success: "#0B5A46",
  /** Caution for high/attention badges only — not a second brand accent */
  warning: "#8A6A1C",
  scoreCurrent: "#0B5A46",
  scoreImprovement: "#0B5A46",
  scoreDecline: "#9C2B2B",
  neutral: "#55595F",
  white: "#FFFFFF",
  successBg: "#E8F2EE",
  successBorder: "#B7D4C8",
  warningBg: "#F5F0E8",
  warningBorder: "#D8DBDF",
  criticalBg: "#F8EDED",
  criticalBorder: "#E0B4B4",
  accentBg: "#E8F2EE",
  accentBorder: "#B7D4C8",
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

/** Sharp print corners — 0–2px */
export const REPORT_RADIUS = {
  sm: 0,
  md: 1,
  lg: 2,
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

/** Registered family names — see `fonts.ts` */
export const REPORT_FONTS = {
  display: "SpaceGrotesk",
  displayBold: "SpaceGrotesk-Bold",
  body: "SourceSans3",
  bodyBold: "SourceSans3-Bold",
  mono: "JetBrainsMono",
  monoBold: "JetBrainsMono-Bold",
} as const;
