import { Sparkles } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_INSIGHTS_PREVIEWS } from "@/lib/product-overview/demo-partnership";

export function AiInsightsPreviewSection() {
  return (
    <section
      id="product-overview-ai-insights"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Future AI Advisory
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              The next evolution of technology advisory
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore is building AI-assisted insights to help leaders detect trends, forecast
              investments, and prioritize work — always grounded in your technology data.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AI_INSIGHTS_PREVIEWS.map((insight, index) => (
            <OfferReveal key={insight.id} delayMs={index * 40}>
              <Card className="h-full border-border/70 bg-gradient-to-b from-muted/20 to-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <CardTitle className="mt-4 text-base">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
                  <Badge variant="outline" className="mt-4">
                    Future roadmap
                  </Badge>
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
