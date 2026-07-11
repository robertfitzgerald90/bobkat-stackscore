import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TechnologyFeatureCard, TechnologyCatalogMetrics } from "@/components/technology-catalog/technology-feature-card";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import {
  getCatalogMetrics,
  getCatalogTechnologies,
  getFeaturedTechnologies,
  getTechnologyCategories,
} from "@/lib/technology-catalog";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function TechnologyCatalogPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/dashboard");

  const [technologies, featured, metrics, categories] = await Promise.all([
    getCatalogTechnologies(),
    getFeaturedTechnologies(),
    getCatalogMetrics(),
    getTechnologyCategories(),
  ]);

  return (
    <div className="page-shell space-y-8">
      <WorkspaceSectionHeader
        title="Technology Catalog"
        description="Approved technologies that define the Bobkat IT Standard."
      />

      <TechnologyCatalogMetrics
        preferredCount={metrics.preferredCount}
        productCount={metrics.productCount}
        pillarMappings={metrics.pillarMappings}
        playbookCount={metrics.playbookCount}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Featured Standard</h2>
          <p className="text-sm text-muted-foreground">
            Core platforms that define repeatable Bobkat IT delivery.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {featured.map((technology) => (
            <TechnologyFeatureCard key={technology.id} technology={technology} />
          ))}
        </div>
      </section>

      {technologies.length > featured.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Catalog Library</h2>
            <p className="text-sm text-muted-foreground">
              {metrics.technologyCount} technologies across {categories.length} categories.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {technologies
              .filter((technology) => !technology.isFeatured)
              .map((technology) => (
                <TechnologyFeatureCard key={technology.id} technology={technology} />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
