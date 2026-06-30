"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { BaselineAssessmentDetails } from "@/components/assessments/baseline-assessment-details";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ASSESSMENT_TYPE_LABELS,
  formatAssessmentCompletionDate,
  sortCompletedAssessmentsNewestFirst,
} from "@/lib/assessments/display";

type CompletedAssessment = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  completedAt: string | null;
  overallScore: number | null;
};

const REASSESSMENT_TYPE_OPTIONS = ["followup", "quarterly", "annual"] as const;

export function ReassessmentForm({
  clientId,
  completedAssessments,
}: {
  clientId: string;
  completedAssessments: CompletedAssessment[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sortedAssessments = useMemo(
    () => sortCompletedAssessmentsNewestFirst(completedAssessments),
    [completedAssessments],
  );

  const baselineItems = useMemo(
    () =>
      Object.fromEntries(
        sortedAssessments.map((assessment) => [assessment.id, assessment.assessmentName]),
      ),
    [sortedAssessments],
  );

  const reassessmentTypeItems = useMemo(
    () =>
      Object.fromEntries(
        REASSESSMENT_TYPE_OPTIONS.map((type) => [type, ASSESSMENT_TYPE_LABELS[type]]),
      ),
    [],
  );

  const latest = sortedAssessments[0];
  const [sourceAssessmentId, setSourceAssessmentId] = useState(latest?.id ?? "");
  const [assessmentName, setAssessmentName] = useState(
    `Reassessment ${formatAssessmentCompletionDate(new Date())}`,
  );
  const [assessmentType, setAssessmentType] = useState("followup");

  const baselineFieldId = `reassessment-baseline-${clientId}`;
  const nameFieldId = `reassessment-name-${clientId}`;
  const typeFieldId = `reassessment-type-${clientId}`;

  const selectedBaseline = sortedAssessments.find(
    (assessment) => assessment.id === sourceAssessmentId,
  );

  async function startReassessment() {
    if (!sourceAssessmentId) return;

    setLoading(true);
    const response = await fetch(`/api/v1/clients/${clientId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reassessment: true,
        sourceAssessmentId,
        assessmentName,
        assessmentType,
        assessmentDate: new Date().toISOString(),
      }),
    });
    setLoading(false);

    if (response.ok) {
      const assessment = await response.json();
      router.push(`/assessments/${assessment.id}`);
    }
  }

  if (sortedAssessments.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-w-0 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 lg:max-w-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <RefreshCw className="h-4 w-4" />
        Run Reassessment
      </div>
      <p className="text-xs text-muted-foreground">
        Creates a new assessment with previous answers pre-filled. Historical assessments are
        preserved as immutable snapshots.
      </p>
      <div className="space-y-2">
        <Label htmlFor={baselineFieldId}>Baseline Assessment</Label>
        <Select
          value={sourceAssessmentId}
          items={baselineItems}
          onValueChange={(value) => setSourceAssessmentId(value ?? "")}
        >
          <SelectTrigger id={baselineFieldId} className="w-full">
            <SelectValue placeholder="Select baseline assessment" />
          </SelectTrigger>
          <SelectContent>
            {sortedAssessments.map((assessment) => (
              <SelectItem key={assessment.id} value={assessment.id}>
                <span className="truncate">{assessment.assessmentName}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedBaseline ? (
          <BaselineAssessmentDetails
            completedAt={selectedBaseline.completedAt}
            overallScore={selectedBaseline.overallScore}
          />
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={nameFieldId}>Assessment Name</Label>
        <Input
          id={nameFieldId}
          value={assessmentName}
          onChange={(e) => setAssessmentName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={typeFieldId}>Type</Label>
        <Select
          value={assessmentType}
          items={reassessmentTypeItems}
          onValueChange={(value) => setAssessmentType(value ?? "followup")}
        >
          <SelectTrigger id={typeFieldId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASSESSMENT_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {ASSESSMENT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={startReassessment} disabled={loading || !sourceAssessmentId} className="w-full">
        {loading ? "Creating..." : "Start Reassessment"}
      </Button>
    </div>
  );
}
