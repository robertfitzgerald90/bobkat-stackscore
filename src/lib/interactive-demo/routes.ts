/**
 * Canonical Interactive Demo routes and deep-link section mapping.
 */

export const INTERACTIVE_DEMO_PATH = "/demo";
export const ASSESSMENT_OFFER_PATH = "/assessment-offer";
export const SOLUTIONS_HOME_PATH = "/solutions";

/** Short path segments → in-page section IDs */
export const DEMO_DEEP_LINK_SECTIONS = {
  dashboard: {
    sectionId: "product-overview-dashboard",
    label: "Executive Dashboard",
  },
  scores: {
    sectionId: "product-overview-assessment",
    label: "Technology Scores",
  },
  recommendations: {
    sectionId: "product-overview-recommendations",
    label: "Recommendations",
  },
  roadmap: {
    sectionId: "product-overview-roadmap",
    label: "Technology Roadmap",
  },
  "improvement-plan": {
    sectionId: "product-overview-phase-proposal",
    label: "Improvement Plan",
  },
  projects: {
    sectionId: "product-overview-projects",
    label: "Projects",
  },
  investment: {
    sectionId: "product-overview-budget",
    label: "Investment Planning",
  },
  "quarterly-review": {
    sectionId: "product-overview-quarterly-review",
    label: "Quarterly Review",
  },
} as const;

export type DemoDeepLinkSection = keyof typeof DEMO_DEEP_LINK_SECTIONS;

export function isDemoDeepLinkSection(value: string): value is DemoDeepLinkSection {
  return Object.prototype.hasOwnProperty.call(DEMO_DEEP_LINK_SECTIONS, value);
}

export type DemoHrefOptions = {
  section?: DemoDeepLinkSection;
  /** Absolute path to return to after exiting the demo */
  returnTo?: string;
  /** Analytics / CTA placement label preserved through entry */
  source?: string;
};

/**
 * Build a demo URL. Prefers pretty deep links (`/demo/roadmap`) when a section
 * is provided; otherwise `/demo` with optional query params.
 */
export function buildDemoHref(options: DemoHrefOptions = {}): string {
  const { section, returnTo, source } = options;
  const params = new URLSearchParams();
  if (returnTo) params.set("returnTo", returnTo);
  if (source) params.set("source", source);

  const query = params.toString();
  const base = section ? `${INTERACTIVE_DEMO_PATH}/${section}` : INTERACTIVE_DEMO_PATH;
  return query ? `${base}?${query}` : base;
}

export function resolveDemoSectionId(section: string | undefined): string | null {
  if (!section || !isDemoDeepLinkSection(section)) return null;
  return DEMO_DEEP_LINK_SECTIONS[section].sectionId;
}

export function getDemoSectionLabel(sectionId: string | null | undefined): string | null {
  if (!sectionId) return null;
  for (const entry of Object.values(DEMO_DEEP_LINK_SECTIONS)) {
    if (entry.sectionId === sectionId) return entry.label;
  }
  return null;
}
