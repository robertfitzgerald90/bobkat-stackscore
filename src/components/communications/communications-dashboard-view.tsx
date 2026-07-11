import Link from "next/link";
import { Eye, LayoutTemplate, Mail, Send } from "lucide-react";
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
  CommunicationTestSendRecord,
} from "@/lib/communications/types";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";

type CommunicationsDashboardViewProps = {
  stats: CommunicationDashboardStats;
  recentTemplates: TemplateLibraryItem[];
  recentTestSends: CommunicationTestSendRecord[];
};

export function CommunicationsDashboardView({
  stats,
  recentTemplates,
  recentTestSends,
}: CommunicationsDashboardViewProps) {
  const metrics = [
    { label: "Active Templates", value: stats.activeTemplates },
    { label: "Draft Templates", value: stats.draftTemplates },
    { label: "Available for Preview", value: stats.previewableTemplates },
    { label: "Test Emails Sent", value: stats.testEmailsSent },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Communications</h2>
          <p className="mt-1 text-muted-foreground">
            Preview production email templates and send safe test messages without triggering
            customer workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <Link href="/admin/communications/templates/EMAIL-001" className={buttonClassName({})}>
            <Send className="size-4" />
            Send Test Email
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="stat-card rounded-xl bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="stat-card rounded-xl bg-card p-5">
          <h3 className="text-lg font-semibold text-foreground">Email System Status</h3>
          <div className="mt-4 space-y-3 text-sm">
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
          </div>
        </section>

        <section className="stat-card rounded-xl bg-card p-5">
          <h3 className="text-lg font-semibold text-foreground">Recently Updated Templates</h3>
          <div className="mt-4 space-y-3">
            {recentTemplates.slice(0, 4).map((template) => (
              <div
                key={template.key}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.documentId}</p>
                </div>
                <TemplateStatusBadge status={template.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="stat-card overflow-hidden rounded-xl bg-card">
        <div className="border-b border-border/70 px-5 py-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Test Sends</h3>
        </div>
        {recentTestSends.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">No test emails sent yet</p>
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
                  <TableCell className="capitalize text-sm">{record.status}</TableCell>
                  <TableCell className="text-sm">{record.sentByName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
