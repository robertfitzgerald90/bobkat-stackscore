import { BRAND } from "@/lib/branding";

export const PDF_COLORS = {
  primary: BRAND.primaryColor,
  secondary: BRAND.secondaryColor,
  lightBackground: BRAND.lightBackground,
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  success: "#059669",
  danger: "#DC2626",
  warning: "#D97706",
} as const;

export const PDF_LOGO_PATH = "public/branding/bobkat-it-logo-navy.png";
