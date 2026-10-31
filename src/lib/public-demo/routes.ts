/**
 * SS-WEB-003 — Public demo navigation paths (customer IA parity).
 */

import {
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Map,
  type LucideIcon,
} from "lucide-react";

export const PUBLIC_DEMO_ROOT = "/demo";
export const PUBLIC_DEMO_OVERVIEW_PATH = "/demo/overview";
export const PUBLIC_DEMO_EXPLORE_PATH = "/demo/explore";
export const PUBLIC_DEMO_ROADMAP_PATH = "/demo/roadmap";
export const PUBLIC_DEMO_PROJECTS_PATH = "/demo/projects";
export const PUBLIC_DEMO_REPORTS_PATH = "/demo/reports";
export const PUBLIC_DEMO_OPPORTUNITIES_PATH = "/demo/opportunities";
export const PUBLIC_DEMO_SAMPLE_REPORT_PATH = "/demo/reports/sample";

export type PublicDemoSection =
  | "overview"
  | "explore"
  | "roadmap"
  | "projects"
  | "reports"
  | "opportunities";

export type PublicDemoNavItem = {
  id: PublicDemoSection;
  href: string;
  label: string;
  icon: LucideIcon;
  activePathPrefixes: string[];
};

export const PUBLIC_DEMO_PRIMARY_NAV: PublicDemoNavItem[] = [
  {
    id: "overview",
    href: PUBLIC_DEMO_OVERVIEW_PATH,
    label: "Overview",
    icon: LayoutDashboard,
    activePathPrefixes: [PUBLIC_DEMO_OVERVIEW_PATH, PUBLIC_DEMO_ROOT],
  },
  {
    id: "explore",
    href: PUBLIC_DEMO_EXPLORE_PATH,
    label: "Explore",
    icon: Compass,
    activePathPrefixes: [PUBLIC_DEMO_EXPLORE_PATH],
  },
  {
    id: "roadmap",
    href: PUBLIC_DEMO_ROADMAP_PATH,
    label: "Roadmap",
    icon: Map,
    activePathPrefixes: [PUBLIC_DEMO_ROADMAP_PATH],
  },
  {
    id: "projects",
    href: PUBLIC_DEMO_PROJECTS_PATH,
    label: "Projects",
    icon: FolderKanban,
    activePathPrefixes: [PUBLIC_DEMO_PROJECTS_PATH],
  },
  {
    id: "reports",
    href: PUBLIC_DEMO_REPORTS_PATH,
    label: "Reports",
    icon: FileText,
    activePathPrefixes: [PUBLIC_DEMO_REPORTS_PATH],
  },
];

export function publicDemoExplorePillarPath(pillarCode: string): string {
  return `${PUBLIC_DEMO_EXPLORE_PATH}?pillar=${encodeURIComponent(pillarCode)}`;
}

export function publicDemoProjectPath(projectId: string): string {
  return `${PUBLIC_DEMO_PROJECTS_PATH}/${encodeURIComponent(projectId)}`;
}

export function publicDemoOpportunityPath(opportunityId: string): string {
  return `${PUBLIC_DEMO_OPPORTUNITIES_PATH}/${encodeURIComponent(opportunityId)}`;
}

export function publicDemoRoadmapPhasePath(phaseId: string): string {
  return `${PUBLIC_DEMO_ROADMAP_PATH}#${encodeURIComponent(phaseId)}`;
}

/** Legacy marketing deep-link segments → customer-parity demo destinations. */
export const LEGACY_DEMO_SECTION_REDIRECTS: Record<string, string> = {
  dashboard: PUBLIC_DEMO_OVERVIEW_PATH,
  scores: PUBLIC_DEMO_OVERVIEW_PATH,
  overview: PUBLIC_DEMO_OVERVIEW_PATH,
  explore: PUBLIC_DEMO_EXPLORE_PATH,
  recommendations: PUBLIC_DEMO_OPPORTUNITIES_PATH,
  roadmap: PUBLIC_DEMO_ROADMAP_PATH,
  "improvement-plan": PUBLIC_DEMO_ROADMAP_PATH,
  projects: PUBLIC_DEMO_PROJECTS_PATH,
  investment: PUBLIC_DEMO_REPORTS_PATH,
  "quarterly-review": PUBLIC_DEMO_REPORTS_PATH,
  reports: PUBLIC_DEMO_REPORTS_PATH,
};

export function resolveLegacyDemoSectionRedirect(section: string): string | null {
  return LEGACY_DEMO_SECTION_REDIRECTS[section] ?? null;
}

export function isPublicDemoNavActive(pathname: string, item: PublicDemoNavItem): boolean {
  if (item.id === "overview") {
    return (
      pathname === PUBLIC_DEMO_ROOT ||
      pathname === PUBLIC_DEMO_OVERVIEW_PATH ||
      pathname === `${PUBLIC_DEMO_ROOT}/`
    );
  }
  return item.activePathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
