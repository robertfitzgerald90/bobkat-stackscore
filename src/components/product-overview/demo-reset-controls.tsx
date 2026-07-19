"use client";

import { RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewDemoReset } from "@/lib/analytics/product-overview-events";

export function DemoResetControls() {
  const { resetDemo, startFresh, restartTour, personalization } = useProductOverview();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          resetDemo();
        }}
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Reset Demo
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          restartTour();
          trackProductOverviewDemoReset("restart_tour");
        }}
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Restart Tour
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={startFresh}>
        <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Start Fresh
      </Button>
      <span className="self-center text-xs text-muted-foreground">
        Viewing: <strong className="text-foreground">{personalization.companyName}</strong>
      </span>
    </div>
  );
}
