import {
  isClientVisibleWorkspaceSection,
  resolveActiveWorkspaceSection,
} from "@/lib/client-workspace/nav";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import type { PageContext } from "@/lib/command-center/types";

const CLIENT_ALLOWED_EXACT = new Set([
  "/dashboard",
  "/account",
  "/support",
  "/assessment/start",
  "/onboarding",
]);

/** Mirrors middleware client route policy in auth.config.ts */
export function canClientAccessPath(pathname: string, context: PageContext): boolean {
  if (!isCustomerMode(context.role)) return true;

  const path = pathname.split("?")[0] ?? pathname;

  if (CLIENT_ALLOWED_EXACT.has(path)) {
    return true;
  }

  if (
    path === "/clients" ||
    path === "/clients/new" ||
    path === "/projects" ||
    path === "/portfolio" ||
    path === "/assessments" ||
    path.startsWith("/admin/") ||
    path.startsWith("/technology-catalog") ||
    path.startsWith("/playbooks") ||
    path.startsWith("/settings") ||
    path.startsWith("/snapshot-leads")
  ) {
    return false;
  }

  if (/^\/assessments\/[^/]+(\/report)?$/.test(path)) {
    return true;
  }

  const clientMatch = path.match(/^\/clients\/([^/]+)/);
  if (clientMatch && clientMatch[1] !== "new") {
    if (context.userClientId && clientMatch[1] !== context.userClientId) {
      return false;
    }
    const section = resolveActiveWorkspaceSection(path);
    return isClientVisibleWorkspaceSection(section);
  }

  if (path.startsWith("/clients")) {
    return false;
  }

  if (path.startsWith("/api/v1/assessments/") && path.endsWith("/export/pdf")) {
    return true;
  }

  return false;
}

export function canAccessHref(href: string | undefined, context: PageContext): boolean {
  if (!href) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return !isCustomerMode(context.role);
  }
  if (href.startsWith("/api/")) {
    return canClientAccessPath(href, context);
  }
  try {
    const url = new URL(href, "https://stackscore.local");
    return canClientAccessPath(url.pathname, context);
  } catch {
    return false;
  }
}

export function getClientSafeRedirectPath(context: PageContext): string {
  if (context.userClientId) {
    return clientTechnologyProfilePath(context.userClientId);
  }
  return "/dashboard";
}
