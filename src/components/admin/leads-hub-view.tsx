import Link from "next/link";
import { ArrowRight, Camera, Globe, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { LeadsHubSummary } from "@/lib/leads/hub";
import { cn } from "@/lib/utils";

type LeadsHubViewProps = {
  summary: LeadsHubSummary;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-md border border-border/50 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function LeadsHubView({ summary }: LeadsHubViewProps) {
  const { snapshot, website, prospects } = summary;

  return (
    <div className="min-w-0 space-y-5">
      <header>
        <h1 className="page-title">Leads</h1>
        <p className="page-description">
          Intake and outreach sources stay separate — open each workflow for operational work.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4" aria-hidden />
              Technology Snapshot
            </CardTitle>
            <CardDescription>Statuses from Technology Snapshot acquisition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="New" value={snapshot.newLeads} />
              <Metric label="Follow-up" value={snapshot.followUpNeeded} />
              <Metric label="Awaiting follow-up" value={snapshot.awaitingFollowUp} />
              <Metric label="Contacted" value={snapshot.contacted} />
              <Metric label="Invited" value={snapshot.assessmentInvitationsSent} />
              <Metric label="Converted" value={snapshot.converted} />
            </div>
            <Link
              href="/snapshot-leads"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "inline-flex gap-1")}
            >
              Open Snapshot Leads
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" aria-hidden />
              Website Inquiries
            </CardTitle>
            <CardDescription>Statuses from website contact forms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Total" value={website.total} />
              <Metric label="New" value={website.newLeads} />
              <Metric label="Contacted" value={website.contacted} />
              <Metric label="Qualified" value={website.qualified} />
              <Metric label="Converted" value={website.converted} />
            </div>
            <Link
              href="/website-leads"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "inline-flex gap-1")}
            >
              Open Website Leads
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" aria-hidden />
              Communications Prospects
            </CardTitle>
            <CardDescription>
              Outreach Prospects remain in Communications — not merged with intake leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Metric
                label="Total prospects"
                value={prospects.total === null ? "—" : prospects.total}
              />
              <Metric
                label="Status: new"
                value={prospects.newCount === null ? "—" : prospects.newCount}
              />
            </div>
            {prospects.total === null ? (
              <p className="text-xs text-muted-foreground">
                Counts unavailable — open Communications Prospects to manage records.
              </p>
            ) : null}
            <Link
              href="/admin/communications/prospects"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1")}
            >
              Open Communications Prospects
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
