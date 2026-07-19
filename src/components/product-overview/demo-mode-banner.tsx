"use client";

import { Info, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoResetControls } from "@/components/product-overview/demo-reset-controls";
import { useProductOverview } from "@/components/product-overview/product-overview-context";

export function DemoModeBanner() {
  const { personalization } = useProductOverview();

  return (
    <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-primary/[0.02] px-4 py-4 text-sm text-foreground shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Interactive Demo</span>
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {personalization.companyName}
            </Badge>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Changes made during this tour — filters, toggles, roadmap views, industry selection, and
            feature details — are temporary and reset automatically when you refresh the page.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
            No authentication required. Isolated demo data only — nothing persists.
          </p>
          <DemoResetControls />
        </div>
      </div>
    </div>
  );
}
