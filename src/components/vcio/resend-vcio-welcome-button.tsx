"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ResendVcioWelcomeButton({ clientId }: { clientId: string }) {
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/vcio/welcome-email`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to resend vCIO welcome email.");
        return;
      }
      toast.success("vCIO welcome email resent.");
    } catch {
      toast.error("Unable to resend vCIO welcome email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={resend} disabled={sending}>
      {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
      Resend vCIO Welcome Email
    </Button>
  );
}
