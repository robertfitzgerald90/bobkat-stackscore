import { Info, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoModeBanner() {
  return (
    <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-primary/[0.02] px-4 py-4 text-sm text-foreground shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Interactive Demo</span>
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Changes made during this tour — filters, toggles, roadmap views, and detail panels — are
            temporary and reset automatically when you refresh the page.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
            No client data is accessed. This preview uses isolated Northstar Manufacturing demo data only.
          </p>
        </div>
      </div>
    </div>
  );
}
