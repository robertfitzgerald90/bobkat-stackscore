"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PhaseProposalDetail } from "@/lib/phase-proposals/types";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { buttonClassName } from "@/components/ui/button";

export function PhaseProposalReview({
  clientId,
  initialProposal,
}: {
  clientId: string;
  initialProposal: PhaseProposalDetail;
}) {
  const router = useRouter();
  const [proposal, setProposal] = useState(initialProposal);
  const [comments, setComments] = useState(initialProposal.clientComments ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function setStatus(status: "internal_review" | "sent" | "approved" | "rejected") {
    setError(null);
    const response = await fetch(
      `/api/v1/clients/${clientId}/phase-proposals/${proposal.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "approved" || status === "rejected" ? { clientComments: comments } : {}),
        }),
      },
    );
    const body = (await response.json()) as {
      proposal?: PhaseProposalDetail;
      error?: string;
    };
    if (!response.ok || !body.proposal) {
      setError(body.error ?? "Unable to update proposal");
      toast.error(body.error ?? "Unable to update proposal");
      return;
    }
    setProposal(body.proposal);
    toast.success(
      status === "approved"
        ? "Phase proposal approved"
        : status === "sent"
          ? "Proposal sent to client"
          : status === "rejected"
            ? "Proposal rejected"
            : "Proposal updated",
    );
    startTransition(() => router.refresh());
  }

  const snapshot = proposal.snapshot;

  return (
    <div className="space-y-6">
      <Link
        href={`/clients/${clientId}/roadmap/phases/${proposal.phaseId}`}
        className={buttonClassName({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to phase
      </Link>

      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
              {proposal.phaseSubtitle} Proposal
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{proposal.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {proposal.proposalNumber} · v{proposal.version} · {proposal.timeline}
            </p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {proposal.statusLabel}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="One-Time Investment" value={formatCurrency(proposal.oneTimeInvestment)} />
          <Meta
            label="Monthly Services"
            value={
              proposal.monthlyRecurringInvestment > 0
                ? `${formatCurrency(proposal.monthlyRecurringInvestment)}/mo`
                : "None"
            }
          />
          <Meta
            label="StackScore Improvement"
            value={`+${proposal.expectedScoreImprovement} pts`}
          />
          <Meta label="Prepared By" value={proposal.preparedByName} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {proposal.documentUrl ? (
            <a
              href={proposal.documentUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ variant: "outline" })}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          ) : null}

          {proposal.isConsultant &&
          (proposal.status === "draft" || proposal.status === "internal_review") ? (
            <>
              {proposal.status === "draft" ? (
                <button
                  type="button"
                  className={buttonClassName({ variant: "secondary" })}
                  disabled={pending}
                  onClick={() => void setStatus("internal_review")}
                >
                  Mark internal review
                </button>
              ) : null}
              <button
                type="button"
                className={buttonClassName({ variant: "default" })}
                disabled={pending}
                onClick={() => void setStatus("sent")}
              >
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send to client
              </button>
            </>
          ) : null}

          {proposal.canClientApprove ? (
            <>
              <button
                type="button"
                className={buttonClassName({ variant: "default" })}
                disabled={pending}
                onClick={() => void setStatus("approved")}
              >
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Approve this phase
              </button>
              <button
                type="button"
                className={buttonClassName({ variant: "outline" })}
                disabled={pending}
                onClick={() => void setStatus("rejected")}
              >
                Reject
              </button>
            </>
          ) : null}
        </div>

        {(proposal.canClientApprove || proposal.clientComments) && (
          <div className="mt-4">
            <label className="text-sm font-medium" htmlFor="proposal-comments">
              Comments (optional)
            </label>
            <textarea
              id="proposal-comments"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              value={comments}
              disabled={!proposal.canClientApprove || pending}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Questions or notes for Bobkat IT"
            />
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </header>

      <Section title="Executive Summary">
        {snapshot.executiveSummary.split(/\n\n+/).map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </Section>

      <Section title="Scope of Work">
        <Subheading>Included initiatives</Subheading>
        <Checklist items={snapshot.scopeOfWork.includedInitiatives} />
        <Subheading>Implementation activities</Subheading>
        <Checklist items={snapshot.scopeOfWork.implementationActivities} />
        <Subheading>Deliverables</Subheading>
        <Checklist items={snapshot.scopeOfWork.deliverables} />
        <p className="mt-3 text-sm text-muted-foreground">
          Expected timeline: {snapshot.scopeOfWork.expectedTimeline}
        </p>
        <Subheading>Dependencies</Subheading>
        <Checklist items={snapshot.scopeOfWork.dependencies} />
        <Subheading>Out of scope</Subheading>
        <Checklist items={snapshot.scopeOfWork.outOfScope} />
      </Section>

      <Section title="Business Outcomes">
        <Checklist
          items={snapshot.businessOutcomes.map((item) => item.description || item.title)}
        />
      </Section>

      <Section title="Investment Summary">
        <div className="grid gap-3 sm:grid-cols-3">
          <Meta
            label="One-Time Implementation"
            value={formatCurrency(proposal.oneTimeInvestment)}
          />
          <Meta
            label="Monthly Recurring"
            value={
              proposal.monthlyRecurringInvestment > 0
                ? `${formatCurrency(proposal.monthlyRecurringInvestment)}/mo`
                : "None"
            }
          />
          <Meta
            label="Annual Recurring"
            value={
              proposal.annualRecurringInvestment > 0
                ? `${formatCurrency(proposal.annualRecurringInvestment)}/yr`
                : "None"
            }
          />
        </div>
        {proposal.monthlyRecurringInvestment > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Monthly services begin after successful implementation and client acceptance of this
            phase.
          </p>
        ) : null}
      </Section>

      <Section title="Assumptions">
        <Checklist items={snapshot.assumptions} />
      </Section>

      <Section title="Acceptance">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Approval applies to {proposal.phaseSubtitle} — {proposal.phaseName} only. Remaining
          Technology Roadmap phases remain optional and may be approved separately.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#082f5b]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Subheading({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-4 text-sm font-semibold first:mt-0">{children}</p>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
