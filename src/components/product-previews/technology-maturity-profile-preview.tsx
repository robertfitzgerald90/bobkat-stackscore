import { TechnologyMaturityProfile } from "@/components/technology-maturity/technology-maturity-profile";
import type { TechnologyMaturityProfileProps } from "@/components/technology-maturity/technology-maturity-profile";
import { cn } from "@/lib/utils";

type TechnologyMaturityProfilePreviewProps = {
  data: TechnologyMaturityProfileProps;
  className?: string;
};

/**
 * Focused Technology Maturity Profile panel for marketing pages.
 * Static demo data only — no auth, database, or interactive controls.
 */
export function TechnologyMaturityProfilePreview({
  data,
  className,
}: TechnologyMaturityProfilePreviewProps) {
  return (
    <div className={cn("w-full min-w-0", className)} aria-label="Technology maturity profile preview">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground lg:text-left">
        Executive Technology Profile
      </p>

      <TechnologyMaturityProfile {...data} readOnly marketingPreview />

      <p className="mt-4 text-center text-sm text-muted-foreground lg:text-left">
        See your technology maturity, business exposure, and improvement trajectory in one executive
        view.
      </p>
    </div>
  );
}
