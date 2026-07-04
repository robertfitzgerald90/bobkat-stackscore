"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getVisibleWorkspaceNav,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceNavHref,
  type ClientWorkspaceNavItem,
} from "@/lib/client-workspace/nav";
import { cn } from "@/lib/utils";

type ClientWorkspaceNavProps = {
  clientId: string;
  role: string;
};

export function ClientWorkspaceNav({ clientId, role }: ClientWorkspaceNavProps) {
  const pathname = usePathname();
  const activeSection = resolveActiveWorkspaceSection(pathname);
  const items = getVisibleWorkspaceNav(role);

  return (
    <nav
      aria-label="Client workspace"
      className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => (
        <WorkspaceNavLink
          key={item.section}
          clientId={clientId}
          item={item}
          active={item.section === activeSection}
        />
      ))}
    </nav>
  );
}

function WorkspaceNavLink({
  clientId,
  item,
  active,
}: {
  clientId: string;
  item: ClientWorkspaceNavItem;
  active: boolean;
}) {
  const href = resolveClientWorkspaceNavHref(clientId, item.section);
  const className = cn(
    "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    !href && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
  );

  if (!href) {
    return (
      <span className={className} title="Available in a later update">
        {item.label}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-current={active ? "page" : undefined}>
      {item.label}
    </Link>
  );
}
