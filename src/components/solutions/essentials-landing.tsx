import Image from "next/image";
import { CheckCircle2, ClipboardCheck, FileText, Headphones, Network, ShieldCheck, TrendingUp, Wifi, type LucideIcon } from "lucide-react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { ServicesCtaLink } from "@/components/services/services-cta-link";

const ESSENTIALS_IMAGES = {
  hero: {
    src: "/solutions/essentials/Essentials Banner Image.png",
    alt: "Bobkat Essentials secure technology solution for small businesses",
  },
  benefits: {
    src: "/solutions/essentials/CTA Cards - Essentials.png",
    alt: "Four benefits of Bobkat Essentials including reliability, security, proactive support, and scalability",
  },
  process: {
    src: "/solutions/essentials/The Process - Essentials.png",
    alt: "Bobkat IT four-step process from technology assessment through ongoing support",
  },
} as const;

const benefits = [
  {
    title: "Reliable Every Day",
    description:
      "Fast Wi-Fi, healthy computers, reliable Microsoft 365, and technology that works the way your business needs it to.",
    icon: Wifi,
  },
  {
    title: "Protected by Design",
    description:
      "Security is not added later. It is built into every deployment, from endpoint protection and secure networking to backups and identity safeguards.",
    icon: ShieldCheck,
  },
  {
    title: "Proactive Support",
    description:
      "We continuously monitor and maintain your environment to identify issues before they become downtime.",
    icon: Headphones,
  },
  {
    title: "Built to Grow",
    description:
      "As your business grows, your technology grows with it. No rebuilding. No starting over.",
    icon: TrendingUp,
  },
];

const processSteps = [
  {
    title: "Technology Assessment",
    description:
      "We evaluate the current environment, identify risks and gaps, and understand the needs of the business.",
    icon: ClipboardCheck,
  },
  {
    title: "Solution Design",
    description:
      "We design a practical technology plan aligned with the organization's goals, priorities, and budget.",
    icon: Network,
  },
  {
    title: "Deployment",
    description:
      "We implement the solution using documented standards, proven configurations, and clear communication.",
    icon: ShieldCheck,
  },
  {
    title: "Ongoing Support",
    description:
      "We monitor, maintain, support, and improve the environment over time.",
    icon: Headphones,
  },
];

const qualificationPoints = [
  "Approximately 5-20 employees",
  "Need dependable day-to-day IT support",
  "Want secure Wi-Fi, networking, Microsoft 365, and endpoint protection",
  "Prefer proactive maintenance instead of reactive troubleshooting",
  "Need backup, documentation, and long-term planning",
  "Want technology that can grow with the business",
  "Value clear communication and practical recommendations",
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

export function EssentialsLanding() {
  return (
    <div className="min-h-screen scroll-smooth bg-background motion-reduce:scroll-auto">
      <PublicMarketingNav active="solutions" />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
          <OfferHeroBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="text-center lg:text-left">
              <OfferReveal>
                <p className="inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                  Bobkat Essentials
                </p>
              </OfferReveal>

              <OfferReveal delayMs={60}>
                <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  Complete IT for Small Businesses
                </h1>
              </OfferReveal>

              <OfferReveal delayMs={120}>
                <div className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6 lg:mx-0">
                  <p className="font-medium text-foreground">
                    Reliable technology. Proactive support. Enterprise-inspired best practices.
                  </p>
                  <p className="mt-4">
                    Built for businesses with approximately 5-20 employees that need secure,
                    dependable technology without the complexity of an enterprise IT department.
                  </p>
                </div>
              </OfferReveal>

              <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row lg:justify-start">
                <ServicesCtaLink
                  cta="assessmentInvitation"
                  label="Start Your Technology Assessment"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="essentials_hero"
                />
                <ServicesCtaLink
                  cta="generalConsultation"
                  label="Schedule a Consultation"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  placement="essentials_hero"
                  variant="outline"
                />
              </OfferReveal>
            </div>

            <OfferReveal delayMs={140}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
                <Image
                  src={ESSENTIALS_IMAGES.hero.src}
                  alt={ESSENTIALS_IMAGES.hero.alt}
                  width={1280}
                  height={640}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="aspect-[2/1] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
                  Bobkat Essentials is a standardized technology platform designed specifically for
                  small businesses.
                </p>
                <p>
                  Instead of piecing together hardware, software, security, support, and backups
                  from multiple disconnected providers, Essentials brings the core components of a
                  healthy technology environment together into one reliable solution.
                </p>
                <p>
                  Whether a business is opening a new office, replacing aging equipment, improving
                  security, or simply tired of reacting to technology problems, Bobkat Essentials
                  provides a secure and manageable foundation designed to support daily operations
                  and future growth.
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
              description="Essentials brings the everyday technology foundation of your business into one manageable, secure, and documented solution."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={ESSENTIALS_IMAGES.benefits.src}
                  alt={ESSENTIALS_IMAGES.benefits.alt}
                  width={1024}
                  height={683}
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
                    Why Bobkat Essentials?
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Small businesses do not need enterprise complexity, but they deserve enterprise-level thinking.
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Most small businesses do not need more technology. They need the right
                    technology, implemented consistently and managed proactively.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Bobkat Essentials brings networking, productivity, cybersecurity, monitoring,
                    backups, documentation, and support together into one standardized solution that
                    keeps your business secure, reliable, and ready to grow.
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
              description="Every Bobkat Essentials engagement follows a clear, documented process designed to reduce uncertainty and create a technology environment that can be supported long-term."
            />
            <OfferReveal>
              <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <Image
                  src={ESSENTIALS_IMAGES.process.src}
                  alt={ESSENTIALS_IMAGES.process.alt}
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
              title="Is Bobkat Essentials Right for You?"
              description="Bobkat Essentials is designed for small businesses that want dependable technology, professional support, and a clear path forward without building an internal IT department."
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
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-foreground">
                    Not sure yet? The assessment clarifies fit before you commit to a solution.
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
                  Every Bobkat Essentials engagement begins with understanding your current
                  environment. The Technology Maturity Assessment identifies strengths, uncovers
                  risks, and provides a clear roadmap designed around your business, not a generic
                  checklist.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <ServicesCtaLink
                    cta="assessmentInvitation"
                    label="Start My Technology Assessment"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="essentials_final"
                  />
                  <ServicesCtaLink
                    cta="generalConsultation"
                    label="Schedule a Consultation"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="essentials_final"
                    variant="outline"
                  />
                  <ServicesCtaLink
                    cta="solutionsLanding"
                    label="Explore All Solutions"
                    className="h-11 w-full px-8 text-base sm:w-auto"
                    placement="essentials_final"
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
