"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmailPreviewPanel } from "@/components/communications/email-preview-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SampleProfileView } from "@/lib/communications/sample-profiles";

type SendTestEmailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateKey: string;
  templateName: string;
  defaultRecipient?: string;
  sampleProfiles?: SampleProfileView[];
};

type RecipientEntry = {
  id: string;
  email: string;
};

export function SendTestEmailSheet({
  open,
  onOpenChange,
  templateKey,
  templateName,
  defaultRecipient = "",
  sampleProfiles = [],
}: SendTestEmailSheetProps) {
  const [recipients, setRecipients] = useState<RecipientEntry[]>([
    { id: "1", email: defaultRecipient },
  ]);
  const [firstName, setFirstName] = useState("Alex");
  const [organizationName, setOrganizationName] = useState("Northwind Professional Services");
  const [assessmentName, setAssessmentName] = useState("StackScore Technology Maturity Assessment");
  const [vcioCustomerType, setVcioCustomerType] = useState("brand_new");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [preview, setPreview] = useState<{ html: string; text: string; subject: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRecipients([{ id: "1", email: defaultRecipient }]);
  }, [open, defaultRecipient]);

  function buildSampleData() {
    if (templateKey === "EMAIL-010") {
      const base = {
        firstName: firstName || undefined,
        clientName: firstName || undefined,
        organizationName: organizationName || undefined,
        vcioCustomerType,
      };
      if (vcioCustomerType === "assessment_customer") {
        return {
          ...base,
          heroTitle: "Welcome Back to StackScore vCIO",
          heroDescription:
            "Your existing assessment has been connected and your advisory roadmap is ready.",
          paragraphs: [
            "We connected your existing technology assessment, recommendations, improvement plan, and current projects.",
            "Complete the quick setup to tell us what has changed since your assessment, then schedule your first strategy session.",
          ],
          summaryItems: ["Technology Score: 72", "Recommendations are available", "Your roadmap is ready for review"],
          primaryCta: { label: "Complete Quick Setup", href: "https://app.stackscore.example/portal/vcio/onboarding" },
        };
      }
      if (vcioCustomerType === "managed_services_client") {
        return {
          ...base,
          heroTitle: "Your StackScore vCIO Service Is Active",
          heroDescription:
            "Welcome back. Your Bobkat IT relationship is already connected to your vCIO planning workspace.",
          paragraphs: [
            "Your organization is already configured, so there is no lengthy setup process.",
            "Next, review your roadmap, share current priorities, and schedule your first strategy session.",
          ],
          summaryItems: ["Review your roadmap", "Begin quarterly planning", "Schedule your strategy session"],
          primaryCta: { label: "Review Roadmap", href: "https://app.stackscore.example/portal/roadmap" },
        };
      }
      return base;
    }
    return {
      firstName: firstName || undefined,
      organizationName: organizationName || undefined,
      assessmentName: assessmentName || undefined,
    };
  }

  async function handlePreview() {
    setPreviewLoading(true);
    const response = await fetch("/api/v1/admin/communications/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateKey,
        sampleData: buildSampleData(),
        versionMode: "draft",
      }),
    });
    setPreviewLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to generate preview");
      return;
    }
    setPreview(payload.preview);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const emails = recipients.map((entry) => entry.email.trim()).filter(Boolean);
    const results = await Promise.all(
      emails.map(async (recipientEmail) => {
        const response = await fetch("/api/v1/admin/communications/test-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateKey,
            recipientEmail,
            ...buildSampleData(),
            sampleProfileId: selectedProfileId || undefined,
          }),
        });
        const payload = await response.json().catch(() => null);
        return { recipientEmail, ok: response.ok, payload };
      }),
    );

    setLoading(false);
    const failures = results.filter((result) => !result.ok || result.payload?.status === "failed");
    if (failures.length > 0) {
      toast.error(`Failed to send ${failures.length} of ${results.length} test email(s)`);
      return;
    }

    toast.success(`Sent ${results.length} test email(s)`);
    onOpenChange(false);
  }

  async function handleSaveProfile() {
    const name = window.prompt("Profile name");
    if (!name?.trim()) return;
    const response = await fetch("/api/v1/admin/communications/sample-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        templateKey,
        sampleData: buildSampleData(),
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to save profile");
      return;
    }
    toast.success("Sample profile saved");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[100vw] overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Send Test Email</SheetTitle>
          <SheetDescription>
            Preview sample data, send to multiple recipients, and save reusable profiles for{" "}
            {templateName}.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          <div className="space-y-3">
            <Label>Recipients</Label>
            {recipients.map((entry, index) => (
              <Input
                key={entry.id}
                type="email"
                required={index === 0}
                value={entry.email}
                onChange={(event) => {
                  const next = [...recipients];
                  next[index] = { ...next[index], email: event.target.value };
                  setRecipients(next);
                }}
                placeholder="you@example.com"
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRecipients((current) => [
                  ...current,
                  { id: String(Date.now()), email: "" },
                ])
              }
            >
              Add recipient
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Sample first name</Label>
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Sample organization</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessmentName">Assessment name</Label>
            <Input
              id="assessmentName"
              value={assessmentName}
              onChange={(event) => setAssessmentName(event.target.value)}
            />
          </div>

          {templateKey === "EMAIL-010" ? (
            <div className="space-y-2">
              <Label htmlFor="vcioCustomerType">Simulate customer type</Label>
              <select
                id="vcioCustomerType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={vcioCustomerType}
                onChange={(event) => setVcioCustomerType(event.target.value)}
              >
                <option value="brand_new">Brand New Customer</option>
                <option value="assessment_customer">Existing Assessment Customer</option>
                <option value="managed_services_client">Existing Managed Services Customer</option>
              </select>
            </div>
          ) : null}

          {sampleProfiles.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="sampleProfile">Saved sample profile</Label>
              <select
                id="sampleProfile"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedProfileId}
                onChange={(event) => {
                  const profile = sampleProfiles.find((item) => item.id === event.target.value);
                  setSelectedProfileId(event.target.value);
                  if (!profile) return;
                  setFirstName(String(profile.sampleData.firstName ?? firstName));
                  setOrganizationName(String(profile.sampleData.organizationName ?? organizationName));
                  setAssessmentName(String(profile.sampleData.assessmentName ?? assessmentName));
                }}
              >
                <option value="">Custom sample data</option>
                {sampleProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handlePreview} disabled={previewLoading}>
              {previewLoading ? "Generating preview..." : "Preview before send"}
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveProfile}>
              Save sample profile
            </Button>
          </div>

          {preview ? (
            <div className="rounded-xl border border-[#1e3a5f]/10 p-3">
              <p className="mb-3 text-sm font-medium text-[#082F5B]">Subject: {preview.subject}</p>
              <EmailPreviewPanel html={preview.html} text={preview.text} />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Test Email(s)"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
