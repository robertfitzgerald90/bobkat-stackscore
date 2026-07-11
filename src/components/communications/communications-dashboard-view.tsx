import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Eye,
  FileCheck2,
  FilePenLine,
  LayoutTemplate,
  Mail,
  MailCheck,
  MailOpen,
  MousePointerClick,
  Send,
  TestTube2,
} from "lucide-react";
import {
  CommunicationsEmptyState,
  CommunicationsMetricsGrid,
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { OutreachDashboardSection, type OutreachDashboardStats } from "@/components/communications/outreach-dashboard-section";
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
  outreachStats: OutreachDashboardStats;
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
  outreachStats,
  recentTemplates,
  recentTestSends,
  recentActivity,
  customerActivity,
  recentFailures,
  health,
}: CommunicationsDashboardViewProps) {
  const metrics = [
    { label: "Production Messages", value: stats.messagesSent, icon: Mail },
    {
      label: "Delivery Rate",
      value: stats.deliveryRate === null ? "—" : `${stats.deliveryRate}%`,
      icon: MailCheck,
    },
    {
      label: "Open Rate",
      value: stats.openRate === null ? "—" : `${stats.openRate}%`,
      icon: MailOpen,
    },
    {
      label: "Click Rate",
      value: stats.clickRate === null ? "—" : `${stats.clickRate}%`,
      icon: MousePointerClick,
    },
    { label: "Failed Deliveries", value: stats.failedDeliveries, icon: AlertTriangle },
    { label: "Test Emails Sent", value: stats.testEmailsSent, icon: TestTube2 },
    { label: "Published Versions", value: stats.publishedVersions, icon: FileCheck2 },
    { label: "Pending Drafts", value: stats.draftVersions, icon: FilePenLine },
  ];

  return (
    <div className="page-shell space-y-8">
      <OutreachDashboardSection stats={outreachStats} />

      <CommunicationsPageHeader
        title="Communications"
        description="Author, preview, and validate production email templates without triggering customer workflows."
        actions={
          <>
            <Link
              href="/admin/communications/templates/EMAIL-001"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              <Eye className="size-4" />
              Preview Account Activation
            </Link>
            <Link
              href="/admin/communications/templates"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              <LayoutTemplate className="size-4" />
              Browse Templates
            </Link>
            <Link
              href="/admin/communications/history"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              History
            </Link>
            <Link
              href="/admin/communications/analytics"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              <BarChart3 className="size-4" />
              Analytics
            </Link>
            <Link
              href="/admin/communications/templates/EMAIL-001"
              className={buttonClassName({ variant: "default", size: "sm" })}
            >
              <Send className="size-4" />
              Send Test Email
            </Link>
          </>
        }
      />

      <CommunicationsMetricsGrid metrics={metrics} columns={4} />

      <div className="grid gap-6 xl:grid-cols-3">
        <CommunicationsPanel title="Communication Health">
          <div className="space-y-3">
            {health.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/15 p-3"
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
              <span className="font-medium text-foreground">{stats.providerLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Last test email</span>
              <span className="font-medium text-foreground">
                {stats.lastTestEmail
                  ? new Date(stats.lastTestEmail.createdAt).toLocaleString()
                  : "None yet"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Previewable templates</span>
              <span className="font-medium tabular-nums text-foreground">
                {stats.previewableTemplates}
              </span>
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
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/15 p-3 transition-colors hover:bg-surface-card-hover"
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
            <CommunicationsEmptyState
              title="No customer activity recorded yet"
              description="Activity from client workspaces will appear here."
            />
          ) : (
            <div className="space-y-3">
              {customerActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? `/clients/${item.clientId}/activity`}
                  className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-surface-card-hover"
                >
                  <p className="font-medium text-foreground">{item.title}</p>
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
            <CommunicationsEmptyState
              title="No recent delivery failures"
              description="Failed sends will appear here for follow-up."
            />
          ) : (
            <div className="space-y-3">
              {recentFailures.map((failure) => (
                <Link
                  key={failure.id}
                  href={`/admin/communications/history/${failure.id}`}
                  className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-surface-card-hover"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{failure.subject}</p>
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
            <CommunicationsEmptyState
              title="No template version activity yet"
              description="Publish or update a template to see activity here."
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/70 bg-muted/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{item.templateName}</p>
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
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-surface-card-hover"
              >
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
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

      <CommunicationsPanel title="Recent Test Sends" contentClassName="p-0 sm:p-0">
        {recentTestSends.length === 0 ? (
          <div className="px-5 pb-5">
            <CommunicationsEmptyState
              title="No test emails sent yet"
              description="Send a test email from a template detail page to see history here."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5">Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent by</TableHead>
                <TableHead className="pr-5">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTestSends.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="px-5">
                    <div>
                      <p className="font-medium text-foreground">{record.templateName}</p>
                      <p className="text-xs text-muted-foreground">{record.templateKey}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{record.recipientEmail}</TableCell>
                  <TableCell>
                    <StatusPill tone={record.status === "sent" ? "success" : "warning"}>
                      {record.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{record.sentByName}</TableCell>
                  <TableCell className="pr-5 text-sm text-muted-foreground">
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
