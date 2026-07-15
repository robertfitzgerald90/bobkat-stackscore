"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import {
  SnapshotResultCard,
  snapshotResultsPayloadToCardData,
} from "@/components/snapshot/snapshot-result-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/branding";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { FULL_ASSESSMENT_BENEFITS, SNAPSHOT_MAX_SCORE } from "@/lib/technology-snapshot/display";
import type { SnapshotClassification } from "@/lib/technology-snapshot/types";
import { cn } from "@/lib/utils";

const PURCHASE_URL = SERVICES_CTA_DESTINATIONS.assessmentLearnMore.href;

export type SnapshotResultsPayload = {
  id: string;
  totalScore: number;
  classification: SnapshotClassification;
  classificationLabel: string;
  summary: string;
  observations: string[];
};

type SnapshotResultsViewProps = {
  companyName: string;
  result: SnapshotResultsPayload;
  onRestart?: () => void;
  invitationFlow?: boolean;
};

export function SnapshotResultsView({
  companyName,
  result,
  onRestart,
  invitationFlow = false,
}: SnapshotResultsViewProps) {
  const [continuing, setContinuing] = useState(false);

  async function continueToFullAssessment() {
    setContinuing(true);
    try {
      const response = await fetch(
        `/api/v1/public/technology-snapshot/${result.id}/continue-assessment`,
        { method: "POST" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to continue to assessment");
      }
      window.location.href =
        payload.mode === "existing_account" ? payload.loginUrl : payload.activationUrl;
    } catch (error) {
      setContinuing(false);
      window.alert(error instanceof Error ? error.message : "Unable to continue to assessment");
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <SnapshotResultCard
        data={snapshotResultsPayloadToCardData(companyName, result, SNAPSHOT_MAX_SCORE)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your snapshot only scratches the surface.</CardTitle>
          <CardDescription>
            The full {BRAND.reportTitle} from {BRAND.companyName} delivers a complete picture of
            your technology maturity and a practical path forward.
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

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {invitationFlow ? (
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={continuing}
                onClick={() => void continueToFullAssessment()}
              >
                {continuing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing your assessment...
                  </>
                ) : (
                  <>
                    Continue to Full Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <a
                href={PURCHASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  className: cn("w-full sm:w-auto"),
                })}
              >
                Purchase Full Technology Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}
            {onRestart ? (
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onRestart}>
                Start another snapshot
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            Questions? Contact {BRAND.companyName} at{" "}
            <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
              {BRAND.email}
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
