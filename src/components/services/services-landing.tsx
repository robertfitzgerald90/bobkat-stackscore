import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { DemoAssessmentServicePanel } from "@/components/interactive-demo/demo-assessment-service-panel";
import { DemoCompactPanel } from "@/components/interactive-demo/demo-compact-panel";
import { DemoStrategicConsultingCta } from "@/components/interactive-demo/demo-strategic-consulting-cta";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { ServiceScreenshot } from "@/components/services/service-screenshot";
import { buttonVariants } from "@/components/ui/button";
import {
  CORE_SERVICES,
  FEATURED_PRODUCT,
  RESIDENTIAL_SERVICE,
  SERVICES_JOURNEY_KEYWORDS,
  type FeaturedProductItem,
  type ResidentialServiceItem,
  type ServiceCatalogItem,
} from "@/lib/services/catalog";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { SolutionViewTracker } from "@/components/analytics/solution-view-tracker";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { cn } from "@/lib/utils";

function ServiceKeywordBadge({ keyword }: { keyword: string }) {
  return (
    <p className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
      {keyword}
    </p>
  );
}

function ServiceHighlights({ highlights, title }: { highlights: string[]; title: string }) {
  return (
    <ul className="grid gap-3" aria-label={`${title} highlights`}>
      {highlights.map((highlight) => (
        <li key={highlight} className="flex items-start gap-3 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{highlight}</span>
        </li>
      ))}
    </ul>
  );
}

function JourneyKeywords() {
  return (
    <OfferReveal delayMs={150} className="mt-10 w-full max-w-2xl">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        {SERVICES_JOURNEY_KEYWORDS.map((keyword, index) => (
          <div key={keyword} className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <ServiceKeywordBadge keyword={keyword} />
            {index < SERVICES_JOURNEY_KEYWORDS.length - 1 ? (
              <ArrowDown className="h-4 w-4 shrink-0 text-primary/60 sm:hidden" aria-hidden />
            ) : null}
            {index < SERVICES_JOURNEY_KEYWORDS.length - 1 ? (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-primary/60 sm:block" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </OfferReveal>
  );
}

function FeaturedProductSection({ product }: { product: FeaturedProductItem }) {
  const Icon = product.icon;

  return (
    <section
      id={product.id}
      className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader
          eyebrow="Featured Product"
          title="Start by understanding your technology"
          description="Our flagship assessment is the recommended first step for every new client."
        />

        <OfferReveal>
          <SolutionViewTracker
            solutionId={product.id}
            solutionTitle={product.title}
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[0.08] via-card to-card p-4 shadow-md sm:p-6 lg:p-8"
          >
            <ServiceScreenshot
              src={product.image.src}
              alt={product.image.alt}
              size="featured"
              className="mb-8"
            />

            <div className="space-y-6">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-primary">{product.price}</p>
                </div>
              </div>

              <p className="max-w-4xl text-base leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <ServiceHighlights highlights={product.highlights} title={product.title} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <ServicesCtaLink
                  cta={product.primaryCta}
                  label={product.primaryCtaLabel}
                  className="h-11 w-full px-6 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
                  serviceId={product.id}
                  placement="featured_product_primary"
                />
                <ServicesCtaLink
                  cta={product.secondaryCta}
                  label={product.secondaryCtaLabel}
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  variant="outline"
                  serviceId={product.id}
                  placement="featured_product_secondary"
                />
              </div>

              <DemoAssessmentServicePanel />
            </div>
          </SolutionViewTracker>
        </OfferReveal>
      </div>
    </section>
  );
}

function ServiceSection({ service }: { service: ServiceCatalogItem }) {
  const Icon = service.icon;
  const imageFirst = service.imagePosition === "left";

  return (
    <OfferReveal>
      <SolutionViewTracker
        solutionId={service.id}
        solutionTitle={service.title}
        id={service.id}
        className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 lg:p-8"
      >
        <div
          className={cn(
            "grid items-center gap-8 lg:gap-10",
            imageFirst ? "lg:grid-cols-[1.12fr_1fr]" : "lg:grid-cols-[1fr_1.12fr]",
          )}
        >
          <div className={cn("space-y-6", imageFirst && "lg:order-2")}>
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 space-y-3">
                <ServiceKeywordBadge keyword={service.keyword} />
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-primary">{service.price}</p>
                </div>
              </div>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground">{service.description}</p>

            <ServiceHighlights highlights={service.highlights} title={service.title} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <ServicesCtaLink
                cta={service.primaryCta}
                label={service.primaryCtaLabel}
                className="h-11 w-full px-6 text-base sm:w-auto"
                serviceId={service.id}
                placement="service_section_primary"
              />
              {service.secondaryCta ? (
                <ServicesCtaLink
                  cta={service.secondaryCta}
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  variant="outline"
                  serviceId={service.id}
                  placement="service_section_secondary"
                />
              ) : null}
            </div>
            {service.id === "strategic-it-consulting" ? <DemoStrategicConsultingCta /> : null}
          </div>

          <ServiceScreenshot
            src={service.image.src}
            alt={service.image.alt}
            size="large"
            className={imageFirst ? "lg:order-1" : undefined}
          />
        </div>
      </SolutionViewTracker>
    </OfferReveal>
  );
}

function ResidentialSection({ service }: { service: ResidentialServiceItem }) {
  const Icon = service.icon;

  return (
    <section id={service.id} className="border-t border-border/60 bg-muted/20 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader
          eyebrow="Additional Offering"
          title="Support for home technology"
          description="Residential IT Support is available as a separate service for individuals and families."
        />

        <OfferReveal>
          <SolutionViewTracker
            solutionId={service.id}
            solutionTitle={service.title}
            className="scroll-mt-24 rounded-2xl border border-dashed border-border/70 bg-card/80 p-4 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.12fr] lg:gap-10">
              <div className="space-y-6">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-lg font-semibold text-primary">{service.price}</p>
                  </div>
                </div>

                <p className="text-base leading-relaxed text-muted-foreground">{service.description}</p>

                <ServiceHighlights highlights={service.highlights} title={service.title} />

                <ServicesCtaLink
                  cta={service.primaryCta}
                  label={service.primaryCtaLabel}
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  serviceId={service.id}
                  placement="residential_primary"
                />
              </div>

              <ServiceScreenshot src={service.image.src} alt={service.image.alt} size="large" />
            </div>
          </SolutionViewTracker>
        </OfferReveal>
      </div>
    </section>
  );
}

export function ServicesLanding() {
  return (
    <div className="min-h-screen scroll-smooth bg-background motion-reduce:scroll-auto">
      <PublicMarketingNav active="services" />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
          <OfferHeroBackground />

          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <OfferReveal>
              <p className="rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                Bobkat IT Services
              </p>
            </OfferReveal>

            <OfferReveal delayMs={60}>
              <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Technology should support your business—not slow it down.
              </h1>
            </OfferReveal>

            <OfferReveal delayMs={120}>
              <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6">
                Bobkat IT helps businesses understand their technology, operate securely, plan for
                the future, and grow through modern digital experiences—a complete approach built
                for security, reliability, and long-term success.
              </p>
            </OfferReveal>

            <JourneyKeywords />

            <OfferReveal delayMs={210} className="mt-10 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={`#${FEATURED_PRODUCT.id}`}
                className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full px-6 text-base sm:w-auto")}
              >
                Explore Services
                <ArrowDown className="ml-1.5 h-4 w-4" aria-hidden />
              </a>
              <TechnologySnapshotLink
                label={SERVICES_CTA_DESTINATIONS.snapshot.label}
                className="h-11 w-full px-6 text-base sm:w-auto"
                placement="services_hero"
              />
              <ServicesCtaLink
                cta="purchaseAssessment"
                label={SERVICES_CTA_DESTINATIONS.purchaseAssessment.label}
                className="h-11 w-full px-6 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
                placement="services_hero"
              />
            </OfferReveal>
          </div>
        </section>

        <FeaturedProductSection product={FEATURED_PRODUCT} />

        <section id="core-services" className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Core Services"
              title="Operate → Plan → Grow"
              description="Three focused service areas that help your organization run reliably, plan strategically, and grow digitally."
            />
            <div className="grid gap-6">
              {CORE_SERVICES.map((service) => (
                <ServiceSection key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        <ResidentialSection service={RESIDENTIAL_SERVICE} />

        <section className="px-4 pb-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <DemoCompactPanel
              heading="Not Ready to Reach Out Yet?"
              copy="Explore the StackScore client portal first and see how Bobkat IT turns technology findings into a clear improvement plan."
              placement="contact_page"
              returnTo="/services"
              demoLabel="Explore Interactive Demo"
            />
          </div>
        </section>

        <OfferCtaPanel
          headline="Build Technology That Supports Your Business"
          supportingText="Start with a Technology Maturity Assessment, then move from reliable operations to strategic planning and digital growth."
        >
          <TechnologySnapshotLink
            label="Start Free Snapshot"
            className="h-11 w-full px-8 text-base sm:w-auto"
            placement="services_footer"
          />
          <ServicesCtaLink
            cta="purchaseAssessment"
            label="Purchase Assessment"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
            placement="services_footer"
          />
          <ServicesCtaLink
            cta="generalConsultation"
            label="Schedule Consultation"
            className="h-11 w-full px-8 text-base sm:w-auto"
            placement="services_footer"
          />
          <Link
            href={`#${FEATURED_PRODUCT.id}`}
            className="mt-1 inline-flex items-center text-sm font-medium text-primary hover:text-link-hover"
          >
            Review all services
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </OfferCtaPanel>
      </main>
      <OfferFooter />
    </div>
  );
}
