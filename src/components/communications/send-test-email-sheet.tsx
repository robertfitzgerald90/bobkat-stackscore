"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SendTestEmailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateKey: string;
  templateName: string;
  defaultRecipient?: string;
};

export function SendTestEmailSheet({
  open,
  onOpenChange,
  templateKey,
  templateName,
  defaultRecipient = "",
}: SendTestEmailSheetProps) {
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipient);
  const [firstName, setFirstName] = useState("Alex");
  const [organizationName, setOrganizationName] = useState("Northwind Professional Services");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/v1/admin/communications/test-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateKey,
        recipientEmail,
        firstName: firstName || undefined,
        organizationName: organizationName || undefined,
      }),
    });

    setLoading(false);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to send test email");
      return;
    }

    if (payload.status === "failed") {
      toast.error(payload.errorMessage ?? "Test email failed to send");
      return;
    }

    toast.success(`Test email sent to ${recipientEmail}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[100vw] overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Send Test Email</SheetTitle>
          <SheetDescription>
            Send a safe test message for {templateName}. Test emails are marked with [TEST] and
            never trigger production workflows.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient email</Label>
            <Input
              id="recipientEmail"
              type="email"
              required
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Sample first name (optional)</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationName">Sample organization (optional)</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
