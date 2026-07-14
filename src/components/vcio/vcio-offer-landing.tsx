import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LineChart,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { buttonVariants } from "@/components/ui/button";
import { VcioCheckoutButton } from "@/components/vcio/vcio-checkout-button";
import { cn } from "@/lib/utils";

const receiveItems = [
  "Quarterly Technology Reviews",
  "Technology Roadmap Management",
  "Technology Budget Planning",
  "Improvement Tracking",
  "Executive Reports",
  "Project Prioritization",
  "Vendor and Renewal Planning",
  "Annual Technology Reassessment",
  "Ongoing StackScore Client Portal Access",
  "Direct Access to a Strategic IT Advisor",
  "Guidance on technology purchases and projects",
  "Coordination between business priorities and technology investments",
] as const;

const audienceItems = [
  "Businesses without a full-time CIO",
  "Organizations that need a documented technology strategy",
  "Companies managing multiple technology projects or vendors",
  "Businesses that want executive-level guidance without hiring a full-time technology leader",
  "Existing StackScore assessment clients that need help executing their roadmap",
  "Organizations that want proactive planning instead of reactive technology spending",
] as const;

const processSteps = [
  "Subscribe to StackScore vCIO",
  "Complete your onboarding profile",
  "Review your existing assessment or establish an initial technology baseline",
  "Build and prioritize your technology roadmap",
  "Begin ongoing planning, reporting, and quarterly reviews",
] as const;

const portalFeatures = [
  "Technology maturity score",
  "Recommendations",
  "Improvement plans",
  "Projects",
  "Technology roadmap",
  "Quarterly reviews",
  "Technology budget",
  "Reports",
  "Documents",
  "Invoices",
  "Subscription and billing management",
  "Strategic meeting scheduling",
  "Progress tracking over time",
] as const;

const pricingIncludes = [
  "Ongoing technology advisory",
  "Quarterly technology reviews",
  "Roadmap and budget management",
  "Executive reporting",
  "Direct advisor access",
  "Annual reassessment",
  "StackScore portal access",
  "Cancel anytime",
] as const;

const faqs = [
  {
    question: "Is StackScore vCIO managed IT support?",
    answer:
      "No. StackScore vCIO is focused on technology strategy, planning, budgeting, reporting, and executive guidance. Managed IT services can be added separately for monitoring, maintenance, patching, and technical support.",
  },
  {
    question: "Do I need to purchase a Technology Assessment first?",
    answer:
      "A completed StackScore Technology Assessment is recommended but not strictly required. Clients without an existing assessment will complete an initial baseline review during onboarding.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes. The subscription can be canceled through the billing portal. Access continues through the end of the current paid billing period.",
  },
  {
    question: "How often are strategy reviews performed?",
    answer:
      "Formal reviews are performed quarterly, with ongoing roadmap and advisory access throughout the subscription.",
  },
  {
    question: "Can Bobkat IT implement the recommendations?",
    answer:
      "Yes. Bobkat IT can scope and deliver projects, managed services, network upgrades, backup solutions, and other recommendations separately.",
  },
  {
    question: "Can managed services and backups be added later?",
    answer: "Yes. These services can be added as the client's needs develop.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Historical assessments, reports, and completed records are preserved. Certain ongoing advisory and editing features may become read-only after the subscription ends.",
  },
  {
    question: "Is this a long-term contract?",
    answer: "No. StackScore vCIO is billed monthly and can be canceled through the billing portal.",
  },
] as const;

const relatedServices: Array<{
  title: string;
  price: string;
  Icon: LucideIcon;
}> = [
  { title: "Managed IT Services", price: "Starting at $15/device/month", Icon: ClipboardList },
  { title: "Backup & Disaster Recovery", price: "Starting at $800/month", Icon: WalletCards },
  { title: "Technology Projects", price: "Custom scoped pricing", Icon: FolderKanban },
];

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortalPreview() {
  const metrics = [
    { label: "Technology Score", value: "72" },
    { label: "Active Recommendations", value: "18" },
    { label: "Projects in Progress", value: "4" },
    { label: "Next Quarterly Review", value: "Aug 15" },
  ];

  return (
    <div className="rounded-2xl border border-primary/15 bg-[#061426] p-4 text-white shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">StackScore Portal</p>
          <h3 className="mt-1 text-xl font-semibold">Executive Technology Workspace</h3>
        </div>
        <LineChart className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="font-medium">Current-quarter priorities</p>
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">In progress</span>
        </div>
        <div className="mt-4 space-y-3">
          {["MFA rollout", "Backup recovery test", "Network lifecycle plan"].map((item, index) => (
            <div key={item}>
              <div className="flex justify-between text-sm text-slate-300">
                <span>{item}</span>
                <span>{[80, 55, 35][index]}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${[80, 55, 35][index]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {portalFeatures.map((feature) => (
        <OfferReveal key={feature}>
          <div className="flex h-full items-start gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-medium">{feature}</p>
          </div>
        </OfferReveal>
      ))}
    </div>
  );
}

export function VcioOfferLanding() {
  return (
    <div className="min-h-screen scroll-smooth bg-background motion-reduce:scroll-auto">
      <PublicMarketingNav active="services" />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
          <OfferHeroBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <OfferReveal>
                <p className="w-fit rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-primary">
                  Ongoing Technology Advisory
                </p>
              </OfferReveal>
              <OfferReveal delayMs={70}>
                <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  Turn Your Technology Roadmap Into an Ongoing Strategy
                </h1>
              </OfferReveal>
              <OfferReveal delayMs={120}>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  StackScore vCIO gives your business continuous technology planning, executive
                  reporting, roadmap management, and direct access to a strategic IT advisor.
                </p>
              </OfferReveal>
              <OfferReveal delayMs={170}>
                <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">StackScore vCIO</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-primary">$300/month</p>
                  <p className="mt-1 text-sm text-muted-foreground">Billed monthly. Cancel anytime.</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <VcioCheckoutButton className="h-11 w-full px-6 text-base sm:w-auto" />
                    <ServicesCtaLink
                      cta="generalConsultation"
                      label="Schedule a Consultation"
                      className="h-11 w-full px-6 text-base sm:w-auto"
                      variant="outline"
                      placement="vcio_offer_hero"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Clear monthly pricing. No long-term contract. Your technology data remains
                    available even if you cancel.
                  </p>
                </div>
              </OfferReveal>
            </div>
            <OfferReveal delayMs={120}>
              <PortalPreview />
            </OfferReveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <ChecklistSection title="What You Receive" items={receiveItems} />
            <ChecklistSection title="Who It Is For" items={audienceItems} />
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="How It Works"
              title="From subscription to strategic execution"
              description="The vCIO experience turns your assessment, roadmap, and business priorities into a managed planning rhythm."
            />
            <div className="grid gap-4 md:grid-cols-5">
              {processSteps.map((step, index) => (
                <OfferReveal key={step} delayMs={index * 45}>
                  <div className="h-full rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <p className="mt-4 text-sm font-medium leading-relaxed">{step}</p>
                  </div>
                </OfferReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Client Portal"
              title="A strategic workspace for technology decisions"
              description="StackScore keeps the advisory relationship grounded in real data, progress, reports, documents, and billing visibility."
            />
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <PortalPreview />
              <FeatureGrid />
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Pricing Summary"
              title="StackScore vCIO"
              description="Ongoing advisory for organizations that need executive technology guidance without hiring a full-time CIO."
            />
            <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
              <p className="text-4xl font-semibold tracking-tight text-primary">$300/month</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {pricingIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <VcioCheckoutButton label="Start Your Subscription" className="h-11 w-full px-6 text-base sm:w-auto" />
                <ServicesCtaLink
                  cta="generalConsultation"
                  label="Schedule a Consultation"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                  variant="outline"
                  placement="vcio_offer_pricing"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <OfferSectionHeader
              eyebrow="Related Services"
              title="Add implementation and support when you need it"
              description="vCIO is the strategy layer. Bobkat IT can scope additional services separately as your roadmap develops."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {relatedServices.map(({ title, price, Icon }) => (
                <div key={title} className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm font-medium text-primary">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-4xl">
            <OfferSectionHeader
              eyebrow="FAQ"
              title="Common questions"
              description="Clear answers before you start a monthly advisory relationship."
            />
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OfferCtaPanel
          headline="Start Turning Your Roadmap Into Momentum"
          supportingText="Subscribe to StackScore vCIO and begin building a steady rhythm for technology planning, reporting, and executive guidance."
        >
          <VcioCheckoutButton label="Start StackScore vCIO" className="h-11 w-full px-8 text-base sm:w-auto" />
          <ServicesCtaLink
            cta="generalConsultation"
            label="Schedule a Consultation"
            className="h-11 w-full px-8 text-base sm:w-auto"
            variant="outline"
            placement="vcio_offer_final"
          />
          <Link
            href="/services"
            className={cn(buttonVariants({ variant: "link" }), "mt-1 h-auto px-0")}
          >
            Explore all services
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </OfferCtaPanel>
      </main>
      <OfferFooter />
    </div>
  );
}
