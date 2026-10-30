import { getStaffWorkspaceGroups } from "@/lib/client-workspace/nav";
import { cn } from "@/lib/utils";

type ClientWorkspaceNavStaticProps = {
  role?: string;
  activeGroup?: "overview" | "assessment" | "strategy" | "execution" | "relationship";
};

/**
 * Non-interactive workspace groups for marketing and demo previews.
 * Mirrors SS-ADMIN-003 staff chrome without routing or client hooks.
 */
export function ClientWorkspaceNavStatic({
  role = "admin",
  activeGroup = "overview",
}: ClientWorkspaceNavStaticProps) {
  void role;
  const groups = getStaffWorkspaceGroups();
  const group = groups.find((item) => item.id === activeGroup) ?? groups[0]!;

  return (
    <div className="min-w-0 space-y-2" aria-hidden="true">
      <nav
        aria-label="Client workspace groups preview"
        className="flex flex-wrap gap-1 border-b border-border/60 pb-px"
      >
        {groups.map((item) => (
          <span
            key={item.id}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold tracking-tight",
              item.id === activeGroup
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </span>
        ))}
      </nav>
      <nav aria-label={`${group.label} destinations preview`} className="flex flex-wrap gap-1">
        {group.children.map((child) => (
          <span
            key={child.section}
            className={cn(
              "rounded-md px-2.5 py-1 text-sm font-medium",
              child.section === group.defaultSection
                ? "bg-muted text-foreground ring-1 ring-border"
                : "text-muted-foreground",
            )}
          >
            {child.label}
          </span>
        ))}
      </nav>
    </div>
  );
}
