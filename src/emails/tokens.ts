/**
 * Paper-safe email design tokens.
 * Email clients need inline hex colors — not CSS variables or dark/obsidian themes.
 * Aligned with the print/PDF paper palette (not the screen Instrument theme).
 */
export const emailTokens = {
  paper: "#FAFAF8",
  ink: "#1A1D22",
  inkSecondary: "#55595F",
  rule: "#D8DBDF",
  forest: "#0B5A46",
  critical: "#9C2B2B",

  /** @deprecated Prefer `forest` — kept as alias for existing component usage */
  primary: "#0B5A46",
  primaryHover: "#094A39",
  /** @deprecated Prefer `inkSecondary` */
  secondary: "#55595F",
  background: "#FAFAF8",
  surface: "#FAFAF8",
  surfaceMuted: "#F3F3F0",
  border: "#D8DBDF",
  text: "#1A1D22",
  textMuted: "#55595F",
  textInverse: "#FFFFFF",
  warningBackground: "#F5F0E8",
  warningBorder: "#D8DBDF",
  warningText: "#1A1D22",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyHeading:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  /** 4px is the Outlook-safe sharp range; avoid 0px */
  radius: "4px",
  shadow: "none",
  maxWidth: "600px",
} as const;
