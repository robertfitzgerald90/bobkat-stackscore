import { cn } from "@/lib/utils";
import {
  MARKETING_CONTENT,
  MARKETING_PAGE_ROOT,
} from "@/lib/marketing/tokens";

type PublicPageShellProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "auth";
};

/**
 * Wraps public-facing StackScore pages with the executive marketing theme.
 * Applies dark dashboard tokens without affecting authenticated app surfaces.
 */
export function PublicPageShell({
  children,
  className,
  contentClassName,
  variant = "default",
}: PublicPageShellProps) {
  return (
    <div className={cn(MARKETING_PAGE_ROOT, className)}>
      <div
        className={cn(
          variant === "auth" ? undefined : MARKETING_CONTENT,
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
