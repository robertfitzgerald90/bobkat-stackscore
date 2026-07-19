import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  nextStep?: string;
  action?: ReactNode;
  positive?: boolean;
  className?: string;
};

export function ClientEmptyState({
  icon: Icon,
  title,
  description,
  nextStep,
  action,
  positive = false,
  className,
}: ClientEmptyStateProps) {
  return (
    <Card
      className={cn(
        CLIENT_SURFACE_CARD,
        "border-dashed",
        positive && "border-success/30 bg-success/5",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0",
              positive ? "text-success" : "text-primary",
            )}
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            {nextStep ? (
              <p className="text-sm font-medium text-foreground">Next: {nextStep}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
