/**
 * Bobkat IT marketing website URLs.
 *
 * Platform boundary:
 * - Bobkat IT (bobkatit.com): marketing, services, solutions, pricing, SEO, lead gen
 * - StackScore (stackscore.tech): checkout, Stripe, webhooks, provisioning, portal
 */
export const BOBKAT_IT_WEBSITE_ORIGIN = "https://bobkatit.com";

export const BOBKAT_IT_URLS = {
  home: BOBKAT_IT_WEBSITE_ORIGIN,
  services: `${BOBKAT_IT_WEBSITE_ORIGIN}/services`,
  solutions: `${BOBKAT_IT_WEBSITE_ORIGIN}/solutions`,
  strategicItConsulting: `${BOBKAT_IT_WEBSITE_ORIGIN}/strategic-it-consulting`,
  technologyMaturityAssessment: `${BOBKAT_IT_WEBSITE_ORIGIN}/services#technology-maturity-assessment`,
  solutionsEssentials: `${BOBKAT_IT_WEBSITE_ORIGIN}/solutions/essentials`,
  solutionsProfessional: `${BOBKAT_IT_WEBSITE_ORIGIN}/solutions/professional`,
  solutionsManufacturing: `${BOBKAT_IT_WEBSITE_ORIGIN}/solutions/manufacturing`,
} as const;

export function resolveBobkatWebsiteOrigin(): string {
  const configured = process.env.BOBKAT_IT_WEBSITE?.trim();
  if (!configured) return BOBKAT_IT_WEBSITE_ORIGIN;
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured.replace(/\/$/, "");
  }
  return `https://${configured.replace(/\/$/, "")}`;
}

export function bobkatUrl(path: string): string {
  const origin = resolveBobkatWebsiteOrigin();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
