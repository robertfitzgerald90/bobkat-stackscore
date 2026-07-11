"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/communications", label: "Overview", exact: true },
  { href: "/admin/communications/templates", label: "Templates", exact: false },
] as const;

export function CommunicationsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/70 pb-4">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-blue/15 text-accent-blue"
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
