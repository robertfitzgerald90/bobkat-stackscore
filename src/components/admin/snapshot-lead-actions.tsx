"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  Building2,
  CheckCircle2,
  Copy,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Send,
  Trash2,
} from "lucide-react";
import {
  SnapshotLeadDeleteDialog,
  type SnapshotLeadDeleteTarget,
} from "@/components/admin/snapshot-lead-delete-dialog";
import { buttonClassName } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildSnapshotLeadMailtoUrl,
  normalizePhoneForTel,
  NOT_PROVIDED_LABEL,
  resolveLeadDisplayName,
  type SnapshotLeadContactFields,
} from "@/lib/technology-snapshot/contact-helpers";
import { getSnapshotLeadDeletionBlockReason } from "@/lib/technology-snapshot/lead-deletion";
import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { toast } from "sonner";

export type SnapshotLeadActionRecord = SnapshotLeadContactFields & {
  id: string;
  status: TechnologySnapshotLeadStatus;
  classification: string;
  companyName: string;
  email: string;
  createdAt: Date | string;
  clientId?: string | null;
  prospect?: { clientId?: string | null } | null;
};

type SnapshotLeadActionsProps = {
  lead: SnapshotLeadActionRecord;
  compact?: boolean;
  onStatusChange?: (status: TechnologySnapshotLeadStatus) => Promise<void>;
  onSendInvitation?: () => Promise<void>;
  onConvert?: () => void;
  onDeleted?: (leadId: string) => void;
  invitationBlockedReason?: string;
  /** When true, redirects to the list after a successful delete. */
  redirectOnDelete?: boolean;
  showDeleteButton?: boolean;
};

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Unable to copy ${label.toLowerCase()}`);
  }
}

export function SnapshotLeadActions({
  lead,
  compact = false,
  onStatusChange,
  onSendInvitation,
  onConvert,
  onDeleted,
  invitationBlockedReason,
  redirectOnDelete = false,
  showDeleteButton = false,
}: SnapshotLeadActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const displayName = resolveLeadDisplayName(lead);
  const mailtoUrl = buildSnapshotLeadMailtoUrl(lead);
  const phoneHref = lead.phone ? `tel:${normalizePhoneForTel(lead.phone)}` : null;
  const deletionBlockReason = getSnapshotLeadDeletionBlockReason({
    status: lead.status,
    clientId: lead.clientId,
    prospectClientId: lead.prospect?.clientId ?? null,
  });

  async function markStatus(status: TechnologySnapshotLeadStatus) {
    if (!onStatusChange) return;
    setBusy(true);
    try {
      await onStatusChange(status);
    } finally {
      setBusy(false);
    }
  }

  async function handleSendInvitation() {
    if (!onSendInvitation) return;
    const confirmed = window.confirm(
      invitationBlockedReason
        ? `${invitationBlockedReason}\n\nSend anyway?`
        : `Send an assessment invitation email to ${lead.email}?`,
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      await onSendInvitation();
    } finally {
      setBusy(false);
    }
  }

  function requestDelete() {
    if (deletionBlockReason) {
      toast.error(deletionBlockReason);
      return;
    }
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/v1/snapshot-leads/${lead.id}`, {
        method: "DELETE",
        headers: {
          "x-stackscore-admin-source": redirectOnDelete
            ? "admin.snapshot-leads.detail"
            : "admin.snapshot-leads.list",
        },
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast.error(payload.error ?? "Unable to delete Snapshot Lead. No records were changed.");
        return;
      }

      setDeleteOpen(false);
      toast.success("Snapshot Lead deleted.");
      onDeleted?.(lead.id);

      if (redirectOnDelete) {
        router.push("/snapshot-leads");
      }
      router.refresh();
    } catch {
      toast.error("Unable to delete Snapshot Lead. No records were changed.");
    } finally {
      setDeleting(false);
    }
  }

  const deleteTarget: SnapshotLeadDeleteTarget = {
    id: lead.id,
    contactName: lead.contactName,
    firstName: lead.firstName,
    lastName: lead.lastName,
    companyName: lead.companyName,
    email: lead.email,
    createdAt: lead.createdAt,
  };

  const deleteDialog = (
    <SnapshotLeadDeleteDialog
      open={deleteOpen}
      onOpenChange={(open) => {
        if (deleting) return;
        setDeleteOpen(open);
      }}
      lead={deleteTarget}
      loading={deleting}
      onConfirm={confirmDelete}
    />
  );

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <a href={mailtoUrl} className={buttonClassName({ variant: "outline", size: "sm", className: "h-8" })}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email
          </a>
          {phoneHref ? (
            <a href={phoneHref} className={buttonClassName({ variant: "outline", size: "sm", className: "h-8" })}>
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call
            </a>
          ) : null}
          <Link href={`/snapshot-leads/${lead.id}`} className={buttonClassName({ variant: "outline", size: "sm", className: "h-8" })}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
          <button
            type="button"
            className={buttonClassName({ variant: "destructive", size: "sm", className: "h-8" })}
            onClick={requestDelete}
            disabled={busy || deleting}
            aria-label={`Delete Snapshot Lead for ${displayName}`}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Delete Lead
          </button>
        </div>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      {showDeleteButton ? (
        <button
          type="button"
          className={buttonClassName({ variant: "destructive" })}
          onClick={requestDelete}
          disabled={busy || deleting}
          aria-label={`Delete Snapshot Lead for ${displayName}`}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden />
          Delete Lead
        </button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonClassName({ variant: "outline", size: "icon-sm" })}
          disabled={busy || deleting}
          aria-label={`Actions for ${displayName}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => { window.location.href = mailtoUrl; }}>
            <Mail className="h-4 w-4" />
            Email Lead
          </DropdownMenuItem>
          {phoneHref ? (
            <DropdownMenuItem onClick={() => { window.location.href = phoneHref; }}>
              <Phone className="h-4 w-4" />
              Call Lead
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => void copyText(lead.email, "Email")}>
            <Copy className="h-4 w-4" />
            Copy Email
          </DropdownMenuItem>
          {lead.phone ? (
            <DropdownMenuItem onClick={() => void copyText(lead.phone!, "Phone")}>
              <Copy className="h-4 w-4" />
              Copy Phone
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/snapshot-leads/${lead.id}`)}>
            <Eye className="h-4 w-4" />
            Open Lead Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/snapshot-leads/${lead.id}#answers`)}>
            <Eye className="h-4 w-4" />
            View Snapshot
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {onSendInvitation ? (
            <DropdownMenuItem onClick={() => void handleSendInvitation()} disabled={busy}>
              <Send className="h-4 w-4" />
              Send Assessment Invitation
            </DropdownMenuItem>
          ) : null}
          {onStatusChange ? (
            <DropdownMenuItem onClick={() => void markStatus("contacted")} disabled={busy}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Contacted
            </DropdownMenuItem>
          ) : null}
          {onConvert ? (
            <DropdownMenuItem onClick={onConvert} disabled={busy}>
              <Building2 className="h-4 w-4" />
              Convert to Client
            </DropdownMenuItem>
          ) : null}
          {onStatusChange ? (
            <DropdownMenuItem onClick={() => void markStatus("archived")} disabled={busy}>
              <Archive className="h-4 w-4" />
              Archive Lead
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={requestDelete}
            disabled={busy || deleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete Lead
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {deleteDialog}
    </>
  );
}

export function SnapshotLeadContactCell({
  lead,
}: {
  lead: SnapshotLeadContactFields;
}) {
  const displayName = resolveLeadDisplayName(lead);

  return (
    <div className="min-w-0 space-y-0.5">
      <p className="break-words font-medium">{displayName}</p>
      {lead.email ? (
        <a href={`mailto:${lead.email}`} className="break-all text-sm text-primary hover:underline">
          {lead.email}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">{NOT_PROVIDED_LABEL}</span>
      )}
    </div>
  );
}

export function SnapshotLeadPhoneCell({ phone }: { phone: string | null | undefined }) {
  if (!phone?.trim()) {
    return <span className="text-sm text-muted-foreground">{NOT_PROVIDED_LABEL}</span>;
  }

  return (
    <a href={`tel:${normalizePhoneForTel(phone)}`} className="text-sm text-primary hover:underline">
      {phone}
    </a>
  );
}
