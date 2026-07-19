import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PHASE_2_TEASER_MODULES } from "@/lib/product-overview/navigation";

export function PhaseTeaserSection() {
  return (
    <section id="product-overview-phase-2" className="border-t border-border/70 bg-muted/20 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Full Product Tour
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Explore the complete StackScore client journey
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Phase 1 focuses on the Client Success Dashboard. The full tour will expand into
            assessments, recommendations, roadmap planning, projects, reviews, budget, and executive
            reporting — all from the client perspective.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PHASE_2_TEASER_MODULES.map((module) => (
            <Card key={module.id} id={`product-overview-teaser-${module.id}`} className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{module.teaserTitle ?? module.label}</CardTitle>
                  <Badge variant="outline">Coming in the full tour</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{module.teaserDescription}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
