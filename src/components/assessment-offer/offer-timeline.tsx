import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { OFFER_TIMELINE } from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";

export function OfferTimeline() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferReveal className="mb-10 text-center md:mb-14">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            What happens next
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            A clear path from purchase to strategy
          </h2>
        </OfferReveal>

        <div
          role="list"
          className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-between"
        >
          {OFFER_TIMELINE.map((step, index) => (
            <Fragment key={step.title}>
              <OfferReveal delayMs={index * 70} className="w-full lg:flex-1 lg:min-w-0">
                <div role="listitem" className="flex flex-col items-center px-2 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary shadow-sm">
                    {index + 1}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </OfferReveal>
              {index < OFFER_TIMELINE.length - 1 ? (
                <div
                  className="flex shrink-0 items-center justify-center py-3 text-muted-foreground/50 lg:px-1 lg:py-0 lg:pt-9"
                  aria-hidden
                >
                  <ChevronDown className="h-5 w-5 lg:hidden" />
                  <ChevronRight className="hidden h-4 w-4 lg:block" />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
