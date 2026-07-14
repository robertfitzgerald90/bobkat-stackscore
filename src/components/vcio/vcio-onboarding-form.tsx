"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VcioCustomerType } from "@/generated/prisma/client";

type OnboardingValue = Record<string, string>;

type VcioOnboardingFormProps = {
  clientId: string;
  initial: {
    businessInfoJson: unknown;
    leadershipJson: unknown;
    environmentJson: unknown;
    planningJson: unknown;
    assessmentStatus: string | null;
    customerType: VcioCustomerType;
    currentStep: string;
    completionPercentage: number;
    strategySessionScheduledAt: string | null;
    completedAt: string | null;
  };
  knownData: {
    companyName: string;
    primaryContactName: string;
    primaryContactEmail: string;
    employeeCount: number | null;
    numberOfLocations: number | null;
    deviceCount: number | null;
    industry: string | null;
    technologyScore: string | null;
    openRecommendationCount: number;
    criticalExposureCount: number;
    recommendations: string[];
    projects: string[];
    improvementPlan: string | null;
  };
  previewMode?: boolean;
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

const steps = ["Welcome", "Business", "Goals", "Strategy Session", "Complete"] as const;

function customerTypeLabel(customerType: VcioCustomerType) {
  if (customerType === "managed_services_client") return "Existing Managed Services Client";
  if (customerType === "assessment_customer") return "Existing Assessment Customer";
  return "Brand New Customer";
}

export function VcioOnboardingForm({
  clientId,
  initial,
  knownData,
  previewMode = false,
}: VcioOnboardingFormProps) {
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
  const customerType = initial.customerType;
  const currentStep = initial.currentStep ?? "welcome";
  const isBrandNew = customerType === "brand_new";
  const isAssessmentCustomer = customerType === "assessment_customer";
  const isManagedServicesClient = customerType === "managed_services_client";
  const completed = Boolean(initial?.completedAt);

  function update(
    setter: Dispatch<SetStateAction<OnboardingValue>>,
    key: string,
    value: string,
  ) {
    setter((current) => ({ ...current, [key]: value }));
  }

  async function save(complete = false) {
    if (previewMode) {
      toast.info("Preview mode does not save onboarding changes.");
      return;
    }
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
          currentStep,
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
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{customerTypeLabel(customerType)}</p>
              <h2 className="mt-1 text-xl font-semibold">
                {isBrandNew ? "Welcome to StackScore vCIO" : "Welcome back."}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isBrandNew
                  ? "We will collect only the essentials needed to prepare your first strategy session."
                  : isAssessmentCustomer
                    ? "Your existing assessment, recommendations, roadmap, and projects are already connected."
                    : "Your organization is already configured. We only need your current priorities."}
              </p>
            </div>
            <div className="min-w-48">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{initial.completionPercentage}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-background">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${initial.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="rounded-full border border-border bg-background px-2 py-1">{step}</span>
                {index < steps.length - 1 ? <span>→</span> : null}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isBrandNew ? (
        <Card>
          <CardHeader>
            <CardTitle>What we already know</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization</p>
              <p className="mt-2 font-semibold">{knownData.companyName}</p>
              <p className="text-sm text-muted-foreground">{knownData.primaryContactEmail}</p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Technology Score</p>
              <p className="mt-2 text-2xl font-semibold">{knownData.technologyScore ?? "Baseline needed"}</p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommendations</p>
              <p className="mt-2 text-2xl font-semibold">{knownData.openRecommendationCount}</p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Projects</p>
              <p className="mt-2 text-2xl font-semibold">{knownData.projects.length}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

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

      {isBrandNew ? (
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
      ) : null}

      {isBrandNew ? (
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
      ) : null}

      {isBrandNew ? (
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
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {isAssessmentCustomer
              ? "What has changed since your assessment?"
              : isManagedServicesClient
                ? "Current priorities"
                : "Planning Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {isAssessmentCustomer ? (
            <TextArea
              label="What has changed?"
              value={planning.changedSinceAssessment ?? ""}
              onChange={(value) => update(setPlanning, "changedSinceAssessment", value)}
              placeholder="New employees, locations, initiatives, budget changes, vendor changes, or business priorities"
            />
          ) : null}
          <TextArea label="Business priorities" value={planning.concerns ?? ""} onChange={(value) => update(setPlanning, "concerns", value)} />
          <TextArea label="Current projects" value={planning.projects ?? ""} onChange={(value) => update(setPlanning, "projects", value)} />
          <TextArea label="Upcoming initiatives" value={planning.growth ?? ""} onChange={(value) => update(setPlanning, "growth", value)} />
          {isBrandNew || isAssessmentCustomer ? (
            <>
              <TextArea label="Upcoming renewals" value={planning.renewals ?? ""} onChange={(value) => update(setPlanning, "renewals", value)} />
              <TextArea label="Known compliance requirements" value={planning.compliance ?? ""} onChange={(value) => update(setPlanning, "compliance", value)} />
              <TextArea label="Budget-planning preferences" value={planning.budgetPreferences ?? ""} onChange={(value) => update(setPlanning, "budgetPreferences", value)} />
            </>
          ) : null}
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
          {previewMode ? "Preview Only" : "Save Progress"}
        </Button>
        <Button type="button" onClick={() => void save(true)} disabled={saving || previewMode}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}
