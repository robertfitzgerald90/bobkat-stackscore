"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProposalReviewViewProps = {
  clientId: string;
  tipId: string;
  proposal: TipPlanDetail;
  initialAction: "review" | "approve";
};

export function ProposalReviewView({
  clientId,
  tipId,
  proposal,
  initialAction,
}: ProposalReviewViewProps) {
  const [mode, setMode] = useState<"review" | "approve" | "changes">(initialAction);
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(action: "approve" | "request_changes") {
    setLoading(true);
    const response = await fetch(`/api/v1/clients/${clientId}/proposals/${tipId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        signerName,
        signerTitle,
        consentText:
          "I approve this proposal and authorize Bobkat IT to proceed with the described scope.",
        comments,
      }),
    });
    setLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to update proposal");
      return;
    }
    toast.success(action === "approve" ? "Proposal approved" : "Revision request submitted");
    setMode("review");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Technology Proposal</p>
        <h1 className="text-3xl font-semibold tracking-tight">{proposal.title}</h1>
        <p className="text-muted-foreground">{proposal.executiveSummary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1 font-semibold capitalize">{proposal.status.replace("_", " ")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Investment</p>
          <p className="mt-1 font-semibold">
            {proposal.investment.clientTotal
              ? `$${proposal.investment.clientTotal.toLocaleString()}`
              : "Available on review"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Roadmap Phases</p>
          <p className="mt-1 font-semibold">{proposal.roadmapPhases.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Deliverables</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {proposal.playbooks.map((playbook) => (
            <li key={playbook.id}>• {playbook.name}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/api/v1/clients/${clientId}/tip/${tipId}/pdf`}
            target="_blank"
            className={buttonClassName({ variant: "outline" })}
          >
            Download Proposal PDF
          </Link>
          <Button variant="default" onClick={() => setMode("approve")}>
            Approve Proposal
          </Button>
          <Button variant="secondary" onClick={() => setMode("changes")}>
            Request Changes
          </Button>
        </div>
      </div>

      {mode === "approve" ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Electronic Signature</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signerName">Full name</Label>
              <Input id="signerName" value={signerName} onChange={(e) => setSignerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerTitle">Title</Label>
              <Input id="signerTitle" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} />
            </div>
          </div>
          <Button disabled={loading || !signerName.trim()} onClick={() => submit("approve")}>
            {loading ? "Submitting..." : "Sign and Approve"}
          </Button>
        </div>
      ) : null}

      {mode === "changes" ? (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Request Changes</h2>
          <textarea
            className="min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Describe the changes you'd like Bobkat IT to make."
          />
          <Button disabled={loading || !comments.trim()} onClick={() => submit("request_changes")}>
            {loading ? "Submitting..." : "Submit Revision Request"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
