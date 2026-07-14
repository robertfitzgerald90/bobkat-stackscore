"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Save, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EmailPreviewPanel } from "@/components/communications/email-preview-panel";
import { SendTestEmailSheet } from "@/components/communications/send-test-email-sheet";
import { CommunicationsPanel, StatusPill } from "@/components/communications/communications-shell";
import { TemplateStatusBadge } from "@/components/communications/template-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS } from "@/lib/communications/registry";
import type { SampleProfileView } from "@/lib/communications/sample-profiles";
import type { TemplateContentBlock } from "@/lib/communications/template-content";
import type {
  EmailTemplateCategory,
  EmailTemplateStatus,
  TemplateValidationIssue,
  TemplateVersionView,
} from "@/lib/communications/types";
import type { CommunicationAutomationDefinition } from "@/lib/communications/automation-registry";

type TemplateDetailViewProps = {
  template: {
    key: string;
    documentId: string;
    name: string;
    description: string;
    category: EmailTemplateCategory;
    status: EmailTemplateStatus;
    subject: string;
    previewText: string;
    lastUpdated: string;
    requiredVariables: readonly string[];
    optionalVariables: readonly string[];
    previewable: boolean;
    sharedComponents: string[];
  };
  preview: { html: string; text: string; subject: string } | null;
  versionState: {
    published: TemplateVersionView | null;
    draft: TemplateVersionView | null;
    currentVersion: number | null;
    publishedVersion: number | null;
    draftVersion: number | null;
    lastPublished: string | null;
    publishedBy: string | null;
    history: TemplateVersionView[];
  };
  isAdmin: boolean;
  defaultTestRecipient: string;
  sampleProfiles: SampleProfileView[];
  initialValidation: TemplateValidationIssue[];
  automations: CommunicationAutomationDefinition[];
  recentSends: Array<{
    id: string;
    eventKey: string | null;
    sendType: string;
    recipientEmail: string;
    subject: string;
    status: string;
    occurredAt: string;
    isTest: boolean;
  }>;
};

export function TemplateDetailView({
  template,
  preview,
  versionState,
  isAdmin,
  defaultTestRecipient,
  sampleProfiles,
  initialValidation,
  automations,
  recentSends,
}: TemplateDetailViewProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const [subject, setSubject] = useState(versionState.draft?.subject ?? template.subject);
  const [previewText, setPreviewText] = useState(
    versionState.draft?.previewText ?? template.previewText,
  );
  const [content, setContent] = useState<TemplateContentBlock>(
    (versionState.draft?.content as TemplateContentBlock) ?? {},
  );
  const [changeNotes, setChangeNotes] = useState(versionState.draft?.changeNotes ?? "");
  const [validation, setValidation] = useState(initialValidation);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function runAction(action: "save" | "publish" | "discard" | "validate") {
    setLoadingAction(action);
    const endpoint =
      action === "validate"
        ? `/api/v1/admin/communications/templates/${template.key}/validate`
        : `/api/v1/admin/communications/templates/${template.key}/versions`;

    const response = await fetch(endpoint, {
      method: action === "discard" ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body:
        action === "discard"
          ? undefined
          : JSON.stringify({
              action,
              subject,
              previewText,
              content,
              changeNotes,
            }),
    });
    setLoadingAction(null);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Action failed");
      if (payload?.issues) setValidation(payload.issues);
      return;
    }

    if (action === "validate") {
      setValidation(payload.issues ?? []);
      toast.success(
        payload.canPublish ? "Template passed validation" : "Validation found issues",
      );
      return;
    }

    toast.success(
      action === "save"
        ? "Draft saved"
        : action === "publish"
          ? "Template published"
          : "Draft discarded",
    );
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/admin/communications/templates"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-[#082F5B]"
          >
            <ArrowLeft className="size-4" />
            Template Library
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#082F5B]">{template.name}</h2>
            <TemplateStatusBadge status={template.status} />
            {versionState.draft ? <StatusPill tone="warning">Draft pending</StatusPill> : null}
          </div>
          <p className="text-sm text-muted-foreground">{template.documentId}</p>
          <p className="max-w-3xl text-sm text-secondary-token">{template.description}</p>
        </div>
        {template.previewable ? (
          <Button type="button" onClick={() => setSendOpen(true)}>
            <Mail className="size-4" />
            Send Test Email
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <CommunicationsPanel title="Overview">
            <Meta label="Category" value={CATEGORY_LABELS[template.category]} />
            <Meta label="Current version" value={String(versionState.currentVersion ?? "—")} />
            <Meta label="Published version" value={String(versionState.publishedVersion ?? "—")} />
            <Meta label="Draft version" value={String(versionState.draftVersion ?? "None")} />
            <Meta
              label="Last published"
              value={
                versionState.lastPublished
                  ? new Date(versionState.lastPublished).toLocaleString()
                  : "Not published"
              }
            />
            <Meta label="Published by" value={versionState.publishedBy ?? "—"} />
            <Meta label="Required variables" value={template.requiredVariables.join(", ") || "None"} />
            <Meta label="Optional variables" value={template.optionalVariables.join(", ") || "None"} />
            <Meta label="Shared components" value={template.sharedComponents.join(", ")} />
          </CommunicationsPanel>

          <CommunicationsPanel title="Automation Mapping">
            {automations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No verified automation mapping is registered for this template.
              </p>
            ) : (
              <div className="space-y-3">
                {automations.map((automation) => (
                  <div key={automation.event} className="rounded-lg border border-border/70 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{automation.event}</p>
                      <StatusPill tone={automation.status === "connected" ? "success" : "warning"}>
                        {automation.status.replaceAll("_", " ")}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-muted-foreground">{automation.description}</p>
                    <Meta label="Trigger source" value={automation.triggerSource} />
                    <Meta label="Recipient" value={automation.recipient} />
                    <Meta label="Idempotency" value={automation.idempotencyKey} />
                    <Meta label="Manual resend" value={automation.manualResend ? "Eligible" : "Not eligible"} />
                  </div>
                ))}
              </div>
            )}
          </CommunicationsPanel>

          <CommunicationsPanel title="Recent Sends">
            {recentSends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sends recorded for this template yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSends.map((send) => (
                  <Link
                    key={send.id}
                    href={`/admin/communications/history/${send.id}`}
                    className="block rounded-lg border border-border/70 p-3 text-sm hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{send.recipientEmail}</p>
                      <StatusPill tone={send.status === "SENT" ? "success" : send.status === "FAILED" ? "warning" : "neutral"}>
                        {send.status}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-muted-foreground">{send.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {send.sendType} · {send.eventKey ?? "No event"} ·{" "}
                      {new Date(send.occurredAt).toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CommunicationsPanel>

          {isAdmin && template.previewable ? (
            <CommunicationsPanel title="Authoring">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewText">Preview text</Label>
                  <Input
                    id="previewText"
                    value={previewText}
                    onChange={(event) => setPreviewText(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">Primary button label</Label>
                  <Input
                    id="ctaLabel"
                    value={content.ctaLabel ?? ""}
                    onChange={(event) => setContent({ ...content, ctaLabel: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroDescription">Hero description</Label>
                  <Input
                    id="heroDescription"
                    value={content.heroDescription ?? ""}
                    onChange={(event) =>
                      setContent({ ...content, heroDescription: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeNotes">Change notes</Label>
                  <Input
                    id="changeNotes"
                    value={changeNotes}
                    onChange={(event) => setChangeNotes(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loadingAction === "save"}
                    onClick={() => runAction("save")}
                  >
                    <Save className="size-4" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loadingAction === "validate"}
                    onClick={() => runAction("validate")}
                  >
                    Validate
                  </Button>
                  <Button
                    type="button"
                    disabled={loadingAction === "publish"}
                    onClick={() => runAction("publish")}
                  >
                    <Upload className="size-4" />
                    Publish
                  </Button>
                  {versionState.draft ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loadingAction === "discard"}
                      onClick={() => runAction("discard")}
                    >
                      <XCircle className="size-4" />
                      Discard Draft
                    </Button>
                  ) : null}
                </div>
              </div>
            </CommunicationsPanel>
          ) : null}

          {validation.length > 0 ? (
            <CommunicationsPanel title="Validation">
              <ul className="space-y-2">
                {validation.map((issue) => (
                  <li
                    key={`${issue.code}-${issue.message}`}
                    className="rounded-lg border border-[#1e3a5f]/10 px-3 py-2 text-sm"
                  >
                    <StatusPill tone={issue.severity === "error" ? "warning" : "neutral"}>
                      {issue.severity}
                    </StatusPill>
                    <span className="ml-2">{issue.message}</span>
                  </li>
                ))}
              </ul>
            </CommunicationsPanel>
          ) : null}

          {versionState.history.length > 0 ? (
            <CommunicationsPanel title="Recent Changes">
              <div className="space-y-3">
                {versionState.history.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-[#1e3a5f]/10 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">v{entry.versionNumber}</span>
                      <StatusPill tone={entry.status === "published" ? "success" : "neutral"}>
                        {entry.status}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {entry.changeNotes ?? "No change notes"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CommunicationsPanel>
          ) : null}
        </div>

        <CommunicationsPanel title="Live Preview">
          {!template.previewable || !preview ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-medium text-foreground">Preview not available</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                This template is registered as Draft. Implement the React Email template before
                previewing or sending test messages.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#082F5B]">Subject: {preview.subject}</p>
              <EmailPreviewPanel html={preview.html} text={preview.text} />
            </div>
          )}
        </CommunicationsPanel>
      </div>

      {template.previewable ? (
        <SendTestEmailSheet
          open={sendOpen}
          onOpenChange={setSendOpen}
          templateKey={template.key}
          templateName={template.name}
          defaultRecipient={defaultTestRecipient}
          sampleProfiles={sampleProfiles}
        />
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#1e3a5f]/10 py-3 last:border-b-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
