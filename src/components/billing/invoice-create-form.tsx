"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ManualInvoiceBuilder } from "@/components/billing/manual-invoice-builder";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type InvoiceCreateFormProps = {
  clientId: string;
  tips: Array<{ id: string; title: string; status: string }>;
  projects: Array<{ id: string; title: string }>;
};

export function InvoiceCreateForm({ clientId, tips, projects }: InvoiceCreateFormProps) {
  const router = useRouter();
  const [source, setSource] = useState<"manual" | "tip" | "project">("manual");
  const [tipId, setTipId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSourceSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { source };
      if (source === "tip") {
        if (!tipId) throw new Error("Select a Technology Improvement Plan");
        body.tipId = tipId;
      } else if (source === "project") {
        if (!projectId) throw new Error("Select a project");
        body.projectId = projectId;
      }

      const res = await fetch(`/api/v1/clients/${clientId}/billing/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create invoice");
      }
      const data = (await res.json()) as { invoice: { id: string } };
      toast.success("Invoice created");
      router.push(`/clients/${clientId}/billing/invoices/${data.invoice.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clients/${clientId}/billing/invoices`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Invoices
        </Link>
        <h2 className="page-title mt-2">New Invoice</h2>
        <p className="page-description">Create from a plan, project, or itemized manual invoice</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(["manual", "tip", "project"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSource(value)}
                className={buttonClassName({
                  variant: source === value ? "default" : "outline",
                  size: "sm",
                })}
              >
                {value === "manual" ? "Manual" : value === "tip" ? "From Plan" : "From Project"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {source === "manual" ? <ManualInvoiceBuilder clientId={clientId} /> : null}

      {source === "tip" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">From Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSourceSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Technology Improvement Plan</label>
                <select
                  value={tipId}
                  onChange={(e) => setTipId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select plan…</option>
                  {tips.map((tip) => (
                    <option key={tip.id} value={tip.id}>
                      {tip.title} ({tip.status})
                    </option>
                  ))}
                </select>
              </div>
              <SubmitButton submitting={submitting} />
            </form>
          </CardContent>
        </Card>
      ) : null}

      {source === "project" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">From Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSourceSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select project…</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <SubmitButton submitting={submitting} />
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <button type="submit" disabled={submitting} className={buttonClassName({ variant: "default" })}>
      {submitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating…
        </>
      ) : (
        "Create draft invoice"
      )}
    </button>
  );
}
