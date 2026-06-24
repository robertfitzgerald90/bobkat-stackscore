"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function StartAssessmentForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assessmentName, setAssessmentName] = useState("Initial Assessment");
  const [assessmentType, setAssessmentType] = useState("initial");

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
    <div className="w-full max-w-sm space-y-3 rounded-lg border p-4">
      <div className="space-y-2">
        <Label>Assessment Name</Label>
        <Input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={assessmentType}
          onValueChange={(value) => setAssessmentType(value ?? "initial")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="initial">Initial</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={startAssessment} disabled={loading} className="w-full">
        {loading ? "Starting..." : "Start Assessment"}
      </Button>
    </div>
  );
}
