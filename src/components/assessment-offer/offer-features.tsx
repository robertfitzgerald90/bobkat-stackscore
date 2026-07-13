import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { OFFER_FEATURES } from "@/lib/assessment-offer/content";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
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
              Included Consultation
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              60-Minute Results Review
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              Walk through your assessment results with a Bobkat IT consultant. We&apos;ll explain
              your maturity score, answer questions, prioritize recommendations, and align on the
              most important next steps for your business.
            </p>
            <div className="mt-6">
              <ServicesCtaLink
                cta="purchaseAssessment"
                label="Schedule Your Review"
                className="h-11 w-full px-6 text-base sm:w-auto"
                placement="assessment_offer_review_session"
              />
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
      eyebrow="What's included"
      title="Everything you need to move from insight to action"
      features={OFFER_FEATURES}
      columns={3}
      afterContent={<ReviewSessionPanel />}
    />
  );
}
