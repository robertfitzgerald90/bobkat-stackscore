"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ClientOption = {
  id: string;
  companyName: string;
  primaryContactEmail: string;
};

type Check = {
  label: string;
  status: "pass" | "warning" | "fail";
  detail: string;
};

type Result = {
  onboardingUrl?: string;
  customerType?: string;
  onboardingStatus?: string;
  currentStep?: string;
  completionPercentage?: number;
  welcomeEmailStatus?: string | null;
  welcomeEmailRecipient?: string | null;
  welcomeEmailSentAt?: string | null;
  welcomeEmailMessageId?: string | null;
  idempotencyKey?: string;
};

export function VcioOnboardingTestLauncher({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [scenario, setScenario] = useState("brand_new");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [resetExisting, setResetExisting] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clients, clientId],
  );

  async function run(action: string) {
    if (!clientId && action !== "readiness-check") {
      toast.error("Select a test organization.");
      return;
    }
    if (action === "reset" && !window.confirm("Reset vCIO onboarding progress for this organization? Existing organization data, assessments, projects, reports, subscriptions, and communication history are preserved.")) {
      return;
    }
    setLoading(action);
    const response = await fetch("/api/v1/admin/vcio/onboarding-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        clientId,
        scenario,
        sendWelcomeEmail,
        testRecipientEmail,
        resetExisting,
      }),
    });
    setLoading(null);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Action failed.");
      return;
    }
    if (payload.checks) {
      setChecks(payload.checks);
      toast.success("Readiness check complete.");
      return;
    }
    setResult(payload.result ?? payload.state ?? null);
    setPreviewUrl(payload.previewUrl ?? payload.state?.onboardingUrl ?? null);
    toast.success("vCIO onboarding test action completed.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        Safe test mode never creates Stripe Checkout Sessions, subscriptions, invoices, or payments.
        Test emails are sent only to the explicit administrator recipient and are marked as TEST.
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test organization</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName} ({client.primaryContactEmail})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer scenario</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              <option value="brand_new">Brand New Client</option>
              <option value="assessment_customer">Existing Assessment Client</option>
              <option value="managed_services_client">Existing Managed Services Client</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test email recipient</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              type="email"
              value={testRecipientEmail}
              onChange={(event) => setTestRecipientEmail(event.target.value)}
              placeholder="admin@example.com"
            />
            <p className="text-xs text-muted-foreground">
              The organization contact is never used for test sends.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendWelcomeEmail}
              onChange={(event) => setSendWelcomeEmail(event.target.checked)}
            />
            Send welcome email during initialization
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={resetExisting}
              onChange={(event) => setResetExisting(event.target.checked)}
            />
            Reset existing onboarding progress first
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => run("preview")} disabled={Boolean(loading)}>
              Preview Onboarding State
            </Button>
            <Button type="button" variant="outline" onClick={() => run("send-test-email")} disabled={Boolean(loading)}>
              Send Welcome Email Test
            </Button>
            <Button type="button" onClick={() => run("initialize")} disabled={Boolean(loading)}>
              Initialize Test Onboarding
            </Button>
            <Button type="button" variant="outline" onClick={() => run("reset")} disabled={Boolean(loading)}>
              Reset Onboarding
            </Button>
            <Button type="button" variant="outline" onClick={() => run("readiness-check")} disabled={Boolean(loading)}>
              Run vCIO Purchase Readiness Check
            </Button>
          </div>

          {previewUrl ? (
            <a className="inline-flex text-sm font-medium text-accent-blue hover:underline" href={previewUrl}>
              Open Onboarding Preview
            </a>
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold">Result</h3>
          <p className="text-sm text-muted-foreground">
            {selectedClient
              ? `Testing ${selectedClient.companyName} as ${scenario}.`
              : "Select an organization to begin."}
          </p>
          {result ? (
            <dl className="grid gap-2 text-sm">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-border/60 py-2">
                  <dt className="font-medium">{key}</dt>
                  <dd className="text-right text-muted-foreground">{String(value ?? "—")}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No result yet.</p>
          )}
        </div>
      </div>

      {checks.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold">Readiness Check Results</h3>
          <div className="mt-4 grid gap-3">
            {checks.map((check) => (
              <div key={check.label} className="rounded-lg border border-border/70 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{check.label}</p>
                  <span
                    className={
                      check.status === "pass"
                        ? "text-success"
                        : check.status === "warning"
                          ? "text-warning"
                          : "text-destructive"
                    }
                  >
                    {check.status.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{check.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
