import Link from "next/link";
import { Building2, ExternalLink, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import type { ProfileBusinessSnapshot, ProfileCapabilities } from "@/lib/technology-profile/types";

type TpBusinessSnapshotProps = {
  clientId: string;
  snapshot: ProfileBusinessSnapshot;
  capabilities: ProfileCapabilities;
  limited?: boolean;
};

function formatCount(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString();
}

export function TpBusinessSnapshot({
  clientId,
  snapshot,
  capabilities,
  limited = false,
}: TpBusinessSnapshotProps) {
  const gridItems = limited
    ? [
        { label: "Industry", value: snapshot.industry || "—" },
        { label: "Employees", value: formatCount(snapshot.employeeCount) },
        { label: "Locations", value: formatCount(snapshot.numberOfLocations) },
        { label: "Business Goal", value: snapshot.primaryBusinessGoalLabel },
      ]
    : [
        { label: "Industry", value: snapshot.industry || "—" },
        { label: "Employees", value: formatCount(snapshot.employeeCount) },
        { label: "Locations", value: formatCount(snapshot.numberOfLocations) },
        { label: "Business Goal", value: snapshot.primaryBusinessGoalLabel },
        { label: "IT Support", value: snapshot.itSupportModelLabel },
        { label: "Environment", value: snapshot.environmentTypeLabel },
        {
          label: "Compliance",
          value: snapshot.complianceFrameworkLabel,
          subvalue: snapshot.complianceStatus,
        },
        { label: "Technology Vision", value: snapshot.technologyVision || "—", wide: true },
      ];

  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Business Snapshot
            </CardTitle>
            <CardDescription>
              Business context shaping assessments, recommendations, and improvement plans.
            </CardDescription>
          </div>
          {capabilities.canEditBusinessProfile ? (
            <Link
              href={`/clients/${clientId}/business-profile`}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          ) : (
            <Link
              href={`/clients/${clientId}/business-profile`}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View Profile
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gridItems.map((item) => (
            <div
              key={item.label}
              className={
                "wide" in item && item.wide
                  ? "rounded-md border px-3 py-2 sm:col-span-2 lg:col-span-4"
                  : "rounded-md border px-3 py-2"
              }
            >
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-medium">{item.value}</dd>
              {"subvalue" in item && item.subvalue ? (
                <dd className="text-xs text-muted-foreground">{item.subvalue}</dd>
              ) : null}
            </div>
          ))}
        </dl>

        {!limited ? (
          <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{snapshot.primaryContactName}</span>
              {snapshot.primaryContactTitle ? (
                <span className="text-muted-foreground">· {snapshot.primaryContactTitle}</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {snapshot.primaryContactEmail}
            </div>
            {snapshot.primaryContactPhone ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {snapshot.primaryContactPhone}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
