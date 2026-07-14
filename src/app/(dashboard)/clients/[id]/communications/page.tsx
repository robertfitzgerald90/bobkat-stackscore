import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEmailTemplate } from "@/lib/communications/registry";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientCommunicationsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "technician") redirect("/dashboard");

  const { id: clientId } = await params;
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const messages = await prisma.communicationMessage.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      templateKey: true,
      subject: true,
      recipientEmail: true,
      status: true,
      eventKey: true,
      sendType: true,
      sentAt: true,
      deliveredAt: true,
      failedAt: true,
      failureReason: true,
      relatedEntityType: true,
      relatedEntityId: true,
      isTest: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Communications</p>
        <h1 className="page-title">{client.companyName} Email History</h1>
        <p className="page-description">
          Customer-facing automated, manual, and test emails associated with this organization.
        </p>
      </div>
      <div className="stat-card overflow-x-auto rounded-xl bg-card">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Template</th>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Recipient</th>
              <th className="p-4 font-medium">Trigger</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Related</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="border-b border-border/60 align-top">
                <td className="p-4">
                  {new Date(message.sentAt ?? message.failedAt ?? message.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <p>{getEmailTemplate(message.templateKey)?.name ?? message.templateKey}</p>
                  <p className="text-xs text-muted-foreground">{message.templateKey}</p>
                </td>
                <td className="p-4">{message.subject}</td>
                <td className="p-4">{message.recipientEmail}</td>
                <td className="p-4">{message.eventKey ?? "Manual/legacy"}</td>
                <td className="p-4">{message.isTest ? "TEST" : message.sendType}</td>
                <td className="p-4">
                  <p>{message.status}</p>
                  {message.failureReason ? (
                    <p className="text-xs text-destructive">{message.failureReason}</p>
                  ) : null}
                </td>
                <td className="p-4">
                  {message.relatedEntityType
                    ? `${message.relatedEntityType}: ${message.relatedEntityId ?? "unknown"}`
                    : "—"}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/communications/history/${message.id}`}
                    className="font-medium text-accent-blue hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {messages.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No communication history found.</p>
        ) : null}
      </div>
    </div>
  );
}
