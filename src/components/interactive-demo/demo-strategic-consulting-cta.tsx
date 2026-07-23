import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";

export function DemoStrategicConsultingCta() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-primary/25 bg-primary/[0.04] p-4">
      <p className="text-sm text-muted-foreground">
        See how ongoing strategic planning is managed inside StackScore.
      </p>
      <InteractiveDemoButton
        label="View Strategic Planning Demo"
        placement="services_strategic_consulting"
        section="quarterly-review"
        returnTo={BOBKAT_IT_URLS.strategicItConsulting}
        variant="outline"
        className="mt-3 h-10 px-5 text-sm sm:w-auto"
      />
    </div>
  );
}
