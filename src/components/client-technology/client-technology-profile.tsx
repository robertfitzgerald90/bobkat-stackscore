"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AssignTechnologySheet } from "@/components/client-technology/assign-technology-sheet";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import {
  TechnologyStandardBadge,
} from "@/components/technology-catalog/technology-catalog-badges";
import {
  formatAlignmentStatus,
  formatDeploymentStatus,
  formatHealthStatus,
  formatManagedBy,
} from "@/lib/technology-catalog/labels";
import type { ClientTechnologyRecord } from "@/lib/technology-catalog/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CatalogOption = {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  standardStatus: string;
  category: { name: string };
  products: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    isPreferred: boolean;
  }>;
};

type ClientTechnologyProfileProps = {
  clientId: string;
  companyName: string;
  deployments: ClientTechnologyRecord[];
  catalogOptions: CatalogOption[];
  metrics: {
    total: number;
    preferredCount: number;
    exceptionCount: number;
    atRiskCount: number;
  };
  canManage: boolean;
};

function healthBadgeVariant(status: string) {
  if (status === "healthy") return "border-success/30 bg-success/10 text-success";
  if (status === "attention_needed") return "border-warning/30 bg-warning/10 text-warning";
  if (status === "at_risk") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-border bg-muted/40 text-secondary-token";
}

export function ClientTechnologyProfile({
  clientId,
  companyName,
  deployments: initialDeployments,
  catalogOptions,
  metrics,
  canManage,
}: ClientTechnologyProfileProps) {
  const [deployments, setDeployments] = useState(initialDeployments);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const metricCards = useMemo(
    () => [
      { label: "Deployed Technologies", value: metrics.total },
      { label: "Preferred Standard", value: metrics.preferredCount },
      { label: "Exceptions", value: metrics.exceptionCount },
      { label: "Needs Attention", value: metrics.atRiskCount },
    ],
    [metrics],
  );

  async function handleRemove(deploymentId: string) {
    setRemovingId(deploymentId);
    const response = await fetch(`/api/v1/clients/${clientId}/technologies/${deploymentId}`, {
      method: "DELETE",
    });
    setRemovingId(null);

    if (!response.ok) {
      toast.error("Unable to remove deployment");
      return;
    }

    setDeployments((current) => current.filter((deployment) => deployment.id !== deploymentId));
    toast.success("Technology removed from client profile");
  }

  function handleAssigned(deployment: ClientTechnologyRecord) {
    setDeployments((current) => [deployment, ...current]);
    setAssignOpen(false);
    toast.success("Technology assigned to client");
  }

  return (
    <div className="space-y-8">
      <WorkspaceSectionHeader
        title="Client Technology Profile"
        description={`Documented technology deployments for ${companyName}.`}
        actions={
          canManage ? (
            <Button type="button" onClick={() => setAssignOpen(true)}>
              <Plus className="size-4" />
              Assign Technology
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="stat-card rounded-xl bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      {deployments.length === 0 ? (
        <div className="stat-card rounded-xl border border-dashed border-border/70 bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">No technologies assigned yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Assign catalog technologies to record what this organization actually uses.
          </p>
          {canManage ? (
            <Button type="button" className="mt-4" onClick={() => setAssignOpen(true)}>
              Assign Technology
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="stat-card overflow-hidden rounded-xl bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technology</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Alignment</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Managed By</TableHead>
                {canManage ? <TableHead className="w-12" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/technology-catalog/${deployment.technology.slug}`}
                        className="font-medium text-foreground hover:text-accent-blue"
                      >
                        {deployment.displayName ?? deployment.technology.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {deployment.technology.vendor} · {deployment.technology.categoryName}
                      </p>
                      <TechnologyStandardBadge status={deployment.technology.standardStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-secondary-token">
                    {deployment.technologyProduct?.name ?? "Platform-level"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatDeploymentStatus(deployment.deploymentStatus)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatAlignmentStatus(deployment.alignmentStatus)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={healthBadgeVariant(deployment.healthStatus)}>
                      {formatHealthStatus(deployment.healthStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-secondary-token">
                    {formatManagedBy(deployment.managedBy)}
                  </TableCell>
                  {canManage ? (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={removingId === deployment.id}
                        onClick={() => handleRemove(deployment.id)}
                        aria-label={`Remove ${deployment.technology.name}`}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canManage ? (
        <AssignTechnologySheet
          open={assignOpen}
          onOpenChange={setAssignOpen}
          clientId={clientId}
          catalogOptions={catalogOptions}
          onAssigned={handleAssigned}
        />
      ) : null}
    </div>
  );
}
