import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import type { DemoDeepLinkSection } from "@/lib/interactive-demo/routes";
import { cn } from "@/lib/utils";

type DemoCompactPanelProps = {
  heading: string;
  copy: string;
  placement: string;
  returnTo?: string;
  section?: DemoDeepLinkSection;
  demoLabel?: string;
  assessmentLabel?: string;
  showAssessment?: boolean;
  className?: string;
};

export function DemoCompactPanel({
  heading,
  copy,
  placement,
  returnTo,
  section,
  demoLabel = "Launch Demo",
  assessmentLabel = "Purchase Assessment",
  showAssessment = false,
  className,
}: DemoCompactPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Interactive Demo
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {heading}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <InteractiveDemoButton
          label={demoLabel}
          placement={placement}
          returnTo={returnTo}
          section={section}
          variant="outline"
          className="h-10 px-5 text-sm sm:w-auto"
        />
        {showAssessment ? (
          <ServicesCtaLink
            cta="purchaseAssessment"
            label={assessmentLabel}
            className="h-10 px-5 text-sm sm:w-auto"
            placement={`${placement}_assessment`}
          />
        ) : null}
      </div>
    </aside>
  );
}
