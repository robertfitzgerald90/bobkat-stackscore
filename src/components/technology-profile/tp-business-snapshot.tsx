import Link from "next/link";
import { Building2, ExternalLink, Mail, Phone, User } from "lucide-react";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { isBusinessSnapshotSparse } from "@/lib/technology-profile/display";
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
  const isSparse = isBusinessSnapshotSparse(snapshot);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          ) : (
            <Link
              href={`/clients/${clientId}/business-profile`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              View Profile
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSparse && !limited ? (
          <TpEmptyState
            icon={Building2}
            title="Business profile incomplete"
            message="Add industry, goals, and compliance context to sharpen recommendations and improvement planning."
            actionLabel={capabilities.canEditBusinessProfile ? "Complete profile" : undefined}
            actionHref={
              capabilities.canEditBusinessProfile
                ? `/clients/${clientId}/business-profile`
                : undefined
            }
          />
        ) : (
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
        )}

        {!limited && !isSparse ? (
          <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="flex min-w-0 items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">{snapshot.primaryContactName}</span>
              {snapshot.primaryContactTitle ? (
                <span className="text-muted-foreground">· {snapshot.primaryContactTitle}</span>
              ) : null}
            </div>
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="break-all">{snapshot.primaryContactEmail}</span>
            </div>
            {snapshot.primaryContactPhone ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {snapshot.primaryContactPhone}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
