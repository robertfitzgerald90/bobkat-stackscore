import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { getBusinessProfile, formatComplianceFramework, formatPrimaryBusinessGoal } from "@/lib/business-profile";
import { getTechnologyProfile } from "@/lib/technology-profile";
import { auth } from "@/lib/auth";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";

type BusinessSnapshotProps = {
  clientId: string;
};

function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
}

export async function BusinessSnapshot({ clientId }: BusinessSnapshotProps) {
  const session = await auth();
  const role = session?.user?.role ?? "client";

  const [profile, technologyProfile] = await Promise.all([
    getBusinessProfile(clientId, role),
    getTechnologyProfile(clientId),
  ]);

  if (!profile) return null;

  const score = technologyProfile?.overallStackScore ?? null;

  const snapshotItems = [
    { label: "Industry", value: profile.industry || "—" },
    { label: "Employees", value: formatCount(profile.employeeCount) },
    { label: "Locations", value: formatCount(profile.numberOfLocations) },
    {
      label: "Business Goal",
      value: formatPrimaryBusinessGoal(profile.primaryBusinessGoal),
    },
    { label: "Technology Vision", value: profile.technologyVision || "—" },
    {
      label: "Compliance",
      value: formatComplianceFramework(profile.complianceFramework),
    },
    {
      label: "StackScore",
      value: score !== null ? String(score) : "—",
      score,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Business Snapshot
            </CardTitle>
            <CardDescription>
              Lightweight business context for assessments, recommendations, and improvement plans.
            </CardDescription>
          </div>
          <Link
            href={`/clients/${clientId}/business-profile`}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {profile.canEdit ? "Edit Profile" : "View Profile"}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {snapshotItems.map((item) => (
            <div key={item.label} className="rounded-md border px-3 py-2">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd
                className={
                  item.score !== undefined && item.score !== null
                    ? `text-lg font-semibold tabular-nums ${getScoreTextColorClass(item.score)}`
                    : "text-sm font-medium"
                }
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
