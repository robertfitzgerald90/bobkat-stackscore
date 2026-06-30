"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TipPlanSummary } from "@/lib/technology-improvement-plan/types";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { toast } from "sonner";

type TipPlanListProps = {
  clientId: string;
  clientName: string;
  initialPlans: TipPlanSummary[];
};

export function TipPlanList({ clientId, clientName, initialPlans }: TipPlanListProps) {
  const router = useRouter();
  const [plans] = useState(initialPlans);
  const [creating, setCreating] = useState(false);

  const startPlan = async () => {
    setCreating(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to create plan");
      }
      const body = (await response.json()) as { plan: TipPlanSummary };
      router.push(`/clients/${clientId}/improvement-plan/${body.plan.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start plan");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={clientTechnologyProfilePath(clientId)}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Technology Maturity Profile
          </Link>
          <h2 className="page-title">Technology Improvement Plans</h2>
          <p className="page-description">{clientName}</p>
        </div>
        <Button type="button" onClick={startPlan} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New Improvement Plan
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan History</CardTitle>
          <CardDescription>
            Draft and generated Technology Improvement Plans for this client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No improvement plans yet. Start a guided workflow from the latest assessment
              recommendations.
            </p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{plan.title}</p>
                    <Badge variant={plan.status === "generated" ? "success" : "outline"}>
                      {plan.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(plan.updatedAt).toLocaleString()}
                    {plan.generatedAt
                      ? ` · Generated ${new Date(plan.generatedAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/clients/${clientId}/improvement-plan/${plan.id}`}
                    className={buttonClassName({ variant: "default", size: "sm" })}
                  >
                    {plan.status === "generated" ? "View" : "Continue"}
                  </Link>
                  {plan.status === "generated" ? (
                    <a
                      href={`/api/v1/clients/${clientId}/tip/${plan.id}/pdf`}
                      className={buttonClassName({ variant: "outline", size: "sm" })}
                    >
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
