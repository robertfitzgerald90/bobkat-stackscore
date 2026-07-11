"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  CommunicationDeliveryTimeline,
  OpenTrackingNotice,
} from "@/components/communications/communication-delivery-timeline";
import {
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";

type CommunicationDetailViewProps = {
  message: {
    id: string;
    subject: string;
    previewText: string | null;
    recipientEmail: string;
    recipientName: string | null;
    templateKey: string;
    templateName: string;
    templateVersion: number | null;
    statusLabel: string;
    status: string;
    isTest: boolean;
    sentAt: string | null;
    deliveredAt: string | null;
    firstOpenedAt: string | null;
    lastOpenedAt: string | null;
    openCount: number;
    firstClickedAt: string | null;
    lastClickedAt: string | null;
    clickCount: number;
    failureReason: string | null;
    providerMessageId: string | null;
    client: { id: string; companyName: string } | null;
    user: { id: string; name: string; email: string } | null;
    createdBy: { id: string; name: string; email: string } | null;
    assessment: { id: string; assessmentName: string } | null;
    project: { id: string; title: string } | null;
    events: Array<{
      id: string;
      eventType: string;
      source: string;
      occurredAt: string;
      url?: string | null;
      linkLabel?: string | null;
    }>;
    clickedLinks: Array<{
      url: string;
      label: string | null;
      firstClickedAt: string;
      lastClickedAt: string;
      count: number;
    }>;
    metadataJson: unknown;
  };
  showProviderMetadata: boolean;
};

export function CommunicationDetailView({
  message,
  showProviderMetadata,
}: CommunicationDetailViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/communications/history"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-[#082F5B]"
        >
          <ArrowLeft className="size-4" />
          Communication History
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-[#082F5B]">{message.subject}</h2>
          <StatusPill tone={message.isTest ? "info" : "neutral"}>
            {message.isTest ? "Test" : "Production"}
          </StatusPill>
          <StatusPill tone="neutral">{message.statusLabel}</StatusPill>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <CommunicationsPanel title="Summary">
            <DetailField label="Recipient" value={message.recipientEmail} />
            <DetailField label="Organization" value={message.client?.companyName ?? "—"} />
            <DetailField label="Template" value={`${message.templateName} (${message.templateKey})`} />
            <DetailField label="Version" value={message.templateVersion ? `v${message.templateVersion}` : "—"} />
            <DetailField label="Sent" value={formatDate(message.sentAt)} />
            <DetailField label="Delivered" value={formatDate(message.deliveredAt)} />
            <DetailField label="Sent by" value={message.createdBy?.name ?? "System"} />
          </CommunicationsPanel>

          <CommunicationsPanel title="Engagement">
            <OpenTrackingNotice />
            <div className="mt-4 space-y-2 text-sm">
              <DetailField label="First opened" value={formatDate(message.firstOpenedAt)} />
              <DetailField label="Last opened" value={formatDate(message.lastOpenedAt)} />
              <DetailField label="Open count" value={String(message.openCount)} />
              <DetailField label="First clicked" value={formatDate(message.firstClickedAt)} />
              <DetailField label="Last clicked" value={formatDate(message.lastClickedAt)} />
              <DetailField label="Click count" value={String(message.clickCount)} />
            </div>
          </CommunicationsPanel>

          {(message.status === "FAILED" || message.status === "BOUNCED") && message.failureReason ? (
            <CommunicationsPanel title="Failure">
              <p className="text-sm text-secondary-token">{message.failureReason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Permanent failures should be reviewed before retrying. Automated resend scheduling is not enabled in Sprint 3.
              </p>
            </CommunicationsPanel>
          ) : null}
        </div>

        <div className="space-y-4">
          <CommunicationsPanel title="Delivery Timeline">
            <CommunicationDeliveryTimeline events={message.events} />
          </CommunicationsPanel>

          {message.clickedLinks.length > 0 ? (
            <CommunicationsPanel title="Links Clicked">
              <div className="space-y-3">
                {message.clickedLinks.map((link) => (
                  <div key={link.url} className="rounded-lg border border-[#1e3a5f]/10 p-3 text-sm">
                    <p className="font-medium">{link.label ?? "Link"}</p>
                    <p className="mt-1 break-all text-muted-foreground">{link.url}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {link.count} click{link.count === 1 ? "" : "s"} · first{" "}
                      {new Date(link.firstClickedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CommunicationsPanel>
          ) : null}

          {showProviderMetadata ? (
            <CommunicationsPanel title="Provider Metadata">
              <pre className="overflow-auto rounded-lg bg-muted/30 p-3 text-xs">
                {JSON.stringify(
                  {
                    providerMessageId: message.providerMessageId,
                    metadata: message.metadataJson,
                  },
                  null,
                  2,
                )}
              </pre>
            </CommunicationsPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#1e3a5f]/10 py-3 last:border-b-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}
