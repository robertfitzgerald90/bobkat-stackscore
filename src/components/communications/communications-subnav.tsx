"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  exact: boolean;
  adminOnly?: boolean;
}> = [
  { href: "/admin/communications", label: "Overview", exact: true },
  { href: "/admin/communications/campaigns", label: "Campaigns", exact: false },
  { href: "/admin/communications/prospects", label: "Prospects", exact: false },
  { href: "/admin/communications/templates", label: "Templates", exact: false },
  { href: "/admin/communications/history", label: "History", exact: false },
  { href: "/admin/communications/automations", label: "Automations", exact: false, adminOnly: true },
  { href: "/admin/communications/testing", label: "Testing", exact: false, adminOnly: true },
  { href: "/admin/communications/analytics", label: "Analytics", exact: false },
  { href: "/admin/communications/components", label: "Components", exact: false, adminOnly: true },
  { href: "/admin/communications/variables", label: "Variables", exact: false },
  { href: "/admin/communications/settings", label: "Settings", exact: false, adminOnly: true },
];

type CommunicationsSubnavProps = {
  isAdmin?: boolean;
};

export function CommunicationsSubnav({ isAdmin = false }: CommunicationsSubnavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
      {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
