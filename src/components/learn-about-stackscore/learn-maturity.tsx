import { TechnologyMaturityProfilePreview } from "@/components/product-previews/technology-maturity-profile-preview";
import { technologyMaturityProfileDemoData } from "@/lib/demo-data/technology-maturity-profile";
import { MARKETING_PANEL } from "@/lib/marketing/tokens";
import { LearnSectionShell } from "./learn-section-shell";

export function LearnMaturity() {
  return (
    <LearnSectionShell
      id="technology-maturity"
      eyebrow="Technology maturity"
      title="See where you stand — clearly"
      description="StackScore scores your environment across technology pillars and presents an executive-friendly maturity profile so leaders understand exposure, strengths, and improvement trajectory."
    >
      <div className={`${MARKETING_PANEL} p-4 sm:p-6`}>
        <TechnologyMaturityProfilePreview data={technologyMaturityProfileDemoData} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demonstration profile with sample scores — not live customer data.
        </p>
      </div>
      <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <li className="rounded-xl border border-border/60 bg-card/40 p-4">
          <p className="font-semibold text-foreground">Overall StackScore</p>
          <p className="mt-1 leading-relaxed">
            A single maturity score that summarizes technology health for executive conversations.
          </p>
        </li>
        <li className="rounded-xl border border-border/60 bg-card/40 p-4">
          <p className="font-semibold text-foreground">Pillar-level results</p>
          <p className="mt-1 leading-relaxed">
            Understand which areas — security, continuity, operations, and more — need attention first.
          </p>
        </li>
        <li className="rounded-xl border border-border/60 bg-card/40 p-4">
          <p className="font-semibold text-foreground">Business-ready framing</p>
          <p className="mt-1 leading-relaxed">
            Findings are presented for owners and leadership teams, not buried in technical jargon.
          </p>
        </li>
      </ul>
    </LearnSectionShell>
  );
}
