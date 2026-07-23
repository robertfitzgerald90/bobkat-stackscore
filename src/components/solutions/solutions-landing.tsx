import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { DemoShowcasePanel } from "@/components/interactive-demo/demo-showcase-panel";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { buttonVariants } from "@/components/ui/button";
import {
  SOLUTION_FAMILIES,
  SOLUTION_METHOD_STEPS,
  SOLUTIONS_HERO_IMAGE,
  type SolutionFamily,
} from "@/lib/solutions/content";
import { cn } from "@/lib/utils";
import {
  MARKETING_BADGE,
  MARKETING_FEATURE_CARD,
  MARKETING_HERO_TITLE,
  MARKETING_ICON_WELL_LG,
  MARKETING_ICON_WELL_MD,
  MARKETING_SECTION,
  MARKETING_SECTION_ALT,
} from "@/lib/marketing/tokens";

function SolutionFamilyCard({ solution, index }: { solution: SolutionFamily; index: number }) {
  const Icon = solution.icon;

  return (
    <OfferReveal delayMs={index * 70}>
      <Link
        href={solution.href}
        className="group block h-full overflow-hidden marketing-feature-card transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="relative overflow-hidden border-b border-border/60 bg-muted/30">
          <Image
            src={solution.image.src}
            alt={solution.image.alt}
            width={1024}
            height={682}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent opacity-80" aria-hidden />
        </div>

        <div className="flex h-full flex-col p-6">
          <div className={cn(MARKETING_ICON_WELL_LG, "mb-5 text-primary transition-colors group-hover:bg-primary/15")}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {solution.title}
          </h3>
          <p className="mt-3 text-base font-medium text-primary">{solution.tagline}</p>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
            {solution.description}
          </p>
          <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary transition-colors group-hover:text-link-hover">
            {solution.ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </OfferReveal>
  );
}

function MethodStepCard({ step, index }: { step: (typeof SOLUTION_METHOD_STEPS)[number]; index: number }) {
  const Icon = step.icon;

  return (
    <OfferReveal delayMs={index * 50}>
      <div className={cn(MARKETING_FEATURE_CARD, "p-6")}>
        <div className={cn(MARKETING_ICON_WELL_MD, "mb-4 text-primary")}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </OfferReveal>
  );
}

export function SolutionsLanding() {
  return (
    <PublicPageShell>
      <PublicMarketingNav active="solutions" />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
          <OfferHeroBackground />

          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <div className="text-center lg:text-left">
              <OfferReveal>
                <p className={MARKETING_BADGE}>
                  Bobkat IT Solutions
                </p>
              </OfferReveal>

              <OfferReveal delayMs={60}>
                <h1 className={cn(MARKETING_HERO_TITLE, "mt-8 lg:text-left")}>
                  Enterprise Thinking.
                  <br />
                  <span className="marketing-text-gradient">Right-Sized</span> for Your Business.
                </h1>
              </OfferReveal>

              <OfferReveal delayMs={120}>
                <div className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6 lg:mx-0">
                  <p>Every organization has different technology needs.</p>
                  <p className="mt-4">
                    Bobkat IT offers three standardized technology solutions designed to provide
                    secure, reliable, and scalable technology built around your business.
                  </p>
                </div>
              </OfferReveal>

              <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 lg:items-start">
                <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:justify-start">
                  <ServicesCtaLink
                    cta="purchaseAssessment"
                    label="Get Your Technology Assessment"
                    className="h-11 w-full px-6 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
                    placement="homepage_hero"
                  />
                  <InteractiveDemoButton
                    label="Explore the Interactive Demo"
                    placement="homepage_hero"
                    returnTo="/solutions"
                    variant="outline"
                    className="h-11 w-full px-6 text-base sm:w-auto"
                  />
                </div>
                <p className="max-w-md text-sm text-muted-foreground lg:text-left">
                  Explore a sample StackScore client portal before purchasing your assessment.
                </p>
                <a
                  href="#solution-families"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-full px-4 text-sm sm:w-auto",
                  )}
                >
                  Choose Your Solution
                  <ArrowDown className="ml-1.5 h-4 w-4" aria-hidden />
                </a>
              </OfferReveal>
            </div>

            <OfferReveal delayMs={140}>
              <div className="group relative aspect-[16/10] overflow-hidden marketing-screenshot marketing-screenshot-hero bg-[#020b18]">
                <Image
                  src={SOLUTIONS_HERO_IMAGE.src}
                  alt={SOLUTIONS_HERO_IMAGE.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" aria-hidden />
              </div>
            </OfferReveal>
          </div>
        </section>

        <section id="solution-families" className={MARKETING_SECTION_ALT}>
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Choose Your Solution"
              title="Technology that fits your business"
              description="Every business deserves technology that fits its size, goals, and operational requirements. Whether you're building your first secure office, growing into a more advanced technology environment, or supporting mission-critical manufacturing operations, Bobkat IT has a standardized solution designed for you."
            />
            <div className="grid gap-6 lg:grid-cols-3">
              {SOLUTION_FAMILIES.map((solution, index) => (
                <SolutionFamilyCard key={solution.id} solution={solution} index={index} />
              ))}
            </div>
          </div>
        </section>

        <DemoShowcasePanel placement="homepage_demo_panel" returnTo="/solutions" />

        <section className={MARKETING_SECTION}>
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Three Solutions. One Standard."
              title="Three Solutions. One Standard."
              description="Every Bobkat IT solution follows the same proven methodology. The technology may change based on your business, but our commitment to security, documentation, standardization, and long-term partnership never does."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SOLUTION_METHOD_STEPS.map((step, index) => (
                <MethodStepCard key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>
        </section>

        <OfferCtaPanel
          headline="Not Sure Which Solution Is Right For You?"
          supportingText="Start with a Technology Maturity Assessment and receive personalized recommendations based on your business, infrastructure, and goals."
        >
          <TechnologySnapshotLink
            label="Start Free Technology Snapshot"
            className="h-11 w-full px-8 text-base sm:w-auto"
            placement="solutions_final"
          />
          <ServicesCtaLink
            cta="purchaseAssessment"
            label="Purchase Assessment"
            className="h-11 w-full px-8 text-base"
            placement="solutions_final"
          />
          <ServicesCtaLink
            cta="generalConsultation"
            label="Schedule Consultation"
            className="h-11 w-full px-8 text-base"
            placement="solutions_final"
          />
        </OfferCtaPanel>
      </main>
      <OfferFooter />
    </PublicPageShell>
  );
}
