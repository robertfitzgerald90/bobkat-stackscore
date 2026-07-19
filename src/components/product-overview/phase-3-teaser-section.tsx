import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PHASE_3_TEASER_MODULES } from "@/lib/product-overview/navigation";

export function Phase3TeaserSection() {
  return (
    <section
      id="product-overview-phase-3"
      className="scroll-mt-36 border-t border-border/70 bg-muted/20 px-4 py-16 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Turning Strategy Into Action
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Turning Strategy Into Action
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Recommendations become projects, projects become measurable progress, and every
            completed initiative moves your technology maturity forward.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PHASE_3_TEASER_MODULES.map((module) => (
            <Card
              key={module.id}
              id={`product-overview-teaser-${module.id}`}
              className="border-border/70"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{module.teaserTitle ?? module.label}</CardTitle>
                  <Badge variant="outline">Coming in Phase 3</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {module.teaserDescription}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
