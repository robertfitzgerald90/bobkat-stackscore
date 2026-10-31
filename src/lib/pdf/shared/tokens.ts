/**
 * StackScore PDF report design tokens — paper-safe print palette.
 * SS-REL-017-R3: purple brand accent + charcoal ink (not legacy forest green).
 * Not a port of the on-screen Obsidian/phosphor theme.
 */

/** Print-safe brand purple (aligned with `--brand-primary-fill` / AA solid). */
const BRAND_PURPLE = "#6D28D9";
const BRAND_PURPLE_SOFT = "#F3EEFF";
const BRAND_PURPLE_BORDER = "#C4B5FD";

export const REPORT_COLORS = {
  paper: "#FAFAF8",
  ink: "#1A1D22",
  inkSecondary: "#55595F",
  rule: "#D8DBDF",
  /** Brand accent (historical key name `forest` retained for import stability) */
  forest: BRAND_PURPLE,
  critical: "#9C2B2B",

  /** @deprecated Prefer `forest` / brand accent — remapped to purple */
  navy: BRAND_PURPLE,
  accent: BRAND_PURPLE,
  background: "#FAFAF8",
  sectionBackground: "#F3F3F0",
  border: "#D8DBDF",
  textPrimary: "#1A1D22",
  textSecondary: "#55595F",
  /** Positive maturity / success chrome — brand purple on paper */
  success: BRAND_PURPLE,
  /** Caution for high/attention badges only — not a second brand accent */
  warning: "#8A6A1C",
  scoreCurrent: BRAND_PURPLE,
  scoreImprovement: BRAND_PURPLE,
  scoreDecline: "#9C2B2B",
  neutral: "#55595F",
  white: "#FFFFFF",
  successBg: BRAND_PURPLE_SOFT,
  successBorder: BRAND_PURPLE_BORDER,
  warningBg: "#F5F0E8",
  warningBorder: "#D8DBDF",
  criticalBg: "#F8EDED",
  criticalBorder: "#E0B4B4",
  accentBg: BRAND_PURPLE_SOFT,
  accentBorder: BRAND_PURPLE_BORDER,
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
