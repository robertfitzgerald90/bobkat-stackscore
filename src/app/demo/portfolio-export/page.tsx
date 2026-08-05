import type { Metadata } from "next";
import {
  ExecutiveDashboardPreview,
  TechnologyMaturityPreview,
  RecommendationsWorkspacePreview,
  TechnologyRoadmapPreview,
  ExecutiveReportPreview,
} from "../../../../marketing/portfolio-export";

export const metadata: Metadata = {
  title: "StackScore Portfolio Export Preview",
  description:
    "Public safe gallery of portable StackScore marketing previews using fictional data only.",
  robots: { index: false, follow: false },
};

export default function PortfolioExportDemoPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-400">
            Portfolio export
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            StackScore portable previews
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Fictional Lumen Harbor Group sample data. No authentication, APIs, or production
            records are used. Safe for portfolio screenshots.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            1. Executive Dashboard
          </h2>
          <ExecutiveDashboardPreview />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            2. Technology Maturity
          </h2>
          <TechnologyMaturityPreview />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            3. Recommendations Workspace
          </h2>
          <RecommendationsWorkspacePreview />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            4. Technology Roadmap
          </h2>
          <TechnologyRoadmapPreview />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            5. Executive Report
          </h2>
          <ExecutiveReportPreview />
        </section>
      </div>
    </main>
  );
}
