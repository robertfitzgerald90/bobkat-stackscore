import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/branding";
import { FULL_ASSESSMENT_BENEFITS } from "@/lib/technology-snapshot/display";

export const metadata: Metadata = {
  title: `Technology Assessment | ${BRAND.companyName}`,
  description: `Purchase the full ${BRAND.reportTitle} from ${BRAND.companyName}.`,
};

export default function AssessmentOfferPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-w-0 max-w-2xl flex-col items-center gap-6">
        <BrandLogo size={48} />
        <div className="min-w-0 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Full Technology Assessment
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Go beyond the snapshot with a complete maturity review, executive summary, and
            actionable roadmap from {BRAND.companyName}.
          </p>
        </div>

        <Card className="w-full min-w-0 shadow-sm">
          <CardHeader>
            <CardTitle>What&apos;s included</CardTitle>
            <CardDescription>
              Secure checkout powered by Stripe. You&apos;ll receive next steps after payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="grid gap-2 sm:grid-cols-2">
              {FULL_ASSESSMENT_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 break-words">{benefit}</span>
                </li>
              ))}
            </ul>
            <AssessmentPurchaseButton className="w-full sm:w-auto" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
