import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLIENT_METRIC_VALUE,
  clientSurfaceCardClass,
  type ClientVisualVariant,
} from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientMetricCardProps = {
  label: string;
  value: ReactNode;
  sublabel?: string;
  emphasizeClassName?: string;
  /** Default stays clean; use industrial sparingly for hero metrics. */
  variant?: ClientVisualVariant;
  className?: string;
};

export function ClientMetricCard({
  label,
  value,
  sublabel,
  emphasizeClassName,
  variant = "default",
  className,
}: ClientMetricCardProps) {
  return (
    <Card className={cn(clientSurfaceCardClass(variant), className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold sm:text-3xl",
            CLIENT_METRIC_VALUE,
            emphasizeClassName,
          )}
        >
          {value}
        </p>
        {sublabel ? <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p> : null}
      </CardContent>
    </Card>
  );
}
