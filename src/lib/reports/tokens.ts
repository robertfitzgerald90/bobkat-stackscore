import { BRAND } from "@/lib/branding";
import { REPORT_PRINT_ROOT_CLASS } from "@/lib/reports/types";

export { REPORT_PRINT_ROOT_CLASS };

export const REPORT_TOKENS = {
  primary: BRAND.primaryColor,
  secondary: BRAND.secondaryColor,
  lightBackground: BRAND.lightBackground,
  coverPadding: "2.5rem",
  sectionGap: "2rem",
  logoPath: "/branding/bobkat-it-logo-navy.png",
} as const;

export const REPORT_PRIORITY_BADGE_CLASS = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  medium: "bg-slate-50 text-slate-700 border-slate-200",
  low: "bg-white text-slate-500 border-slate-200",
} as const;
