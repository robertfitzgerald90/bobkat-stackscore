import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { PurchaseSuccessTracker } from "@/components/analytics/purchase-success-tracker";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Payment Successful | ${BRAND.companyName}`,
  description: "Your Technology Assessment purchase was received.",
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PurchaseSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 sm:py-12">
      <PurchaseSuccessTracker hasCheckoutSession={Boolean(sessionId)} />
      <div className="mx-auto flex min-w-0 max-w-lg flex-col items-center gap-6 text-center">
        <BrandLogo size={48} />
        <Card className="w-full min-w-0 shadow-sm">
          <CardHeader className="items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Payment received</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Thank you for purchasing the {BRAND.reportTitle}. Check your email for activation
              instructions to access your assessment workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-left text-sm">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                We sent an activation link to the email address used at checkout. After activating
                your account, you can begin the 80-question Technology Assessment in StackScore.
              </p>
            </div>
            {sessionId ? (
              <p className="break-all text-xs text-muted-foreground">
                Reference: {sessionId}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/login" className={buttonVariants()}>
                Sign in to StackScore
              </Link>
              <Link href="/assessment-offer" className={buttonVariants({ variant: "outline" })}>
                Back to offer page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
