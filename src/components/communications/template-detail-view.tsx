"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { EmailPreviewPanel } from "@/components/communications/email-preview-panel";
import { SendTestEmailSheet } from "@/components/communications/send-test-email-sheet";
import { TemplateStatusBadge } from "@/components/communications/template-status-badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/communications/registry";
import type { EmailTemplateCategory, EmailTemplateStatus } from "@/lib/communications/types";

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
  };
  preview: { html: string; text: string } | null;
};

export function TemplateDetailView({ template, preview }: TemplateDetailViewProps) {
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/admin/communications/templates"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Template Library
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{template.name}</h2>
            <TemplateStatusBadge status={template.status} />
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

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="stat-card space-y-4 rounded-xl bg-card p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
            <p className="mt-1 text-sm font-medium">{CATEGORY_LABELS[template.category]}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
            <p className="mt-1 text-sm">{template.subject}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview text</p>
            <p className="mt-1 text-sm text-secondary-token">{template.previewText}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated</p>
            <p className="mt-1 text-sm">{new Date(template.lastUpdated).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Required variables</p>
            <p className="mt-1 text-sm">{template.requiredVariables.join(", ") || "None"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Optional variables</p>
            <p className="mt-1 text-sm">{template.optionalVariables.join(", ") || "None"}</p>
          </div>
        </div>

        <div className="stat-card rounded-xl bg-card p-5">
          {!template.previewable || !preview ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-medium text-foreground">Preview not available</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                This template is registered as Draft. Implement the React Email template before
                previewing or sending test messages.
              </p>
            </div>
          ) : (
            <EmailPreviewPanel html={preview.html} text={preview.text} />
          )}
        </div>
      </div>

      {template.previewable ? (
        <SendTestEmailSheet
          open={sendOpen}
          onOpenChange={setSendOpen}
          templateKey={template.key}
          templateName={template.name}
        />
      ) : null}
    </div>
  );
}
