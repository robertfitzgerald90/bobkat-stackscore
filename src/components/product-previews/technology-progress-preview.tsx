import { JourneyProgressSummary } from "@/components/technology-journey/journey-progress-summary";
import type { JourneyProgressSummaryProps } from "@/components/technology-journey/journey-progress-summary";
import { cn } from "@/lib/utils";

type TechnologyProgressPreviewProps = {
  data: JourneyProgressSummaryProps;
  className?: string;
};

const PREVIEW_PANEL_CLASS =
  "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_16px_48px_-18px_rgba(8,47,91,0.16),0_0_64px_-24px_rgba(8,47,91,0.12)]";

/**
 * Focused Technology Journey progress summary for marketing pages.
 * Static demo data only — no auth, database, or interactive controls.
 */
export function TechnologyProgressPreview({ data, className }: TechnologyProgressPreviewProps) {
  return (
    <div
      className={cn(PREVIEW_PANEL_CLASS, className)}
      aria-label="Technology journey progress preview"
    >
      <div className="p-4 sm:p-5 md:p-6 lg:p-7">
        <JourneyProgressSummary {...data} readOnly marketingPreview />
      </div>
    </div>
  );
}
