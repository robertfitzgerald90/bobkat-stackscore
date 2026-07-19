"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getVisibleWorkspaceNav,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceNavHref,
  type ClientWorkspaceNavItem,
  type ClientWorkspaceSection,
} from "@/lib/client-workspace/nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ClientWorkspaceNavProps = {
  clientId: string;
  role: string;
  variant?: "default" | "workspaceShell";
};

export function ClientWorkspaceNav({
  clientId,
  role,
  variant = "default",
}: ClientWorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = resolveActiveWorkspaceSection(pathname);
  const items = getVisibleWorkspaceNav(role);
  const isWorkspaceShell = variant === "workspaceShell";

  return (
    <div className="min-w-0 bg-sidebar">
      <div className="md:hidden">
        <label htmlFor="workspace-section-nav" className="sr-only">
          Client workspace section
        </label>
        <Select
          value={activeSection}
          items={Object.fromEntries(
            items.map((item) => [item.section, item.label]),
          )}
          onValueChange={(value) => {
            if (!value) return;
            const href = resolveClientWorkspaceNavHref(
              clientId,
              value as ClientWorkspaceSection,
            );
            if (href) router.push(href);
          }}
        >
          <SelectTrigger
            id="workspace-section-nav"
            className={cn(
              "w-full min-w-0 max-w-full",
              isWorkspaceShell &&
                "border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.section} value={item.section}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav
        aria-label="Client workspace"
        className={cn(
          "hidden gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] md:flex md:snap-x md:snap-mandatory md:touch-pan-x [&::-webkit-scrollbar]:hidden",
          isWorkspaceShell ? "border-b border-sidebar-border/70" : "border-b border-border/60",
        )}
      >
        {items.map((item) => (
          <WorkspaceNavLink
            key={item.section}
            clientId={clientId}
            item={item}
            active={item.section === activeSection}
            variant={variant}
          />
        ))}
      </nav>
    </div>
  );
}

function WorkspaceNavLink({
  clientId,
  item,
  active,
  variant = "default",
}: {
  clientId: string;
  item: ClientWorkspaceNavItem;
  active: boolean;
  variant?: "default" | "workspaceShell";
}) {
  const href = resolveClientWorkspaceNavHref(clientId, item.section);
  const isWorkspaceShell = variant === "workspaceShell";
  const className = cn(
    "shrink-0 snap-start rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
    isWorkspaceShell
      ? active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      : active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    !href &&
      (isWorkspaceShell
        ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-sidebar-foreground/80"
        : "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground"),
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
