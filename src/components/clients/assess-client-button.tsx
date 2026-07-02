"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveAutoAssessmentParams,
  type CompletedAssessmentForAuto,
} from "@/lib/assessments/auto-assessment";
import { toast } from "sonner";

type AssessClientButtonProps = {
  clientId: string;
  completedAssessments: CompletedAssessmentForAuto[];
  draftAssessmentId?: string | null;
  nextRecommendedAssessmentAt?: string | null;
  disabled?: boolean;
};

export function AssessClientButton({
  clientId,
  completedAssessments,
  draftAssessmentId,
  nextRecommendedAssessmentAt,
  disabled = false,
}: AssessClientButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAssess() {
    if (draftAssessmentId) {
      router.push(`/assessments/${draftAssessmentId}`);
      return;
    }

    setLoading(true);

    const params = resolveAutoAssessmentParams({
      completedAssessments,
      nextRecommendedAssessmentAt,
    });

    const body =
      params.kind === "initial"
        ? {
            assessmentName: params.assessmentName,
            assessmentType: params.assessmentType,
            assessmentDate: new Date().toISOString(),
          }
        : {
            reassessment: true,
            sourceAssessmentId: params.sourceAssessmentId,
            assessmentName: params.assessmentName,
            assessmentType: params.assessmentType,
            assessmentDate: new Date().toISOString(),
          };

    try {
      const response = await fetch(`/api/v1/clients/${clientId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(typeof error.error === "string" ? error.error : "Failed to start assessment");
        return;
      }

      const assessment = await response.json();
      router.push(`/assessments/${assessment.id}`);
    } catch {
      toast.error("Failed to start assessment");
    } finally {
      setLoading(false);
    }
  }

  const label = draftAssessmentId ? "Continue Assessment" : "Assess Client";

  return (
    <Button
      type="button"
      className="w-full shrink-0 sm:w-auto"
      disabled={disabled || loading}
      onClick={handleAssess}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ClipboardList className="mr-2 h-4 w-4" />
      )}
      {loading ? "Starting..." : label}
    </Button>
  );
}
