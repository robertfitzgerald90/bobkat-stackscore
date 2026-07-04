import {
  CLIENT_WORKSPACE_NAV,
  resolveActiveWorkspaceSection,
} from "@/lib/client-workspace/nav";

const STATIC_ROUTE_TITLES: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/portfolio$/, title: "Portfolio" },
  { pattern: /^\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/clients\/new$/, title: "New Client" },
  { pattern: /^\/clients$/, title: "Clients" },
  { pattern: /^\/assessments\/[^/]+\/results$/, title: "Results" },
  { pattern: /^\/assessments\/[^/]+\/improvement$/, title: "Improvement" },
  { pattern: /^\/assessments\/[^/]+$/, title: "Assessment" },
  { pattern: /^\/projects$/, title: "Projects" },
  { pattern: /^\/admin\/users$/, title: "Users" },
];

const CLIENT_SUBROUTE_TITLES: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/clients\/[^/]+\/assessments\/history$/, title: "Assessment History" },
  { pattern: /^\/clients\/[^/]+\/assessments\/compare$/, title: "Compare Assessments" },
  { pattern: /^\/clients\/[^/]+\/improvement-plan\/[^/]+$/, title: "Improvement Plan" },
  { pattern: /^\/clients\/[^/]+\/quarterly-review\/[^/]+$/, title: "Quarterly Review" },
  { pattern: /^\/clients\/[^/]+\/progress-report$/, title: "Progress Report" },
  {
    pattern: /^\/clients\/[^/]+\/projects\/[^/]+\/completion-report$/,
    title: "Completion Report",
  },
  { pattern: /^\/clients\/[^/]+\/improvement$/, title: "Improvement Dashboard" },
];

function getClientWorkspaceTitle(pathname: string): string | null {
  if (!/^\/clients\/[^/]+/.test(pathname)) return null;

  for (const route of CLIENT_SUBROUTE_TITLES) {
    if (route.pattern.test(pathname)) return route.title;
  }

  const section = resolveActiveWorkspaceSection(pathname);
  if (section === "overview") return "Client Workspace";

  const navItem = CLIENT_WORKSPACE_NAV.find((item) => item.section === section);
  return navItem?.label ?? "Client Workspace";
}

export function getPageTitle(pathname: string): string {
  for (const route of STATIC_ROUTE_TITLES) {
    if (route.pattern.test(pathname)) {
      return route.title;
    }
  }

  const clientTitle = getClientWorkspaceTitle(pathname);
  if (clientTitle) return clientTitle;

  return "StackScore";
}
