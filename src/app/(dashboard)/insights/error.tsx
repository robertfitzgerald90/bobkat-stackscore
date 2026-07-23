"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[commercial-insights] route error boundary:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <Card className="border-destructive/20 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle>Business Insights is temporarily unavailable</CardTitle>
              <CardDescription className="mt-1">
                We could not load commercial KPIs and portfolio insights. Your data is safe — this
                is usually caused by incomplete records that we can recover from automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Link href="/dashboard" className={buttonClassName({ variant: "outline" })}>
            Back to Executive Briefing
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
