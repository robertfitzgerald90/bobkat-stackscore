import { Badge } from "@/components/ui/badge";
import { DEMO_ENVIRONMENT_LABEL } from "@/lib/interactive-demo/content";
import { cn } from "@/lib/utils";

type DemoEnvironmentBadgeProps = {
  className?: string;
  label?: string;
};

export function DemoEnvironmentBadge({
  className,
  label = DEMO_ENVIRONMENT_LABEL,
}: DemoEnvironmentBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border border-primary/20 bg-primary/10 font-semibold tracking-wide text-primary",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
