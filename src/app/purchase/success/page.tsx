import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
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
      <div className="mx-auto flex min-w-0 max-w-lg flex-col items-center gap-6 text-center">
        <BrandLogo size={48} />
        <Card className="w-full min-w-0 shadow-sm">
          <CardHeader className="items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Payment received</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Thank you for purchasing the {BRAND.reportTitle}. The {BRAND.companyName} team will
              follow up with next steps shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId ? (
              <p className="break-all text-xs text-muted-foreground">
                Reference: {sessionId}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/technology-snapshot" className={buttonVariants({ variant: "outline" })}>
                Take a Technology Snapshot
              </Link>
              <Link href="/login" className={buttonVariants()}>
                Sign in to StackScore
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
