import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  Map,
  Settings,
  Shield,
  UserCircle,
  Users,
  Camera,
  Library,
} from "lucide-react";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, item is omitted unless clientId is available. */
  requiresClient?: boolean;
  adminOnly?: boolean;
  portfolioOnly?: boolean;
};

function customerHref(clientId: string | null, path: string): string {
  if (!clientId) return "/dashboard";
  return `/clients/${clientId}/${path}`;
}

export function getCustomerSidebarNav(clientId: string | null): SidebarNavItem[] {
  return [
    {
      href: clientId ? `/clients/${clientId}/technology-profile` : "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/assessment/start", label: "Assessment", icon: ClipboardList },
    {
      href: customerHref(clientId, "recommendations"),
      label: "Recommendations",
      icon: Lightbulb,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "executive-reports"),
      label: "Reports",
      icon: FileText,
      requiresClient: true,
    },
    { href: "/support", label: "Support", icon: HelpCircle },
    { href: "/account", label: "Account", icon: UserCircle },
  ];
}

export function getConsultantSidebarNav(
  role: string,
  clientId: string | null,
): SidebarNavItem[] {
  const clientScoped = (section: string): string =>
    clientId ? `/clients/${clientId}/${section}` : "/clients";

  const items: SidebarNavItem[] = [
    { href: "/portfolio", label: "Portfolio", icon: LayoutGrid, portfolioOnly: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/assessments", label: "Assessments", icon: ClipboardList },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    {
      href: clientScoped("recommendations"),
      label: "Recommendations",
      icon: Lightbulb,
    },
    { href: clientScoped("roadmap"), label: "Roadmaps", icon: Map },
    {
      href: clientScoped("executive-reports"),
      label: "Reports",
      icon: FileText,
    },
    { href: "/technology-catalog", label: "Technology Catalog", icon: Library },
    { href: "/playbooks", label: "Playbooks", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/admin/users", label: "Users", icon: Shield, adminOnly: true },
    {
      href: "/admin/assessment-library",
      label: "Assessment Library",
      icon: BookOpen,
      adminOnly: true,
    },
    { href: "/snapshot-leads", label: "Snapshot Leads", icon: Camera, adminOnly: true },
  ];

  return items.filter((item) => {
    if (item.adminOnly && role !== "admin") return false;
    if (item.portfolioOnly && !canAccessPortfolio(role)) return false;
    if (item.requiresClient && !clientId) return false;
    return true;
  });
}

export function getSidebarNavForRole(
  role: string,
  clientId: string | null,
): SidebarNavItem[] {
  if (isCustomerMode(role)) {
    return getCustomerSidebarNav(clientId).filter(
      (item) => !item.requiresClient || Boolean(clientId),
    );
  }
  return getConsultantSidebarNav(role, clientId);
}

/** Extract client id from pathname when viewing a client workspace. */
export function resolveClientIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/clients\/([^/]+)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}
