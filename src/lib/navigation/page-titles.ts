const ROUTE_TITLES: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/portfolio$/, title: "Portfolio" },
  { pattern: /^\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/clients\/new$/, title: "New Client" },
  { pattern: /^\/clients\/[^/]+\/improvement$/, title: "Improvement" },
  { pattern: /^\/clients\/[^/]+\/assessments\/history$/, title: "Assessment History" },
  { pattern: /^\/clients\/[^/]+$/, title: "Client" },
  { pattern: /^\/clients$/, title: "Clients" },
  { pattern: /^\/assessments\/[^/]+\/results$/, title: "Results" },
  { pattern: /^\/assessments\/[^/]+\/improvement$/, title: "Improvement" },
  { pattern: /^\/assessments\/[^/]+$/, title: "Assessment" },
  { pattern: /^\/projects$/, title: "Projects" },
  { pattern: /^\/admin\/users$/, title: "Users" },
];

export function getPageTitle(pathname: string): string {
  for (const route of ROUTE_TITLES) {
    if (route.pattern.test(pathname)) {
      return route.title;
    }
  }
  return "StackScore";
}
