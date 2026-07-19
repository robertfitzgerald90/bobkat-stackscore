import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";

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
        returnTo="/services#strategic-it-consulting"
        variant="outline"
        className="mt-3 h-10 px-5 text-sm sm:w-auto"
      />
    </div>
  );
}
