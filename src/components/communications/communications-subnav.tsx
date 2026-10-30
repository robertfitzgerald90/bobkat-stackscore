"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getVisibleCommunicationsGroups,
  isCommunicationsNavChildActive,
  resolveActiveCommunicationsGroup,
  type CommunicationsNavChild,
  type CommunicationsNavGroup,
} from "@/lib/communications/nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STICKY_IN_SCROLLPORT_CLASS } from "@/lib/ui/sticky-chrome";
import { cn } from "@/lib/utils";

type CommunicationsSubnavProps = {
  isAdmin?: boolean;
};

/**
 * SS-ADMIN-006 — two-level Communications workspace navigation.
 * Mirrors SS-ADMIN-003 group + secondary pattern; routes unchanged.
 */
export function CommunicationsSubnav({ isAdmin = false }: CommunicationsSubnavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = getVisibleCommunicationsGroups(isAdmin);
  const activeGroupId = resolveActiveCommunicationsGroup(pathname) ?? "overview";
  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0]!;

  return (
    <div
      className={cn(STICKY_IN_SCROLLPORT_CLASS, "mb-4 min-w-0 space-y-2 border-border pb-3")}
    >
      <div className="md:hidden space-y-2">
        <label htmlFor="communications-group-nav" className="sr-only">
          Communications workspace group
        </label>
        <Select
          value={activeGroup.id}
          items={Object.fromEntries(groups.map((group) => [group.id, group.label]))}
          onValueChange={(value) => {
            if (!value) return;
            const group = groups.find((item) => item.id === value);
            if (!group) return;
            router.push(group.defaultHref);
          }}
        >
          <SelectTrigger id="communications-group-nav" className="w-full min-w-0 max-w-full">
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

        <SecondaryRow group={activeGroup} pathname={pathname} compact />
      </div>

      <div className="hidden md:block space-y-2">
        <nav
          aria-label="Communications workspace groups"
          className="flex flex-wrap gap-1 border-b border-border/60 pb-px"
        >
          {groups.map((group) => {
            const active = group.id === activeGroupId;
            return (
              <Link
                key={group.id}
                href={group.defaultHref}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {group.label}
              </Link>
            );
          })}
        </nav>

        <SecondaryRow group={activeGroup} pathname={pathname} />
      </div>
    </div>
  );
}

function SecondaryRow({
  group,
  pathname,
  compact = false,
}: {
  group: CommunicationsNavGroup;
  pathname: string;
  compact?: boolean;
}) {
  return (
    <nav aria-label={`${group.label} destinations`} className="flex flex-wrap gap-1">
      {group.children.map((child) => (
        <SecondaryLink
          key={child.href}
          child={child}
          active={isCommunicationsNavChildActive(pathname, child)}
          compact={compact}
        />
      ))}
    </nav>
  );
}

function SecondaryLink({
  child,
  active,
  compact,
}: {
  child: CommunicationsNavChild;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={child.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        compact ? "px-2 py-1 text-xs sm:text-sm" : "px-2.5 py-1 text-sm",
        active
          ? "bg-muted text-foreground ring-1 ring-border"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {child.label}
    </Link>
  );
}
