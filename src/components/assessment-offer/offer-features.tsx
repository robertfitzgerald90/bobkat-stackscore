import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { OFFER_FEATURES } from "@/lib/assessment-offer/content";
import { OfferFeatureGrid } from "./offer-feature-grid";
import { OfferReveal } from "./offer-reveal";

const reviewSessionPoints = [
  "Review your StackScore results",
  "Clarify risks and opportunities",
  "Prioritize recommended actions",
  "Define practical next steps",
] as const;

function ReviewSessionPanel() {
  return (
    <OfferReveal delayMs={320}>
      <div className="mt-8 overflow-hidden rounded-2xl border border-primary/15 bg-[#061426] p-6 text-primary-foreground sm:p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CalendarCheck className="h-6 w-6" aria-hidden />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Included With Your Assessment
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              60-Minute Results Review
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              After your assessment is completed, meet with a Bobkat IT consultant to review your
              StackScore, clarify risks and opportunities, prioritize recommendations, and define
              practical next steps for your business.
            </p>
            <div className="mt-6">
              <AssessmentPurchaseButton
                label="Purchase Assessment — $1,500"
                className="h-11 w-full px-6 text-base sm:w-auto"
                source="offer_review_session"
              />
              <p className="mt-3 text-sm text-slate-400">
                Review scheduling becomes available after purchase and assessment completion.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <ul className="grid gap-3">
              {reviewSessionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </OfferReveal>
  );
}

export function OfferFeatures() {
  return (
    <OfferFeatureGrid
      id="assessment-inclusions"
      eyebrow="What's included"
      title="Everything you need to move from insight to action"
      features={OFFER_FEATURES}
      columns={3}
      sectionClassName="scroll-mt-24 bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24"
      afterContent={<ReviewSessionPanel />}
    />
  );
}
