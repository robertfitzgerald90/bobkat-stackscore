/**
 * SS-UX-003 — Customer portal visual foundation helpers.
 * Presentation-only; no data or entitlement logic.
 */

/** Root class applied to the authenticated customer dashboard shell. */
export const CUSTOMER_PORTAL_THEME_CLASS = "customer-portal";

/** Main content region — texture + watermark host. */
export const CUSTOMER_PORTAL_MAIN_CLASS = "customer-portal-main";

/** Opt-in industrial corner treatment for major panels only. */
export const CUSTOMER_INDUSTRIAL_PANEL_CLASS = "customer-industrial-panel";

export function isCustomerPortalThemeEnabled(role: string | null | undefined): boolean {
  return role === "client";
}
