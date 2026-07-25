import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function DemoCard({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground shadow-sm ring-1 ring-border/60",
        className,
      )}
      {...props}
    />
  );
}

export function DemoCardHeader({ className, ...props }: DivProps) {
  return <div className={cn("grid gap-1 px-4", className)} {...props} />;
}

export function DemoCardTitle({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("min-w-0 break-words text-base font-medium leading-snug", className)}
      {...props}
    />
  );
}

export function DemoCardDescription({ className, ...props }: DivProps) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DemoCardContent({ className, ...props }: DivProps) {
  return <div className={cn("px-4", className)} {...props} />;
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  outline: "border-border text-foreground",
  success: "bg-success/10 text-success dark:bg-success/20",
  warning: "bg-warning/10 text-warning dark:bg-warning/20",
};

export function DemoBadge({
  className,
  variant = "default",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
