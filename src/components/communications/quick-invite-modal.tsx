"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import type { QuickInvitePrefill } from "@/components/communications/quick-invite-provider";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DuplicateInfo = {
  type: string;
  id: string;
  label: string;
  email: string;
  href: string;
};

type QuickInviteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: QuickInvitePrefill;
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  industry: "",
  employeeCount: "",
  notes: "",
  campaignId: "",
};

export function QuickInviteModal({ open, onOpenChange, prefill }: QuickInviteModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [success, setSuccess] = useState<{ clientId: string; prospectId: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY_FORM,
      ...prefill,
      campaignId: prefill?.campaignId ?? "",
    });
    setDuplicate(null);
    setPreviewHtml(null);
    setSuccess(null);

    fetch("/api/v1/admin/campaigns?limit=50&status=ready")
      .then((res) => res.json())
      .then((payload) => {
        const items = payload.data ?? payload.items ?? [];
        setCampaigns(
          Array.isArray(items)
            ? items.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
            : [],
        );
      })
      .catch(() => undefined);
  }, [open, prefill]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "email") setDuplicate(null);
  }

  async function checkDuplicate(email: string) {
    if (!email.trim()) return null;
    const response = await fetch("/api/v1/admin/communications/quick-invite/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json().catch(() => ({}));
    return (payload.duplicate as DuplicateInfo | null) ?? null;
  }

  async function handlePreview() {
    setPreviewLoading(true);
    const params = new URLSearchParams({
      firstName: form.firstName,
      company: form.company,
    });
    const response = await fetch(
      `/api/v1/admin/communications/quick-invite/check?${params.toString()}`,
    );
    setPreviewLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to preview invitation");
      return;
    }
    setPreviewHtml(payload.preview?.html ?? null);
  }

  async function handleSubmit(forceResend = false) {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.company.trim() || !form.email.trim()) {
      toast.error("First name, last name, company, and email are required");
      return;
    }

    if (!forceResend) {
      const dup = await checkDuplicate(form.email);
      if (dup) {
        setDuplicate(dup);
        return;
      }
    }

    setLoading(true);
    const response = await fetch("/api/v1/admin/communications/quick-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
        campaignId: form.campaignId || undefined,
        forceResend,
      }),
    });
    setLoading(false);

    const payload = await response.json().catch(() => null);

    if (response.status === 409 && payload?.duplicate) {
      setDuplicate(payload.duplicate);
      return;
    }

    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to send invitation");
      return;
    }

    setSuccess({ clientId: payload.clientId, prospectId: payload.prospectId });
    toast.success("Assessment invitation sent");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close Quick Invite"
        className="absolute inset-0 bg-[#041326]/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-invite-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#1e3a5f]/20 bg-white shadow-2xl"
      >
        <div className="border-b border-[#1e3a5f]/10 bg-[#082F5B] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Quick Invite</p>
              <h2 id="quick-invite-title" className="mt-1 text-xl font-bold">
                Send Assessment Invitation
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Minimal fields. Professional EMAIL-009. Ready in seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <p className="font-semibold">Invitation sent successfully</p>
              <p className="mt-1 text-sm">
                The prospect will receive a professional assessment invitation with activation link.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/communications/prospects/${success.prospectId}`}
                className={buttonClassName({ variant: "outline" })}
              >
                View Prospect
              </Link>
              <Link
                href={`/clients/${success.clientId}`}
                className={buttonClassName({ variant: "outline" })}
              >
                Open Organization
              </Link>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : duplicate ? (
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <p className="font-semibold">Already exists</p>
              <p className="mt-1 text-sm">
                {duplicate.label} ({duplicate.email}) is already in StackScore as a{" "}
                {duplicate.type.replace("_", " ")}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={duplicate.href} className={buttonClassName({ variant: "outline" })}>
                Open Existing Record
              </Link>
              <Button variant="outline" onClick={() => setDuplicate(null)}>
                Edit Email
              </Button>
              <Button onClick={() => handleSubmit(true)} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send Another Invitation
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(false);
            }}
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qi-firstName">First Name *</Label>
                  <Input
                    id="qi-firstName"
                    autoFocus
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="Alex"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qi-lastName">Last Name *</Label>
                  <Input
                    id="qi-lastName"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Morgan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qi-company">Company *</Label>
                <Input
                  id="qi-company"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Northwind Professional Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qi-email">Email *</Label>
                <Input
                  id="qi-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="alex@company.com"
                />
              </div>

              <details className="rounded-lg border border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] p-4">
                <summary className="cursor-pointer text-sm font-medium text-[#082F5B]">
                  Optional details
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="qi-phone">Phone</Label>
                      <Input
                        id="qi-phone"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qi-industry">Industry</Label>
                      <Input
                        id="qi-industry"
                        value={form.industry}
                        onChange={(e) => updateField("industry", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qi-employeeCount">Employee Count</Label>
                    <Input
                      id="qi-employeeCount"
                      type="number"
                      min={1}
                      value={form.employeeCount}
                      onChange={(e) => updateField("employeeCount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qi-notes">Notes</Label>
                    <Input
                      id="qi-notes"
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qi-campaign">Campaign</Label>
                    <select
                      id="qi-campaign"
                      value={form.campaignId}
                      onChange={(e) => updateField("campaignId", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Auto-create Quick Invite campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>

              {previewHtml ? (
                <div className="overflow-hidden rounded-xl border border-[#1e3a5f]/10">
                  <div className="border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
                    Invitation Preview (EMAIL-009)
                  </div>
                  <iframe
                    title="Invitation preview"
                    srcDoc={previewHtml}
                    className="h-64 w-full bg-white"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] px-6 py-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={previewLoading}
                onClick={handlePreview}
              >
                {previewLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Eye className="size-4" />
                )}
                Preview Invitation
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={cn("min-w-[180px] bg-[#082F5B] hover:bg-[#062646]")}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send Assessment Invitation
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
