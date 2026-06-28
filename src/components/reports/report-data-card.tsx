import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportDataCardProps = {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  icon?: ReactNode;
  className?: string;
  accent?: boolean;
};

export function ReportDataCard({
  title,
  description,
  meta,
  aside,
  icon,
  className,
  accent = false,
}: ReportDataCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 p-4",
        accent && "border-primary/20 bg-primary/5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">{title}</div>
            {description ? (
              <div className="mt-2 text-sm text-muted-foreground">{description}</div>
            ) : null}
            {meta ? <div className="mt-2 text-xs text-muted-foreground">{meta}</div> : null}
          </div>
        </div>
        {aside ? <div className="shrink-0 text-right text-sm text-muted-foreground">{aside}</div> : null}
      </div>
    </div>
  );
}

export function ReportHighlightCard({
  children,
  className,
  leftBorder = false,
}: {
  children: ReactNode;
  className?: string;
  leftBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-4",
        leftBorder && "border-l-4 border-l-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}
