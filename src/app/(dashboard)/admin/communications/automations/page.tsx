import { redirect } from "next/navigation";
import { CommunicationsPageHeader } from "@/components/communications/communications-shell";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";
import { listCommunicationAutomations } from "@/lib/communications/automation-registry";
import { getEmailTemplate } from "@/lib/communications/registry";
import { prisma } from "@/lib/db";

type PageProps = {
  searchParams: Promise<{ status?: string; template?: string }>;
};

function healthStatus(input: {
  automationStatus: string;
  enabled: boolean;
  templateExists: boolean;
  failureCount: number;
  sendCount: number;
}) {
  if (!input.templateExists) return "Missing Template";
  if (!input.enabled) return "Disabled";
  if (input.automationStatus === "missing_trigger") return "Missing Trigger";
  if (input.automationStatus === "not_implemented") return "Not Implemented";
  if (input.failureCount > 0) return "Recent Failure";
  if (input.sendCount === 0) return "Never Triggered";
  return "Healthy";
}

export default async function CommunicationsAutomationsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/admin/communications");
  }
  const filters = await searchParams;
  const automations = listCommunicationAutomations().filter((automation) => {
    if (filters.template && automation.templateKey !== filters.template) return false;
    if (filters.status && automation.status !== filters.status) return false;
    return true;
  });
  const stats = await prisma.communicationMessage.groupBy({
    by: ["eventKey"],
    where: { eventKey: { in: automations.map((automation) => automation.event) } },
    _count: { _all: true },
  });
  const failures = await prisma.communicationMessage.groupBy({
    by: ["eventKey"],
    where: {
      eventKey: { in: automations.map((automation) => automation.event) },
      status: "FAILED",
    },
    _count: { _all: true },
  });
  const lastMessages = await prisma.communicationMessage.findMany({
    where: { eventKey: { in: automations.map((automation) => automation.event) } },
    orderBy: { createdAt: "desc" },
    distinct: ["eventKey"],
    select: { eventKey: true, status: true, sentAt: true, failedAt: true, createdAt: true },
  });
  const countByEvent = new Map(stats.map((row) => [row.eventKey, row._count._all]));
  const failureByEvent = new Map(failures.map((row) => [row.eventKey, row._count._all]));
  const lastByEvent = new Map(lastMessages.map((row) => [row.eventKey, row]));

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Automation Health"
        description="Every registered customer email automation, its trigger source, template mapping, and recent delivery health."
      />
      <div className="stat-card overflow-x-auto rounded-xl bg-card">
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4 font-medium">Event</th>
              <th className="p-4 font-medium">Template</th>
              <th className="p-4 font-medium">Trigger Source</th>
              <th className="p-4 font-medium">Enabled</th>
              <th className="p-4 font-medium">Last Triggered</th>
              <th className="p-4 font-medium">Send Count</th>
              <th className="p-4 font-medium">Failures</th>
              <th className="p-4 font-medium">Idempotency</th>
              <th className="p-4 font-medium">Health</th>
            </tr>
          </thead>
          <tbody>
            {automations.map((automation) => {
              const template = getEmailTemplate(automation.templateKey);
              const sendCount = countByEvent.get(automation.event) ?? 0;
              const failureCount = failureByEvent.get(automation.event) ?? 0;
              const last = lastByEvent.get(automation.event);
              const health = healthStatus({
                automationStatus: automation.status,
                enabled: automation.enabled,
                templateExists: Boolean(template),
                failureCount,
                sendCount,
              });
              return (
                <tr key={automation.event} className="border-b border-border/60 align-top">
                  <td className="p-4">
                    <p className="font-medium">{automation.event}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{automation.description}</p>
                  </td>
                  <td className="p-4">
                    <p>{template?.name ?? automation.templateKey}</p>
                    <p className="text-xs text-muted-foreground">{automation.templateKey}</p>
                  </td>
                  <td className="p-4">
                    <p>{automation.triggerSource}</p>
                    <p className="text-xs text-muted-foreground">{automation.handler}</p>
                  </td>
                  <td className="p-4">{automation.enabled ? "Yes" : "No"}</td>
                  <td className="p-4">
                    {last ? new Date(last.sentAt ?? last.failedAt ?? last.createdAt).toLocaleString() : "Never"}
                  </td>
                  <td className="p-4">{sendCount}</td>
                  <td className="p-4">{failureCount}</td>
                  <td className="p-4 text-xs text-muted-foreground">{automation.idempotencyKey}</td>
                  <td className="p-4">
                    <span className="rounded-full border border-border bg-muted/40 px-2 py-1 text-xs font-medium">
                      {health}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
