"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SNAPSHOT_CONTACT_CONSENT_TEXT,
  SNAPSHOT_MARKETING_CONSENT_TEXT,
} from "@/lib/technology-snapshot/display";
import type { SnapshotAnswersV2 } from "@/lib/technology-snapshot/engine";
import type { SnapshotBusinessContext } from "@/lib/technology-snapshot/session-state";
import type { SnapshotItManagementModel } from "@/lib/technology-snapshot/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SnapshotContactCaptureProps = {
  answers: SnapshotAnswersV2;
  context: SnapshotBusinessContext;
  prospectId?: string;
  campaignId?: string;
  onSaved: (leadId: string) => void;
  className?: string;
};

export function SnapshotContactCapture({
  answers,
  context,
  prospectId,
  campaignId,
  onSaved,
  className,
}: SnapshotContactCaptureProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  async function submit(intent: "save" | "copy") {
    if (!contactConsent) {
      toast.error("Please confirm we may contact you about your results.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/v1/public/technology-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          companyName: context.companyName,
          industry: context.industry,
          companySize: context.companySize,
          itManagementModel:
            (context.itManagementModel as SnapshotItManagementModel) || "unsure",
          answers,
          contactConsent: true,
          marketingConsent,
          prospectId,
          campaignId,
          sourcePath: "/technology-snapshot",
          website,
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "Unable to save Snapshot");
      }
      toast.success(
        intent === "copy"
          ? "Saved. Your Snapshot is on file with Bobkat IT — we’ll follow up if helpful."
          : "Snapshot saved. Bobkat IT can follow up using the details you provided.",
      );
      onSaved(data.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save Snapshot");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className={cn(
        "relative rounded-xl border border-primary/20 bg-card/40 p-5 sm:p-6",
        className,
      )}
      aria-labelledby="snapshot-contact-heading"
    >
      <h2 id="snapshot-contact-heading" className="text-lg font-semibold text-foreground">
        Optional: save or request follow-up
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your results are already available above. Share contact details only if you want Bobkat IT
        to keep a copy or follow up — never required to see your Snapshot.
      </p>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <Label htmlFor="snapshot-website">Website</Label>
        <Input
          id="snapshot-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="snapshot-first-name">First name</Label>
          <Input
            id="snapshot-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="snapshot-last-name">Last name</Label>
          <Input
            id="snapshot-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="snapshot-email">Email</Label>
          <Input
            id="snapshot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="snapshot-phone">Phone (optional)</Label>
          <Input
            id="snapshot-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-1"
          checked={contactConsent}
          onChange={(e) => setContactConsent(e.target.checked)}
        />
        <span>{SNAPSHOT_CONTACT_CONSENT_TEXT}</span>
      </label>
      <label className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-1"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
        />
        <span>{SNAPSHOT_MARKETING_CONSENT_TEXT}</span>
      </label>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="sm:flex-1"
          disabled={submitting}
          onClick={() => void submit("save")}
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save My Snapshot
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          disabled={submitting}
          onClick={() => void submit("copy")}
        >
          Request a Copy
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Automated email delivery of results is not enabled in this release. “Request a Copy” stores
        your Snapshot with Bobkat IT for follow-up.
      </p>
    </section>
  );
}
