import { TechnologyLifecyclePanel } from "@/components/technology-stack/technology-lifecycle-panel";
import type { TechnologyLifecycleItem } from "@/components/technology-stack/technology-lifecycle-card";
import { cn } from "@/lib/utils";

type TechnologyLifecyclePreviewProps = {
  items: TechnologyLifecycleItem[];
  className?: string;
};

/**
 * Focused budget, vendor, and lifecycle panel for marketing pages.
 * Static demo data only — no auth, database, or interactive controls.
 */
export function TechnologyLifecyclePreview({ items, className }: TechnologyLifecyclePreviewProps) {
  return (
    <div
      className={cn("w-full min-w-0", className)}
      aria-label="Technology lifecycle planning preview"
    >
      <TechnologyLifecyclePanel items={items} readOnly compact />
    </div>
  );
}
