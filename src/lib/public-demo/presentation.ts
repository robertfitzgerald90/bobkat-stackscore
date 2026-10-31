/**
 * SS-WEB-003-R1 — Presentation adapters for shared customer compositions.
 * Maps fictional demo routes into the same WorkspaceHubLink / href shapes
 * the authenticated Overview expects — without branching inside every card.
 */

import type { WorkspaceHubLink } from "@/components/client-workspace/workspace-hub-links";
import {
  PUBLIC_DEMO_EXPLORE_PATH,
  PUBLIC_DEMO_OPPORTUNITIES_PATH,
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_REPORTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
} from "@/lib/public-demo/routes";

/** Demo Overview workspace hub — mirrors customer hub titles/descriptions. */
export function getPublicDemoWorkspaceLinks(): WorkspaceHubLink[] {
  return [
    {
      href: PUBLIC_DEMO_EXPLORE_PATH,
      title: "Explore pillars",
      description: "Eight technology maturity domains",
    },
    {
      href: PUBLIC_DEMO_ROADMAP_PATH,
      title: "Roadmap",
      description: "Living execution plan and progress",
    },
    {
      href: PUBLIC_DEMO_PROJECTS_PATH,
      title: "Projects",
      description: "Active delivery work and completion status",
    },
    {
      href: PUBLIC_DEMO_OPPORTUNITIES_PATH,
      title: "Improvement opportunities",
      description: "Prioritized assessment recommendations",
    },
    {
      href: PUBLIC_DEMO_REPORTS_PATH,
      title: "Reports",
      description: "Assessment report, PDF, and reviews",
    },
  ];
}

export const PUBLIC_DEMO_RECOMMENDATIONS_HREF = PUBLIC_DEMO_OPPORTUNITIES_PATH;
export const PUBLIC_DEMO_OVERVIEW_HREF = PUBLIC_DEMO_OVERVIEW_PATH;

/** Page titles aligned with customer `getPageTitle` labels. */
export function getPublicDemoPageTitle(pathname: string): string {
  if (pathname.startsWith(PUBLIC_DEMO_EXPLORE_PATH)) return "Explore";
  if (pathname.startsWith(PUBLIC_DEMO_ROADMAP_PATH)) return "Roadmap";
  if (pathname.startsWith(PUBLIC_DEMO_PROJECTS_PATH)) return "Projects";
  if (pathname.startsWith(PUBLIC_DEMO_REPORTS_PATH)) return "Reports";
  if (pathname.startsWith(PUBLIC_DEMO_OPPORTUNITIES_PATH)) return "Improvement Opportunities";
  return "Overview";
}
