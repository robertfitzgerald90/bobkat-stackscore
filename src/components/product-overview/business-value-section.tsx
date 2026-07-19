import {
  ClipboardCheck,
  Eye,
  Lock,
  RefreshCw,
  Shield,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_OUTCOMES } from "@/lib/product-overview/demo-strategy";
import type { BusinessOutcome } from "@/lib/product-overview/types";

function OutcomeIcon({ icon }: { icon: BusinessOutcome["icon"] }) {
  const className = "h-5 w-5 text-primary";
  switch (icon) {
    case "shield":
      return <Shield className={className} aria-hidden />;
    case "wallet":
      return <Wallet className={className} aria-hidden />;
    case "eye":
      return <Eye className={className} aria-hidden />;
    case "chart":
      return <BarChart3 className={className} aria-hidden />;
    case "trending":
      return <TrendingUp className={className} aria-hidden />;
    case "lock":
      return <Lock className={className} aria-hidden />;
    case "clipboard":
      return <ClipboardCheck className={className} aria-hidden />;
    case "refresh":
      return <RefreshCw className={className} aria-hidden />;
    default:
      return <Shield className={className} aria-hidden />;
  }
}

export function BusinessValueSection() {
  return (
    <section
      id="product-overview-business-value"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Business Value
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Why This Matters
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore is built for business leaders who need clarity, accountability, and a
              practical technology roadmap — not another technical report that sits on a shelf.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BUSINESS_OUTCOMES.map((outcome, index) => (
            <OfferReveal key={outcome.id} delayMs={index * 40}>
              <Card className="h-full border-border/70 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <OutcomeIcon icon={outcome.icon} />
                  </div>
                  <CardTitle className="mt-4 text-base">{outcome.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{outcome.description}</p>
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
