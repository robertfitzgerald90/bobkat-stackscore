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
};

export function ClientWorkspaceNav({ clientId, role }: ClientWorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = resolveActiveWorkspaceSection(pathname);
  const items = getVisibleWorkspaceNav(role);

  return (
    <div className="min-w-0">
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
          <SelectTrigger id="workspace-section-nav" className="w-full">
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
        className="hidden gap-1 overflow-x-auto border-b border-border/60 pb-px [-ms-overflow-style:none] [scrollbar-width:none] md:flex md:snap-x md:snap-mandatory md:touch-pan-x [&::-webkit-scrollbar]:hidden"
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
    </div>
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
    "shrink-0 snap-start rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
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
