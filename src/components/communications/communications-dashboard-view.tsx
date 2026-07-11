import Link from "next/link";
import { Eye, LayoutTemplate, Send } from "lucide-react";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { TemplateStatusBadge } from "@/components/communications/template-status-badge";
import { buttonClassName } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CommunicationDashboardStats,
  CommunicationHealthItem,
  CommunicationTestSendRecord,
  TemplateActivityItem,
} from "@/lib/communications/types";
import type { ActivityFeedItem } from "@/lib/communications/activity/record-activity";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";

type CommunicationsDashboardViewProps = {
  stats: CommunicationDashboardStats;
  recentTemplates: TemplateLibraryItem[];
  recentTestSends: CommunicationTestSendRecord[];
  recentActivity: TemplateActivityItem[];
  customerActivity: ActivityFeedItem[];
  recentFailures: Array<{
    id: string;
    subject: string;
    recipientEmail: string;
    organizationName: string | null;
    status: string;
    occurredAt: string;
  }>;
  health: CommunicationHealthItem[];
};

export function CommunicationsDashboardView({
  stats,
  recentTemplates,
  recentTestSends,
  recentActivity,
  customerActivity,
  recentFailures,
  health,
}: CommunicationsDashboardViewProps) {
  const metrics = [
    { label: "Production Messages", value: stats.messagesSent },
    { label: "Delivery Rate", value: stats.deliveryRate === null ? "—" : `${stats.deliveryRate}%` },
    { label: "Open Rate", value: stats.openRate === null ? "—" : `${stats.openRate}%` },
    { label: "Click Rate", value: stats.clickRate === null ? "—" : `${stats.clickRate}%` },
    { label: "Failed Deliveries", value: stats.failedDeliveries },
    { label: "Test Emails Sent", value: stats.testEmailsSent },
    { label: "Published Versions", value: stats.publishedVersions },
    { label: "Pending Drafts", value: stats.draftVersions },
  ];

  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Communications"
        description="Author, preview, and validate production email templates without triggering customer workflows."
        actions={
          <>
            <Link
              href="/admin/communications/templates/EMAIL-001"
              className={buttonClassName({ variant: "outline" })}
            >
              <Eye className="size-4" />
              Preview Account Activation
            </Link>
            <Link
              href="/admin/communications/templates"
              className={buttonClassName({ variant: "outline" })}
            >
              <LayoutTemplate className="size-4" />
              Browse Templates
            </Link>
            <Link href="/admin/communications/history" className={buttonClassName({ variant: "outline" })}>
              History
            </Link>
            <Link href="/admin/communications/analytics" className={buttonClassName({ variant: "outline" })}>
              Analytics
            </Link>
            <Link href="/admin/communications/templates/EMAIL-001" className={buttonClassName({})}>
              <Send className="size-4" />
              Send Test Email
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[#1e3a5f]/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#082F5B]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <CommunicationsPanel title="Communication Health">
          <div className="space-y-3">
            {health.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-[#1e3a5f]/10 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <StatusPill tone={item.status === "healthy" ? "success" : "warning"}>
                  {item.status}
                </StatusPill>
              </div>
            ))}
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Email System Status">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{stats.providerLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Last test email</span>
              <span className="font-medium">
                {stats.lastTestEmail
                  ? new Date(stats.lastTestEmail.createdAt).toLocaleString()
                  : "None yet"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Previewable templates</span>
              <span className="font-medium">{stats.previewableTemplates}</span>
            </div>
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Templates Needing Review">
          {stats.templatesNeedingReview === 0 ? (
            <p className="text-sm text-muted-foreground">All active templates are published.</p>
          ) : (
            <p className="text-sm text-secondary-token">
              {stats.templatesNeedingReview} template(s) have unpublished draft versions.
            </p>
          )}
          <div className="mt-4 space-y-3">
            {recentTemplates.slice(0, 3).map((template) => (
              <Link
                key={template.key}
                href={`/admin/communications/templates/${template.key}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] p-3 transition-colors hover:bg-[#082F5B]/[0.05]"
              >
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.documentId}</p>
                </div>
                <TemplateStatusBadge status={template.status} />
              </Link>
            ))}
          </div>
        </CommunicationsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CommunicationsPanel title="Recent Customer Activity">
          {customerActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customer activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {customerActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? `/clients/${item.clientId}/activity`}
                  className="block rounded-lg border border-[#1e3a5f]/10 p-3 transition-colors hover:bg-muted/20"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.clientName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.occurredAt).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CommunicationsPanel>

        <CommunicationsPanel title="Recent Delivery Failures">
          {recentFailures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent delivery failures.</p>
          ) : (
            <div className="space-y-3">
              {recentFailures.map((failure) => (
                <Link
                  key={failure.id}
                  href={`/admin/communications/history/${failure.id}`}
                  className="block rounded-lg border border-[#1e3a5f]/10 p-3 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{failure.subject}</p>
                    <StatusPill tone="warning">{failure.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {failure.recipientEmail}
                    {failure.organizationName ? ` · ${failure.organizationName}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CommunicationsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CommunicationsPanel title="Recent Activity">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No template version activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#1e3a5f]/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.templateName}</p>
                    <StatusPill tone={item.status === "published" ? "success" : "info"}>
                      v{item.versionNumber} · {item.status}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.changeNotes ?? "Updated template version"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.actorName ?? "System"} · {new Date(item.occurredAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CommunicationsPanel>

        <CommunicationsPanel title="Newest Templates">
          <div className="space-y-3">
            {recentTemplates.slice(0, 5).map((template) => (
              <Link
                key={template.key}
                href={`/admin/communications/templates/${template.key}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-[#1e3a5f]/10 p-3 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(template.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <TemplateStatusBadge status={template.status} />
              </Link>
            ))}
          </div>
        </CommunicationsPanel>
      </div>

      <CommunicationsPanel title="Recent Test Sends">
        {recentTestSends.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-medium text-foreground">No test emails sent yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Send a test email from a template detail page to see history here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent by</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTestSends.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.templateName}</p>
                      <p className="text-xs text-muted-foreground">{record.templateKey}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{record.recipientEmail}</TableCell>
                  <TableCell>
                    <StatusPill tone={record.status === "sent" ? "success" : "warning"}>
                      {record.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-sm">{record.sentByName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CommunicationsPanel>
    </div>
  );
}
