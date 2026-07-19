import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLIENT_METRIC_VALUE, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientMetricCardProps = {
  label: string;
  value: ReactNode;
  sublabel?: string;
  emphasizeClassName?: string;
  className?: string;
};

export function ClientMetricCard({
  label,
  value,
  sublabel,
  emphasizeClassName,
  className,
}: ClientMetricCardProps) {
  return (
    <Card className={cn(CLIENT_SURFACE_CARD, className)}>
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
