import { Lightbulb } from "lucide-react";
import type { Priority } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_LABELS } from "@/lib/display";
import { cn } from "@/lib/utils";

export type PriorityItem = {
  id: string;
  title: string;
  severity: Priority;
};

export type CurrentQuarterPrioritiesProps = {
  priorities: PriorityItem[];
  title?: string;
  readOnly?: boolean;
  compact?: boolean;
  emptyMessage?: string;
};

export function CurrentQuarterPriorities({
  priorities,
  title = "Current-quarter priorities",
  readOnly = false,
  compact = false,
  emptyMessage = "No open recommendations yet. Complete a baseline assessment to populate priorities.",
}: CurrentQuarterPrioritiesProps) {
  return (
    <Card className={cn(compact && "shadow-sm")}>
      <CardHeader className={cn(compact && "pb-3")}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        {priorities.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className={cn("space-y-3", compact && "space-y-2.5")}>
            {priorities.map((priority) => (
              <li
                key={priority.id}
                className={cn(
                  "flex items-start justify-between gap-3 text-sm",
                  readOnly && "pointer-events-none",
                )}
              >
                <span className="min-w-0 break-words font-medium">{priority.title}</span>
                <span className="shrink-0 text-muted-foreground">
                  {PRIORITY_LABELS[priority.severity]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
