import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { ASSESSMENT_DEMO_HIGHLIGHTS } from "@/lib/interactive-demo/content";

export function DemoAssessmentServicePanel() {
  return (
    <OfferReveal>
      <aside className="mt-8 rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Interactive Demo
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          See Exactly What You Receive
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Explore a sample StackScore client portal before purchasing your Technology Maturity
          Assessment. Review example scores, recommendations, projects, roadmaps, investment
          phases, and strategic planning tools using realistic demonstration data.
        </p>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2" aria-label="Demo highlights">
          {ASSESSMENT_DEMO_HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <InteractiveDemoButton
            label="Explore Demo"
            placement="services_assessment_panel"
            section="scores"
            returnTo="/services#technology-maturity-assessment"
            variant="outline"
            className="h-10 px-5 text-sm sm:w-auto"
          />
          <ServicesCtaLink
            cta="purchaseAssessment"
            label="Purchase Assessment"
            className="h-10 px-5 text-sm sm:w-auto"
            placement="services_assessment_panel_purchase"
          />
        </div>
      </aside>
    </OfferReveal>
  );
}
