import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function PreviewCard({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-4 text-sm text-slate-900 shadow-sm dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function PreviewCardHeader({ className, ...props }: DivProps) {
  return <div className={cn("grid gap-1 px-4", className)} {...props} />;
}

export function PreviewCardTitle({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("min-w-0 break-words text-base font-semibold leading-snug", className)}
      {...props}
    />
  );
}

export function PreviewCardDescription({ className, ...props }: DivProps) {
  return (
    <div className={cn("text-sm text-slate-600 dark:text-slate-400", className)} {...props} />
  );
}

export function PreviewCardContent({ className, ...props }: DivProps) {
  return <div className={cn("px-4", className)} {...props} />;
}

export function PreviewBadge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PreviewShell({
  className,
  children,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        "stackscore-portfolio-preview min-w-0 max-w-full overflow-x-clip rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-[#06111f] dark:text-slate-100",
        className,
      )}
      data-portfolio-preview="stackscore"
      {...props}
    >
      {children}
    </div>
  );
}
