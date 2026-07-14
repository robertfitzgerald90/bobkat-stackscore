"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OnboardingValue = Record<string, string>;

type VcioOnboardingFormProps = {
  clientId: string;
  initial: {
    businessInfoJson: unknown;
    leadershipJson: unknown;
    environmentJson: unknown;
    planningJson: unknown;
    assessmentStatus: string | null;
    strategySessionScheduledAt: string | null;
    completedAt: string | null;
  } | null;
};

function asRecord(value: unknown): OnboardingValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as OnboardingValue;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        className="min-h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function VcioOnboardingForm({ clientId, initial }: VcioOnboardingFormProps) {
  const [saving, setSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<OnboardingValue>(
    asRecord(initial?.businessInfoJson),
  );
  const [leadership, setLeadership] = useState<OnboardingValue>(
    asRecord(initial?.leadershipJson),
  );
  const [environment, setEnvironment] = useState<OnboardingValue>(
    asRecord(initial?.environmentJson),
  );
  const [planning, setPlanning] = useState<OnboardingValue>(asRecord(initial?.planningJson));
  const [assessmentStatus, setAssessmentStatus] = useState(
    initial?.assessmentStatus ?? "baseline_required",
  );
  const [strategySessionScheduledAt, setStrategySessionScheduledAt] = useState(
    initial?.strategySessionScheduledAt?.slice(0, 10) ?? "",
  );
  const completed = Boolean(initial?.completedAt);

  function update(
    setter: Dispatch<SetStateAction<OnboardingValue>>,
    key: string,
    value: string,
  ) {
    setter((current) => ({ ...current, [key]: value }));
  }

  async function save(complete = false) {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/vcio/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo,
          leadership,
          environment,
          planning,
          assessmentStatus,
          strategySessionScheduledAt: strategySessionScheduledAt || null,
          complete,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "Unable to save onboarding.");
        return;
      }
      toast.success(complete ? "vCIO onboarding completed." : "vCIO onboarding saved.");
      if (complete) window.location.href = `/clients/${clientId}/vcio`;
    } catch {
      toast.error("Unable to save onboarding.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {completed ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-5 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Onboarding completed</p>
              <p className="text-muted-foreground">
                You can update this profile as your environment changes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal or display name" value={businessInfo.name ?? ""} onChange={(value) => update(setBusinessInfo, "name", value)} />
          <Field label="Primary location" value={businessInfo.location ?? ""} onChange={(value) => update(setBusinessInfo, "location", value)} />
          <Field label="Website" value={businessInfo.website ?? ""} onChange={(value) => update(setBusinessInfo, "website", value)} />
          <Field label="Industry" value={businessInfo.industry ?? ""} onChange={(value) => update(setBusinessInfo, "industry", value)} />
          <Field label="Number of employees" value={businessInfo.employees ?? ""} onChange={(value) => update(setBusinessInfo, "employees", value)} />
          <Field label="Technology users" value={businessInfo.users ?? ""} onChange={(value) => update(setBusinessInfo, "users", value)} />
          <Field label="Endpoints" value={businessInfo.endpoints ?? ""} onChange={(value) => update(setBusinessInfo, "endpoints", value)} />
          <Field label="Locations" value={businessInfo.locations ?? ""} onChange={(value) => update(setBusinessInfo, "locations", value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Leadership</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Executive contact" value={leadership.executiveContact ?? ""} onChange={(value) => update(setLeadership, "executiveContact", value)} />
          <Field label="Billing contact" value={leadership.billingContact ?? ""} onChange={(value) => update(setLeadership, "billingContact", value)} />
          <Field label="Technology contact" value={leadership.technologyContact ?? ""} onChange={(value) => update(setLeadership, "technologyContact", value)} />
          <Field label="Internal IT contact" value={leadership.internalItContact ?? ""} onChange={(value) => update(setLeadership, "internalItContact", value)} />
          <Field label="Existing MSP" value={leadership.managedServiceProvider ?? ""} onChange={(value) => update(setLeadership, "managedServiceProvider", value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Environment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Microsoft 365 or Google Workspace" value={environment.productivitySuite ?? ""} onChange={(value) => update(setEnvironment, "productivitySuite", value)} />
          <Field label="Endpoint management" value={environment.endpointManagement ?? ""} onChange={(value) => update(setEnvironment, "endpointManagement", value)} />
          <Field label="Backup platform" value={environment.backupPlatform ?? ""} onChange={(value) => update(setEnvironment, "backupPlatform", value)} />
          <Field label="Network platform" value={environment.networkPlatform ?? ""} onChange={(value) => update(setEnvironment, "networkPlatform", value)} />
          <TextArea label="Primary line-of-business applications" value={environment.businessApplications ?? ""} onChange={(value) => update(setEnvironment, "businessApplications", value)} />
          <TextArea label="Current technology vendors" value={environment.vendors ?? ""} onChange={(value) => update(setEnvironment, "vendors", value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planning Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Current technology concerns" value={planning.concerns ?? ""} onChange={(value) => update(setPlanning, "concerns", value)} />
          <TextArea label="Current projects" value={planning.projects ?? ""} onChange={(value) => update(setPlanning, "projects", value)} />
          <TextArea label="Planned growth" value={planning.growth ?? ""} onChange={(value) => update(setPlanning, "growth", value)} />
          <TextArea label="Upcoming renewals" value={planning.renewals ?? ""} onChange={(value) => update(setPlanning, "renewals", value)} />
          <TextArea label="Known compliance requirements" value={planning.compliance ?? ""} onChange={(value) => update(setPlanning, "compliance", value)} />
          <TextArea label="Budget-planning preferences" value={planning.budgetPreferences ?? ""} onChange={(value) => update(setPlanning, "budgetPreferences", value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment and Strategy Session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Assessment status</span>
            <select
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={assessmentStatus}
              onChange={(event) => setAssessmentStatus(event.target.value)}
            >
              <option value="completed">Existing completed StackScore assessment</option>
              <option value="in_progress">Assessment in progress</option>
              <option value="baseline_required">No current assessment</option>
            </select>
          </label>
          <Field
            label="Initial strategy meeting date"
            value={strategySessionScheduledAt}
            onChange={setStrategySessionScheduledAt}
            placeholder="YYYY-MM-DD"
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => void save(false)} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Progress
        </Button>
        <Button type="button" onClick={() => void save(true)} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}
