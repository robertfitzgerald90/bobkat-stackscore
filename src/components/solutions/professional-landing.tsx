import Image from "next/image";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  MonitorCheck,
  Network,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { ServicesCtaLink } from "@/components/services/services-cta-link";

const PROFESSIONAL_IMAGES = {
  hero: {
    src: "/solutions/professional/Professional Banner Image.png",
    alt: "Bobkat Professional strategic technology solution for growing businesses",
  },
  benefits: {
    src: "/solutions/professional/CTA Cards Professional.png",
    alt: "Four benefits of Bobkat Professional including strategic partnership, advanced security, centralized management, and growth",
  },
  process: {
    src: "/solutions/professional/Our Process Professional.png",
    alt: "Bobkat IT four-step Professional process from technology assessment through ongoing support",
  },
} as const;

const benefits = [
  {
    title: "Strategic IT Partnership",
    description:
      "Technology should support business strategy, not simply react to problems. Professional provides strategic planning, technology roadmaps, budgeting guidance, and long-term IT leadership.",
    icon: Users,
  },
  {
    title: "Advanced Security",
    description:
      "Protect users, identities, devices, and business data with enterprise-inspired security designed for growing organizations.",
    icon: ShieldCheck,
  },
  {
    title: "Centralized Management",
    description:
      "Gain complete visibility into your technology environment through monitoring, automation, reporting, documentation, and lifecycle management.",
    icon: MonitorCheck,
  },
  {
    title: "Built for Growth",
    description:
      "As your organization expands, your technology should scale with it. Professional provides a foundation designed for future users, locations, and business initiatives.",
    icon: TrendingUp,
  },
];

const processSteps = [
  {
    title: "Technology Assessment",
    description:
      "We evaluate the current environment, identify risks and opportunities, and prioritize initiatives by business impact.",
    icon: ClipboardCheck,
  },
  {
    title: "Solution Design",
    description:
      "We align technology with business goals, design security and growth strategies, and create a clear implementation roadmap.",
    icon: Network,
  },
  {
    title: "Deployment",
    description:
      "We implement the solution using documented standards, secure configuration, validation, and clear communication.",
    icon: ShieldCheck,
  },
  {
    title: "Ongoing Support",
    description:
      "We monitor, optimize, report, and continuously improve your environment so leadership has visibility and confidence.",
    icon: Headphones,
  },
];

const qualificationPoints = [
  "Approximately 20-75 employees",
  "Growing organization",
  "Multiple departments or locations",
  "Increased security requirements",
  "Microsoft 365 optimization",
  "Technology budgeting and planning",
  "Executive reporting",
  "Long-term IT strategy",
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

export function ProfessionalLanding() {
  return (
    <div className="min-h-screen scroll-smooth bg-background motion-reduce:scroll-auto">
      <PublicMarketingNav active="solutions" />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 md:pb-28 md:pt-16 lg:pb-32 lg:pt-20">
          <OfferHeroBackground />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="text-center lg:text-left">
              <OfferReveal>
                <p className="inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                  Bobkat Professional
                </p>
              </OfferReveal>

              <OfferReveal delayMs={60}>
                <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  Technology That Grows With Your Business
                </h1>
              </OfferReveal>

              <OfferReveal delayMs={120}>
                <div className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6 lg:mx-0">
                  <p className="font-medium text-foreground">
                    Strategic technology. Advanced security. Enterprise-inspired management.
                  </p>
                  <p className="mt-4">
                    Built for organizations with approximately 20-75 employees that require
                    stronger security, centralized technology management, and strategic IT planning.
                  </p>
                </div>
              </OfferReveal>

              <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row lg:justify-start">
                <ServicesCtaLink
                  cta="assessmentInvitation"
                  label="Start Your Technology Assessment"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="professional_hero"
                />
                <ServicesCtaLink
                  cta="generalConsultation"
                  label="Schedule Consultation"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="professional_hero"
                  variant="outline"
                />
              </OfferReveal>
            </div>

            <OfferReveal delayMs={140}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-2 shadow-md sm:p-3">
                <Image
                  src={PROFESSIONAL_IMAGES.hero.src}
                  alt={PROFESSIONAL_IMAGES.hero.alt}
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
                  Bobkat Professional is designed for organizations that need more than dependable
                  technology; they need strategic technology leadership.
                </p>
                <p>
                  Rather than simply maintaining systems, Professional aligns technology with
                  business goals through centralized management, advanced security, automation, and
                  long-term planning.
                </p>
                <p>
                  Whether your organization is expanding locations, adding employees, or preparing
                  for future growth, Professional provides the structure and visibility to move
                  forward with confidence.
                </p>
              </div>
            </OfferReveal>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Core Benefits"
              title="What You'll Experience"
              description="Professional connects strategy, security, visibility, and growth planning into one standardized technology solution."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={PROFESSIONAL_IMAGES.benefits.src}
                  alt={PROFESSIONAL_IMAGES.benefits.alt}
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
                    Why Bobkat Professional?
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Growing businesses need more than IT support.
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    They need a trusted technology partner that understands how technology drives
                    productivity, security, and long-term business success.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Bobkat Professional combines strategic planning, enterprise-grade security,
                    centralized management, automation, and proactive support into one standardized
                    solution designed to help organizations scale confidently.
                  </p>
                </div>
              </div>
            </OfferReveal>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Our Process"
              title="Our Process"
              description="Every Bobkat Professional engagement follows a structured methodology designed to align technology with business objectives while minimizing operational risk."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={PROFESSIONAL_IMAGES.process.src}
                  alt={PROFESSIONAL_IMAGES.process.alt}
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
              title="Is Bobkat Professional Right for You?"
              description="Professional is ideal for growing organizations that require stronger security, centralized technology management, and strategic planning."
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
                    Not sure yet? The assessment clarifies priorities before you commit to a
                    solution.
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
                  Every Bobkat Professional engagement begins with understanding your current
                  environment. The Technology Maturity Assessment identifies strengths, uncovers
                  opportunities, and provides a strategic roadmap tailored to your business.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <ServicesCtaLink
                    cta="assessmentInvitation"
                    label="Start My Technology Assessment"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="professional_final"
                  />
                  <ServicesCtaLink
                    cta="generalConsultation"
                    label="Schedule Consultation"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="professional_final"
                    variant="outline"
                  />
                  <ServicesCtaLink
                    cta="solutionsLanding"
                    label="Explore All Solutions"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="professional_final"
                    variant="outline"
                  />
                </div>
              </div>
            </OfferReveal>
          </div>
        </section>
      </main>
      <OfferFooter />
    </div>
  );
}
