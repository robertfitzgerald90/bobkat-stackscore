import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { buttonVariants } from "@/components/ui/button";
import {
  SERVICES_CATALOG,
  SERVICES_PRICING,
  type ServiceCatalogItem,
  type ServicePricingItem,
} from "@/lib/services/catalog";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { SolutionViewTracker } from "@/components/analytics/solution-view-tracker";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { cn } from "@/lib/utils";

function ServicesPrimaryCta({
  service,
  className,
}: {
  service: ServiceCatalogItem;
  className?: string;
}) {
  return (
    <ServicesCtaLink
      cta={service.primaryCta}
      label={service.primaryCtaLabel}
      className={className}
      serviceId={service.id}
      placement="service_section_primary"
    />
  );
}

function ServiceOverviewCard({ service, index }: { service: ServiceCatalogItem; index: number }) {
  const Icon = service.icon;

  return (
    <OfferReveal delayMs={index * 45}>
      <a
        href={`#${service.id}`}
        className="group block h-full rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{service.title}</h3>
            <p className="mt-1 text-sm font-medium text-primary">{service.price}</p>
          </div>
        </div>
      </a>
    </OfferReveal>
  );
}

function ServiceSection({ service }: { service: ServiceCatalogItem }) {
  const Icon = service.icon;
  const imageFirst = service.imagePosition === "left";
  const imageFit = service.image.fit ?? "cover";

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
            "grid items-center gap-8 lg:grid-cols-[1fr_0.92fr] lg:gap-10",
            imageFirst && "lg:grid-cols-[0.92fr_1fr]",
          )}
        >
          <div className={cn("space-y-6", imageFirst && "lg:order-2")}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {service.eyebrow}
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{service.price}</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {service.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>

            <ul className="grid gap-3" aria-label={`${service.title} highlights`}>
              {service.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ServicesPrimaryCta service={service} className="h-11 w-full px-6 text-base sm:w-auto" />
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
          </div>

          <div
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm",
              imageFirst && "lg:order-1",
            )}
          >
            <Image
              src={service.image.src}
              alt={service.image.alt}
              width={1024}
              height={682}
              sizes="(min-width: 1024px) 44vw, 100vw"
              className={cn(
                "aspect-[3/2] h-auto w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                imageFit === "contain" ? "object-contain p-3 sm:p-4" : "object-cover",
              )}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-70" aria-hidden />
          </div>
        </div>
      </SolutionViewTracker>
    </OfferReveal>
  );
}

function PricingCard({ item, index }: { item: ServicePricingItem; index: number }) {
  const isHighlighted = Boolean(item.badge);

  return (
    <OfferReveal delayMs={index * 45}>
      <div
        className={cn(
          "flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none",
          isHighlighted
            ? "border-primary/25 bg-gradient-to-b from-primary/[0.08] to-card"
            : "border-border/60 hover:border-primary/20",
        )}
      >
        {item.badge ? (
          <p className="mb-4 w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
            {item.badge}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
        <p className="mt-4 text-2xl font-semibold text-primary">{item.price}</p>
        {item.frequency ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">{item.frequency}</p>
        ) : null}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <ServicesCtaLink
          cta={item.cta}
          label={item.ctaLabel}
          className="mt-6 h-10 w-full px-4"
          placement="services_pricing"
          variant={isHighlighted ? "default" : "outline"}
        />
      </div>
    </OfferReveal>
  );
}

function PositioningCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <OfferReveal>
      <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </OfferReveal>
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
                Technology Designed Around Your Business
              </h1>
            </OfferReveal>

            <OfferReveal delayMs={120}>
              <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6">
                From strategic assessments and managed IT to infrastructure, cloud projects, backup,
                disaster recovery, and residential support, Bobkat IT delivers practical technology
                solutions built for security, reliability, and long-term growth.
              </p>
            </OfferReveal>

            <OfferReveal delayMs={180} className="mt-8 flex w-full max-w-xl flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
              <a
                href="#services-catalog"
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

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Services Overview"
              title="Choose the right starting point"
              description="Each service connects to the right next step, from public assessment details to a focused consultation with Bobkat IT."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES_CATALOG.map((service, index) => (
                <ServiceOverviewCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section id="services-catalog" className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Interactive Services Catalog"
              title="Modern technology services for growing teams"
              description="Browse Bobkat IT services, compare entry points, and take the next step that fits your organization."
            />
            <div className="grid gap-6">
              {SERVICES_CATALOG.map((service) => (
                <ServiceSection key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Assessment Positioning"
              title="Not Sure Where to Start?"
              description="Start small, purchase the full assessment, or talk through your goals with Bobkat IT."
            />
            <div className="grid gap-4 md:grid-cols-3">
              <PositioningCard
                title="Start Free Technology Snapshot"
                description="Answer a short set of questions and get an immediate high-level maturity view."
              >
                <TechnologySnapshotLink
                  label="Start Free Snapshot"
                  className="h-10 w-full px-4"
                  placement="services_positioning_snapshot"
                />
              </PositioningCard>
              <PositioningCard
                title="Purchase Comprehensive Assessment"
                description="Unlock executive reporting, risk analysis, and a strategic roadmap powered by StackScore."
              >
                <ServicesCtaLink cta="purchaseAssessment" label="Purchase Assessment" className="h-10 w-full px-4" placement="services_positioning_purchase" />
              </PositioningCard>
              <PositioningCard
                title="Schedule Consultation"
                description="Talk with Bobkat IT about managed services, projects, continuity planning, or home support."
              >
                <ServicesCtaLink cta="generalConsultation" className="h-10 w-full px-4" placement="services_positioning_consultation" />
              </PositioningCard>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Transparent Technology Pricing"
              title="Transparent Technology Pricing"
              description="Clear starting prices with no mystery. Every engagement is scoped around your environment, priorities, and business goals."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES_PRICING.map((item, index) => (
                <PricingCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        <OfferCtaPanel
          headline="Build Technology That Supports Your Business"
          supportingText="Move from scattered technology decisions to a clear path for security, reliability, and long-term growth."
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
            href="#services-catalog"
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
