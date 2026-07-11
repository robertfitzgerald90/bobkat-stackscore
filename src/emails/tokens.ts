import { BRAND } from "@/lib/branding";

/** Email design tokens aligned with StackScore app branding (globals.css / BRAND). */
export const emailTokens = {
  primary: BRAND.primaryColor,
  primaryHover: "#0a3d75",
  secondary: BRAND.secondaryColor,
  background: BRAND.lightBackground,
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  textInverse: "#ffffff",
  warningBackground: "#fffbeb",
  warningBorder: "#fcd34d",
  warningText: "#92400e",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyHeading:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  radius: "12px",
  shadow: "0 4px 24px rgba(8, 47, 91, 0.08)",
  maxWidth: "600px",
} as const;
