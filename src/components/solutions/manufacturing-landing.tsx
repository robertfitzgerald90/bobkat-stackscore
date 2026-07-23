import Image from "next/image";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  DatabaseBackup,
  Eye,
  Factory,
  Headphones,
  Link2,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { MARKETING_SECTION_ALT } from "@/lib/marketing/tokens";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { publicAssetUrl } from "@/lib/branding/assets";

const MANUFACTURING_IMAGES = {
  hero: {
    src: publicAssetUrl("/solutions/manufacturing/Manufacturing Banner Image.png"),
    alt: "Bobkat Manufacturing technology solution for industrial operations",
  },
  benefits: {
    src: publicAssetUrl("/solutions/manufacturing/CTA Cards Manufacturing.png"),
    alt: "Four benefits of Bobkat Manufacturing including operational reliability, IT and OT integration, complete visibility, and business continuity",
  },
  process: {
    src: publicAssetUrl("/solutions/manufacturing/Our Process Manufacturing.png"),
    alt: "Bobkat IT four-step Manufacturing process from technology assessment through ongoing support",
  },
} as const;

const benefits = [
  {
    title: "Operational Reliability",
    description:
      "Production depends on technology that performs consistently. Manufacturing is designed to maximize uptime through resilient infrastructure, proactive monitoring, and standardized deployments.",
    icon: Factory,
  },
  {
    title: "IT + OT Integration",
    description:
      "Modern manufacturing depends on secure communication between business systems and operational technology. We help connect these environments while maintaining security, reliability, and visibility.",
    icon: Link2,
  },
  {
    title: "Complete Visibility",
    description:
      "You cannot improve what you cannot see. From infrastructure and servers to network equipment and operational systems, Manufacturing provides centralized monitoring and actionable insights.",
    icon: Eye,
  },
  {
    title: "Built for Business Continuity",
    description:
      "Manufacturing environments require resilience. Our standardized approach includes secure backups, disaster recovery planning, documentation, and infrastructure designed to minimize operational disruption.",
    icon: DatabaseBackup,
  },
];

const processSteps = [
  {
    title: "Technology Assessment",
    description:
      "We evaluate IT and OT environments, identify operational risks and compliance gaps, and prioritize initiatives by impact.",
    icon: ClipboardCheck,
  },
  {
    title: "Solution Design",
    description:
      "We design secure IT and OT architecture, network segmentation, recovery plans, and practical standards aligned with operational goals.",
    icon: Network,
  },
  {
    title: "Deployment",
    description:
      "We implement infrastructure and configurations, harden systems, validate performance, and minimize disruption to operations.",
    icon: ShieldCheck,
  },
  {
    title: "Ongoing Support",
    description:
      "We monitor, maintain, patch, report, and optimize the environment so production teams can keep moving.",
    icon: Headphones,
  },
];

const qualificationPoints = [
  "Manufacturing facilities",
  "Warehouses & distribution centers",
  "Industrial operations",
  "Production environments",
  "Multiple buildings or campuses",
  "Mission-critical networking",
  "Operational technology environments",
  "Business continuity requirements",
];

function IconCard({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <OfferReveal delayMs={index * 45}>
      <div className="h-full rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </OfferReveal>
  );
}

export function ManufacturingLanding() {
  return (
    <PublicPageShell>
      <PublicMarketingNav active="home" />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 md:pb-28 md:pt-16 lg:pb-32 lg:pt-20">
          <OfferHeroBackground />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="text-center lg:text-left">
              <OfferReveal>
                <p className="inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                  Bobkat Manufacturing
                </p>
              </OfferReveal>

              <OfferReveal delayMs={60}>
                <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  Where Information Technology Meets Operations
                </h1>
              </OfferReveal>

              <OfferReveal delayMs={120}>
                <div className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6 lg:mx-0">
                  <p className="font-medium text-foreground">
                    Operational technology. Industrial security. Enterprise-inspired reliability.
                  </p>
                  <p className="mt-4">
                    Built for manufacturers, warehouses, and industrial operations that require
                    secure infrastructure, resilient networking, and technology designed to keep
                    production moving.
                  </p>
                </div>
              </OfferReveal>

              <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row lg:justify-start">
                <ServicesCtaLink
                  cta="assessmentInvitation"
                  label="Start Your Technology Assessment"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="manufacturing_hero"
                />
                <ServicesCtaLink
                  cta="generalConsultation"
                  label="Schedule Consultation"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="manufacturing_hero"
                  variant="outline"
                />
              </OfferReveal>
            </div>

            <OfferReveal delayMs={140}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-2 shadow-md sm:p-3">
                <Image
                  src={MANUFACTURING_IMAGES.hero.src}
                  alt={MANUFACTURING_IMAGES.hero.alt}
                  width={1280}
                  height={640}
                  priority
                  sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 60vw, 100vw"
                  className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" aria-hidden />
              </div>
            </OfferReveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <OfferReveal>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Solution Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                Everything Your Business Needs. Nothing It Doesn&apos;t.
              </h2>
            </OfferReveal>
            <OfferReveal delayMs={80}>
              <div className="mx-auto mt-6 grid gap-4 text-left text-base leading-relaxed text-muted-foreground">
                <p>
                  Bobkat Manufacturing is designed for organizations where technology directly
                  supports production, safety, and operational efficiency.
                </p>
                <p>
                  Instead of treating IT and operational technology as separate environments,
                  Manufacturing brings them together through secure infrastructure, industrial
                  networking, proactive monitoring, documentation, and business continuity planning.
                </p>
                <p>
                  Whether you&apos;re modernizing aging infrastructure, improving plant visibility,
                  expanding production, or reducing operational risk, Bobkat Manufacturing provides
                  a standardized technology foundation built for dependable operations.
                </p>
              </div>
            </OfferReveal>
          </div>
        </section>

        <section className={MARKETING_SECTION_ALT}>
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Core Benefits"
              title="What You'll Experience"
              description="Manufacturing brings operational reliability, IT and OT integration, visibility, and continuity into one standardized solution."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={MANUFACTURING_IMAGES.benefits.src}
                  alt={MANUFACTURING_IMAGES.benefits.alt}
                  width={1024}
                  height={512}
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </OfferReveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <IconCard key={benefit.title} {...benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-5xl">
            <OfferReveal>
              <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-transparent p-8 shadow-sm sm:p-10 md:p-12">
                <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden />
                <div className="relative max-w-3xl">
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">
                    Why Bobkat Manufacturing?
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Manufacturing environments cannot afford unnecessary downtime.
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Bobkat Manufacturing combines secure infrastructure, industrial networking,
                    operational visibility, proactive monitoring, and business continuity into one
                    standardized solution designed to keep production productive, protected, and
                    prepared for the future.
                  </p>
                </div>
              </div>
            </OfferReveal>
          </div>
        </section>

        <section className={MARKETING_SECTION_ALT}>
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Our Process"
              title="Our Process"
              description="Every Bobkat Manufacturing engagement follows a structured methodology designed to minimize risk, improve operational reliability, and deliver technology that supports long-term production goals."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={MANUFACTURING_IMAGES.process.src}
                  alt={MANUFACTURING_IMAGES.process.alt}
                  width={1024}
                  height={512}
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </OfferReveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <IconCard key={step.title} {...step} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Qualification"
              title="Is Bobkat Manufacturing Right for You?"
              description="Manufacturing is designed for organizations where technology directly supports operations, production, logistics, and business continuity."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {qualificationPoints.map((point, index) => (
                <OfferReveal key={point} delayMs={index * 35}>
                  <div className="flex h-full items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p className="text-sm leading-relaxed text-foreground">{point}</p>
                  </div>
                </OfferReveal>
              ))}
              <OfferReveal delayMs={qualificationPoints.length * 35}>
                <div className="flex h-full items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-4 shadow-sm">
                  <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-foreground">
                    Not sure yet? The assessment clarifies operational risks and priorities before
                    you commit to a solution.
                  </p>
                </div>
              </OfferReveal>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl">
            <OfferReveal>
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Start With Clarity
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Let&apos;s Understand Your Technology First.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                  Every Bobkat Manufacturing engagement begins with understanding your current
                  technology environment. The Technology Maturity Assessment identifies operational
                  risks, infrastructure opportunities, and provides a strategic roadmap designed to
                  improve reliability, security, and long-term operational success.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <ServicesCtaLink
                    cta="assessmentInvitation"
                    label="Start My Technology Assessment"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="manufacturing_final"
                  />
                  <ServicesCtaLink
                    cta="generalConsultation"
                    label="Schedule Consultation"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="manufacturing_final"
                    variant="outline"
                  />
                  <ServicesCtaLink
                    cta="solutionsLanding"
                    label="Explore All Solutions"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="manufacturing_final"
                    variant="outline"
                  />
                </div>
              </div>
            </OfferReveal>
          </div>
        </section>
      </main>
      <OfferFooter />
    </PublicPageShell>
  );
}
