import Link from "next/link";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { buttonVariants } from "@/components/ui/button";
import { INVITATION_BENEFITS } from "@/lib/assessment-invitation/content";
import { cn } from "@/lib/utils";

export function InvitationWhySection() {
  return (
    <section id="why-stackscore" className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader
          eyebrow="Why organizations use StackScore"
          title="Technology clarity for business leaders"
          description="Built for owners and leadership teams who need practical insight — not another IT audit that sits in a drawer."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {INVITATION_BENEFITS.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <OfferReveal key={feature.title} delayMs={index * 50}>
                <CornerBrackets corners="two" className="h-full">
                  <div className="group h-full rounded-[2px] border border-border/60 bg-card p-6 transition-colors duration-300 hover:border-primary/20">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CornerBrackets>
              </OfferReveal>
            );
          })}
        </div>

        <OfferReveal delayMs={180} className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/assessment-offer"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6 text-base")}
          >
            Learn About StackScore
          </Link>
        </OfferReveal>
      </div>
    </section>
  );
}
