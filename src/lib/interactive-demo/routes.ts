/**
 * Canonical Interactive Demo routes and deep-link section mapping.
 * SS-WEB-003: deep links resolve to customer-parity public demo destinations.
 */

import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  PUBLIC_DEMO_EXPLORE_PATH,
  PUBLIC_DEMO_OPPORTUNITIES_PATH,
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_REPORTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
} from "@/lib/public-demo/routes";

export const INTERACTIVE_DEMO_PATH = "/demo";
export const ASSESSMENT_OFFER_PATH = "/assessment-offer";
/** Demo exit links back to Bobkat IT solutions marketing (StackScore no longer hosts /solutions). */
export const SOLUTIONS_HOME_PATH = BOBKAT_IT_URLS.solutions;

/** Short path segments → customer-parity demo destinations (SS-WEB-003). */
export const DEMO_DEEP_LINK_SECTIONS = {
  dashboard: {
    sectionId: "demo-overview",
    label: "Overview",
    href: PUBLIC_DEMO_OVERVIEW_PATH,
  },
  scores: {
    sectionId: "demo-overview",
    label: "Technology Scores",
    href: PUBLIC_DEMO_OVERVIEW_PATH,
  },
  overview: {
    sectionId: "demo-overview",
    label: "Overview",
    href: PUBLIC_DEMO_OVERVIEW_PATH,
  },
  explore: {
    sectionId: "demo-explore",
    label: "Explore",
    href: PUBLIC_DEMO_EXPLORE_PATH,
  },
  recommendations: {
    sectionId: "demo-opportunities",
    label: "Recommendations",
    href: PUBLIC_DEMO_OPPORTUNITIES_PATH,
  },
  roadmap: {
    sectionId: "demo-roadmap",
    label: "Roadmap",
    href: PUBLIC_DEMO_ROADMAP_PATH,
  },
  "improvement-plan": {
    sectionId: "demo-roadmap",
    label: "Improvement Plan",
    href: PUBLIC_DEMO_ROADMAP_PATH,
  },
  projects: {
    sectionId: "demo-projects",
    label: "Projects",
    href: PUBLIC_DEMO_PROJECTS_PATH,
  },
  investment: {
    sectionId: "demo-reports",
    label: "Investment Planning",
    href: PUBLIC_DEMO_REPORTS_PATH,
  },
  "quarterly-review": {
    sectionId: "demo-reports",
    label: "Business Review",
    href: PUBLIC_DEMO_REPORTS_PATH,
  },
  reports: {
    sectionId: "demo-reports",
    label: "Reports",
    href: PUBLIC_DEMO_REPORTS_PATH,
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
  const base = section
    ? DEMO_DEEP_LINK_SECTIONS[section].href
    : INTERACTIVE_DEMO_PATH;
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
