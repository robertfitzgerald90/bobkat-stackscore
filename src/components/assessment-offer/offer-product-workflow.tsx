"use client";

import { ArrowDown } from "lucide-react";
import { ASSESSMENT_OFFER_WORKFLOW_STEPS } from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";

export function OfferProductWorkflow() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-primary/[0.05] via-transparent to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <OfferReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How It Works</p>
          <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            From Assessment to Continuous Improvement
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            StackScore is designed as an ongoing technology operating rhythm—not a one-time report. Each
            phase builds on the last so your team always knows what to do next.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={80} className="mt-14 md:mt-16">
          <div className="hidden items-stretch justify-between gap-3 lg:flex">
            {ASSESSMENT_OFFER_WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex min-w-0 flex-1 items-stretch">
                  <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border/60 bg-card/70 px-4 py-5 text-center shadow-sm backdrop-blur-sm">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>

                  {index < ASSESSMENT_OFFER_WORKFLOW_STEPS.length - 1 ? (
                    <div className="flex w-8 shrink-0 items-center justify-center text-primary/35" aria-hidden>
                      <span className="text-lg">→</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <ol className="mx-auto max-w-md space-y-3 lg:hidden">
            {ASSESSMENT_OFFER_WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <li key={step.id}>
                  <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                          {step.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {index < ASSESSMENT_OFFER_WORKFLOW_STEPS.length - 1 ? (
                    <div className="flex justify-center py-1 text-primary/40" aria-hidden>
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </OfferReveal>
      </div>
    </section>
  );
}
