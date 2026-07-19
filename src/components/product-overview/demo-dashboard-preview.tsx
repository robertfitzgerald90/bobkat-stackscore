"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DemoDashboardPreviewProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Soft presentation frame for the Interactive Demo dashboard preview.
 * Keeps the full dashboard visible with balanced inset padding — no cropping.
 */
export function DemoDashboardPreview({ children, className }: DemoDashboardPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-gradient-to-br from-muted/50 via-background to-muted/30 p-3 shadow-sm sm:p-4 md:p-5",
        className,
      )}
    >
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_18px_48px_-28px_rgba(8,47,91,0.4)]">
        {children}
      </div>
    </div>
  );
}
