import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnologyLifecycleCard } from "@/components/technology-stack/technology-lifecycle-card";
import type { TechnologyLifecycleItem } from "@/components/technology-stack/technology-lifecycle-card";
import { cn } from "@/lib/utils";

export type TechnologyLifecyclePanelProps = {
  title?: string;
  items: TechnologyLifecycleItem[];
  readOnly?: boolean;
  compact?: boolean;
  emptyMessage?: string;
};

export function TechnologyLifecyclePanel({
  title = "Budget, Vendor, and Lifecycle Planning",
  items,
  readOnly = false,
  compact = false,
  emptyMessage = "Add technologies in the Client Technology Profile to track vendors, renewals, licensing, warranties, replacements, and budgets.",
}: TechnologyLifecyclePanelProps) {
  return (
    <Card className={cn(compact && "shadow-sm")}>
      <CardHeader className={cn(compact && "pb-3")}>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <TechnologyLifecycleCard
                key={item.id}
                item={item}
                readOnly={readOnly}
                compact={compact}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
