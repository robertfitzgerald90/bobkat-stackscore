"use client";

import Link from "next/link";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { useQuickInvite } from "@/components/communications/quick-invite-provider";
import { buttonClassName } from "@/components/ui/button";
import { LEAD_SOURCE_LABELS, PROSPECT_STATUS_LABELS } from "@/lib/communications/outreach/labels";

type ProspectDetailViewProps = {
  prospect: {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string | null;
    industry: string | null;
    employeeCount: number | null;
    leadSource: string;
    notes: string | null;
    status: string;
    clientId: string | null;
    createdAt: string;
    lastContactAt: string | null;
    createdBy: { name: string } | null;
    client: { id: string; companyName: string; status: string } | null;
    campaignRecipients: Array<{
      id: string;
      invitedAt: string | null;
      campaign: { id: string; name: string; status: string };
      message: { id: string; status: string } | null;
    }>;
  };
};

export function ProspectDetailView({ prospect }: ProspectDetailViewProps) {
  const { openQuickInvite } = useQuickInvite();

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title={`${prospect.firstName} ${prospect.lastName}`}
        description={prospect.company}
        actions={
          <>
            <button
              type="button"
              className={buttonClassName({})}
              onClick={() =>
                openQuickInvite({
                  firstName: prospect.firstName,
                  lastName: prospect.lastName,
                  company: prospect.company,
                  email: prospect.email,
                  phone: prospect.phone ?? undefined,
                  industry: prospect.industry ?? undefined,
                  employeeCount: prospect.employeeCount?.toString(),
                  notes: prospect.notes ?? undefined,
                })
              }
            >
              Send Another Invitation
            </button>
            {prospect.clientId ? (
              <Link href={`/clients/${prospect.clientId}`} className={buttonClassName({ variant: "outline" })}>
                Open Organization
              </Link>
            ) : null}
            <Link href="/admin/communications/prospects" className={buttonClassName({ variant: "outline" })}>
              Back to Prospects
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusPill tone="info">{PROSPECT_STATUS_LABELS[prospect.status] ?? prospect.status}</StatusPill>
        <StatusPill tone="neutral">{LEAD_SOURCE_LABELS[prospect.leadSource] ?? prospect.leadSource}</StatusPill>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CommunicationsPanel title="Contact">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Email</dt><dd>{prospect.email}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{prospect.phone ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Industry</dt><dd>{prospect.industry ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Employee Count</dt><dd>{prospect.employeeCount ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{new Date(prospect.createdAt).toLocaleString()}</dd></div>
            <div><dt className="text-muted-foreground">Last Contact</dt><dd>{prospect.lastContactAt ? new Date(prospect.lastContactAt).toLocaleString() : "—"}</dd></div>
            {prospect.notes ? <div><dt className="text-muted-foreground">Notes</dt><dd>{prospect.notes}</dd></div> : null}
          </dl>
        </CommunicationsPanel>

        <CommunicationsPanel title="Campaign Activity">
          <div className="space-y-4">
            {prospect.campaignRecipients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
            ) : (
              prospect.campaignRecipients.map((recipient) => (
                <div key={recipient.id} className="rounded-lg border border-[#1e3a5f]/10 p-4">
                  <Link
                    href={`/admin/communications/campaigns/${recipient.campaign.id}`}
                    className="font-medium text-[#082F5B] hover:underline"
                  >
                    {recipient.campaign.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Invited {recipient.invitedAt ? new Date(recipient.invitedAt).toLocaleString() : "—"}
                  </p>
                  {recipient.message ? (
                    <Link
                      href={`/admin/communications/history/${recipient.message.id}`}
                      className="mt-2 inline-block text-sm text-[#082F5B] hover:underline"
                    >
                      View message ({recipient.message.status})
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CommunicationsPanel>
      </div>
    </div>
  );
}
