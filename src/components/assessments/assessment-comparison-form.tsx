"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAssessmentBaselineSummary } from "@/lib/assessments/display";

type CompletedAssessmentOption = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  completedAt: string | null;
  overallScore: number | null;
};

type AssessmentComparisonFormProps = {
  clientId: string;
  completedAssessments: CompletedAssessmentOption[];
  initialPreviousId?: string;
  initialCurrentId?: string;
};

export function AssessmentComparisonForm({
  clientId,
  completedAssessments,
  initialPreviousId,
  initialCurrentId,
}: AssessmentComparisonFormProps) {
  const router = useRouter();
  const sorted = useMemo(
    () =>
      [...completedAssessments].sort((left, right) => {
        const leftTime = left.completedAt ? new Date(left.completedAt).getTime() : 0;
        const rightTime = right.completedAt ? new Date(right.completedAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [completedAssessments],
  );

  const assessmentItems = useMemo(
    () =>
      Object.fromEntries(
        sorted.map((assessment) => [
          assessment.id,
          formatAssessmentBaselineSummary(assessment),
        ]),
      ),
    [sorted],
  );

  const defaultCurrent = initialCurrentId ?? sorted[0]?.id ?? "";
  const defaultPrevious =
    initialPreviousId ?? sorted.find((assessment) => assessment.id !== defaultCurrent)?.id ?? "";

  const [previousId, setPreviousId] = useState(defaultPrevious);
  const [currentId, setCurrentId] = useState(defaultCurrent);
  const [error, setError] = useState<string | null>(null);

  function handleCompare() {
    if (!previousId || !currentId) {
      setError("Select both assessments to compare.");
      return;
    }
    if (previousId === currentId) {
      setError("Choose two different completed assessments.");
      return;
    }

    setError(null);
    const params = new URLSearchParams({
      baselineId: previousId,
      comparisonId: currentId,
    });
    router.push(`/clients/${clientId}/assessments/compare?${params.toString()}`);
  }

  return (
    <Card className="stat-card max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Select Assessments to Compare
        </CardTitle>
        <CardDescription>
          Choose a previous baseline and a more recent assessment to analyze progress, regression,
          and remaining opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="previous-assessment">Previous Assessment</Label>
            <Select
              value={previousId}
              items={assessmentItems}
              onValueChange={(value) => setPreviousId(value ?? "")}
            >
              <SelectTrigger id="previous-assessment" className="w-full">
                <SelectValue placeholder="Select previous assessment" />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id} multiline>
                    {formatAssessmentBaselineSummary(assessment)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current-assessment">Current Assessment</Label>
            <Select
              value={currentId}
              items={assessmentItems}
              onValueChange={(value) => setCurrentId(value ?? "")}
            >
              <SelectTrigger id="current-assessment" className="w-full">
                <SelectValue placeholder="Select current assessment" />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id} multiline>
                    {formatAssessmentBaselineSummary(assessment)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="button"
          onClick={handleCompare}
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          Compare Assessments
        </button>
      </CardContent>
    </Card>
  );
}
