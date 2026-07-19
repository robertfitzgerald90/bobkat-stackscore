import type { ReactNode } from "react";
import { CLIENT_PAGE_SHELL } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Consistent content width and vertical rhythm for client-facing pages. */
export function ClientPageShell({ children, className }: ClientPageShellProps) {
  return <div className={cn(CLIENT_PAGE_SHELL, className)}>{children}</div>;
}
