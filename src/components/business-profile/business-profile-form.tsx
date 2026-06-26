"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  ComplianceFramework,
} from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPLIANCE_FRAMEWORK_LABELS,
  ENVIRONMENT_TYPE_LABELS,
  IT_SUPPORT_MODEL_LABELS,
  PRIMARY_BUSINESS_GOAL_LABELS,
} from "@/lib/business-profile/labels";
import { getComplianceFieldGroup } from "@/lib/business-profile/compliance";
import type { BusinessProfileView, ComplianceDetails } from "@/lib/business-profile/types";

const textareaClassName =
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

type FormState = {
  companyName: string;
  industry: string;
  employeeCount: string;
  numberOfLocations: string;
  primaryBusinessGoal: string;
  highestTechnologyPriority: string;
  technologyVision: string;
  complianceFramework: string;
  complianceDetails: ComplianceDetails;
  itSupportModel: string;
  environmentType: string;
  approximateEndpointCount: string;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
};

function toFormState(profile: BusinessProfileView): FormState {
  return {
    companyName: profile.companyName,
    industry: profile.industry ?? "",
    employeeCount: profile.employeeCount?.toString() ?? "",
    numberOfLocations: profile.numberOfLocations?.toString() ?? "",
    primaryBusinessGoal: profile.primaryBusinessGoal ?? "",
    highestTechnologyPriority: profile.highestTechnologyPriority ?? "",
    technologyVision: profile.technologyVision ?? "",
    complianceFramework: profile.complianceFramework ?? "none",
    complianceDetails: { ...profile.complianceDetails },
    itSupportModel: profile.itSupportModel ?? "",
    environmentType: profile.environmentType ?? "",
    approximateEndpointCount: profile.approximateEndpointCount?.toString() ?? "",
    primaryContactName: profile.primaryContactName,
    primaryContactTitle: profile.primaryContactTitle ?? "",
    primaryContactEmail: profile.primaryContactEmail,
    primaryContactPhone: profile.primaryContactPhone ?? "",
  };
}

function booleanToSelectValue(value: boolean | null | undefined) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function selectValueToBoolean(value: string | null): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function EnumSelect<T extends string>({
  id,
  label,
  value,
  labels,
  onValueChange,
  placeholder = "Select…",
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  labels: Record<T, string>;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || null}
        items={labels}
        onValueChange={(next) => onValueChange(next ?? "")}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(labels).map(([key, itemLabel]) => (
            <SelectItem key={key} value={key}>
              {itemLabel as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BusinessProfileForm({
  clientId,
  initialProfile,
}: {
  clientId: string;
  initialProfile: BusinessProfileView;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(() => toFormState(initialProfile));

  const complianceGroup = useMemo(
    () => getComplianceFieldGroup(form.complianceFramework as ComplianceFramework),
    [form.complianceFramework],
  );

  function updateComplianceDetails(patch: Partial<ComplianceDetails>) {
    setForm((current) => ({
      ...current,
      complianceDetails: { ...current.complianceDetails, ...patch },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/v1/clients/${clientId}/business-profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        industry: form.industry || null,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : null,
        numberOfLocations: form.numberOfLocations ? Number(form.numberOfLocations) : null,
        primaryBusinessGoal: form.primaryBusinessGoal || null,
        highestTechnologyPriority: form.highestTechnologyPriority || null,
        technologyVision: form.technologyVision || null,
        complianceFramework: form.complianceFramework || "none",
        complianceDetails: complianceGroup ? form.complianceDetails : null,
        itSupportModel: form.itSupportModel || null,
        environmentType: form.environmentType || null,
        approximateEndpointCount: form.approximateEndpointCount
          ? Number(form.approximateEndpointCount)
          : null,
        primaryContactName: form.primaryContactName,
        primaryContactTitle: form.primaryContactTitle || null,
        primaryContactEmail: form.primaryContactEmail,
        primaryContactPhone: form.primaryContactPhone || null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.error ?? "Unable to save business profile");
      return;
    }

    toast.success("Business profile saved");
    router.refresh();
  }

  const readOnly = !initialProfile.canEdit;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileSection
        title="Company"
        description="Basic organization details used across assessments and reports."
      >
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            required
            disabled={readOnly}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              disabled={readOnly}
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeCount">Employee Count</Label>
            <Input
              id="employeeCount"
              type="number"
              min={0}
              disabled={readOnly}
              value={form.employeeCount}
              onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfLocations">Number of Locations</Label>
            <Input
              id="numberOfLocations"
              type="number"
              min={0}
              disabled={readOnly}
              value={form.numberOfLocations}
              onChange={(e) => setForm({ ...form, numberOfLocations: e.target.value })}
            />
          </div>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Business"
        description="Strategic context that shapes recommendations and improvement plans."
      >
        <EnumSelect
          id="primaryBusinessGoal"
          label="Primary Business Goal"
          value={form.primaryBusinessGoal}
          labels={PRIMARY_BUSINESS_GOAL_LABELS}
          disabled={readOnly}
          onValueChange={(value) => setForm({ ...form, primaryBusinessGoal: value })}
        />
        <div className="space-y-2">
          <Label htmlFor="highestTechnologyPriority">Highest Technology Priority</Label>
          <Input
            id="highestTechnologyPriority"
            disabled={readOnly}
            placeholder="e.g. Security hardening, cloud migration"
            value={form.highestTechnologyPriority}
            onChange={(e) => setForm({ ...form, highestTechnologyPriority: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="technologyVision">Technology Vision</Label>
          <textarea
            id="technologyVision"
            disabled={readOnly}
            className={textareaClassName}
            placeholder="Where should technology be in 3–5 years?"
            value={form.technologyVision}
            onChange={(e) => setForm({ ...form, technologyVision: e.target.value })}
          />
        </div>
      </ProfileSection>

      <ProfileSection
        title="Compliance"
        description="Only the fields relevant to the selected framework are shown."
      >
        <EnumSelect
          id="complianceFramework"
          label="Compliance Framework"
          value={form.complianceFramework}
          labels={COMPLIANCE_FRAMEWORK_LABELS}
          disabled={readOnly}
          onValueChange={(value) =>
            setForm({
              ...form,
              complianceFramework: value,
              complianceDetails: {},
            })
          }
        />

        {complianceGroup === "cmmc_nist" ? (
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <Label htmlFor="currentControlsImplemented">Current Controls Implemented</Label>
              <Input
                id="currentControlsImplemented"
                disabled={readOnly}
                value={form.complianceDetails.currentControlsImplemented ?? ""}
                onChange={(e) =>
                  updateComplianceDetails({ currentControlsImplemented: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetCompliance">Target Compliance</Label>
              <Input
                id="targetCompliance"
                disabled={readOnly}
                value={form.complianceDetails.targetCompliance ?? ""}
                onChange={(e) => updateComplianceDetails({ targetCompliance: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceNotes">Notes</Label>
              <textarea
                id="complianceNotes"
                disabled={readOnly}
                className={textareaClassName}
                value={form.complianceDetails.notes ?? ""}
                onChange={(e) => updateComplianceDetails({ notes: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        {complianceGroup === "iso_27001" ? (
          <div className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="isoCertified">Certified</Label>
              <Select
                value={booleanToSelectValue(form.complianceDetails.certified)}
                items={{ yes: "Yes", no: "No" }}
                onValueChange={(value) =>
                  updateComplianceDetails({ certified: selectValueToBoolean(value) })
                }
              >
                <SelectTrigger id="isoCertified" className="w-full" disabled={readOnly}>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationDate">Certification Date (optional)</Label>
              <Input
                id="certificationDate"
                type="date"
                disabled={readOnly}
                value={form.complianceDetails.certificationDate ?? ""}
                onChange={(e) => updateComplianceDetails({ certificationDate: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        {complianceGroup === "hipaa" ? (
          <div className="space-y-2 rounded-md border p-4">
            <Label htmlFor="hipaaProgram">HIPAA Program Implemented</Label>
            <Select
              value={booleanToSelectValue(form.complianceDetails.hipaaProgramImplemented)}
              items={{ yes: "Yes", no: "No" }}
              onValueChange={(value) =>
                updateComplianceDetails({
                  hipaaProgramImplemented: selectValueToBoolean(value),
                })
              }
            >
              <SelectTrigger id="hipaaProgram" className="w-full" disabled={readOnly}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {complianceGroup === "pci_dss" ? (
          <div className="space-y-2 rounded-md border p-4">
            <Label htmlFor="pciCompliant">PCI Compliant</Label>
            <Select
              value={booleanToSelectValue(form.complianceDetails.pciCompliant)}
              items={{ yes: "Yes", no: "No" }}
              onValueChange={(value) =>
                updateComplianceDetails({ pciCompliant: selectValueToBoolean(value) })
              }
            >
              <SelectTrigger id="pciCompliant" className="w-full" disabled={readOnly}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </ProfileSection>

      <ProfileSection
        title="Technology Context"
        description="High-level environment context — not a full inventory."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <EnumSelect
            id="itSupportModel"
            label="IT Support Model"
            value={form.itSupportModel}
            labels={IT_SUPPORT_MODEL_LABELS}
            disabled={readOnly}
            onValueChange={(value) => setForm({ ...form, itSupportModel: value })}
          />
          <EnumSelect
            id="environmentType"
            label="Environment Type"
            value={form.environmentType}
            labels={ENVIRONMENT_TYPE_LABELS}
            disabled={readOnly}
            onValueChange={(value) => setForm({ ...form, environmentType: value })}
          />
          <div className="space-y-2">
            <Label htmlFor="approximateEndpointCount">Approximate Endpoint Count</Label>
            <Input
              id="approximateEndpointCount"
              type="number"
              min={0}
              disabled={readOnly}
              value={form.approximateEndpointCount}
              onChange={(e) => setForm({ ...form, approximateEndpointCount: e.target.value })}
            />
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="Primary Contact">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryContactName">Name</Label>
            <Input
              id="primaryContactName"
              required
              disabled={readOnly}
              value={form.primaryContactName}
              onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactTitle">Title</Label>
            <Input
              id="primaryContactTitle"
              disabled={readOnly}
              value={form.primaryContactTitle}
              onChange={(e) => setForm({ ...form, primaryContactTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactEmail">Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              required
              disabled={readOnly}
              value={form.primaryContactEmail}
              onChange={(e) => setForm({ ...form, primaryContactEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactPhone">Phone</Label>
            <Input
              id="primaryContactPhone"
              type="tel"
              disabled={readOnly}
              value={form.primaryContactPhone}
              onChange={(e) => setForm({ ...form, primaryContactPhone: e.target.value })}
            />
          </div>
        </div>
      </ProfileSection>

      {initialProfile.canEdit ? (
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Business Profile"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
