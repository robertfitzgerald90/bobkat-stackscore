"use client";

import { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ResetVcioOnboardingButton({ clientId }: { clientId: string }) {
  const [resetting, setResetting] = useState(false);

  async function reset() {
    if (!window.confirm("Reset vCIO onboarding progress for this organization?")) return;
    setResetting(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/vcio/onboarding/reset`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        toast.error(payload?.error ?? "Unable to reset vCIO onboarding.");
        return;
      }
      toast.success("vCIO onboarding reset.");
      window.location.reload();
    } catch {
      toast.error("Unable to reset vCIO onboarding.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={reset} disabled={resetting}>
      {resetting ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
      Reset Onboarding
    </Button>
  );
}
