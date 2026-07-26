"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Copy,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WebsiteLeadStatus } from "@/generated/prisma/client";
import { formatDisplayDate } from "@/lib/display";
import {
  ALL_WEBSITE_LEAD_STATUSES,
  formatWebsiteLeadSource,
  formatWebsiteLeadStatus,
} from "@/lib/website-leads/display";
import { buildWebsiteLeadMailtoUrl } from "@/lib/website-leads/contact-helpers";
import { toast } from "sonner";

export type WebsiteLeadDetail = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string;
  message: string;
  source: string;
  status: WebsiteLeadStatus;
  internalNotes: string | null;
  websiteUrl: string | null;
  submittedAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
  convertedAt: string | null;
  linkedClientId: string | null;
  linkedAssessmentId: string | null;
  linkedClient?: { id: string; companyName: string; status: string } | null;
  linkedAssessment?: { id: string; assessmentName: string; status: string } | null;
};

type ConvertPreview = {
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
};

export function WebsiteLeadDetailView({
  initialLead,
  convertPreview,
}: {
  initialLead: WebsiteLeadDetail;
  convertPreview: ConvertPreview;
}) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [notes, setNotes] = useState(initialLead.internalNotes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertMode, setConvertMode] = useState<"create_new" | "link_existing">("create_new");
  const [existingClientId, setExistingClientId] = useState("");
  const [convertForm, setConvertForm] = useState(convertPreview);

  async function patchLead(body: Record<string, unknown>, actionLabel: string) {
    setBusyAction(actionLabel);
    const response = await fetch(`/api/v1/website-leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusyAction(null);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to update lead");
      return null;
    }

    const payload = (await response.json()) as { data: WebsiteLeadDetail };
    setLead((current) => ({ ...current, ...payload.data }));
    toast.success(`${actionLabel} updated`);
    router.refresh();
    return payload.data;
  }

  async function updateStatus(status: WebsiteLeadStatus, actionLabel: string) {
    await patchLead({ status }, actionLabel);
  }

  async function saveNotes() {
    setSavingNotes(true);
    await patchLead({ internalNotes: notes }, "Notes");
    setSavingNotes(false);
  }

  async function handleDelete() {
    setBusyAction("delete");
    const response = await fetch(`/api/v1/website-leads/${lead.id}`, { method: "DELETE" });
    setBusyAction(null);
    setDeleteOpen(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to delete lead");
      return;
    }

    toast.success("Lead deleted");
    router.push("/website-leads");
    router.refresh();
  }

  async function handleConvert() {
    setBusyAction("convert");
    const body =
      convertMode === "link_existing"
        ? { mode: "link_existing", clientId: existingClientId.trim() }
        : {
            mode: "create_new",
            companyName: convertForm.companyName,
            primaryContactName: convertForm.primaryContactName,
            primaryContactEmail: convertForm.primaryContactEmail,
            primaryContactPhone: convertForm.primaryContactPhone ?? "",
            industry: "",
          };

    const response = await fetch(`/api/v1/website-leads/${lead.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusyAction(null);
    setConvertOpen(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to convert lead");
      return;
    }

    const payload = (await response.json()) as { data: WebsiteLeadDetail };
    setLead((current) => ({ ...current, ...payload.data }));
    toast.success("Lead converted");
    router.refresh();
  }

  async function copyValue(label: string, value: string | null | undefined) {
    if (!value) {
      toast.error(`No ${label.toLowerCase()} to copy`);
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  const mailto = buildWebsiteLeadMailtoUrl({
    email: lead.email,
    name: lead.name,
    company: lead.company,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/website-leads" className={buttonClassName({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Website Leads
        </Link>
        <Badge variant="outline">{formatWebsiteLeadStatus(lead.status)}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{lead.name}</CardTitle>
            <CardDescription>{formatWebsiteLeadSource(lead.source as never)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow icon={Building2} label="Company" value={lead.company ?? "—"} />
            <DetailRow icon={Mail} label="Email" value={lead.email} />
            <DetailRow icon={Phone} label="Phone" value={lead.phone ?? "—"} />
            <DetailRow icon={Calendar} label="Submitted" value={formatDisplayDate(lead.submittedAt)} />
            <DetailRow
              icon={Calendar}
              label="Last contacted"
              value={formatDisplayDate(lead.lastContactedAt)}
            />
            {lead.websiteUrl ? (
              <DetailRow icon={Building2} label="Website URL" value={lead.websiteUrl} />
            ) : null}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Message</p>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
                {lead.message}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" onClick={() => copyValue("Email", lead.email)}>
                <Copy className="mr-2 h-4 w-4" /> Copy email
              </Button>
              <Button variant="outline" onClick={() => copyValue("Phone", lead.phone)}>
                <Copy className="mr-2 h-4 w-4" /> Copy phone
              </Button>
              <a href={mailto} className={buttonClassName({ variant: "outline" })}>
                <Mail className="mr-2 h-4 w-4" /> Send email
              </a>
              <Button
                variant="outline"
                disabled={busyAction === "Contacted"}
                onClick={() => updateStatus("CONTACTED", "Contacted")}
              >
                Mark contacted
              </Button>
              <Button
                variant="outline"
                disabled={busyAction === "Qualified"}
                onClick={() => updateStatus("QUALIFIED", "Qualified")}
              >
                Mark qualified
              </Button>
              <Button
                variant="outline"
                disabled={busyAction === "Consultation booked"}
                onClick={() => updateStatus("CONSULTATION_BOOKED", "Consultation booked")}
              >
                Mark consultation booked
              </Button>
              <Button
                disabled={lead.status === "CONVERTED"}
                onClick={() => setConvertOpen(true)}
              >
                Convert
              </Button>
              <Button
                variant="outline"
                disabled={busyAction === "Closed"}
                onClick={() => updateStatus("CLOSED", "Closed")}
              >
                Close
              </Button>
              <Button
                variant="outline"
                disabled={busyAction === "Reopened"}
                onClick={() => updateStatus("NEW", "Reopened")}
              >
                Reopen
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>

          {(lead.linkedClient || lead.convertedAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Converted: {formatDisplayDate(lead.convertedAt)}</p>
                {lead.linkedClient ? (
                  <Link href={`/clients/${lead.linkedClient.id}`} className="text-primary hover:underline">
                    {lead.linkedClient.companyName}
                  </Link>
                ) : null}
                {lead.linkedAssessment ? (
                  <p className="text-muted-foreground">
                    Assessment: {lead.linkedAssessment.assessmentName}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Internal notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                placeholder="Add internal notes for your team…"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving…" : "Save notes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete website lead?</DialogTitle>
            <DialogDescription>
              This permanently removes the lead record for {lead.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busyAction === "delete"}>
              Delete lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Convert website lead</DialogTitle>
            <DialogDescription>
              Link this lead to an existing client or create a new client record with the required
              fields completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={convertMode === "create_new" ? "default" : "outline"}
                onClick={() => setConvertMode("create_new")}
              >
                Create new client
              </Button>
              <Button
                type="button"
                variant={convertMode === "link_existing" ? "default" : "outline"}
                onClick={() => setConvertMode("link_existing")}
              >
                Link existing client
              </Button>
            </div>

            {convertMode === "link_existing" ? (
              <div className="space-y-2">
                <Label htmlFor="clientId">Existing client ID</Label>
                <Input
                  id="clientId"
                  value={existingClientId}
                  onChange={(event) => setExistingClientId(event.target.value)}
                  placeholder="Client UUID"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    value={convertForm.companyName}
                    onChange={(event) =>
                      setConvertForm((current) => ({ ...current, companyName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContactName">Primary contact name</Label>
                  <Input
                    id="primaryContactName"
                    value={convertForm.primaryContactName}
                    onChange={(event) =>
                      setConvertForm((current) => ({
                        ...current,
                        primaryContactName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContactEmail">Primary contact email</Label>
                  <Input
                    id="primaryContactEmail"
                    type="email"
                    value={convertForm.primaryContactEmail}
                    onChange={(event) =>
                      setConvertForm((current) => ({
                        ...current,
                        primaryContactEmail: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContactPhone">Primary contact phone</Label>
                  <Input
                    id="primaryContactPhone"
                    value={convertForm.primaryContactPhone ?? ""}
                    onChange={(event) =>
                      setConvertForm((current) => ({
                        ...current,
                        primaryContactPhone: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvert} disabled={busyAction === "convert"}>
              Convert lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-all text-foreground">{value}</p>
      </div>
    </div>
  );
}
