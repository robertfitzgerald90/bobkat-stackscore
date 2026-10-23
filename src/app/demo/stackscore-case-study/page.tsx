import type { Metadata } from "next";
import {
  AssessmentInsightTransformation,
  BusinessMethodologyArchitecture,
  Client360PortfolioIntelligence,
  CommunicationsGovernanceConsole,
  ExecutiveTechnologyProfile,
  LivingRoadmapTimeline,
  QuarterlyBusinessReviewVisual,
  RecommendationLineageVisual,
  StackScoreLifecycleHero,
  TechnologyImprovementPlanVisual,
} from "@/components/portfolio/stackscore";
import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "StackScore Case Study Visual System Preview",
  description: "Development preview of reusable StackScore portfolio case-study components.",
  robots: { index: false, follow: false },
};

const visuals = [
  {
    id: "lifecycle",
    title: "01 · StackScore Lifecycle Hero",
    description: "The operating-lifecycle thesis and persistent Technology Profile.",
    component: <StackScoreLifecycleHero />,
  },
  {
    id: "profile",
    title: "02 · Executive Technology Profile",
    description: "An executive answer to where we are, what is at risk, and what deserves attention.",
    component: <ExecutiveTechnologyProfile />,
  },
  {
    id: "transformation",
    title: "03 · Assessment-to-Executive-Insight Transformation",
    description: "Structured evidence transformed into decision-ready understanding.",
    component: <AssessmentInsightTransformation />,
  },
  {
    id: "lineage",
    title: "04 · Recommendation Lineage",
    description: "A governed recommendation with evidence, provenance, state, and a roadmap destination.",
    component: <RecommendationLineageVisual />,
  },
  {
    id: "tip",
    title: "05 · Technology Improvement Plan",
    description: "Findings organized into strategic initiatives, phases, investment, and expected improvement.",
    component: <TechnologyImprovementPlanVisual />,
  },
  {
    id: "roadmap",
    title: "06 · Living Roadmap Timeline",
    description: "Approved strategy moving through governed execution.",
    component: <LivingRoadmapTimeline />,
  },
  {
    id: "client-360",
    title: "07 · Client 360 / Portfolio Intelligence",
    description: "Management visibility across technology health, delivery, advisory, and commercial context.",
    component: <Client360PortfolioIntelligence />,
  },
  {
    id: "qbr",
    title: "08 · Quarterly Business Review",
    description: "Evidence that the environment was assessed, acted on, and measurably changed.",
    component: <QuarterlyBusinessReviewVisual />,
  },
  {
    id: "communications",
    title: "09 · Communications Governance Console",
    description: "Human-approved, versioned, traceable automation surrounding the consulting lifecycle.",
    component: <CommunicationsGovernanceConsole />,
  },
  {
    id: "architecture",
    title: "10 · From Business Methodology to Operating Platform",
    description: "How business lifecycle intent becomes product domains, controls, and platform decisions.",
    component: <BusinessMethodologyArchitecture />,
  },
];

export default function StackScoreCaseStudyPreviewPage() {
  return (
    <PublicPageShell className="instrument" contentClassName="mx-auto min-h-screen max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
      <header className="border-b border-border pb-8">
        <div className="instrument-mono text-[10px] uppercase tracking-[0.2em] text-primary">Development preview · Demo data only</div>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">StackScore case-study visual system</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Reusable product-marketing components that communicate how StackScore turns technology consulting into a measurable operating system. All organizations, scores, investments, and activity shown below are fictional.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Visual component index">
        {visuals.map((visual) => <a className="border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground motion-reduce:transition-none" href={`#${visual.id}`} key={visual.id}>{visual.title.split(" · ")[0]}</a>)}
      </nav>

      <main className="space-y-20 py-12 sm:py-16">
        {visuals.map((visual) => (
          <section className="scroll-mt-8" id={visual.id} key={visual.id}>
            <div className="mb-5 max-w-3xl">
              <h2 className="text-xl font-semibold sm:text-2xl">{visual.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{visual.description}</p>
            </div>
            {visual.component}
          </section>
        ))}
      </main>
    </PublicPageShell>
  );
}

