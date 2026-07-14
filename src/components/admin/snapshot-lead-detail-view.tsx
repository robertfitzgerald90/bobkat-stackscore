"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import { SnapshotLeadActions } from "@/components/admin/snapshot-lead-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import {
  buildSnapshotLeadMailtoUrl,
  NOT_PROVIDED_LABEL,
  normalizePhoneForTel,
  resolveLeadDisplayName,
} from "@/lib/technology-snapshot/contact-helpers";
import {
  ALL_SNAPSHOT_LEAD_STATUSES,
  formatSnapshotClassification,
  IT_MANAGEMENT_LABELS,
  SNAPSHOT_LEAD_STATUS_LABELS,
  SNAPSHOT_MAX_SCORE,
} from "@/lib/technology-snapshot/display";
import { SNAPSHOT_ANSWER_OPTIONS, SNAPSHOT_QUESTIONS } from "@/lib/technology-snapshot/questions";
import type { SnapshotAnswers, SnapshotItManagementModel } from "@/lib/technology-snapshot/types";
import { toast } from "sonner";

type SnapshotLeadDetail = {
  id: string;
  contactName: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string;
  email: string;
  phone: string | null;
  industry: string;
  companySize: string | null;
  itManagementModel: SnapshotItManagementModel;
  answers: SnapshotAnswers;
  totalScore: number;
  classification: string;
  status: TechnologySnapshotLeadStatus;
  prospectId: string | null;
  clientId: string | null;
  contactConsentAt: string | null;
  contactedAt: string | null;
  assessmentInvitedAt: string | null;
  convertedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  observations: string[];
  maxScore: number;
  notes: Array<{
    id: string;
    note: string;
    createdAt: string;
    author: { id: string; name: string };
  }>;
  prospect: {
    id: string;
    status: string;
    clientId: string | null;
    campaignRecipients: Array<{
      id: string;
      invitedAt: string | null;
      campaign: { id: string; name: string; status: string };
      message: { id: string; status: string; createdAt: string } | null;
    }>;
    client: { id: string; companyName: string; status: string } | null;
  } | null;
  client: { id: string; companyName: string; status: string } | null;
};

type ConvertPreview = {
  matches: Array<{
    type: "organization" | "prospect" | "user";
    id: string;
    label: string;
    href: string;
    reason: string;
  }>;
  recommendedAction: "link_existing" | "create_new";
  recommendedClientId?: string;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return NOT_PROVIDED_LABEL;
  return new Date(value).toLocaleString();
}

export function SnapshotLeadDetailView({ initialLead }: { initialLead: SnapshotLeadDetail }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lead, setLead] = useState(initialLead);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertPreview, setConvertPreview] = useState<ConvertPreview | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const displayName = resolveLeadDisplayName(lead);
  const mailtoUrl = buildSnapshotLeadMailtoUrl(lead);
  const phoneHref = lead.phone ? `tel:${normalizePhoneForTel(lead.phone)}` : null;

  const answerRows = useMemo(
    () =>
      SNAPSHOT_QUESTIONS.map((question) => ({
        pillar: question.pillarName,
        question: question.question,
        answer:
          SNAPSHOT_ANSWER_OPTIONS.find((option) => option.value === lead.answers[question.pillarCode])
            ?.label ?? lead.answers[question.pillarCode],
      })),
    [lead.answers],
  );

  useEffect(() => {
    if (searchParams.get("convert") === "1") {
      setConvertOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!convertOpen) return;
    void fetch(`/api/v1/snapshot-leads/${lead.id}/convert-preview`)
      .then((response) => response.json())
      .then((preview: ConvertPreview) => {
        setConvertPreview(preview);
        setSelectedClientId(preview.recommendedClientId ?? null);
      })
      .catch(() => toast.error("Unable to load conversion preview"));
  }, [convertOpen, lead.id]);

  async function updateStatus(status: TechnologySnapshotLeadStatus) {
    const response = await fetch(`/api/v1/snapshot-leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to update status");
      return;
    }
    const updated = await response.json();
    setLead((current) => ({ ...current, ...updated }));
    toast.success("Lead status updated");
    router.refresh();
  }

  async function sendInvitation() {
    const confirmed = window.confirm(`Send an assessment invitation email to ${lead.email}?`);
    if (!confirmed) return;

    const response = await fetch(`/api/v1/snapshot-leads/${lead.id}/send-invitation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Unable to send invitation");
      return;
    }
    setLead((current) => ({ ...current, ...payload.lead }));
    toast.success("Assessment invitation sent");
    router.refresh();
  }

  async function saveNote() {
    if (!noteDraft.trim()) return;
    setSavingNote(true);
    const response = await fetch(`/api/v1/snapshot-leads/${lead.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteDraft }),
    });
    setSavingNote(false);
    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to save note");
      return;
    }
    const note = await response.json();
    setLead((current) => ({
      ...current,
      notes: [note, ...current.notes],
    }));
    setNoteDraft("");
    toast.success("Internal note saved");
  }

  async function confirmConvert() {
    setConverting(true);
    const response = await fetch(`/api/v1/snapshot-leads/${lead.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId:
          convertPreview?.recommendedAction === "link_existing" ? selectedClientId : undefined,
      }),
    });
    setConverting(false);
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Unable to convert lead");
      return;
    }
    setLead((current) => ({ ...current, ...payload.lead }));
    setConvertOpen(false);
    toast.success("Lead converted to client");
    router.refresh();
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Link
            href="/snapshot-leads"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Snapshot Leads
          </Link>
          <div>
            <h2 className="page-title break-words">{displayName}</h2>
            <p className="page-description break-words">{lead.companyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{SNAPSHOT_LEAD_STATUS_LABELS[lead.status]}</Badge>
            <Badge variant="outline">{formatSnapshotClassification(lead.classification)}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={mailtoUrl} className={buttonClassName({})}>
            <Mail className="mr-2 h-4 w-4" />
            Email Lead
          </a>
          {phoneHref ? (
            <a href={phoneHref} className={buttonClassName({ variant: "outline" })}>
              <Phone className="mr-2 h-4 w-4" />
              Call Lead
            </a>
          ) : null}
          <Button type="button" variant="outline" onClick={() => void sendInvitation()}>
            <Send className="mr-2 h-4 w-4" />
            Send Assessment Invitation
          </Button>
          <a
            href={SERVICES_CTA_DESTINATIONS.generalConsultation.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName({ variant: "outline" })}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Consultation
          </a>
          <SnapshotLeadActions
            lead={lead}
            onStatusChange={updateStatus}
            onSendInvitation={sendInvitation}
            onConvert={() => setConvertOpen(true)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Full name</dt>
                <dd>{displayName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  {lead.phone ? (
                    <a href={phoneHref!} className="text-primary hover:underline">
                      {lead.phone}
                    </a>
                  ) : (
                    NOT_PROVIDED_LABEL
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{lead.companyName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Industry</dt>
                <dd>{lead.industry}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company size</dt>
                <dd>{lead.companySize ?? NOT_PROVIDED_LABEL}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Job title</dt>
                <dd>{NOT_PROVIDED_LABEL}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preferred contact method</dt>
                <dd>{NOT_PROVIDED_LABEL}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Consent recorded</dt>
                <dd>{formatDateTime(lead.contactConsentAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snapshot Summary</CardTitle>
            <CardDescription>Submitted {formatDateTime(lead.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold tabular-nums text-primary">{lead.totalScore}</p>
              <p className="pb-1 text-sm text-muted-foreground">out of {lead.maxScore ?? SNAPSHOT_MAX_SCORE}</p>
            </div>
            <Badge variant="outline">{formatSnapshotClassification(lead.classification)}</Badge>
            <div>
              <p className="mb-2 text-sm font-medium">Key observations</p>
              {lead.observations.length > 0 ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {lead.observations.map((observation) => (
                    <li key={observation} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{observation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No critical observations recorded.</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IT management model</p>
              <p className="text-sm">{IT_MANAGEMENT_LABELS[lead.itManagementModel]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(lead.createdAt)}</dd></div>
              <div><dt className="text-muted-foreground">Contacted</dt><dd>{formatDateTime(lead.contactedAt)}</dd></div>
              <div><dt className="text-muted-foreground">Assessment invitation sent</dt><dd>{formatDateTime(lead.assessmentInvitedAt)}</dd></div>
              <div><dt className="text-muted-foreground">Converted</dt><dd>{formatDateTime(lead.convertedAt)}</dd></div>
              <div><dt className="text-muted-foreground">Archived</dt><dd>{formatDateTime(lead.archivedAt)}</dd></div>
            </dl>
            {lead.client ? (
              <Link
                href={`/clients/${lead.client.id}`}
                className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
              >
                <Building2 className="mr-1.5 h-4 w-4" />
                Open {lead.client.companyName}
              </Link>
            ) : null}
            {lead.prospect ? (
              <Link
                href={`/admin/communications/prospects/${lead.prospect.id}`}
                className="mt-2 block text-sm text-primary hover:underline"
              >
                View linked prospect
              </Link>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Admin-only notes for follow-up context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={3}
                placeholder="Add an internal note…"
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="button" onClick={() => void saveNote()} disabled={savingNote || !noteDraft.trim()}>
                Add Internal Note
              </Button>
            </div>
            <div className="space-y-3">
              {lead.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No internal notes yet.</p>
              ) : (
                lead.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {note.author.name} · {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="answers">
        <CardHeader>
          <CardTitle>Full Snapshot Answers</CardTitle>
          <CardDescription>Collapsed by default to keep contact actions prominent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {answerRows.map((row) => (
            <details key={row.pillar} className="rounded-lg border bg-muted/10 p-4">
              <summary className="cursor-pointer list-none font-medium">
                {row.pillar} · {row.answer}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{row.question}</p>
            </details>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            value={lead.status}
            items={SNAPSHOT_LEAD_STATUS_LABELS}
            onValueChange={(value) =>
              updateStatus((value ?? lead.status) as TechnologySnapshotLeadStatus)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_SNAPSHOT_LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {SNAPSHOT_LEAD_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Client</DialogTitle>
            <DialogDescription>
              Review the proposed organization match before converting this snapshot lead.
            </DialogDescription>
          </DialogHeader>
          {convertPreview ? (
            <div className="space-y-4 text-sm">
              {convertPreview.matches.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium">Possible matches</p>
                  {convertPreview.matches.map((match) => (
                    <label key={`${match.type}-${match.id}`} className="flex items-start gap-2 rounded-lg border p-3">
                      <input
                        type="radio"
                        name="convert-match"
                        checked={selectedClientId === match.id && match.type === "organization"}
                        onChange={() => setSelectedClientId(match.type === "organization" ? match.id : null)}
                        disabled={match.type !== "organization"}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium">{match.label}</span>
                        <span className="block text-muted-foreground">{match.reason}</span>
                        <Link href={match.href} className="text-primary hover:underline">
                          Review match
                        </Link>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No existing organization match found. A new prospect organization will be created.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading conversion preview…</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void confirmConvert()} disabled={converting}>
              Confirm Conversion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
