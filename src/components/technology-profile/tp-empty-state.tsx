import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TpEmptyStateProps = {
  icon?: LucideIcon;
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  positive?: boolean;
  className?: string;
};

export function TpEmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
  positive = false,
  className,
}: TpEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center sm:px-6",
        positive ? "border-success/30 bg-success/5" : "border-border/60 bg-muted/20",
        className,
      )}
    >
      {Icon ? <Icon className="h-8 w-8 text-muted-foreground/70" aria-hidden /> : null}
      {title ? <p className="text-sm font-semibold text-foreground">{title}</p> : null}
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={buttonClassName({
            variant: positive ? "default" : "outline",
            size: "sm",
            className: "w-full sm:w-auto",
          })}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
