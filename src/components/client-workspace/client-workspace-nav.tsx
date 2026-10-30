"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getStaffWorkspaceGroups,
  isWorkspaceNavChildActive,
  resolveActiveWorkspaceGroup,
  resolveClientWorkspaceGroupHref,
  resolveClientWorkspaceNavHref,
  type ClientWorkspaceGroup,
  type ClientWorkspaceGroupChild,
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

/**
 * SS-ADMIN-003 staff client workspace navigation — five groups + contextual secondary destinations.
 * Customer users do not render this chrome (see ClientWorkspaceShell).
 */
export function ClientWorkspaceNav({
  clientId,
  role,
  variant = "default",
}: ClientWorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = getStaffWorkspaceGroups();
  const activeGroupId = resolveActiveWorkspaceGroup(pathname);
  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0]!;
  const isWorkspaceShell = variant === "workspaceShell";

  // Role retained for API compatibility; shell already gates to staff.
  void role;

  return (
    <div className="min-w-0 space-y-2">
      <div className="md:hidden space-y-2">
        <label htmlFor="workspace-group-nav" className="sr-only">
          Client workspace group
        </label>
        <Select
          value={activeGroup.id}
          items={Object.fromEntries(groups.map((group) => [group.id, group.label]))}
          onValueChange={(value) => {
            if (!value) return;
            const group = groups.find((item) => item.id === value);
            if (!group) return;
            const href = resolveClientWorkspaceGroupHref(clientId, group);
            if (href) router.push(href);
          }}
        >
          <SelectTrigger
            id="workspace-group-nav"
            className={cn(
              "w-full min-w-0 max-w-full",
              isWorkspaceShell &&
                "border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <nav
          aria-label={`${activeGroup.label} destinations`}
          className="flex flex-wrap gap-1"
        >
          {activeGroup.children.map((child) => (
            <SecondaryNavLink
              key={child.section}
              clientId={clientId}
              child={child}
              active={isWorkspaceNavChildActive(pathname, child.section)}
              variant={variant}
              compact
            />
          ))}
        </nav>
      </div>

      <div className="hidden md:block space-y-2">
        <nav
          aria-label="Client workspace groups"
          className={cn(
            "flex flex-wrap gap-1 border-b pb-px",
            isWorkspaceShell ? "border-sidebar-border/70" : "border-border/60",
          )}
        >
          {groups.map((group) => (
            <GroupNavLink
              key={group.id}
              clientId={clientId}
              group={group}
              active={group.id === activeGroupId}
              variant={variant}
            />
          ))}
        </nav>

        <SecondaryNavRow
          clientId={clientId}
          group={activeGroup}
          pathname={pathname}
          variant={variant}
        />
      </div>
    </div>
  );
}

function GroupNavLink({
  clientId,
  group,
  active,
  variant,
}: {
  clientId: string;
  group: ClientWorkspaceGroup;
  active: boolean;
  variant: "default" | "workspaceShell";
}) {
  const href = resolveClientWorkspaceGroupHref(clientId, group);
  const isWorkspaceShell = variant === "workspaceShell";
  const className = cn(
    "shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isWorkspaceShell
      ? active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      : active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );

  if (!href) {
    return <span className={className}>{group.label}</span>;
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      data-workspace-group={group.id}
    >
      {group.label}
    </Link>
  );
}

function SecondaryNavRow({
  clientId,
  group,
  pathname,
  variant,
}: {
  clientId: string;
  group: ClientWorkspaceGroup;
  pathname: string;
  variant: "default" | "workspaceShell";
}) {
  return (
    <nav
      aria-label={`${group.label} destinations`}
      className={cn(
        "flex flex-wrap gap-1",
        group.id === "relationship" && "gap-1.5",
      )}
    >
      {group.children.map((child) => (
        <SecondaryNavLink
          key={child.section}
          clientId={clientId}
          child={child}
          active={isWorkspaceNavChildActive(pathname, child.section)}
          variant={variant}
          compact={group.id === "relationship"}
        />
      ))}
    </nav>
  );
}

function SecondaryNavLink({
  clientId,
  child,
  active,
  variant,
  compact = false,
}: {
  clientId: string;
  child: ClientWorkspaceGroupChild;
  active: boolean;
  variant: "default" | "workspaceShell";
  compact?: boolean;
}) {
  const href = resolveClientWorkspaceNavHref(clientId, child.section);
  const isWorkspaceShell = variant === "workspaceShell";
  const className = cn(
    "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    compact ? "px-2 py-1 text-xs sm:text-sm" : "px-2.5 py-1 text-sm",
    isWorkspaceShell
      ? active
        ? "bg-sidebar-primary/15 text-sidebar-foreground ring-1 ring-sidebar-border"
        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
      : active
        ? "bg-muted text-foreground ring-1 ring-border"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    !href && "cursor-not-allowed opacity-50",
  );

  if (!href) {
    return (
      <span className={className} title="Available in a later update">
        {child.label}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-current={active ? "page" : undefined}>
      {child.label}
    </Link>
  );
}
