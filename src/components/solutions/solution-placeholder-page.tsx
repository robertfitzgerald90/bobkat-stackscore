import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SolutionPlaceholderPageProps = {
  title: string;
  description: string;
};

export function SolutionPlaceholderPage({ title, description }: SolutionPlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicMarketingNav active="solutions" />
      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <OfferHeroBackground />
          <div className="mx-auto max-w-3xl text-center">
            <OfferReveal>
              <p className="inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                Bobkat IT Solutions
              </p>
            </OfferReveal>
            <OfferReveal delayMs={60}>
              <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {title}
              </h1>
            </OfferReveal>
            <OfferReveal delayMs={120}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            </OfferReveal>
            <OfferReveal delayMs={180} className="mt-8">
              <Link
                href="/solutions"
                className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6 text-base")}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
                Back to Solutions
              </Link>
            </OfferReveal>
          </div>
        </section>

        <OfferCtaPanel
          headline="Dedicated Solution Page Coming Soon"
          supportingText="This route is ready for the future detailed solution page. For now, use the Solutions hub to compare Bobkat IT solution families."
        >
          <Link href="/solutions" className={cn(buttonVariants(), "h-11 w-full px-8 text-base sm:w-auto")}>
            View All Solutions
          </Link>
        </OfferCtaPanel>
      </main>
      <OfferFooter />
    </div>
  );
}
