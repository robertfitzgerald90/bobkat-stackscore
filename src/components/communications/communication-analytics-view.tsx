"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { ANALYTICS_DEFINITIONS } from "@/lib/communications/tracking/analytics-definitions";
import type { CommunicationAnalyticsSummary } from "@/lib/communications/tracking/analytics";
import { buttonClassName } from "@/components/ui/button";

type CommunicationAnalyticsViewProps = {
  summary: CommunicationAnalyticsSummary;
  sentOverTime: Array<{ date: string; count: number }>;
  templatePerformance: Array<{
    templateKey: string;
    templateName: string;
    sent: number;
    opens: number;
    clicks: number;
  }>;
  recentFailures: Array<{
    id: string;
    subject: string;
    recipientEmail: string;
    organizationName: string | null;
    status: string;
    failureReason: string | null;
    occurredAt: string;
  }>;
  campaignAnalytics?: {
    invitationsSent: number;
    assessmentsStarted: number;
    assessmentsCompleted: number;
    conversionRate: number | null;
    topPerformingCampaigns: Array<{
      id: string;
      name: string;
      metrics: { conversionRate: number | null; invitationsSent: number };
    }>;
  };
};

export function CommunicationAnalyticsView({
  summary,
  sentOverTime,
  templatePerformance,
  recentFailures,
  campaignAnalytics,
}: CommunicationAnalyticsViewProps) {
  const metrics = [
    { label: "Messages Sent", value: summary.messagesSent },
    { label: "Delivery Rate", value: formatRate(summary.deliveryRate) },
    { label: "Open Rate", value: formatRate(summary.openRate) },
    { label: "Click Rate", value: formatRate(summary.clickRate) },
    { label: "Bounce Rate", value: formatRate(summary.bounceRate) },
    { label: "Failure Rate", value: formatRate(summary.failureRate) },
  ];

  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Communications Analytics"
        description="Real production engagement metrics. Test messages are excluded by default."
        actions={
          <>
            <Link
              href="/admin/communications/history?status=OPENED"
              className={buttonClassName({ variant: "outline" })}
            >
              Opened Messages
            </Link>
            <Link
              href="/admin/communications/history?status=FAILED"
              className={buttonClassName({ variant: "outline" })}
            >
              Failed Messages
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[#1e3a5f]/10 bg-card p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#082F5B]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CommunicationsPanel title="Messages Sent Over Time">
          <div className="h-72">
            {sentOverTime.length === 0 ? (
              <p className="text-sm text-muted-foreground">No production sends in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#082F5B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Template Performance">
          <div className="h-72">
            {templatePerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No template performance data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templatePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="templateKey" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#082F5B" name="Sent" />
                  <Bar dataKey="opens" fill="#7D97AC" name="Opens" />
                  <Bar dataKey="clicks" fill="#2563EB" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CommunicationsPanel>
      </div>

      {campaignAnalytics ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <CommunicationsPanel title="Campaign Outreach">
            <div className="grid gap-3 sm:grid-cols-2">
              <FunnelRow label="Invitations sent" value={campaignAnalytics.invitationsSent} />
              <FunnelRow label="Assessments started" value={campaignAnalytics.assessmentsStarted} />
              <FunnelRow label="Assessments completed" value={campaignAnalytics.assessmentsCompleted} />
              <FunnelRow
                label="Conversion rate"
                value={
                  campaignAnalytics.conversionRate === null
                    ? "—"
                    : `${campaignAnalytics.conversionRate}%`
                }
              />
            </div>
          </CommunicationsPanel>

          <CommunicationsPanel title="Top Performing Campaigns">
            {campaignAnalytics.topPerformingCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaign data yet.</p>
            ) : (
              <div className="space-y-3">
                {campaignAnalytics.topPerformingCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/admin/communications/campaigns/${campaign.id}`}
                    className="block rounded-lg border border-[#1e3a5f]/10 p-3 hover:bg-muted/20"
                  >
                    <p className="font-medium text-[#082F5B]">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.metrics.invitationsSent} sent ·{" "}
                      {campaign.metrics.conversionRate === null
                        ? "—"
                        : `${campaign.metrics.conversionRate}%`}{" "}
                      conversion
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CommunicationsPanel>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <CommunicationsPanel title="Engagement Funnel">
          <div className="space-y-3 text-sm">
            <FunnelRow label="Sent" value={summary.messagesSent} />
            <FunnelRow label="Delivered" value={summary.deliveredCount} />
            <FunnelRow label="Unique opened" value={summary.uniqueOpened} />
            <FunnelRow label="Unique clicked" value={summary.uniqueClicked} />
            <FunnelRow label="Activations attributed" value={summary.activationsAttributed} />
            <FunnelRow label="Assessments started" value={summary.assessmentsStarted} />
            <FunnelRow label="Assessments completed" value={summary.assessmentsCompleted} />
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Metric Definitions">
          <dl className="space-y-3 text-sm">
            {Object.entries(ANALYTICS_DEFINITIONS).map(([key, definition]) => (
              <div key={key}>
                <dt className="font-medium capitalize text-foreground">{key.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="text-muted-foreground">{definition}</dd>
              </div>
            ))}
          </dl>
        </CommunicationsPanel>
      </div>

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
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{failure.subject}</p>
                  <StatusPill tone="warning">{failure.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {failure.recipientEmail}
                  {failure.organizationName ? ` · ${failure.organizationName}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(failure.occurredAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CommunicationsPanel>
    </div>
  );
}

function formatRate(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function FunnelRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#1e3a5f]/10 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
