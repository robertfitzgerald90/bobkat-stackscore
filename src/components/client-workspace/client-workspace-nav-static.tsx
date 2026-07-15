import { getVisibleWorkspaceNav } from "@/lib/client-workspace/nav";
import { cn } from "@/lib/utils";

type ClientWorkspaceNavStaticProps = {
  role?: string;
  activeSection?: "overview";
};

/**
 * Non-interactive workspace tabs for marketing and demo previews.
 * Mirrors ClientWorkspaceNav appearance without routing or client hooks.
 */
export function ClientWorkspaceNavStatic({
  role = "admin",
  activeSection = "overview",
}: ClientWorkspaceNavStaticProps) {
  const items = getVisibleWorkspaceNav(role);

  return (
    <div className="min-w-0" aria-hidden="true">
      <nav
        aria-label="Client workspace preview"
        className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <span
            key={item.section}
            className={cn(
              "shrink-0 snap-start rounded-md px-2.5 py-1.5 text-sm font-medium",
              item.section === activeSection
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </span>
        ))}
      </nav>
    </div>
  );
}
