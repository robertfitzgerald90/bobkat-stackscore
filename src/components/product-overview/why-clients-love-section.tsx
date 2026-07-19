import {
  Compass,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WHY_CLIENTS_LOVE_STACKSCORE } from "@/lib/product-overview/demo-execution";
import type { DemoValueProposition } from "@/lib/product-overview/types";

function ValueIcon({ icon }: { icon: DemoValueProposition["icon"] }) {
  const className = "h-5 w-5 text-primary";
  switch (icon) {
    case "compass":
      return <Compass className={className} aria-hidden />;
    case "target":
      return <Target className={className} aria-hidden />;
    case "trending":
      return <TrendingUp className={className} aria-hidden />;
    case "sparkles":
      return <Sparkles className={className} aria-hidden />;
    case "wallet":
      return <Wallet className={className} aria-hidden />;
    case "lock":
      return <Lock className={className} aria-hidden />;
    case "refresh":
      return <RefreshCw className={className} aria-hidden />;
    default:
      return <Shield className={className} aria-hidden />;
  }
}

export function WhyClientsLoveSection() {
  return (
    <section
      id="product-overview-why-clients"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Why Clients Love StackScore
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              More than an assessment — an operating system for technology
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Business leaders choose StackScore because it turns technology uncertainty into
              clarity, accountability, and measurable progress.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WHY_CLIENTS_LOVE_STACKSCORE.map((item, index) => (
            <OfferReveal key={item.id} delayMs={index * 40}>
              <Card className="h-full border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ValueIcon icon={item.icon} />
                  </div>
                  <CardTitle className="mt-4 text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
