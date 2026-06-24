"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSESSMENT_TYPE_LABELS, formatAssessmentType } from "@/lib/assessments/display";

export function StartAssessmentForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assessmentName, setAssessmentName] = useState("Initial Assessment");
  const [assessmentType, setAssessmentType] = useState("initial");
  const nameFieldId = `start-assessment-name-${clientId}`;
  const typeFieldId = `start-assessment-type-${clientId}`;

  async function startAssessment() {
    setLoading(true);
    const response = await fetch(`/api/v1/clients/${clientId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

  return (
    <div className="w-full space-y-3 rounded-lg border p-4 lg:max-w-sm">
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
          onValueChange={(value) => setAssessmentType(value ?? "initial")}
        >
          <SelectTrigger id={typeFieldId} className="w-full">
            <span className="truncate">{formatAssessmentType(assessmentType)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="initial">{ASSESSMENT_TYPE_LABELS.initial}</SelectItem>
            <SelectItem value="quarterly">{ASSESSMENT_TYPE_LABELS.quarterly}</SelectItem>
            <SelectItem value="annual">{ASSESSMENT_TYPE_LABELS.annual}</SelectItem>
            <SelectItem value="followup">{ASSESSMENT_TYPE_LABELS.followup}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={startAssessment} disabled={loading} className="w-full">
        {loading ? "Starting..." : "Start Assessment"}
      </Button>
    </div>
  );
}
